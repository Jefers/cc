# Tagalog Learning Course (TLC)

A beginner-friendly Tagalog learning app for building a daily habit with useful, friendly, informal phrases for conversation and text messaging with Filipino friends.

## How to use TLC

- **Daily lesson**: study one compact 10-minute phrase set each day.
- **Journal**: lesson notes live in `journal/` as Markdown.
- **Styled browser reading**: Markdown files are rendered into polished HTML under `pages/`.
- **Theme switch**: use the Dark/Light button for comfortable night reading.
- **Progress tracking**: `progress.md` and `progress.json` track phrases, confidence, streaks, and next steps.
- **Dashboard**: open `index.html` from this folder, or visit the GitHub Pages path once pushed.
- **Inbox**: add phrases you hear, text-message screenshots you want explained, or situations you want to handle in `inbox.md`.
- **Curriculum**: `curriculum.md` contains a 30-day roadmap aimed at casual, friendly conversation — not business Tagalog.

## Important language notes

- Tagalog/Filipino is context-heavy. Tone, relationship, age, and comfort matter.
- TLC starts with safe, natural beginner phrases. Slang is introduced gradually and labelled so you know when not to overuse it.
- `po` and `opo` are respectful/polite markers. They are useful culturally, but this course focuses mainly on casual peer-to-peer conversation.
- Spelling in casual chat may vary. TLC gives a clear base phrase first, then informal variants where helpful.

## Folder map

```text
tlc/
├── index.html              # Browser dashboard
├── README.md               # This file
├── curriculum.md           # 30-day learning path
├── inbox.md                # Drop random phrase requests here
├── progress.md             # Human-readable progress log
├── progress.json           # Machine-readable progress state
├── assets/lab.css          # Shared styling and dark/light theme
├── scripts/render_lab.py   # Markdown-to-HTML renderer
├── scripts/lab_server.py   # Optional local-only interactive dashboard server
├── start_lab_server.sh     # Convenience launcher
├── pages/                  # Styled HTML generated from Markdown
└── journal/                # Daily lesson Markdown notes
```

## Refresh the HTML after editing Markdown

```bash
python3 scripts/render_lab.py
```

## Optional local interactive dashboard

GitHub Pages can display TLC but cannot write to files. For local inbox saving and manual buttons, run:

```bash
./start_lab_server.sh
```

Then open:

```text
http://127.0.0.1:8776/
```
