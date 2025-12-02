"""
Weather Data Generator
Generates sample weather data for analysis
"""
import csv
import random
from datetime import datetime, timedelta
import os

def generate_weather_data(num_records=1000, output_file='data/weather_data.csv'):
    """
    Generate sample weather data
    
    Args:
        num_records: Number of records to generate
        output_file: Output CSV file path
    """
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
                 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
    
    weather_conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Foggy', 'Windy']
    
    # Generate data
    data = []
    base_date = datetime(2023, 1, 1)
    
    for i in range(num_records):
        date = base_date + timedelta(days=i % 365)
        location = random.choice(locations)
        
        # Generate realistic weather data based on location and season
        month = date.month
        if location in ['Phoenix', 'Los Angeles', 'San Diego', 'San Jose']:
            # Warmer climates
            base_temp = 20 + (month - 1) * 2
            temp = base_temp + random.uniform(-5, 15)
        elif location in ['Chicago', 'New York', 'Philadelphia']:
            # Temperate climates with seasons
            base_temp = 10 + 10 * abs(6 - month) / 6
            temp = base_temp + random.uniform(-10, 10)
        else:
            # Moderate climates
            base_temp = 15 + (month - 1) * 1.5
            temp = base_temp + random.uniform(-8, 12)
        
        humidity = random.uniform(30, 90)
        precipitation = random.uniform(0, 50) if random.random() < 0.3 else 0
        wind_speed = random.uniform(0, 30)
        condition = random.choice(weather_conditions)
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'location': location,
            'temperature': round(temp, 2),
            'humidity': round(humidity, 2),
            'precipitation': round(precipitation, 2),
            'wind_speed': round(wind_speed, 2),
            'condition': condition
        })
    
    # Write to CSV
    with open(output_file, 'w', newline='') as csvfile:
        fieldnames = ['date', 'location', 'temperature', 'humidity', 
                     'precipitation', 'wind_speed', 'condition']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Generated {num_records} weather records in {output_file}")
    return output_file

if __name__ == '__main__':
    generate_weather_data(1000)








