# Fix: "Cannot connect to server" Error

## Step-by-Step Solution

### Step 1: Stop All Running Servers
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find any Python processes
3. End them, OR
4. Run this in PowerShell:
   ```powershell
   Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

### Step 2: Start the Server Properly

**Option A: Using the Batch File (Recommended)**
1. Double-click `start_server.bat`
2. Wait for: "Starting Flask server..."
3. **Keep this window open** - don't close it!

**Option B: Using PowerShell**
1. Open PowerShell in the project folder
2. Run:
   ```powershell
   .\venv\Scripts\Activate.ps1
   pip install flask-cors
   python app.py
   ```
3. **Keep this window open**

### Step 3: Verify Server is Running

1. **Check the terminal output:**
   - Should see: `Starting Flask server...`
   - Should see: `✓ Using Apache Spark...` OR `✓ Using Pandas...`

2. **Test in browser:**
   - Open: http://localhost:5000/api/health
   - Should see: `{"status": "ok", ...}`

3. **Open the dashboard:**
   - Go to: http://localhost:5000
   - Press **Ctrl+Shift+R** (hard refresh) to clear cache

### Step 4: If Still Not Working

1. **Check browser console (F12):**
   - Look for any red errors
   - Share the error message

2. **Try different browser:**
   - Chrome, Firefox, or Edge
   - Sometimes cache issues

3. **Check firewall:**
   - Windows Firewall might be blocking
   - Allow Python through firewall if prompted

4. **Try different port:**
   - Edit `app.py` line 247
   - Change `port=5000` to `port=5001`
   - Access: http://localhost:5001

## Common Issues

### "Port already in use"
- Another server is running
- Stop it first (see Step 1)

### "Module not found: flask_cors"
- Run: `pip install flask-cors`

### Server starts but browser shows error
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Try incognito/private mode

### Still having issues?
- Check the terminal where server is running for error messages
- Make sure you're using: `http://localhost:5000` (not `file:///`)





