# 🔄 How to Restart the Server

## ✅ Quick Method (Easiest)

1. **Find the PowerShell/Command Prompt window** where the server is running
2. **Press `Ctrl+C`** to stop the server
3. **Type:** `python app.py`
4. **Press Enter**
5. **Wait for:** "Starting Flask server..."
6. **Refresh your browser** (Ctrl+Shift+R)

## ✅ Alternative: Use Batch File

1. **Close the server window** (or press Ctrl+C in it)
2. **Double-click `start_server.bat`**
3. **Done!** Server starts automatically

## 📋 Step-by-Step

### Step 1: Stop the Server
- Look for a window showing "Starting Flask server..."
- Press **Ctrl+C** in that window
- You should see the prompt return

### Step 2: Start the Server Again

**Option A: In the same window**
```powershell
python app.py
```

**Option B: New window**
1. Open PowerShell in project folder
2. Run:
   ```powershell
   .\venv\Scripts\Activate.ps1
   python app.py
   ```

**Option C: Batch file**
- Just double-click `start_server.bat`

### Step 3: Verify It's Running
You should see:
```
==================================================
Starting Flask server...
Server will be available at:
  - http://localhost:5000
==================================================
```

### Step 4: Test in Browser
- Go to: **http://localhost:5000**
- Press **Ctrl+Shift+R** to refresh

## ⚠️ Important Notes

- **Keep the server window open** while using the app
- **Don't close the window** - that stops the server
- **If you see errors**, check the server window for messages

## 🆘 Troubleshooting

### "Port already in use"
- Another server is still running
- Close all PowerShell windows
- Or change port in `app.py` (line 256): `port=5001`

### "Module not found"
- Make sure virtual environment is activated
- Run: `.\venv\Scripts\Activate.ps1`

### Server won't start
- Check for error messages in the terminal
- Make sure you're in the project folder
- Try: `python --version` to verify Python is installed



