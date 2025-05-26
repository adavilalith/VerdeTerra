import json
import boto3
from datetime import datetime, timedelta, timezone 
from collections import defaultdict
from decimal import Decimal

# Initialize DynamoDB client outside the handler for better performance
dynamodb = boto3.resource('dynamodb')

# IMPORTANT: Replace with your actual DynamoDB table name
# Or, set this as an environment variable in Lambda for better practice
TABLE_NAME = 'verde-terra-sensor-data' 

def lambda_handler(event, context):
    print(event) # Keep this for debugging the incoming event

    """
    AWS Lambda function to fetch and aggregate sensor data from DynamoDB.
    Expected query parameters:
    - deviceId (string): The ID of the sensor device.
    - timeBackMs (number): Duration in milliseconds from current time to look back.
    """
    
    # Define CORS headers
    cors_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    }
    
    # Handle OPTIONS preflight request for CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    # 1. Parse Request Parameters and Calculate Time Range
    try:
        query_params = event.get('queryStringParameters')
        if not query_params:
            return {
                'statusCode': 400,
                'headers': { **cors_headers },
                'body': json.dumps({'message': 'Missing query parameters'})
            }

        device_id = query_params.get('deviceId')
        time_back_ms = int(query_params.get('timeBackMs'))

        if not all([device_id, time_back_ms is not None]):
            return {
                'statusCode': 400,
                'headers': { **cors_headers },
                'body': json.dumps({'message': 'Missing required parameters: deviceId, timeBackMs'})
            }
        
        end_time_ms = int(datetime.utcnow().timestamp() * 1000)
        start_time_ms = end_time_ms - time_back_ms

        if start_time_ms >= end_time_ms:
            return {
                'statusCode': 400,
                'headers': { **cors_headers },
                'body': json.dumps({'message': 'Invalid timeBackMs value (must be positive)'})
            }

    except (ValueError, TypeError) as e:
        return {
            'statusCode': 400,
            'headers': { **cors_headers },
            'body': json.dumps({'message': f'Invalid parameter type: {str(e)}'})
        }
    except Exception as e:
        print(f"Error parsing request or calculating time: {e}")
        return {
            'statusCode': 500,
            'headers': { **cors_headers },
            'body': json.dumps({'message': f'Error processing request: {str(e)}'})
        }

    # 2. Determine Aggregation Interval and corresponding format string
    duration_actual_ms = end_time_ms - start_time_ms
    ONE_DAY_MS = 24 * 60 * 60 * 1000
    ONE_HOUR_MS = 60 * 60 * 1000
    FIFTEEN_MIN_MS = 15 * 60 * 1000
    FIVE_MIN_MS = 5 * 60 * 1000 
    TWO_MIN_MS = 2 * 60 * 1000 # <--- NEW: 2-minute interval

    aggregation_interval_ms = FIFTEEN_MIN_MS # Default fallback
    format_string = '%m-%d %H:%M' # Default fallback

    # Ordered from most granular (smallest duration) to least granular (largest duration)
    if duration_actual_ms <= 3 * ONE_HOUR_MS: # <--- NEW Condition: Under 3 hours
        aggregation_interval_ms = TWO_MIN_MS
        format_string = '%H:%M' # e.g., "14:32"
    elif duration_actual_ms <= 6 * ONE_HOUR_MS: # Between 3 and 6 hours
        aggregation_interval_ms = FIVE_MIN_MS
        format_string = '%H:%M' # e.g., "14:30"
    elif duration_actual_ms <= 2 * ONE_DAY_MS: # Between 6 hours and 2 days
        aggregation_interval_ms = FIFTEEN_MIN_MS
        format_string = '%m-%d %H:%M' # e.g., "05-26 14:15"
    elif duration_actual_ms <= 7 * ONE_DAY_MS: # Between 2 and 7 days
        aggregation_interval_ms = ONE_HOUR_MS
        format_string = '%m-%d %H:%M' # e.g., "05-26 14:00"
    else: # More than 7 days
        aggregation_interval_ms = ONE_DAY_MS
        format_string = '%Y-%m-%d' # e.g., "2025-05-26"

    table = dynamodb.Table(TABLE_NAME)
    all_items = []
    
    # 3. Query DynamoDB for Raw Data
    try:
        query_params = {
            'KeyConditionExpression': boto3.dynamodb.conditions.Key('device_id').eq(device_id) &
                                    boto3.dynamodb.conditions.Key('timestamp_ms').between(start_time_ms, end_time_ms)
        }
        
        response = table.query(**query_params)
        all_items.extend(response['Items'])

        while 'LastEvaluatedKey' in response:
            query_params['ExclusiveStartKey'] = response['LastEvaluatedKey']
            response = table.query(**query_params)
            all_items.extend(response['Items'])
        
        if not all_items:
            return {
                'statusCode': 200,
                'headers': { **cors_headers },
                'body': json.dumps({'data': []})
            }

    except Exception as e:
        print(f"DynamoDB query error: {e}")
        return {
            'statusCode': 500,
            'headers': { **cors_headers },
            'body': json.dumps({'message': f'Failed to query data from DynamoDB: {str(e)}'})
        }

    # 4. Perform In-Memory Aggregation and Add Formatted Timestamp
    aggregated_data_sums = defaultdict(lambda: defaultdict(lambda: Decimal(0))) 
    aggregated_data_counts = defaultdict(lambda: defaultdict(int))

    for item in all_items:
        # Ensure timestamp_ms is an integer for floor division
        bucket_timestamp_ms = int((int(item['timestamp_ms']) // aggregation_interval_ms) * aggregation_interval_ms)
        
        aggregated_data_sums[bucket_timestamp_ms]['air_temp_c'] += item.get('air_temp_c', Decimal(0))
        aggregated_data_sums[bucket_timestamp_ms]['air_humidity_pct'] += item.get('air_humidity_pct', Decimal(0))
        aggregated_data_sums[bucket_timestamp_ms]['soil_moisture_pct'] += item.get('soil_moisture_pct', Decimal(0))
        aggregated_data_sums[bucket_timestamp_ms]['soil_temp_c'] += item.get('soil_temp_c', Decimal(0))

        if 'air_temp_c' in item: aggregated_data_counts[bucket_timestamp_ms]['air_temp_c'] += 1
        if 'air_humidity_pct' in item: aggregated_data_counts[bucket_timestamp_ms]['air_humidity_pct'] += 1
        if 'soil_moisture_pct' in item: aggregated_data_counts[bucket_timestamp_ms]['soil_moisture_pct'] += 1
        if 'soil_temp_c' in item: aggregated_data_counts[bucket_timestamp_ms]['soil_temp_c'] += 1
    
    final_aggregated_list = []
    sorted_bucket_timestamps = sorted(aggregated_data_sums.keys())

    for ts_ms in sorted_bucket_timestamps:
        # ts_ms -= 1.98e+7
        dt_object = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
        
        avg_air_temp_c = (aggregated_data_sums[ts_ms]['air_temp_c'] / aggregated_data_counts[ts_ms]['air_temp_c']) if aggregated_data_counts[ts_ms]['air_temp_c'] > 0 else None
        avg_air_humidity_pct = (aggregated_data_sums[ts_ms]['air_humidity_pct'] / aggregated_data_counts[ts_ms]['air_humidity_pct']) if aggregated_data_counts[ts_ms]['air_humidity_pct'] > 0 else None
        avg_soil_moisture_pct = (aggregated_data_sums[ts_ms]['soil_moisture_pct'] / aggregated_data_counts[ts_ms]['soil_moisture_pct']) if aggregated_data_counts[ts_ms]['soil_moisture_pct'] > 0 else None
        avg_soil_temp_c = (aggregated_data_sums[ts_ms]['soil_temp_c'] / aggregated_data_counts[ts_ms]['soil_temp_c']) if aggregated_data_counts[ts_ms]['soil_temp_c'] > 0 else None

        final_aggregated_list.append({
            'device_id': device_id, 
            'timestamp_ms': ts_ms, 
            'timestamp_formatted': dt_object.strftime(format_string),
            'air_temp_c': float(round(avg_air_temp_c, 2)) if avg_air_temp_c is not None else None,
            'air_humidity_pct': float(round(avg_air_humidity_pct, 2)) if avg_air_humidity_pct is not None else None,
            'soil_moisture_pct': float(round(avg_soil_moisture_pct, 2)) if avg_soil_moisture_pct is not None else None,
            'soil_temp_c': float(round(avg_soil_temp_c, 2)) if avg_soil_temp_c is not None else None,
        })
    
    # 5. Return Aggregated Data
    return {
        'statusCode': 200,
        'headers': { **cors_headers },
        'body': json.dumps({'data': final_aggregated_list})
    }
