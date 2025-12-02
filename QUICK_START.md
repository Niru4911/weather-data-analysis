# Quick Start Guide

## Starting the Server

### Option 1: Using the Batch File (Easiest)
1. Double-click `start_server.bat` in Windows Explorer
2. Wait for the message: "Starting Flask server..."
3. Open your browser to: http://localhost:5000

### Option 2: Using Command Line
1. Open PowerShell or Command Prompt in this directory
2. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   Or for Command Prompt:
   ```cmd
   venv\Scripts\activate.bat
   ```
3. Start the server:
   ```bash
   python app.py
   ```
4. Wait for: "Starting Flask server..."
5. Open browser to: http://localhost:5000

## Verifying the Server is Running

1. **Check the terminal output:**
   - You should see: `✓ Using Apache Spark for data processing` OR
   - You should see: `⚠ Spark not available (...), using pandas fallback` followed by `✓ Using Pandas for data processing (fallback mode)`
   - Then: `Starting Flask server...`

2. **Test in browser:**
   - Open: http://localhost:5000/api/health
   - Should return: `{"status": "ok", "message": "Server is running", ...}`

3. **Check the main page:**
   - Open: http://localhost:5000
   - Charts should load automatically

## Stopping the Server

- Press `Ctrl+C` in the terminal where the server is running
- Or close the terminal window

## Troubleshooting

### "Port 5000 already in use"
- Another instance of the server is already running
- Find and stop it, or change the port in `app.py`

### "Module not found"
- Make sure the virtual environment is activated
- Run: `pip install -r requirements.txt`

### Still having issues?
- See `TROUBLESHOOTING.md` for more help





