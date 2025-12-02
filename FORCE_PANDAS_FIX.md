# 🔧 Quick Fix: Force Pandas (Skip Spark)

If Spark is causing errors, use this quick fix to force pandas:

## Step 1: Stop the Server
- Press **Ctrl+C** in the server window

## Step 2: Edit app.py
Open `app.py` and find line 31-33. Change from:

```python
from spark_processor import WeatherDataProcessor
processor = WeatherDataProcessor()
use_spark = True
```

**To:**

```python
# Temporarily disable Spark, use pandas
# from spark_processor import WeatherDataProcessor
# processor = WeatherDataProcessor()
from fallback_processor import FallbackWeatherProcessor
processor = FallbackWeatherProcessor()
use_spark = False
```

## Step 3: Restart Server
```powershell
python app.py
```

You should see: `✓ Using Pandas for data processing (fallback mode)`

## Step 4: Test
- Refresh browser: http://localhost:5000
- Charts should load!

## Why This Works
Pandas is simpler and doesn't require Java/Spark. It will process the data the same way, just without the MapReduce/RDD operations.



