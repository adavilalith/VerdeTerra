import json
import boto3
import os
from decimal import Decimal 

DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    print(f"Received SQS event with {len(event['Records'])} records.")

    records_processed = 0

    for record in event['Records']:
        try:
            message_body = record['body']
            payload = json.loads(message_body)

            print(f"Processing payload for device_id: {payload.get('device_id')}, timestamp_ms: {payload.get('timestamp_ms')}")

            item = {
                'device_id': payload['device_id'],
                'timestamp_ms': int(payload['timestamp_ms']), # Already int, just ensure it's not a string
                'air_temp_c': Decimal(str(payload['air_temp_c'])), # <-- FIX: Convert float to Decimal
                'air_humidity_pct': Decimal(str(payload['air_humidity_pct'])), # <-- FIX: Convert float to Decimal
                'soil_moisture_pct': Decimal(str(payload['soil_moisture_pct'])), # <-- FIX: Convert float to Decimal
                'soil_temp_c': Decimal(str(payload['soil_temp_c'])) # <-- FIX: Convert float to Decimal
            }

            table.put_item(Item=item)
            print(f"Successfully wrote data for device: {item['device_id']}")
            records_processed += 1

        except json.JSONDecodeError as e:
            print(f"ERROR: Failed to decode JSON from SQS message body: {e}. Body: {record.get('body', 'N/A')}")
        except KeyError as e:
            print(f"ERROR: Missing expected key in payload: {e}. Payload: {payload}")
        except ValueError as e:
            print(f"ERROR: Data type conversion error: {e}. Payload: {payload}")
        except Exception as e:
            print(f"ERROR: Unhandled exception: {e}. Record: {record}")

    print(f"Finished processing. Successfully processed {records_processed} out of {len(event['Records'])} records.")

    return {
        'statusCode': 200,
        'body': json.dumps(f'Processed {records_processed} records.')
    }
