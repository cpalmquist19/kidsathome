#!/usr/bin/env python3
"""
WAV to MP3 Converter
Converts WAV audio files to MP3 format with customizable settings.

Usage:
    python wav_to_mp3.py input_audio.wav [output.mp3] [options]

Options:
    --bitrate BITRATE    MP3 bitrate in kbps (default: 192)
    --quality QUALITY    MP3 quality 0-9 (default: 2)
    --start START        Start time in seconds (default: 0)
    --duration DUR       Duration in seconds (default: full audio)
    --normalize          Normalize audio levels (default: False)
    --help               Show this help message

Examples:
    python wav_to_mp3.py audio.wav
    python wav_to_mp3.py audio.wav output.mp3 --bitrate 320
    python wav_to_mp3.py audio.wav --start 10 --duration 30 --normalize
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from pydub import AudioSegment
    from pydub.utils import which
except ImportError as e:
    print("Error: Required packages not installed.")
    print("Please install the required packages:")
    print("pip install pydub")
    print(f"\nImport error: {e}")
    sys.exit(1)


def check_ffmpeg():
    """Check if ffmpeg is available for MP3 conversion."""
    ffmpeg_path = which("ffmpeg")
    if not ffmpeg_path:
        # Try common Windows locations
        common_paths = [
            "C:\\ffmpeg\\bin\\ffmpeg.exe",
            "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
            "C:\\ffmpeg\\ffmpeg.exe"
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                # Set the ffmpeg path for pydub
                import pydub.utils
                pydub.utils.which = lambda x: path if x == "ffmpeg" else None
                return
        
        print("Error: ffmpeg is required for MP3 conversion.")
        print("Please install ffmpeg:")
        print("- Windows: Download from https://ffmpeg.org/download.html")
        print("- macOS: brew install ffmpeg")
        print("- Linux: sudo apt install ffmpeg")
        sys.exit(1)


def convert_wav_to_mp3(
    input_path: str,
    output_path: str = None,
    bitrate: str = "192k",
    quality: int = 2,
    start_time: float = 0,
    duration: float = None,
    normalize: bool = False
) -> str:
    """
    Convert WAV audio to MP3 format.
    
    Args:
        input_path: Path to input WAV file
        output_path: Path for output MP3 file (optional)
        bitrate: MP3 bitrate (e.g., "128k", "192k", "320k")
        quality: MP3 quality 0-9 (0=best, 9=worst)
        start_time: Start time in seconds
        duration: Duration in seconds (None for full audio)
        normalize: Whether to normalize audio levels
    
    Returns:
        Path to the created MP3 file
    """
    
    # Check for ffmpeg
    check_ffmpeg()
    
    # Validate input file
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    if not input_path.lower().endswith('.wav'):
        raise ValueError("Input file must be a WAV audio file")
    
    # Generate output path if not provided
    if output_path is None:
        input_file = Path(input_path)
        output_path = input_file.with_suffix('.mp3')
    
    # Ensure output directory exists
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Converting {input_path} to {output_path}")
    print(f"Settings: Bitrate={bitrate}, Quality={quality}, Start={start_time}s")
    if duration:
        print(f"Duration: {duration}s")
    if normalize:
        print("Normalize: Enabled")
    
    try:
        # Load audio file
        print("Loading audio file...")
        audio = AudioSegment.from_wav(input_path)
        
        # Apply time constraints
        if start_time > 0:
            start_ms = int(start_time * 1000)
            audio = audio[start_ms:]
        
        if duration:
            duration_ms = int(duration * 1000)
            audio = audio[:duration_ms]
        
        # Normalize audio if requested
        if normalize:
            print("Normalizing audio levels...")
            audio = audio.normalize()
        
        # Convert to MP3
        print("Converting to MP3...")
        audio.export(
            output_path,
            format="mp3",
            bitrate=bitrate,
            parameters=["-q:a", str(quality)]
        )
        
        # Get file sizes for comparison
        input_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
        output_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
        
        print(f"✅ Conversion complete!")
        print(f"📁 Input:  {input_size:.1f} MB")
        print(f"📁 Output: {output_size:.1f} MB")
        if input_size > 0:
            print(f"📉 Size reduction: {((input_size - output_size) / input_size * 100):.1f}%")
        
        return output_path
        
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        raise


def main():
    """Main function to handle command line arguments and run conversion."""
    
    parser = argparse.ArgumentParser(
        description="Convert WAV audio files to MP3 format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        'input_wav',
        help='Path to input WAV audio file'
    )
    
    parser.add_argument(
        'output_mp3',
        nargs='?',
        help='Path for output MP3 file (optional, defaults to input filename with .mp3 extension)'
    )
    
    parser.add_argument(
        '--bitrate',
        type=str,
        default='192k',
        help='MP3 bitrate in kbps (default: 192k). Common values: 128k, 192k, 256k, 320k'
    )
    
    parser.add_argument(
        '--quality',
        type=int,
        default=2,
        choices=range(0, 10),
        help='MP3 quality 0-9 (0=best, 9=worst, default: 2)'
    )
    
    parser.add_argument(
        '--start',
        type=float,
        default=0,
        help='Start time in seconds (default: 0)'
    )
    
    parser.add_argument(
        '--duration',
        type=float,
        help='Duration in seconds (default: full audio)'
    )
    
    parser.add_argument(
        '--normalize',
        action='store_true',
        help='Normalize audio levels (default: False)'
    )
    
    args = parser.parse_args()
    
    try:
        output_path = convert_wav_to_mp3(
            input_path=args.input_wav,
            output_path=args.output_mp3,
            bitrate=args.bitrate,
            quality=args.quality,
            start_time=args.start,
            duration=args.duration,
            normalize=args.normalize
        )
        
        print(f"\n🎉 MP3 created successfully: {output_path}")
        
    except Exception as e:
        print(f"\n❌ Conversion failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
