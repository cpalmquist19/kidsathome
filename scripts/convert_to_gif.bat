@echo off
REM Video to GIF Converter - Windows Batch Script
REM Usage: convert_to_gif.bat input_video.mp4 [output.gif] [options]

if "%1"=="" (
    echo Usage: convert_to_gif.bat input_video.mp4 [output.gif] [options]
    echo.
    echo Options:
    echo   --fps FPS          Frames per second for the GIF (default: 10)
    echo   --width WIDTH      Width in pixels (default: 480)
    echo   --height HEIGHT    Height in pixels (default: auto)
    echo   --start START      Start time in seconds (default: 0)
    echo   --duration DUR     Duration in seconds (default: full video)
    echo   --quality QUALITY  Quality level 1-10 (default: 8)
    echo.
    echo Examples:
    echo   convert_to_gif.bat video.mp4
    echo   convert_to_gif.bat video.mp4 output.gif --fps 15 --width 640
    echo   convert_to_gif.bat video.mp4 --start 5 --duration 10 --fps 12
    pause
    exit /b 1
)

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Run the Python script with all passed arguments
python "%SCRIPT_DIR%video_to_gif.py" %*

pause
