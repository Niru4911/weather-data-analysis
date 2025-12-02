# 🚀 START THE SERVER - FOLLOW THESE STEPS

## ✅ Quick Fix (Do This Now!)

### Step 1: Open PowerShell in This Folder
- Right-click in the folder
- Select "Open in Terminal" or "Open PowerShell window here"

### Step 2: Run These Commands (One at a time)

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install flask-cors (if needed)
pip install flask-cors

# Start the server
python app.py
```

### Step 3: Wait for This Message
You should see:
```
==================================================
Starting Flask server...
Server will be available at:
  - http://localhost:5000
  - http://127.0.0.1:5000
==================================================
```

### Step 4: Open Your Browser
- Go to: **http://localhost:5000**
- The dashboard should load!

## ⚠️ IMPORTANT:
- **DO NOT CLOSE** the PowerShell window while using the app
- The server must stay running
- If you close it, refresh your browser and you'll see the error again

## 🔄 If You See "Cannot connect to server":
1. Make sure the PowerShell window is still open
2. Check if you see "Starting Flask server..." in that window
3. If not, the server crashed - check for error messages
4. Restart by running `python app.py` again

## 📝 Alternative: Use the Batch File
Just double-click `start_server.bat` - it does everything automatically!





