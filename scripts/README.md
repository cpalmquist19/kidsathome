# Scripts Directory

This directory contains utility scripts for the Kids at Home project.

## WAV to MP3 Converter

Converts WAV audio files to MP3 format with customizable settings.

### Prerequisites

Install the required Python packages:

```bash
pip install pydub
```

**Important**: You also need to install `ffmpeg` for MP3 conversion:
- **Windows**: Download from https://ffmpeg.org/download.html
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

### Usage

#### Python Script
```bash
python wav_to_mp3.py input_audio.wav [output.mp3] [options]
```

#### Windows Batch Script (Easier)
```bash
convert_wav_to_mp3.bat input_audio.wav [output.mp3] [options]
```

### Options

- `--bitrate BITRATE` - MP3 bitrate in kbps (default: 192k)
- `--quality QUALITY` - MP3 quality 0-9 (default: 2)
- `--start START` - Start time in seconds (default: 0)
- `--duration DUR` - Duration in seconds (default: full audio)
- `--normalize` - Normalize audio levels (default: False)

### Examples

```bash
# Basic conversion
python wav_to_mp3.py audio.wav

# High quality conversion
python wav_to_mp3.py audio.wav output.mp3 --bitrate 320k --quality 0

# Extract specific portion with normalization
python wav_to_mp3.py audio.wav --start 10 --duration 30 --normalize

# Compress for web use
python wav_to_mp3.py audio.wav --bitrate 128k --quality 4
```

### Tips

- **Higher bitrate** = better quality, larger file size (128k, 192k, 256k, 320k)
- **Lower quality number** = better quality (0=best, 9=worst)
- **Use --normalize** to balance audio levels
- **Use --start and --duration** to extract specific parts of long audio files

### File Size Optimization

For web use, consider these settings:
- Bitrate: 128k-192k (good balance)
- Quality: 2-4 (good quality vs file size)
- Use normalization for consistent levels

### Troubleshooting

**"Required packages not installed"**
```bash
pip install pydub
```

**"ffmpeg is required for MP3 conversion"**
- Install ffmpeg (see Prerequisites above)
- Make sure ffmpeg is in your system PATH

**"Input file not found"**
- Check the file path is correct
- Make sure the file exists

**"Input file must be a WAV audio file"**
- Only WAV files are supported
- Convert other formats to WAV first

## Video to GIF Converter

Converts MP4 videos to animated GIFs with customizable settings.

### Prerequisites

Install the required Python packages:

```bash
pip install moviepy pillow
```

### Usage

#### Python Script
```bash
python video_to_gif.py input_video.mp4 [output.gif] [options]
```

#### Windows Batch Script (Easier)
```bash
convert_to_gif.bat input_video.mp4 [output.gif] [options]
```

### Options

- `--fps FPS` - Frames per second for the GIF (default: 10)
- `--width WIDTH` - Width in pixels (default: 480, maintains aspect ratio)
- `--height HEIGHT` - Height in pixels (default: auto, maintains aspect ratio)
- `--start START` - Start time in seconds (default: 0)
- `--duration DUR` - Duration in seconds (default: full video)
- `--quality QUALITY` - Quality level 1-10 (default: 8)

### Examples

```bash
# Basic conversion
python video_to_gif.py video.mp4

# Custom settings
python video_to_gif.py video.mp4 output.gif --fps 15 --width 640

# Extract specific portion
python video_to_gif.py video.mp4 --start 5 --duration 10 --fps 12

# High quality, smaller size
python video_to_gif.py video.mp4 --fps 8 --width 320 --quality 9
```

### Tips

- **Lower FPS** = smaller file size, choppier animation
- **Higher FPS** = larger file size, smoother animation
- **Smaller width** = smaller file size
- **Quality 8-10** = good balance of quality vs file size
- **Use --start and --duration** to extract specific parts of long videos

### File Size Optimization

For web use, consider these settings:
- FPS: 8-12 (good balance)
- Width: 320-480px
- Quality: 8-9
- Duration: Keep under 10 seconds for best results

### Troubleshooting

**"Required packages not installed"**
```bash
pip install moviepy pillow
```

**"Input file not found"**
- Check the file path is correct
- Make sure the file exists

**"Input file must be an MP4 video"**
- Only MP4 files are supported
- Convert other formats to MP4 first

**Large file sizes**
- Reduce FPS (try 8-10)
- Reduce width (try 320-480px)
- Reduce duration
- Lower quality setting
