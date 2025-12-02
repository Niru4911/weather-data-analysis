"""
Flask Web Application for Weather Data Analytics Dashboard
"""
from flask import Flask, render_template, jsonify
from pyspark.sql import SparkSession
from data_generator import generate_weather_data
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'weather-analytics-secret-key'

# Enable CORS if available (optional, not required for same-origin requests)
try:
    from flask_cors import CORS
    CORS(app)
    print("✓ CORS enabled")
except ImportError:
    # CORS not installed, but not required for local development
    pass

# Initialize processor
processor = None
use_spark = True

def get_processor():
    """Get or create processor instance (Spark or fallback)"""
    global processor, use_spark
    
    if processor is None:
        # Skip Spark, use pandas directly
        try:
            from fallback_processor import FallbackWeatherProcessor
            processor = FallbackWeatherProcessor()
            use_spark = False
            print("✓ Using Pandas for data processing")
        except Exception as e:
            print(f"✗ Error initializing processor: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    return processor

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/temperature')
def temperature():
    """Temperature analysis page"""
    return render_template('temperature.html')

@app.route('/precipitation')
def precipitation():
    """Precipitation analysis page"""
    return render_template('precipitation.html')

@app.route('/statistics')
def statistics():
    """Statistics overview page"""
    return render_template('statistics.html')

@app.route('/test')
def test_connection():
    """Test connection page"""
    with open('test_connection.html', 'r', encoding='utf-8') as f:
        return f.read()

# Health check endpoint
@app.route('/api/health')
def api_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Server is running',
        'processor': 'Spark' if use_spark else 'Pandas'
    })

# API Endpoints
@app.route('/api/temperature-by-location')
def api_temperature_by_location():
    """API: Get temperature statistics by location"""
    global processor, use_spark
    
    try:
        proc = get_processor()
        data_file = 'data/weather_data.csv'
        
        if not os.path.exists(data_file):
            generate_weather_data(1000, data_file)
        
        df = proc.load_data(data_file)
        
        # Check if dataframe is empty
        if df is None:
            raise ValueError("DataFrame is None")
        
        result = proc.get_temperature_stats_by_location(df)
        
        # Validate result
        if result is None:
            raise ValueError("Result is None")
        
        if not isinstance(result, list):
            raise ValueError(f"Result is not a list: {type(result)}")
        
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_trace = traceback.format_exc()
        traceback.print_exc()
        print(f"Error in api_temperature_by_location: {error_msg}")
        print(f"Full traceback:\n{error_trace}")
        
        # Try fallback processor if Spark fails
        if use_spark:
            try:
                print("⚠ Spark failed, attempting to use fallback processor...")
                from fallback_processor import FallbackWeatherProcessor
                fallback_proc = FallbackWeatherProcessor()
                data_file = 'data/weather_data.csv'
                df = fallback_proc.load_data(data_file)
                result = fallback_proc.get_temperature_stats_by_location(df)
                print("✓ Fallback processor succeeded")
                # Update global processor to use fallback
                processor = fallback_proc
                use_spark = False
                return jsonify(result)
            except Exception as fallback_error:
                import traceback
                print(f"✗ Fallback processor also failed: {fallback_error}")
                traceback.print_exc()
        
        return jsonify({'error': error_msg, 'details': 'Check server terminal for full error message'}), 500

@app.route('/api/max-min-temperature')
def api_max_min_temperature():
    """API: Get max/min temperatures by location"""
    try:
        proc = get_processor()
        data_file = 'data/weather_data.csv'
        
        if not os.path.exists(data_file):
            generate_weather_data(1000, data_file)
        
        df = proc.load_data(data_file)
        result = proc.get_max_min_temperature_by_location(df)
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"Error in api_max_min_temperature: {error_msg}")
        return jsonify({'error': error_msg}), 500

@app.route('/api/precipitation-by-location')
def api_precipitation_by_location():
    """API: Get precipitation by location"""
    try:
        proc = get_processor()
        data_file = 'data/weather_data.csv'
        
        if not os.path.exists(data_file):
            generate_weather_data(1000, data_file)
        
        df = proc.load_data(data_file)
        result = proc.get_precipitation_by_location(df)
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"Error in api_precipitation_by_location: {error_msg}")
        return jsonify({'error': error_msg}), 500

@app.route('/api/weather-conditions')
def api_weather_conditions():
    """API: Get weather condition distribution"""
    try:
        proc = get_processor()
        data_file = 'data/weather_data.csv'
        
        if not os.path.exists(data_file):
            generate_weather_data(1000, data_file)
        
        df = proc.load_data(data_file)
        result = proc.get_weather_condition_distribution(df)
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"Error in api_weather_conditions: {error_msg}")
        return jsonify({'error': error_msg}), 500

@app.route('/api/daily-temperature')
def api_daily_temperature():
    """API: Get daily average temperature"""
    try:
        proc = get_processor()
        data_file = 'data/weather_data.csv'
        
        if not os.path.exists(data_file):
            generate_weather_data(1000, data_file)
        
        df = proc.load_data(data_file)
        result = proc.get_daily_average_temperature(df)
        # Limit to last 30 days for performance
        if result and len(result) > 30:
            return jsonify(result[-30:])
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"Error in api_daily_temperature: {error_msg}")
        return jsonify({'error': error_msg}), 500

@app.route('/api/location-statistics')
def api_location_statistics():
    """API: Get comprehensive statistics by location"""
    try:
        proc = get_processor()
        data_file = 'data/weather_data.csv'
        
        if not os.path.exists(data_file):
            generate_weather_data(1000, data_file)
        
        df = proc.load_data(data_file)
        result = proc.get_location_statistics(df)
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"Error in api_location_statistics: {error_msg}")
        return jsonify({'error': error_msg}), 500

@app.route('/api/humidity-by-location')
def api_humidity_by_location():
    """API: Get humidity by location"""
    try:
        proc = get_processor()
        data_file = 'data/weather_data.csv'
        
        if not os.path.exists(data_file):
            generate_weather_data(1000, data_file)
        
        df = proc.load_data(data_file)
        result = proc.get_humidity_by_location(df)
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        print(f"Error in api_humidity_by_location: {error_msg}")
        return jsonify({'error': error_msg}), 500

@app.teardown_appcontext
def close_processor(error):
    """Close Spark processor on app teardown"""
    global processor
    if processor is not None:
        processor.close()
        processor = None

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Generate sample data if it doesn't exist
    data_file = 'data/weather_data.csv'
    if not os.path.exists(data_file):
        print("Generating sample weather data...")
        try:
            generate_weather_data(1000, data_file)
            print(f"✓ Sample data generated successfully: {data_file}")
        except Exception as e:
            print(f"✗ Error generating data: {e}")
            print("The application will still run, but API endpoints may fail.")
    else:
        print(f"✓ Using existing data file: {data_file}")
    
    print("\n" + "="*50)
    print("Starting Flask server...")
    print("Server will be available at:")
    print("  - http://localhost:5000")
    print("  - http://127.0.0.1:5000")
    print("="*50 + "\n")
    try:
        app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=False)
    except OSError as e:
        if "Address already in use" in str(e) or "address is already in use" in str(e).lower():
            print("\n" + "="*50)
            print("ERROR: Port 5000 is already in use!")
            print("Please stop the other server or change the port.")
            print("="*50 + "\n")
        raise



