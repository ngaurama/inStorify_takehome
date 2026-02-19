#!/usr/bin/env python3
"""
Cross-platform test runner for the Todo app.
Works on Windows, macOS, and Linux.
Requires: Python 3.8+
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
VENV = ROOT / ".venv"

IS_WIN = sys.platform == "win32"
VENV_BIN = VENV / ("Scripts" if IS_WIN else "bin")
VENV_PIP = VENV_BIN / "pip"
VENV_PY = VENV_BIN / "python"


# helpers

def log(msg): print(f"\033[34m[setup]\033[0m {msg}")
def ok(msg): print(f"\033[32m[done]\033[0m  {msg}")


def fail(msg):
    print(f"\033[31m[error]\033[0m {msg}")
    sys.exit(1)


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        fail(f"command failed: {' '.join(str(c) for c in cmd)}")


# venv

print()
print("Running todo app api tests")
print()

log("creating python virtual environment...")
run([sys.executable, "-m", "venv", str(VENV)])
ok("venv created at .venv/")

log("installing python dependencies...")
run([str(VENV_PIP), "install", "--quiet", "--upgrade", "pip"])
run([str(VENV_PIP), "install", "--quiet", "-r",
     str(ROOT / "requirements.txt")])
ok("python dependencies installed")


# .env setup

env_file = ROOT / ".env"
if not env_file.exists():
    log("creating default .env file...")
    env_file.write_text(
        "DATABASE_FOLDER=data\n"
        "DATABASE_URL=sqlite:///data/todos.db\n"
        "FRONTEND_URL=http://localhost:8000\n"
    )
    ok(".env created with defaults")


# tests

log("running tests...")
run([str(VENV_PY), "-m", "pytest", "tests/test_todos.py", "-v"],
    cwd=ROOT / "backend")
ok("tests passed")
