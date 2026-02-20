#!/usr/bin/env python3
"""
Startup script for todo app
Requires: Python 3.8+, Node.js, npm
"""

import socket
import subprocess
import sys
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
VENV = ROOT / ".venv"
FRONTEND = ROOT / "frontend"
BACKEND = ROOT / "backend"

IS_WIN = sys.platform == "win32"
VENV_BIN = VENV / ("Scripts" if IS_WIN else "bin")
VENV_PY = VENV_BIN / "python"
VENV_PIP = VENV_BIN / "pip"


# helpers

def log(msg):
    print(f"\033[34m[setup]\033[0m {msg}")


def ok(msg):
    print(f"\033[32m[done]\033[0m  {msg}")


def fail(msg):
    print(f"\033[31m[error]\033[0m {msg}")
    sys.exit(1)


def run(cmd, cwd=None):
    """Run a command, exit on failure"""
    result = subprocess.run(cmd, cwd=cwd, shell=IS_WIN)
    if result.returncode != 0:
        fail(f"command failed: {' '.join(str(c) for c in cmd)}")


def check_tool(name):
    if not shutil.which(name):
        fail(f"'{name}' is required but not installed."
             f"Please install it and try again.")


def get_lan_ip():
    """Detect the local LAN IP by opening a dummy UDP socket."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None


# checks

check_tool("node")
check_tool("npm")

print()
print("Starting todo app")
print()


# python venv

log("creating python virtual environment...")
run([sys.executable, "-m", "venv", str(VENV)])
ok("venv created at .venv/")

log("installing python dependencies...")
run([str(VENV_PIP), "install", "--quiet", "--upgrade", "pip"])
run([str(VENV_PIP), "install", "--quiet", "-r",
     str(ROOT / "requirements.txt")])
ok("python dependencies installed")


# frontend

log("installing frontend dependencies...")
run(["npm", "install", "--silent"], cwd=FRONTEND)
ok("npm packages installed")

log("building frontend...")
run(["npm", "run", "build", "--silent"], cwd=FRONTEND)
ok("frontend built → frontend/dist/")


# .env setup

lan_ip = get_lan_ip()
lan_url = f"http://{lan_ip}:8000" if lan_ip else None

env_file = ROOT / ".env"
log("writing .env file...")
lines = [
    "DATABASE_FOLDER=data\n",
    "DATABASE_URL=sqlite:///data/todos.db\n",
    "FRONTEND_URL=http://localhost:8000\n",
]
if lan_url:
    lines.append(f"LAN_URL={lan_url}\n")
env_file.write_text("".join(lines))
ok(".env written")


# serve

print()
print("\033[32m  ready!\033[0m server starting on all interfaces")
print("  local  → http://localhost:8000")
if lan_url:
    print(f"  network→ {lan_url}  (open this on any device on your LAN)")
print("  docs   → http://localhost:8000/docs")
print()

uvicorn = VENV_BIN / ("uvicorn.exe" if IS_WIN else "uvicorn")
os.chdir(BACKEND)

if IS_WIN:
    subprocess.run(
        str(uvicorn),
        [
            str(uvicorn),
            "app.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            "8000"
        ]
    )
else:
    os.execv(
        str(uvicorn),
        [
            str(uvicorn),
            "app.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            "8000"
        ]
    )
