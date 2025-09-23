#!/usr/bin/env python3
"""
Video to GIF Converter
Converts MP4 videos to animated GIFs with customizable settings.

Usage:
    python video_to_gif.py input_video.mp4 [output.gif] [options]

Options:
    --fps FPS          Frames per second for the GIF (default: 10)
    --width WIDTH      Width in pixels (default: 480, maintains aspect ratio)
    --height HEIGHT    Height in pixels (default: auto, maintains aspect ratio)
    --start START      Start time in seconds (default: 0)
    --duration DUR     Duration in seconds (default: full video)
    --quality QUALITY  Quality level 1-10 (default: 8)
    --help             Show this help message

Examples:
    python video_to_gif.py video.mp4
    python video_to_gif.py video.mp4 output.gif --fps 15 --width 640
    python video_to_gif.py video.mp4 --start 5 --duration 10 --fps 12
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from moviepy import VideoFileClip
    from PIL import Image
except ImportError as e:
    print("Error: Required packages not installed.")
    print("Please install the required packages:")
    print("pip install moviepy pillow")
    print(f"\nImport error: {e}")
    sys.exit(1)


def convert_video_to_gif(
    input_path: str,
    output_path: str = None,
    fps: int = 10,
    width: int = 480,
    height: int = None,
    start_time: float = 0,
    duration: float = None,
    quality: int = 8
) -> str:
    """
    Convert MP4 video to animated GIF.
    
    Args:
        input_path: Path to input MP4 file
        output_path: Path for output GIF file (optional)
        fps: Frames per second for the GIF
        width: Width in pixels
        height: Height in pixels (None for auto)
        start_time: Start time in seconds
        duration: Duration in seconds (None for full video)
        quality: Quality level 1-10
    
    Returns:
        Path to the created GIF file
    """
    
    # Validate input file
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    if not input_path.lower().endswith('.mp4'):
        raise ValueError("Input file must be an MP4 video")
    
    # Generate output path if not provided
    if output_path is None:
        input_file = Path(input_path)
        output_path = input_file.with_suffix('.gif')
    
    # Ensure output directory exists
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Converting {input_path} to {output_path}")
    print(f"Settings: FPS={fps}, Width={width}, Start={start_time}s")
    if duration:
        print(f"Duration: {duration}s")
    if height:
        print(f"Height: {height}px")
    
    try:
        # Load video
        print("Loading video...")
        clip = VideoFileClip(input_path)
        
        # Apply time constraints
        if start_time > 0:
            clip = clip.subclip(start_time)
        
        if duration:
            clip = clip.subclip(0, duration)
        
        # Resize video
        if height:
            clip = clip.resized((width, height))
        else:
            # Maintain aspect ratio
            clip = clip.resized(width=width)
        
        # Convert to GIF
        print("Converting to GIF...")
        clip.write_gif(output_path, fps=fps)
        
        # Clean up
        clip.close()
        
        # Get file sizes for comparison
        input_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
        output_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
        
        print(f"✅ Conversion complete!")
        print(f"📁 Input:  {input_size:.1f} MB")
        print(f"📁 Output: {output_size:.1f} MB")
        print(f"📉 Size reduction: {((input_size - output_size) / input_size * 100):.1f}%")
        
        return output_path
        
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        raise


def main():
    """Main function to handle command line arguments and run conversion."""
    
    parser = argparse.ArgumentParser(
        description="Convert MP4 videos to animated GIFs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        'input_video',
        help='Path to input MP4 video file'
    )
    
    parser.add_argument(
        'output_gif',
        nargs='?',
        help='Path for output GIF file (optional, defaults to input filename with .gif extension)'
    )
    
    parser.add_argument(
        '--fps',
        type=int,
        default=10,
        help='Frames per second for the GIF (default: 10)'
    )
    
    parser.add_argument(
        '--width',
        type=int,
        default=480,
        help='Width in pixels (default: 480, maintains aspect ratio)'
    )
    
    parser.add_argument(
        '--height',
        type=int,
        help='Height in pixels (default: auto, maintains aspect ratio)'
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
        help='Duration in seconds (default: full video)'
    )
    
    parser.add_argument(
        '--quality',
        type=int,
        default=8,
        choices=range(1, 11),
        help='Quality level 1-10 (default: 8)'
    )
    
    args = parser.parse_args()
    
    try:
        output_path = convert_video_to_gif(
            input_path=args.input_video,
            output_path=args.output_gif,
            fps=args.fps,
            width=args.width,
            height=args.height,
            start_time=args.start,
            duration=args.duration,
            quality=args.quality
        )
        
        print(f"\n🎉 GIF created successfully: {output_path}")
        
    except Exception as e:
        print(f"\n❌ Conversion failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
