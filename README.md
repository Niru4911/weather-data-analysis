# Weather Data Analytics Project

A comprehensive weather data analytics project using Apache Spark (PySpark) with MapReduce/RDD concepts, featuring an interactive web dashboard.

## Features

- **MapReduce/RDD Processing**: Uses Apache Spark RDD operations for distributed data processing
- **Interactive Dashboard**: Web-based dashboard with multiple visualization pages
- **Real-time Analytics**: Temperature, humidity, precipitation, and wind speed analysis
- **Data Aggregation**: Statistical analysis using Spark transformations and actions

## Installation

1. Install Python 3.8 or higher
2. Install Java JDK 8 or higher (required for Spark)
3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask web server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
weather_data_analysis_project/
├── app.py                 # Flask web application
├── spark_processor.py     # PySpark MapReduce/RDD processing
├── data_generator.py      # Weather data generator
├── requirements.txt       # Python dependencies
├── templates/            # HTML templates
│   ├── index.html        # Main dashboard
│   ├── temperature.html  # Temperature analysis
│   ├── precipitation.html # Precipitation analysis
│   └── statistics.html   # Statistical overview
├── static/               # Static files
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── charts.js     # Chart visualizations
└── data/                 # Weather data files
```

## MapReduce/RDD Concepts Used

This project demonstrates core MapReduce/RDD operations:

### RDD Operations:
- **RDD Creation**: Converting DataFrames to RDDs for MapReduce operations
- **Map Transformations**: 
  - `map()`: Transform each record into key-value pairs
  - Example: `rdd.map(lambda row: (row[0], row[1]))` - Creates (location, temperature) pairs
- **Reduce Operations**:
  - `reduceByKey()`: Efficient aggregation using combiners
  - Example: `rdd.reduceByKey(lambda a, b: a + b)` - Sums values by key
- **Actions**:
  - `collect()`: Retrieve results from distributed RDD
  - `count()`: Count elements in RDD

### MapReduce Pattern Examples:
1. **Temperature Statistics by Location**:
   - Map: `(location, temperature)` → `(location, (temp, 1))`
   - Reduce: Aggregate sum and count by location
   - Final: Calculate average temperature

2. **Precipitation Aggregation**:
   - Map: `(location, precipitation)` pairs
   - Reduce: Sum precipitation by location

3. **Weather Condition Distribution**:
   - Map: `(condition, 1)` for each record
   - Reduce: Count occurrences by condition

## Dashboard Pages

1. **Main Dashboard** (`/`): Overview with key metrics and charts
2. **Temperature Analysis** (`/temperature`): Detailed temperature statistics
3. **Precipitation Analysis** (`/precipitation`): Rainfall and humidity data
4. **Statistics Overview** (`/statistics`): Comprehensive location-based statistics

## API Endpoints

All data is served via RESTful API endpoints:
- `/api/temperature-by-location` - Average temperatures
- `/api/max-min-temperature` - Temperature ranges
- `/api/precipitation-by-location` - Precipitation totals
- `/api/weather-conditions` - Condition distribution
- `/api/daily-temperature` - Daily temperature trends
- `/api/location-statistics` - Complete location stats
- `/api/humidity-by-location` - Humidity averages

## Technologies

- **Backend**: Flask (Python) - Web framework
- **Data Processing**: Apache Spark (PySpark) - Distributed computing
- **Frontend**: HTML5, CSS3, JavaScript - User interface
- **Visualization**: Chart.js - Interactive charts
- **Styling**: Bootstrap 5 - Responsive design

## Troubleshooting

### Java Not Found Error
If you see "Java not found" errors:
- Install Java JDK 8 or higher
- Set JAVA_HOME environment variable
- Verify with: `java -version`

### Spark Installation Issues
- Ensure PySpark is installed: `pip install pyspark`
- Spark will download dependencies automatically on first run

### Port Already in Use
If port 5000 is busy:
- Change port in `app.py`: `app.run(port=5001)`
- Or stop the process using port 5000

