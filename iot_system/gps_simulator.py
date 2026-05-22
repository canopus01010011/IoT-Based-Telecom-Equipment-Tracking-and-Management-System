"""
GPS MQTT Simulator — controllable via active_simulations.json.

Reads the shared state file written by route_server.py endpoints
(/simulation/start/{device_id}, /simulation/stop/{device_id}).

Only publishes MQTT data for devices whose serial numbers appear
in the active list.  Runs one thread per active device.
"""
import paho.mqtt.client as mqtt
import gpxpy
import math
import json
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from config import *

BASE_DIR = Path(__file__).parent
STATE_FILE = BASE_DIR / "active_simulations.json"
POLL_INTERVAL = 3  # seconds between state file checks


def _load_active_devices() -> list[str]:
    try:
        data = json.loads(STATE_FILE.read_text())
        if isinstance(data, list):
            return data
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return []


def calculate_heading(lat1, lon1, lat2, lon2):
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)
    d_lon = lon2 - lon1
    x = math.sin(d_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(d_lon)
    heading = math.degrees(math.atan2(x, y))
    return (heading + 360) % 360


def payload_create(lat, lon, heading, battery):
    return {
        "latitude": lat,
        "longitude": lon,
        "heading": heading,
        "battery": battery,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def load_waypoints(gpx_file: str) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    with open(gpx_file, "r") as f:
        gpx = gpxpy.parse(f)
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                points.append((point.latitude, point.longitude))
    return points


def run_device(client, device, stop_event):
    """
    Publish GPS waypoints for one device until the route is done
    or stop_event is set.
    """
    points = load_waypoints(device["gpx_file"])
    if not points:
        print(f"No waypoints for {device['deviceID']}, skipping")
        return

    topic = TOPIC_GPS.format(siteID=device["siteID"], deviceID=device["deviceID"])
    last_heading = 0
    battery = 100
    battery_counter = 0

    for i in range(len(points)):
        if stop_event.is_set():
            print(f"Simulation stopped for {device['deviceID']}")
            return

        battery_counter += 1
        if battery_counter == 3:
            battery = max(0, battery - 1)
            battery_counter = 0

        if i < len(points) - 1:
            heading = calculate_heading(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1])
            last_heading = heading
        else:
            heading = last_heading

        payload = payload_create(points[i][0], points[i][1], heading, battery)
        client.publish(topic, json.dumps(payload))

        if stop_event.wait(timeout=GPS_INTERVAL):
            print(f"Simulation stopped for {device['deviceID']}")
            return

    print(f"Route complete for {device['deviceID']}")


def find_device(device_id: str):
    """Look up device config by device_serial_number."""
    for d in DEVICES:
        if d["deviceID"] == device_id:
            return d
    return None


def main():
    print(f"Connecting to MQTT {BROKER_HOST}:{BROKER_PORT}...")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    try:
        client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    except Exception as e:
        print(f"MQTT connect failed: {e}")
        print("Set BROKER_HOST, BROKER_PORT, MQTT_USERNAME, MQTT_PASSWORD on Railway.")
        raise SystemExit(1) from e
    client.loop_start()
    print("Connected to broker MQTT — waiting for simulation commands")

    # Track running threads: deviceID -> (thread, stop_event)
    running: dict[str, tuple[threading.Thread, threading.Event]] = {}

    try:
        while True:
            active = _load_active_devices()
            active_set = set(active)

            # Stop devices no longer in the active list
            for device_id in list(running.keys()):
                if device_id not in active_set:
                    thread, stop_event = running.pop(device_id)
                    stop_event.set()
                    print(f"Stopping {device_id}")

            # Start newly active devices
            for device_id in active:
                if device_id in running:
                    continue
                device_cfg = find_device(device_id)
                if not device_cfg:
                    print(f"Unknown device: {device_id}, skipping")
                    continue
                stop_event = threading.Event()
                thread = threading.Thread(
                    target=run_device,
                    args=(client, device_cfg, stop_event),
                    daemon=True,
                )
                thread.start()
                running[device_id] = (thread, stop_event)
                print(f"Started simulation for {device_id} ({device_cfg['route']})")

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        print("\nShutting down...")
        for device_id, (_, stop_event) in running.items():
            stop_event.set()
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
