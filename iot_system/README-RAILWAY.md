# Deploy IoT system on Railway (one service)

**One service** runs both:
- **Route API** — GPX paths for the mobile map (`/routes/OS-BabaHassen`)
- **GPS simulator** — publishes live positions to MQTT

Start command: `python start.py`

---

## 1. Create the IoT service (once)

1. Railway project → **+ New** → **GitHub Repo** → same `PFE` repo  
2. **Service name:** e.g. `iot-system`  
3. **Settings → Root Directory:** `iot_system`  
4. **Start command:**
   ```bash
   python start.py
   ```
5. **Variables** — MQTT (for simulator):
   - `BROKER_HOST`, `BROKER_PORT`, `MQTT_USERNAME`, `MQTT_PASSWORD`
   - `GPS_INTERVAL=5` (optional)
6. **Networking → Generate Domain** → e.g. `iot-system-production.up.railway.app`

### Test

```text
https://YOUR-IOT-DOMAIN.up.railway.app/health
https://YOUR-IOT-DOMAIN.up.railway.app/routes/OS-BabaHassen
```

---

## 2. Link backend to IoT routes

On your **backend** Railway service → **Variables**:

```env
IOT_SERVICE_URL=https://YOUR-IOT-DOMAIN.up.railway.app
```

Redeploy backend. It will load GPX waypoints from the IoT service instead of local files.

### Optional: run only one part

| Variable | Effect |
|----------|--------|
| `IOT_ROUTES_ONLY=true` | HTTP routes only (no simulator) |
| `IOT_SIMULATOR_ONLY=true` | MQTT simulator only (no public routes API) |

Default: **both** run together.

Backend MQTT settings must match the same broker (`MQTT_HOST` on backend).

---

## Commit & push

Ensure `iot_system/*.gpx` are in git, then push so Railway can deploy.
