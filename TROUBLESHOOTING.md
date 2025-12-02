# Troubleshooting Guide

## NetworkError: Failed to fetch / Cannot connect to server

This error means the Flask server is not running or not accessible.

### Solution:

1. **Start the Flask Server:**
   ```bash
   python app.py
   ```

2. **Wait for the startup message:**
   ```
   ==================================================
   Starting Flask server...
   Open your browser and navigate to: http://localhost:5000
   ==================================================
   ```

3. **Verify the server is running:**
   - You should see: `✓ Using Apache Spark for data processing` OR
   - You should see: `⚠ Spark not available (...), using pandas fallback` followed by `✓ Using Pandas for data processing (fallback mode)`

4. **Check the browser:**
   - Make sure you're accessing: `http://localhost:5000`
   - Not: `file:///` or any other protocol

5. **Refresh the page** after the server starts

## Common Issues

### Issue: "Java not found" or Spark errors
**Solution:** The app will automatically use pandas fallback. This is fine - the app will work without Spark.

### Issue: Port 5000 already in use
**Solution:** 
- Stop the other process using port 5000, OR
- Change the port in `app.py` line 234: `app.run(debug=True, host='0.0.0.0', port=5001)`
- Then access: `http://localhost:5001`

### Issue: "Module not found" errors
**Solution:** Install dependencies:
```bash
pip install flask pandas numpy
```

### Issue: Data file not found
**Solution:** The app will automatically generate sample data on first run. If it fails:
```bash
python data_generator.py
```

## Testing the Server

1. **Health Check:**
   Open: `http://localhost:5000/api/health`
   Should return: `{"status": "ok", "message": "Server is running", ...}`

2. **Test API Endpoint:**
   Open: `http://localhost:5000/api/temperature-by-location`
   Should return JSON data or an error message

## Still Having Issues?

1. Check the terminal/console where Flask is running for error messages
2. Check the browser console (F12) for JavaScript errors
3. Make sure you're using the correct URL: `http://localhost:5000`
4. Try restarting the Flask server





