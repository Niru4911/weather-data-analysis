# 🚀 How to Start the Server - Simple Guide

## Quick Answer:
**Use PowerShell to run the Python command!**

- **PowerShell** = The terminal/command window (where you type commands)
- **Python** = The programming language (runs automatically when you execute the command)

## ✅ Easiest Method: Use the Batch File

1. **Double-click `start_server.bat`**
   - This automatically:
     - Opens PowerShell
     - Activates the virtual environment
     - Starts the Python server
   - **Keep this window open!**

## ✅ Alternative: Manual Method (PowerShell)

### Step 1: Open PowerShell
- Right-click in your project folder
- Select "Open in Terminal" or "Open PowerShell window here"
- OR open PowerShell and navigate to your folder:
  ```powershell
  cd D:\weather_data_analysis_project
  ```

### Step 2: Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```
You should see `(venv)` appear at the start of your prompt.

### Step 3: Run Python Command
```powershell
python app.py
```

### Step 4: Wait for This Message
```
==================================================
Starting Flask server...
Server will be available at:
  - http://localhost:5000
==================================================
```

### Step 5: Open Browser
- Go to: **http://localhost:5000**
- **Keep the PowerShell window open!**

## 📝 Summary

| What | Purpose |
|------|---------|
| **PowerShell** | Terminal where you type commands |
| **Python** | Programming language (runs automatically) |
| **Command** | `python app.py` (runs in PowerShell) |
| **Result** | Flask server starts and runs |

## ⚠️ Important Notes

1. **You MUST use PowerShell** (or Command Prompt) - you can't just double-click `app.py`
2. **Keep the PowerShell window open** - closing it stops the server
3. **The server runs in PowerShell** - Python executes inside it
4. **Browser connects to server** - use `http://localhost:5000`

## 🎯 Quick Start (Copy & Paste)

```powershell
# Open PowerShell in project folder, then:
.\venv\Scripts\Activate.ps1
python app.py
```

That's it! Then open http://localhost:5000 in your browser.





