#!/usr/bin/env python3
"""Tiny local server for the Tagalog Learning Course.

Serves the static site and provides local-only actions:
- append text to inbox.md
- regenerate styled HTML pages
- manually trigger configured Hermes cron jobs

Bind address is 127.0.0.1 by default so it is not exposed on the network.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
INBOX = ROOT / "inbox.md"
RENDER = ROOT / "scripts" / "render_lab.py"
HERMES = Path(os.environ.get("HERMES_BIN", "/Users/jeffgordon/.local/bin/hermes"))
DAILY_LESSON_JOB_ID = os.environ.get("HERMES_TLC_DAILY_JOB_ID", "")
MONTHLY_CURRICULUM_JOB_ID = os.environ.get("HERMES_TLC_CURRICULUM_JOB_ID", "")


def now_label() -> str:
    return datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z")


def run_cmd(cmd: list[str], timeout: int = 180) -> dict:
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(ROOT),
            text=True,
            capture_output=True,
            timeout=timeout,
            env={**os.environ, "PATH": f"{HERMES.parent}:{os.environ.get('PATH', '')}"},
        )
        return {"ok": proc.returncode == 0, "exit_code": proc.returncode, "stdout": proc.stdout[-4000:], "stderr": proc.stderr[-4000:]}
    except FileNotFoundError as exc:
        return {"ok": False, "exit_code": 127, "stdout": "", "stderr": str(exc)}
    except subprocess.TimeoutExpired as exc:
        return {"ok": False, "exit_code": 124, "stdout": (exc.stdout or "")[-4000:], "stderr": "Command timed out"}


def append_inbox(section: str, text: str) -> None:
    section = section.strip() or "Open questions"
    text = text.strip()
    if not text:
        raise ValueError("Text is empty")
    safe_section = {
        "question": "Open questions",
        "tried": "Things I tried",
        "confusion": "Confusions / rough notes",
        "note": "Open questions",
    }.get(section, section)
    entry = f"\n### {now_label()} — {safe_section}\n\n{text}\n"
    INBOX.write_text(INBOX.read_text(encoding="utf-8") + entry, encoding="utf-8")


class Handler(SimpleHTTPRequestHandler):
    server_version = "TagalogLearningCourse/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print(f"[{now_label()}] {self.client_address[0]} {fmt % args}")

    def send_json(self, status: int, payload: dict) -> None:
        data = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        return json.loads(raw or "{}")

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/status":
            self.send_json(200, {
                "ok": True,
                "root": str(ROOT),
                "daily_lesson_job_id": DAILY_LESSON_JOB_ID,
                "monthly_curriculum_job_id": MONTHLY_CURRICULUM_JOB_ID,
                "hermes_bin": str(HERMES),
                "inbox_exists": INBOX.exists(),
            })
            return
        # Route root to dashboard.
        if self.path == "/":
            self.path = "/index.html"
        self.path = unquote(self.path)
        return super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        try:
            if self.path == "/api/inbox":
                payload = self.read_json()
                append_inbox(str(payload.get("section", "question")), str(payload.get("text", "")))
                render = run_cmd(["python3", str(RENDER)], timeout=60)
                self.send_json(200 if render["ok"] else 500, {"ok": render["ok"], "message": "Inbox updated", "render": render})
                return

            if self.path == "/api/render":
                render = run_cmd(["python3", str(RENDER)], timeout=60)
                self.send_json(200 if render["ok"] else 500, {"ok": render["ok"], "render": render})
                return

            if self.path == "/api/run-lesson":
                if not DAILY_LESSON_JOB_ID:
                    self.send_json(400, {"ok": False, "message": "Daily TLC cron job id is not configured. Ask Hermes to create the recurring job, or set HERMES_TLC_DAILY_JOB_ID."})
                    return
                if not HERMES.exists():
                    self.send_json(500, {"ok": False, "message": f"Hermes binary not found at {HERMES}"})
                    return
                result = run_cmd([str(HERMES), "cron", "run", DAILY_LESSON_JOB_ID], timeout=180)
                self.send_json(200 if result["ok"] else 500, {"ok": result["ok"], "message": "Requested manual lesson cron run", "result": result})
                return

            if self.path == "/api/run-curriculum-plan":
                if not MONTHLY_CURRICULUM_JOB_ID:
                    self.send_json(400, {"ok": False, "message": "Monthly curriculum job id is not configured in this server process. Restart the server after job creation."})
                    return
                result = run_cmd([str(HERMES), "cron", "run", MONTHLY_CURRICULUM_JOB_ID], timeout=180)
                self.send_json(200 if result["ok"] else 500, {"ok": result["ok"], "message": "Requested monthly curriculum cron run", "result": result})
                return

            self.send_json(404, {"ok": False, "message": "Unknown endpoint"})
        except Exception as exc:  # keep local UI useful; details stay local
            self.send_json(500, {"ok": False, "message": str(exc)})


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the Tagalog Learning Course locally")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8776)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"Tagalog Learning Course server: http://{args.host}:{args.port}/")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
