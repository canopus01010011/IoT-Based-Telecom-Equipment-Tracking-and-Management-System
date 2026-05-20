import paho.mqtt.client as mqtt
import ssl
import json
import requests
from config import *

def on_message(client, userdata, message):
    parts = message.topic.split("/")
    site_id = parts[2]
    device_id = parts[3]
    payload = json.loads(message.payload.decode())
    payload["siteID"] = site_id
    payload["deviceID"] = device_id
    headers = {}
    if IOT_API_TOKEN:
        headers["x-iot-token"] = IOT_API_TOKEN

    try:
        response = requests.post(BACKEND_GPS_URL, json=payload, headers=headers, timeout=5)
        response.raise_for_status()
        print(f"Forwarded GPS payload for {device_id} to backend")
    except requests.RequestException as exc:
        print(f"Failed to forward GPS payload for {device_id}: {exc}")

if __name__ == "__main__":
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    
    # Enable TLS/SSL only on the standard secure MQTT port.
    if BROKER_PORT == 8883:
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)
        
    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        
    client.connect(BROKER_HOST, BROKER_PORT)
    print("Connected to the broker MQTT")
    client.on_message = on_message
    client.subscribe("ericsson/sites/+/+/gps")

    client.loop_forever()
