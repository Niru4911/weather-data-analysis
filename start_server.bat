@echo off
echo ========================================
echo Weather Data Analytics Server
echo ========================================
echo.
cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if flask-cors is installed
python -c "import flask_cors" 2>nul
if errorlevel 1 (
    echo Installing flask-cors...
    pip install flask-cors -q
)

REM Check if required packages are installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt -q
)

echo.
echo Starting server...
echo.
python app.py
pause

