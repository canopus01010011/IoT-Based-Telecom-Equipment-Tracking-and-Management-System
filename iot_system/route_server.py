"""HTTP API — serves GPX route waypoints + controls GPS simulation threads."""
import os
import json
import math
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

import gpxpy
import paho.mqtt.client as mqtt
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from routes import get_waypoints, list_routes

# ── Config (inline so there is no dependency on config.py at runtime) ───────

BROKER_HOST = os.getenv("BROKER_HOST") or "broker.hivemq.com"
BROKER_PORT = int(os.getenv("BROKER_PORT") or "1883")
MQTT_USER   = os.getenv("MQTT_USERNAME") or ""
MQTT_PASS   = os.getenv("MQTT_PASSWORD") or ""
TOPIC_GPS   = "ericsson/sites/{siteID}/{deviceID}/gps"
GPS_INTERVAL = int(os.getenv("GPS_INTERVAL") or "5")

BASE_DIR = Path(__file__).parent

DEVICES = [
    {"siteID": "site_alger", "deviceID": "package_001", "route": "OS-Draria",    "gpx_file": str(BASE_DIR / "OS_Draria.gpx")},
    {"siteID": "site_alger", "deviceID": "package_002", "route": "OS-Meftah",    "gpx_file": str(BASE_DIR / "OS_Meftah.gpx")},
    {"siteID": "site_alger", "deviceID": "package_003", "route": "OS-Cheraga",   "gpx_file": str(BASE_DIR / "OS_Cheraga.gpx")},
    {"siteID": "site_alger", "deviceID": "package_004", "route": "OS-Bouzareah", "gpx_file": str(BASE_DIR / "OS_Bouzareah.gpx")},
    {"siteID": "site_alger", "deviceID": "package_005", "route": "OS-BabaHassen","gpx_file": str(BASE_DIR / "OS_BabaHassen.gpx")},
    {"siteID": "site_alger", "deviceID": "package_006", "route": "OS-Souakria",  "gpx_file": str(BASE_DIR / "OS_Souakria.gpx")},
    {"siteID": "site_alger", "deviceID": "package_007", "route": "OS-APN",       "gpx_file": str(BASE_DIR / "OS_APN.gpx")},
    {"siteID": "site_alger", "deviceID": "package_008", "route": "OS-HusseinDey","gpx_file": str(BASE_DIR / "OS_HusseinDey.gpx")},
    {"siteID": "site_alger", "deviceID": "package_009", "route": "OS-Birtouta",  "gpx_file": str(BASE_DIR / "OS_Birtouta.gpx")},
    {"siteID": "site_alger", "deviceID": "package_010", "route": "OS-Sablettes", "gpx_file": str(BASE_DIR / "OS_Sablettes.gpx")},
]

# ── FastAPI app ─────────────────────────────────────────────────────────────

app = FastAPI(title="EquipTrack IoT Routes & Simulation", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route endpoints ─────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "iot-routes"}

@app.get("/routes")
def available_routes():
    return {"success": True, "routes": list_routes()}

@app.get("/routes/{route_name}")
def route_waypoints(route_name: str):
    waypoints = get_waypoints(route_name)
    if not waypoints:
        raise HTTPException(status_code=404, detail=f"Route not found: {route_name}")
    return {
        "success": True,
        "routeName": route_name,
        "count": len(waypoints),
        "waypoints": waypoints,
    }

# ── Simulation engine (runs in-process, no external files) ──────────────────

def _calc_heading(lat1, lon1, lat2, lon2):
    d_lon = math.radians(lon2 - lon1)
    y = math.sin(d_lon) * math.cos(math.radians(lat2))
    x = math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - \
        math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(d_lon)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def _load_gpx_waypoints(gpx_path: str) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    with open(gpx_path) as f:
        gpx = gpxpy.parse(f)
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                points.append((point.latitude, point.longitude))
    return points


# In-memory simulation state: deviceID -> { stop_event, thread }
_sim_running: dict[str, dict] = {}
_mqtt_client: mqtt.Client | None = None


def _device_worker(cfg: dict, stop: threading.Event):
    """Publish GPS waypoints for one device until route done or stopped."""
    points = _load_gpx_waypoints(cfg["gpx_file"])
    if not points:
        print(f"[sim] No waypoints for {cfg['deviceID']}")
        return

    topic = TOPIC_GPS.format(siteID=cfg["siteID"], deviceID=cfg["deviceID"])
    battery = 100
    bat_cnt = 0
    last_heading = 0

    for i in range(len(points)):
        if stop.is_set():
            print(f"[sim] Stopped {cfg['deviceID']}")
            return
        bat_cnt += 1
        if bat_cnt == 3:
            battery = max(0, battery - 1)
            bat_cnt = 0
        if i < len(points) - 1:
            heading = _calc_heading(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1])
            last_heading = heading
        else:
            heading = last_heading
        payload = json.dumps({
            "latitude": points[i][0],
            "longitude": points[i][1],
            "heading": heading,
            "battery": battery,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        })
        if _mqtt_client:
            _mqtt_client.publish(topic, payload)
        if stop.wait(timeout=GPS_INTERVAL):
            print(f"[sim] Stopped {cfg['deviceID']}")
            return
    print(f"[sim] Route complete for {cfg['deviceID']}")


def _find_device_cfg(device_id: str) -> dict | None:
    for d in DEVICES:
        if d["deviceID"] == device_id:
            return d
    return None


# ── Simulation control endpoints ────────────────────────────────────────────

@app.get("/simulation/status")
def sim_status():
    return {
        "success": True,
        "activeDevices": list(_sim_running.keys()),
    }


@app.post("/simulation/start/{device_id}")
def sim_start(device_id: str):
    if device_id in _sim_running:
        return {"success": True, "deviceId": device_id, "active": True, "message": "Already running"}
    cfg = _find_device_cfg(device_id)
    if not cfg:
        raise HTTPException(status_code=404, detail=f"Unknown device: {device_id}")
    stop_ev = threading.Event()
    t = threading.Thread(target=_device_worker, args=(cfg, stop_ev), daemon=True)
    t.start()
    _sim_running[device_id] = {"thread": t, "stop": stop_ev}
    print(f"[sim] Started {device_id} ({cfg['route']})")
    return {"success": True, "deviceId": device_id, "active": True}


@app.post("/simulation/stop/{device_id}")
def sim_stop(device_id: str):
    entry = _sim_running.pop(device_id, None)
    if entry:
        entry["stop"].set()
        print(f"[sim] Stopped {device_id}")
    return {"success": True, "deviceId": device_id, "active": False}


@app.post("/simulation/stop-all")
def sim_stop_all():
    for device_id in list(_sim_running.keys()):
        _sim_running[device_id]["stop"].set()
    _sim_running.clear()
    print("[sim] Stopped all")
    return {"success": True, "activeDevices": []}


# ── Startup: connect MQTT ───────────────────────────────────────────────────

@app.on_event("startup")
def startup():
    global _mqtt_client
    print(f"[sim] Connecting MQTT {BROKER_HOST}:{BROKER_PORT} ...")
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        if MQTT_USER:
            client.username_pw_set(MQTT_USER, MQTT_PASS)
        client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
        client.loop_start()
        _mqtt_client = client
        print("[sim] MQTT connected — waiting for simulation start commands")
    except Exception as e:
        print(f"[sim] MQTT connect failed: {e} — simulation unavailable")


# ── Main ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
