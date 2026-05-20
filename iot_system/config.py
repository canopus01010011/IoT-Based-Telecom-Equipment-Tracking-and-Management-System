from dotenv import load_dotenv
import os

load_dotenv()

BROKER_HOST = os.getenv("BROKER_HOST")
BROKER_PORT = int(os.getenv("BROKER_PORT"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")

TOPIC_GPS = "ericsson/sites/{siteID}/{deviceID}/gps"

GPS_INTERVAL = 10

DEVICES = [
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000001', 'route': 'OS-Draria',   'gpx_file': 'OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000002', 'route': 'OS-Meftah',   'gpx_file': 'OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000003', 'route': 'OS-Cheraga',  'gpx_file': 'OS_Cheraga.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000004', 'route': 'OS-Draria',   'gpx_file': 'OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000005', 'route': 'OS-Meftah',   'gpx_file': 'OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000006', 'route': 'OS-Cheraga',  'gpx_file': 'OS_Cheraga.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000007', 'route': 'OS-Draria',   'gpx_file': 'OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000008', 'route': 'OS-Meftah',   'gpx_file': 'OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000009', 'route': 'OS-Cheraga',  'gpx_file': 'OS_Cheraga.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000010', 'route': 'OS-Draria',   'gpx_file': 'OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000011', 'route': 'OS-Meftah',   'gpx_file': 'OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000012', 'route': 'OS-Cheraga',  'gpx_file': 'OS_Cheraga.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000013', 'route': 'OS-Draria',   'gpx_file': 'OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000014', 'route': 'OS-Meftah',   'gpx_file': 'OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000015', 'route': 'OS-Cheraga',  'gpx_file': 'OS_Cheraga.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000016', 'route': 'OS-Draria',   'gpx_file': 'OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000017', 'route': 'OS-Meftah',   'gpx_file': 'OS_Meftah.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000018', 'route': 'OS-Cheraga',  'gpx_file': 'OS_Cheraga.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000019', 'route': 'OS-Draria',   'gpx_file': 'OS_Draria.gpx'},
    {'siteID': 'site_alger', 'deviceID': 'GPS-SN-000020', 'route': 'OS-Meftah',   'gpx_file': 'OS_Meftah.gpx'},
]