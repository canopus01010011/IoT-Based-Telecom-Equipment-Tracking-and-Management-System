from dotenv import load_dotenv
import os

load_dotenv()

BROKER_HOST = os.getenv("BROKER_HOST", "localhost")
BROKER_PORT = int(os.getenv("BROKER_PORT", "1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
BACKEND_GPS_URL = os.getenv("BACKEND_GPS_URL", "http://localhost:5000/api/gps/iot")
IOT_API_TOKEN = os.getenv("IOT_API_TOKEN")

TOPIC_GPS = "ericsson/sites/{siteID}/{deviceID}/gps"

GPS_INTERVAL = 5

DEVICES = [
    {'siteID': 'site_alger', 'deviceID': 'package_001', 'route': 'OS-Draria', 'gpx_file': 'roads/OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'package_002', 'route': 'OS-Meftah', 'gpx_file': 'roads/OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'package_003', 'route': 'OS-Cheraga', 'gpx_file': 'roads/OS_Cheraga.gpx'},
]
