# Weather Data Analytics Project

A comprehensive weather data analytics project using Apache Spark (PySpark) with MapReduce/RDD concepts, featuring an interactive web dashboard.

## Features

- **MapReduce/RDD Processing**: Uses Apache Spark RDD operations for distributed data processing
- **Interactive Dashboard**: Web-based dashboard with multiple visualization pages
- **Real-time Analytics**: Temperature, humidity, precipitation, and wind speed analysis
- **Data Aggregation**: Statistical analysis using Spark transformations and actions


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
