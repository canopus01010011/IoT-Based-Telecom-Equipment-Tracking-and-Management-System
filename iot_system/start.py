"""
Single-process deployment: route_server.py handles both the HTTP API and
GPS simulation threads in-process (no external child processes).
"""
import os
import subprocess
import sys


def main() -> None:
    port = os.getenv("PORT", "8001")

    print(f"Starting route API + GPS simulator on port {port}...")
    proc = subprocess.Popen(
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

    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()
        sys.exit(0)


if __name__ == "__main__":
    main()
