"""
Run both services in one Railway deployment:
  - HTTP route API (for backend / mobile map)
  - GPS MQTT simulator (live container tracking)
"""
import os
import subprocess
import sys
import time


def main() -> None:
    port = os.getenv("PORT", "8001")
    routes_only = os.getenv("IOT_ROUTES_ONLY", "").lower() in ("1", "true", "yes")
    sim_only = os.getenv("IOT_SIMULATOR_ONLY", "").lower() in ("1", "true", "yes")

    procs: list[subprocess.Popen] = []

    if not sim_only:
        print(f"Starting route API on port {port}...")
        procs.append(
            subprocess.Popen(
                [
                    sys.executable,
                    "-m",
                    "uvicorn",
                    "route_server:app",
                    "--host",
                    "0.0.0.0",
                    "--port",
                    port,
                ],
            )
        )

    if not routes_only:
        print("Starting GPS simulator...")
        procs.append(subprocess.Popen([sys.executable, "gps_simulator.py"]))

    if not procs:
        print("Nothing to run. Set IOT_ROUTES_ONLY or IOT_SIMULATOR_ONLY, or run both by default.")
        sys.exit(1)

    try:
        while True:
            for p in procs:
                if p.poll() is not None:
                    print(f"Process exited with code {p.returncode}")
                    raise SystemExit(p.returncode or 1)
            time.sleep(2)
    except KeyboardInterrupt:
        for p in procs:
            p.terminate()


if __name__ == "__main__":
    main()
