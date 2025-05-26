import boto3
import json
from datetime import datetime, timedelta, timezone
import random
import time
from decimal import Decimal # <--- NEW: Import Decimal

# --- Configuration ---
# IMPORTANT: Replace with your actual DynamoDB table name
DYNAMODB_TABLE_NAME = 'verde-terra-sensor-data' 

# AWS Region where your DynamoDB table is located
AWS_REGION = 'ap-south-1' # Example: 'us-east-1', 'eu-west-1', 'ap-south-1'

# Number of days back from today to generate data for
DAYS_TO_GENERATE = 5 

# Frequency of data points in seconds (matching your device's sending interval)
DATA_FREQUENCY_SECONDS = 20

# Calculate total points per day based on frequency
POINTS_PER_DAY = (24 * 60 * 60) // DATA_FREQUENCY_SECONDS # 24 hours * 60 min * 60 sec / 20 sec = 4320 points

# List of device IDs to generate data for
DEVICE_IDS = [
    'verde-terra-esp32-001',
    'verde-terra-esp32-002',
    'verde-terra-esp32-003',
]

# --- Initialize DynamoDB Client ---
try:
    dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    print(f"Connected to DynamoDB table: {DYNAMODB_TABLE_NAME}")
except Exception as e:
    print(f"Error connecting to DynamoDB: {e}")
    print("Please ensure your AWS credentials and region are configured correctly.")
    exit(1)

# --- Data Generation Function ---
def generate_sensor_data_points(device_id, start_of_day_utc, num_points_per_day, frequency_seconds):
    """
    Generates dummy sensor data points for a single day for a given device
    at the specified frequency.
    """
    data_points = []
    
    # Calculate time interval in milliseconds
    interval_ms = frequency_seconds * 1000

    for i in range(num_points_per_day):
        # Calculate base timestamp for each point
        # Add a small random offset (e.g., +/- 5 seconds) to make timestamps slightly varied
        current_time = start_of_day_utc + timedelta(milliseconds=i * interval_ms)
        timestamp_ms = int(current_time.timestamp() * 1000) + random.randint(-5000, 5000) 

        # Generate realistic-ish random values and convert them to Decimal
        # This is the crucial change for float-to-Decimal conversion
        air_temp_c = Decimal(str(round(random.uniform(20.0, 35.0), 1)))  # Convert float to string first for exact decimal
        air_humidity_pct = Decimal(str(round(random.uniform(40.0, 90.0), 1)))
        soil_moisture_pct = Decimal(str(round(random.uniform(20.0, 80.0), 1)))
        soil_temp_c = Decimal(str(round(random.uniform(15.0, 30.0), 1)))

        data_points.append({
            'device_id': device_id,
            'timestamp_ms': timestamp_ms, # timestamp_ms is an integer, so no Decimal conversion needed here
            'air_temp_c': air_temp_c,
            'air_humidity_pct': air_humidity_pct,
            'soil_moisture_pct': soil_moisture_pct,
            'soil_temp_c': soil_temp_c,
        })
    return data_points

# --- Main Execution ---
def populate_dynamodb():
    total_items_put = 0
    
    # Get today's date in UTC (important for consistent timestamps)
    # Start of today (00:00:00) in UTC
    today_utc = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    print(f"\nGenerating data for the last {DAYS_TO_GENERATE} days (every {DATA_FREQUENCY_SECONDS} seconds), starting from {today_utc.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"This will generate approximately {POINTS_PER_DAY * len(DEVICE_IDS) * DAYS_TO_GENERATE} items.")
    print("Please ensure your DynamoDB table has sufficient Write Capacity Units (WCUs).\n")

    for day_offset in range(DAYS_TO_GENERATE):
        current_day_utc = today_utc - timedelta(days=day_offset)
        print(f"\n--- Generating data for: {current_day_utc.strftime('%Y-%m-%d UTC')} ---")

        for device_id in DEVICE_IDS:
            print(f"  Generating for device: {device_id}...")
            data_points = generate_sensor_data_points(device_id, current_day_utc, POINTS_PER_DAY, DATA_FREQUENCY_SECONDS)
            
            # Use batch_writer for efficient bulk insertion
            with table.batch_writer() as batch:
                for item in data_points:
                    batch.put_item(Item=item)
                    total_items_put += 1
            print(f"    {len(data_points)} items generated and put for {device_id}.")
            time.sleep(0.5) # Small delay between devices/days for less bursty writes

    print(f"\n--- Data Population Complete ---")
    print(f"Successfully put {total_items_put} items into {DYNAMODB_TABLE_NAME}.")

if __name__ == "__main__":
    populate_dynamodb()
