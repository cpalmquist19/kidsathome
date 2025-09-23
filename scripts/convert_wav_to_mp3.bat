@echo off
REM WAV to MP3 Converter - Windows Batch Script
REM Usage: convert_wav_to_mp3.bat input_audio.wav [output.mp3] [options]

if "%1"=="" (
    echo Usage: convert_wav_to_mp3.bat input_audio.wav [output.mp3] [options]
    echo.
    echo Options:
    echo   --bitrate BITRATE    MP3 bitrate in kbps (default: 192k)
    echo   --quality QUALITY    MP3 quality 0-9 (default: 2)
    echo   --start START        Start time in seconds (default: 0)
    echo   --duration DUR       Duration in seconds (default: full audio)
    echo   --normalize          Normalize audio levels (default: False)
    echo.
    echo Examples:
    echo   convert_wav_to_mp3.bat audio.wav
    echo   convert_wav_to_mp3.bat audio.wav output.mp3 --bitrate 320k
    echo   convert_wav_to_mp3.bat audio.wav --start 10 --duration 30 --normalize
    pause
    exit /b 1
)

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Run the Python script with all passed arguments
python "%SCRIPT_DIR%wav_to_mp3.py" %*

pause
