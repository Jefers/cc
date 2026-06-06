#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 scripts/render_lab.py
python3 scripts/lab_server.py --host 127.0.0.1 --port 8776
