"""
Run both services in one Railway deployment:
  - HTTP route API + simulation control (route_server.py)
  - GPS MQTT simulator (always runs, waits for start/stop commands)
"""
import os
import subprocess
import sys
import time


def main() -> None:
    port = os.getenv("PORT", "8001")
    sim_only = os.getenv("IOT_SIMULATOR_ONLY", "").lower() in ("1", "true", "yes")

    procs: list[tuple[str, subprocess.Popen]] = []

    if not sim_only:
        print(f"Starting route API on port {port}...")
        api_proc = subprocess.Popen(
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
        procs.append(("routes-api", api_proc))

    print("Starting GPS simulator (waiting for commands)...")
    sim_proc = subprocess.Popen([sys.executable, "gps_simulator.py"])
    procs.append(("gps-simulator", sim_proc))

    if not procs:
        print("Nothing to run.")
        sys.exit(1)

    try:
        while True:
            for name, proc in list(procs):
                if proc.poll() is not None:
                    code = proc.returncode or 1
                    if name == "routes-api":
                        print(f"{name} exited with code {code}")
                        raise SystemExit(code)
                    print(
                        f"Warning: {name} exited with code {code}. "
                        "Route API keeps running.",
                    )
                    procs.remove((name, proc))
            time.sleep(2)
    except KeyboardInterrupt:
        for _, proc in procs:
            proc.terminate()


if __name__ == "__main__":
    main()
