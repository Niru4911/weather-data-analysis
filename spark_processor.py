"""
Spark Processor for Weather Data Analysis
Uses MapReduce/RDD concepts for distributed processing
"""
from pyspark.sql import SparkSession
from pyspark import SparkContext
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, DateType
from pyspark.sql.functions import col, avg, max as spark_max, min as spark_min, count
from datetime import datetime
import os

class WeatherDataProcessor:
    """Process weather data using Spark RDD operations"""
    
    def __init__(self):
        """Initialize Spark session"""
        self.spark = SparkSession.builder \
            .appName("WeatherDataAnalysis") \
            .master("local[*]") \
            .getOrCreate()
        self.sc = self.spark.sparkContext
        self.sc.setLogLevel("ERROR")
    
    def load_data(self, file_path):
        """
        Load weather data from CSV file into RDD
        
        Args:
            file_path: Path to CSV file
            
        Returns:
            RDD of weather records
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Weather data file not found: {file_path}")
        
        # Define schema
        schema = StructType([
            StructField("date", StringType(), True),
            StructField("location", StringType(), True),
            StructField("temperature", DoubleType(), True),
            StructField("humidity", DoubleType(), True),
            StructField("precipitation", DoubleType(), True),
            StructField("wind_speed", DoubleType(), True),
            StructField("condition", StringType(), True)
        ])
        
        # Load as DataFrame first, then convert to RDD for MapReduce operations
        df = self.spark.read.csv(file_path, header=True, schema=schema)
        
        # Filter out any completely null rows
        df = df.filter(
            df.location.isNotNull() & 
            df.temperature.isNotNull()
        )
        
        return df
    
    def get_temperature_stats_by_location(self, df):
        """
        Calculate temperature statistics by location using RDD operations
        Uses MapReduce: map -> groupByKey -> reduceByKey pattern
        """
        try:
            # Filter out null values first
            df_clean = df.filter(df.location.isNotNull() & df.temperature.isNotNull())
            
            # Convert DataFrame to RDD for MapReduce operations
            rdd = df_clean.select("location", "temperature").rdd
            
            # Map: Create key-value pairs (location, temperature)
            # Handle both Row objects and tuples
            def extract_values(row):
                try:
                    location = str(row[0]) if row[0] is not None else "Unknown"
                    temp_val = row[1]
                    if temp_val is None:
                        return None
                    temp = float(temp_val)
                    return (location, (temp, 1))
                except (ValueError, TypeError, IndexError) as e:
                    print(f"Error extracting values from row: {row}, error: {e}")
                    return None
            
            location_temp_rdd = rdd.map(extract_values).filter(lambda x: x is not None)
            
            # Check if RDD is empty
            if location_temp_rdd.isEmpty():
                print("Warning: RDD is empty after filtering")
                return []
            
            # Reduce: Aggregate by location (sum temperatures, count records)
            aggregated = location_temp_rdd.reduceByKey(lambda a, b: (a[0] + b[0], a[1] + b[1]))
            
            # Map: Calculate average
            def calculate_avg(x):
                try:
                    location = x[0]
                    temp_sum, count = x[1]
                    avg_temp = round(temp_sum / count, 2) if count > 0 else 0.0
                    return {
                        'location': location,
                        'avg_temperature': avg_temp,
                        'count': count
                    }
                except Exception as e:
                    print(f"Error calculating average: {e}")
                    return None
            
            avg_temps = aggregated.map(calculate_avg).filter(lambda x: x is not None)
            
            result = avg_temps.collect()
            # Ensure we return a list of dictionaries
            return result if result else []
        except Exception as e:
            print(f"Error in get_temperature_stats_by_location: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def get_max_min_temperature_by_location(self, df):
        """Get max and min temperatures by location using RDD"""
        rdd = df.select("location", "temperature").rdd
        
        # Map: Create (location, (temp, temp)) for max/min tracking
        def extract_temp(row):
            location = row[0] if row[0] is not None else str(row[0])
            temp = float(row[1]) if row[1] is not None else 0.0
            return (location, (temp, temp))
        
        location_temp_rdd = rdd.map(extract_temp)
        
        # Reduce: Find max and min
        max_min = location_temp_rdd.reduceByKey(
            lambda a, b: (max(a[0], b[0]), min(a[1], b[1]))
        )
        
        def format_result(x):
            return {
                'location': x[0],
                'max_temperature': round(x[1][0], 2),
                'min_temperature': round(x[1][1], 2)
            }
        
        result = max_min.map(format_result).collect()
        
        return result if result else []
    
    def get_precipitation_by_location(self, df):
        """Calculate total precipitation by location using RDD"""
        rdd = df.select("location", "precipitation").rdd
        
        # Map: Create (location, precipitation)
        def extract_precip(row):
            location = row[0] if row[0] is not None else str(row[0])
            precip = float(row[1]) if row[1] is not None else 0.0
            return (location, precip)
        
        location_precip_rdd = rdd.map(extract_precip)
        
        # Reduce: Sum precipitation by location
        total_precip = location_precip_rdd.reduceByKey(lambda a, b: a + b)
        
        result = total_precip.map(lambda x: {
            'location': x[0],
            'total_precipitation': round(x[1], 2)
        }).collect()
        
        return result if result else []
    
    def get_weather_condition_distribution(self, df):
        """Count weather conditions using RDD"""
        rdd = df.select("condition").rdd
        
        # Map: Create (condition, 1)
        def extract_condition(row):
            condition = row[0] if row[0] is not None else str(row[0])
            return (condition, 1)
        
        condition_rdd = rdd.map(extract_condition)
        
        # Reduce: Count by condition
        condition_counts = condition_rdd.reduceByKey(lambda a, b: a + b)
        
        result = condition_counts.map(lambda x: {
            'condition': x[0],
            'count': x[1]
        }).collect()
        
        return result if result else []
    
    def get_daily_average_temperature(self, df):
        """Calculate daily average temperature using RDD"""
        rdd = df.select("date", "temperature").rdd
        
        # Map: Create (date, (temp, 1))
        def extract_date_temp(row):
            date = row[0] if row[0] is not None else str(row[0])
            temp = float(row[1]) if row[1] is not None else 0.0
            return (date, (temp, 1))
        
        date_temp_rdd = rdd.map(extract_date_temp)
        
        # Reduce: Aggregate by date
        aggregated = date_temp_rdd.reduceByKey(lambda a, b: (a[0] + b[0], a[1] + b[1]))
        
        # Map: Calculate average
        def calculate_daily_avg(x):
            date = x[0]
            temp_sum, count = x[1]
            avg_temp = round(temp_sum / count, 2) if count > 0 else 0.0
            return (date, avg_temp)
        
        daily_avg_rdd = aggregated.map(calculate_daily_avg)
        # Sort by date
        daily_avg = daily_avg_rdd.sortBy(lambda x: x[0]).map(lambda x: {
            'date': x[0],
            'avg_temperature': x[1]
        }).collect()
        
        return daily_avg if daily_avg else []
    
    def get_location_statistics(self, df):
        """Get comprehensive statistics by location using DataFrame operations"""
        stats = df.groupBy("location").agg(
            avg("temperature").alias("avg_temperature"),
            spark_max("temperature").alias("max_temperature"),
            spark_min("temperature").alias("min_temperature"),
            avg("humidity").alias("avg_humidity"),
            avg("precipitation").alias("avg_precipitation"),
            avg("wind_speed").alias("avg_wind_speed"),
            count("location").alias("record_count")
        ).collect()
        
        result = []
        for row in stats:
            result.append({
                'location': row['location'],
                'avg_temperature': round(row['avg_temperature'], 2),
                'max_temperature': round(row['max_temperature'], 2),
                'min_temperature': round(row['min_temperature'], 2),
                'avg_humidity': round(row['avg_humidity'], 2),
                'avg_precipitation': round(row['avg_precipitation'], 2),
                'avg_wind_speed': round(row['avg_wind_speed'], 2),
                'record_count': row['record_count']
            })
        
        return result
    
    def get_humidity_by_location(self, df):
        """Calculate average humidity by location using RDD"""
        rdd = df.select("location", "humidity").rdd
        
        # Map: Create (location, (humidity, 1))
        def extract_humidity(row):
            location = row[0] if row[0] is not None else str(row[0])
            humidity = float(row[1]) if row[1] is not None else 0.0
            return (location, (humidity, 1))
        
        location_humidity_rdd = rdd.map(extract_humidity)
        
        # Reduce: Aggregate
        aggregated = location_humidity_rdd.reduceByKey(lambda a, b: (a[0] + b[0], a[1] + b[1]))
        
        # Map: Calculate average
        def calculate_avg_humidity(x):
            location = x[0]
            hum_sum, count = x[1]
            avg_hum = round(hum_sum / count, 2) if count > 0 else 0.0
            return {
                'location': location,
                'avg_humidity': avg_hum
            }
        
        avg_humidity = aggregated.map(calculate_avg_humidity).collect()
        
        return avg_humidity if avg_humidity else []
    
    def close(self):
        """Close Spark session"""
        self.spark.stop()



