"""HTTP API — serves GPX route waypoints + controls GPS simulation."""
import os
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from routes import get_waypoints, list_routes

app = FastAPI(title="EquipTrack IoT Routes", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
STATE_FILE = BASE_DIR / "active_simulations.json"


def _load_state() -> list[str]:
    try:
        data = json.loads(STATE_FILE.read_text())
        if isinstance(data, list):
            return data
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return []


def _save_state(devices: list[str]) -> None:
    STATE_FILE.write_text(json.dumps(devices, indent=2))


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


# ── Simulation control ────────────────────────────────────────────────────


@app.get("/simulation/status")
def simulation_status():
    return {"success": True, "activeDevices": _load_state()}


@app.post("/simulation/start/{device_id}")
def simulation_start(device_id: str):
    devices = _load_state()
    device_id = device_id.strip()
    if device_id not in devices:
        devices.append(device_id)
        _save_state(devices)
    return {"success": True, "deviceId": device_id, "active": True}


@app.post("/simulation/stop/{device_id}")
def simulation_stop(device_id: str):
    devices = _load_state()
    device_id = device_id.strip()
    devices = [d for d in devices if d != device_id]
    _save_state(devices)
    return {"success": True, "deviceId": device_id, "active": False}


@app.post("/simulation/stop-all")
def simulation_stop_all():
    _save_state([])
    return {"success": True, "activeDevices": []}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
