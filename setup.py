"""
Setup script to generate initial weather data
"""
from data_generator import generate_weather_data
import os

if __name__ == '__main__':
    print("Setting up Weather Data Analytics Project...")
    print("Generating sample weather data...")
    
    data_file = 'data/weather_data.csv'
    if os.path.exists(data_file):
        print(f"Data file already exists: {data_file}")
        response = input("Do you want to regenerate it? (y/n): ")
        if response.lower() == 'y':
            generate_weather_data(1000, data_file)
            print("Data generation complete!")
        else:
            print("Using existing data file.")
    else:
        generate_weather_data(1000, data_file)
        print("Data generation complete!")
    
    print("\nSetup complete!")
    print("To run the application, execute: python app.py")
    print("Then open your browser to: http://localhost:5000")








