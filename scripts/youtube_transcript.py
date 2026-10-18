#!/usr/bin/env python3
"""
Fetch a transcript for a YouTube video.

1. Tries YouTube's caption track (fast, no ML).
2. With --transcribe: downloads audio and runs speech-to-text (needs ffmpeg).

Install:
  pip install youtube-transcript-api
  pip install yt-dlp faster-whisper   # only for --transcribe
"""

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import (
        NoTranscriptFound,
        TranscriptsDisabled,
        VideoUnavailable,
    )
except ImportError:
    YouTubeTranscriptApi = None  # type: ignore[misc, assignment]

DEFAULT_URL = "https://www.youtube.com/watch?v=MV0DJ9kJPoU"


def video_id_from_url(url_or_id: str) -> str:
    """Extract 11-character video ID from a URL or pass through a bare ID."""
    s = url_or_id.strip()
    if re.fullmatch(r"[\w-]{11}", s):
        return s
    parsed = urlparse(s)
    if parsed.hostname and "youtu" in parsed.hostname:
        if parsed.path == "/watch":
            q = parse_qs(parsed.query)
            if "v" in q and q["v"]:
                return q["v"][0]
        parts = [p for p in parsed.path.split("/") if p]
        if parts:
            return parts[-1].split("?")[0]
    raise ValueError(f"Could not parse YouTube video ID from: {url_or_id}")


def fetch_caption_transcript(
    video_id: str,
    languages: list[str] | None = None,
) -> list[dict]:
    """Return caption snippets: {text, start, duration}."""
    if YouTubeTranscriptApi is None:
        raise RuntimeError("Install youtube-transcript-api: pip install youtube-transcript-api")

    langs = languages or ["en", "en-US", "en-GB"]
    api = YouTubeTranscriptApi()
    transcript_list = api.list(video_id)

    try:
        transcript = transcript_list.find_transcript(langs)
    except NoTranscriptFound:
        for t in transcript_list:
            if not t.is_generated:
                transcript = t
                break
        else:
            transcript = next(iter(transcript_list))

    return transcript.fetch()


def download_audio(video_url: str, out_dir: Path) -> Path:
    """Download best audio for the video into out_dir; return path to file."""
    out_template = str(out_dir / "audio.%(ext)s")
    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "-f",
        "bestaudio/best",
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        out_template,
        "--no-playlist",
        # Avoid HTTP 403 when YouTube blocks the default web client.
        "--extractor-args",
        "youtube:player_client=android,web",
        video_url,
    ]
    subprocess.run(cmd, check=True)
    matches = list(out_dir.glob("audio.*"))
    if not matches:
        raise FileNotFoundError("yt-dlp did not produce an audio file")
    return matches[0]


def load_audio_for_whisper(audio_path: Path, sample_rate: int = 16000):
    """Decode audio to mono float32 via ffmpeg (avoids PyAV version issues)."""
    import numpy as np

    cmd = [
        "ffmpeg",
        "-nostdin",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(audio_path),
        "-f",
        "s16le",
        "-acodec",
        "pcm_s16le",
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-",
    ]
    proc = subprocess.run(cmd, capture_output=True, check=True)
    return np.frombuffer(proc.stdout, np.int16).astype(np.float32) / 32768.0


def transcribe_audio(
    audio_path: Path,
    model_size: str = "base",
    language: str | None = None,
) -> list[dict]:
    """Transcribe with faster-whisper; return snippets like caption API."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        raise RuntimeError(
            "Install faster-whisper for --transcribe: pip install faster-whisper"
        ) from None

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    audio = load_audio_for_whisper(audio_path)
    segments, _info = model.transcribe(
        audio,
        language=language,
        vad_filter=False,
    )
    snippets: list[dict] = []
    for seg in segments:
        snippets.append(
            {
                "text": seg.text.strip(),
                "start": seg.start,
                "duration": max(0.0, seg.end - seg.start),
            }
        )
    return snippets


def write_output(
    snippets: list[dict],
    as_json: bool,
    output_path: str | None,
) -> None:
    if as_json:
        payload = json.dumps(snippets, ensure_ascii=False, indent=2)
        if output_path:
            Path(output_path).write_text(payload, encoding="utf-8")
        else:
            print(payload)
    else:
        text = "\n".join(s["text"].strip() for s in snippets if s.get("text"))
        if output_path:
            Path(output_path).write_text(text + "\n", encoding="utf-8")
        else:
            print(text)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download YouTube transcript (captions or speech-to-text)."
    )
    parser.add_argument(
        "url",
        nargs="?",
        default=DEFAULT_URL,
        help="YouTube URL or video ID",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Write result to this file (default: stdout)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output JSON with timestamps",
    )
    parser.add_argument(
        "-l",
        "--lang",
        action="append",
        dest="languages",
        help="Caption language preference, e.g. en (repeatable)",
    )
    parser.add_argument(
        "--transcribe",
        action="store_true",
        help="Download audio and transcribe (use when captions are missing)",
    )
    parser.add_argument(
        "--whisper-model",
        default="base",
        help="faster-whisper model (tiny is fast but often misses speech; base+ recommended)",
    )
    parser.add_argument(
        "--whisper-lang",
        default=None,
        help="Force Whisper language code (default: auto-detect)",
    )
    parser.add_argument(
        "--keep-audio",
        metavar="PATH",
        help="Save downloaded audio to this path instead of deleting it",
    )
    args = parser.parse_args()

    try:
        vid = video_id_from_url(args.url)
    except ValueError as e:
        print(e, file=sys.stderr)
        sys.exit(2)

    video_url = args.url if "youtu" in args.url else f"https://www.youtube.com/watch?v={vid}"
    snippets: list[dict] | None = None

    if not args.transcribe:
        try:
            snippets = fetch_caption_transcript(vid, args.languages)
        except TranscriptsDisabled:
            print(
                "Transcripts are disabled for this video. Re-run with --transcribe.",
                file=sys.stderr,
            )
            sys.exit(1)
        except VideoUnavailable:
            print("Video is unavailable.", file=sys.stderr)
            sys.exit(1)
        except NoTranscriptFound:
            print(
                "No caption track found. Re-run with --transcribe.",
                file=sys.stderr,
            )
            sys.exit(1)
    else:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            print("Downloading audio…", file=sys.stderr)
            audio = download_audio(video_url, tmp_path)
            if args.keep_audio:
                dest = Path(args.keep_audio)
                dest.write_bytes(audio.read_bytes())
                audio = dest
            print("Transcribing (first run downloads the Whisper model)…", file=sys.stderr)
            snippets = transcribe_audio(
                audio,
                model_size=args.whisper_model,
                language=args.whisper_lang,
            )

    if not snippets:
        print(
            "Transcription finished with no text. Try a larger --whisper-model.",
            file=sys.stderr,
        )
        sys.exit(1)

    write_output(snippets, args.json, args.output)


if __name__ == "__main__":
    main()
