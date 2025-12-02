"""
Fallback Processor using Pandas (when Spark is not available)
Provides same interface as SparkProcessor but uses pandas for processing
"""
import pandas as pd
import os

class FallbackWeatherProcessor:
    """Process weather data using pandas (fallback when Spark is unavailable)"""
    
    def __init__(self):
        """Initialize processor"""
        pass
    
    def load_data(self, file_path):
        """
        Load weather data from CSV file
        
        Args:
            file_path: Path to CSV file
            
        Returns:
            DataFrame
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Weather data file not found: {file_path}")
        
        df = pd.read_csv(file_path)
        return df
    
    def get_temperature_stats_by_location(self, df):
        """Calculate temperature statistics by location"""
        result = df.groupby('location')['temperature'].agg(['mean', 'count']).reset_index()
        result.columns = ['location', 'avg_temperature', 'count']
        result['avg_temperature'] = result['avg_temperature'].round(2)
        return result.to_dict('records')
    
    def get_max_min_temperature_by_location(self, df):
        """Get max and min temperatures by location"""
        result = df.groupby('location')['temperature'].agg(['max', 'min']).reset_index()
        result.columns = ['location', 'max_temperature', 'min_temperature']
        result['max_temperature'] = result['max_temperature'].round(2)
        result['min_temperature'] = result['min_temperature'].round(2)
        return result.to_dict('records')
    
    def get_precipitation_by_location(self, df):
        """Calculate total precipitation by location"""
        result = df.groupby('location')['precipitation'].sum().reset_index()
        result.columns = ['location', 'total_precipitation']
        result['total_precipitation'] = result['total_precipitation'].round(2)
        return result.to_dict('records')
    
    def get_weather_condition_distribution(self, df):
        """Count weather conditions"""
        result = df['condition'].value_counts().reset_index()
        result.columns = ['condition', 'count']
        return result.to_dict('records')
    
    def get_daily_average_temperature(self, df):
        """Calculate daily average temperature"""
        result = df.groupby('date')['temperature'].mean().reset_index()
        result.columns = ['date', 'avg_temperature']
        result['avg_temperature'] = result['avg_temperature'].round(2)
        result = result.sort_values('date')
        return result.to_dict('records')
    
    def get_location_statistics(self, df):
        """Get comprehensive statistics by location"""
        result = df.groupby('location').agg({
            'temperature': ['mean', 'max', 'min'],
            'humidity': 'mean',
            'precipitation': 'mean',
            'wind_speed': 'mean',
            'location': 'count'
        }).reset_index()
        
        result.columns = ['location', 'avg_temperature', 'max_temperature', 
                         'min_temperature', 'avg_humidity', 'avg_precipitation',
                         'avg_wind_speed', 'record_count']
        
        # Round numeric columns
        numeric_cols = ['avg_temperature', 'max_temperature', 'min_temperature',
                       'avg_humidity', 'avg_precipitation', 'avg_wind_speed']
        for col in numeric_cols:
            result[col] = result[col].round(2)
        
        return result.to_dict('records')
    
    def get_humidity_by_location(self, df):
        """Calculate average humidity by location"""
        result = df.groupby('location')['humidity'].mean().reset_index()
        result.columns = ['location', 'avg_humidity']
        result['avg_humidity'] = result['avg_humidity'].round(2)
        return result.to_dict('records')
    
    def close(self):
        """Close processor (no-op for pandas)"""
        pass






