#!/usr/bin/env python3
"""Render the Tagalog Learning Course Markdown journal as a polished static HTML site.

This intentionally uses only the Python standard library so the cron job can run
without installing packages. Markdown support covers the subset used by the lab:
headings, paragraphs, lists, blockquotes, fenced code, inline code/bold/links,
and simple pipe tables.
"""
from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "pages"
JOURNAL = ROOT / "journal"
STYLE = "assets/lab.css"

SOURCE_DOCS = ["README.md", "curriculum.md", "progress.md", "inbox.md"]


@dataclass
class RenderedDoc:
    source: Path
    out: Path
    title: str
    rel_url: str
    kind: str
    date_label: str = ""


def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9\s-]", "", text).strip().lower()
    return re.sub(r"[\s-]+", "-", text) or "section"


def doc_title(markdown: str, fallback: str) -> str:
    for line in markdown.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def inline_md(text: str) -> str:
    placeholders: list[str] = []

    def stash(value: str) -> str:
        placeholders.append(value)
        return f"\u0000{len(placeholders)-1}\u0000"

    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", lambda m: stash(f"<code>{m.group(1)}</code>"), text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", text)
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: f'<a href="{html.escape(m.group(2), quote=True)}">{m.group(1)}</a>',
        text,
    )
    for i, value in enumerate(placeholders):
        text = text.replace(f"\u0000{i}\u0000", value)
    return text


def parse_table(lines: list[str], start: int) -> tuple[str | None, int]:
    if start + 1 >= len(lines):
        return None, start
    head, sep = lines[start], lines[start + 1]
    if "|" not in head or not re.match(r"^\s*\|?\s*:?-{3,}:?", sep):
        return None, start
    rows = []
    i = start
    while i < len(lines) and "|" in lines[i] and lines[i].strip():
        cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
        rows.append(cells)
        i += 1
    if len(rows) < 2:
        return None, start
    header = rows[0]
    body = rows[2:]
    out = ["<table>", "<thead><tr>"]
    out.extend(f"<th>{inline_md(c)}</th>" for c in header)
    out.append("</tr></thead>")
    out.append("<tbody>")
    for row in body:
        out.append("<tr>")
        out.extend(f"<td>{inline_md(c)}</td>" for c in row)
        out.append("</tr>")
    out.append("</tbody></table>")
    return "\n".join(out), i


def markdown_to_html(markdown: str) -> tuple[str, list[tuple[int, str, str]]]:
    lines = markdown.splitlines()
    out: list[str] = []
    headings: list[tuple[int, str, str]] = []
    paragraph: list[str] = []
    list_stack: list[str] = []
    in_code = False
    code_lang = ""
    code_lines: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            out.append(f"<p>{inline_md(' '.join(paragraph).strip())}</p>")
            paragraph = []

    def close_lists() -> None:
        while list_stack:
            out.append(f"</{list_stack.pop()}>")

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if in_code:
            if stripped.startswith("```"):
                out.append(f'<pre><code class="language-{html.escape(code_lang)}">{html.escape(chr(10).join(code_lines))}</code></pre>')
                code_lines = []
                code_lang = ""
                in_code = False
            else:
                code_lines.append(line)
            i += 1
            continue

        if stripped.startswith("```"):
            flush_paragraph(); close_lists()
            in_code = True
            code_lang = stripped[3:].strip()
            i += 1
            continue

        table_html, new_i = parse_table(lines, i)
        if table_html:
            flush_paragraph(); close_lists(); out.append(table_html); i = new_i; continue

        if not stripped:
            flush_paragraph(); close_lists(); i += 1; continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if heading:
            flush_paragraph(); close_lists()
            level = len(heading.group(1))
            text = heading.group(2).strip()
            sid = slugify(text)
            headings.append((level, text, sid))
            out.append(f'<h{level} id="{sid}">{inline_md(text)}</h{level}>')
            i += 1
            continue

        if stripped.startswith(">"):
            flush_paragraph(); close_lists()
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append(f"<blockquote><p>{inline_md(' '.join(quote_lines))}</p></blockquote>")
            continue

        bullet = re.match(r"^[-*]\s+(.+)$", stripped)
        ordered = re.match(r"^\d+\.\s+(.+)$", stripped)
        if bullet or ordered:
            flush_paragraph()
            tag = "ul" if bullet else "ol"
            if not list_stack or list_stack[-1] != tag:
                close_lists(); out.append(f"<{tag}>"); list_stack.append(tag)
            text = (bullet or ordered).group(1)
            checked = re.match(r"^\[([ xX])\]\s+(.+)$", text)
            if checked:
                mark = "☑" if checked.group(1).lower() == "x" else "☐"
                text = f'<span aria-hidden="true">{mark}</span> {inline_md(checked.group(2))}'
            else:
                text = inline_md(text)
            out.append(f"<li>{text}</li>")
            i += 1
            continue

        if stripped == "---":
            flush_paragraph(); close_lists(); out.append("<hr />"); i += 1; continue

        paragraph.append(stripped)
        i += 1

    flush_paragraph(); close_lists()
    if in_code:
        out.append(f"<pre><code>{html.escape(chr(10).join(code_lines))}</code></pre>")
    return "\n".join(out), headings


def page_shell(title: str, body: str, active: str = "") -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(title)} · Tagalog Learning Course</title>
  <script>
    (function () {{
      var stored = localStorage.getItem('tlcTheme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    }})();
  </script>
  <link rel="stylesheet" href="{STYLE}" />
</head>
<body>
  <main class="site-shell">
    <nav class="topbar" aria-label="Site">
      <div class="brand"><span class="brand-mark"></span><span>Tagalog Learning Course</span></div>
      <div class="navlinks">
        <a href="index.html">Dashboard</a>
        <a href="pages/curriculum.html">Curriculum</a>
        <a href="pages/progress.html">Progress</a>
        <a href="pages/inbox.html">Inbox</a>
        <a href="index.html#help">Help</a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch colour theme" aria-pressed="false"><span aria-hidden="true">🌙</span><span data-theme-label>Dark</span></button>
      </div>
    </nav>
    {body}
    <p class="footer-note">Rendered from local Markdown in <code>~/TagalogLearningCourse</code>. The Markdown files remain the source of truth.</p>
  </main>
  <script>
    (function () {{
      var button = document.querySelector('[data-theme-toggle]');
      var label = document.querySelector('[data-theme-label]');
      if (!button || !label) return;
      function setTheme(theme) {{
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('tlcTheme', theme);
        var dark = theme === 'dark';
        button.setAttribute('aria-pressed', String(dark));
        button.querySelector('span[aria-hidden="true"]').textContent = dark ? '☀️' : '🌙';
        label.textContent = dark ? 'Light' : 'Dark';
      }}
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
      button.addEventListener('click', function () {{
        setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      }});

      function status(id, message, kind) {{
        var box = document.getElementById(id);
        if (!box) return;
        box.className = 'status-box ' + (kind || '');
        box.textContent = message;
      }}
      async function postJson(url, payload) {{
        var response = await fetch(url, {{
          method: 'POST',
          headers: {{'Content-Type': 'application/json'}},
          body: JSON.stringify(payload || {{}})
        }});
        var data = await response.json().catch(function () {{ return {{ok:false, message:'Invalid JSON response'}}; }});
        if (!response.ok || data.ok === false) throw data;
        return data;
      }}
      var inboxForm = document.getElementById('inbox-form');
      if (inboxForm) {{
        inboxForm.addEventListener('submit', async function (event) {{
          event.preventDefault();
          if (location.protocol === 'file:') {{
            status('inbox-status', 'Interactive saving needs the local lab server. Start it with: ~/TagalogLearningCourse/start_lab_server.sh, then open http://127.0.0.1:8776/', 'err');
            return;
          }}
          var button = inboxForm.querySelector('button[type="submit"]');
          button.disabled = true;
          status('inbox-status', 'Saving your note to inbox.md and refreshing pages…', '');
          try {{
            var data = await postJson('/api/inbox', {{section: inboxForm.section.value, text: inboxForm.text.value}});
            inboxForm.text.value = '';
            status('inbox-status', 'Saved to inbox.md and refreshed the styled pages.', 'ok');
          }} catch (err) {{
            status('inbox-status', 'Could not save inbox note: ' + (err.message || JSON.stringify(err)), 'err');
          }} finally {{
            button.disabled = false;
          }}
        }});
      }}
      async function bindAction(buttonId, statusId, url, waiting) {{
        var actionButton = document.getElementById(buttonId);
        if (!actionButton) return;
        actionButton.addEventListener('click', async function () {{
          if (location.protocol === 'file:') {{
            status(statusId, 'This action needs the local lab server. Start it with: ~/TagalogLearningCourse/start_lab_server.sh, then open http://127.0.0.1:8776/', 'err');
            return;
          }}
          actionButton.disabled = true;
          status(statusId, waiting, '');
          try {{
            var data = await postJson(url, {{}});
            var output = data.result ? (data.result.stdout || data.result.stderr || data.message) : (data.message || 'Done.');
            status(statusId, output || 'Done.', 'ok');
          }} catch (err) {{
            status(statusId, 'Action failed: ' + (err.message || JSON.stringify(err)), 'err');
          }} finally {{
            actionButton.disabled = false;
          }}
        }});
      }}
      bindAction('run-lesson-button', 'lesson-run-status', '/api/run-lesson', 'Requesting a manual run of the daily lesson cron job…');
      bindAction('render-button', 'lesson-run-status', '/api/render', 'Refreshing the styled HTML pages…');
      bindAction('run-curriculum-button', 'curriculum-run-status', '/api/run-curriculum-plan', 'Requesting a manual run of the monthly curriculum planning job…');
    }})();
  </script>
</body>
</html>
"""


def reader_page(doc: Path, out_path: Path, title: str, kind: str) -> RenderedDoc:
    markdown = doc.read_text(encoding="utf-8")
    body_html, headings = markdown_to_html(markdown)
    toc = ""
    h2s = [(level, text, sid) for level, text, sid in headings if level in (2, 3)]
    if h2s:
        toc_items = "\n".join(f'<li><a href="#{sid}">{html.escape(text)}</a></li>' for _, text, sid in h2s[:12])
        toc = f'<aside class="sidebar"><h2>On this page</h2><ul>{toc_items}</ul></aside>'
    else:
        toc = '<aside class="sidebar"><h2>Reading tip</h2><p class="muted">Use this styled view for reading, and edit the Markdown source when you want to make notes.</p></aside>'

    source_rel = doc.relative_to(ROOT).as_posix()
    body = f"""
<section class="reader-layout">
  <article class="document">
    <header class="document-header">
      <div class="eyebrow">{html.escape(kind)} · rendered from {html.escape(source_rel)}</div>
      <h1>{html.escape(title)}</h1>
      <p class="muted"><a href="{html.escape(source_rel)}">Open raw Markdown</a></p>
    </header>
    {body_html}
  </article>
  {toc}
</section>
"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    depth = len(out_path.parent.relative_to(ROOT).parts)
    rel_prefix = "../" * depth
    page = page_shell(title, body).replace('href="assets/lab.css"', f'href="{rel_prefix}assets/lab.css"').replace('href="index.html"', f'href="{rel_prefix}index.html"').replace('href="index.html#', f'href="{rel_prefix}index.html#').replace('href="pages/', f'href="{rel_prefix}pages/')
    # Links back to raw markdown from rendered pages need a depth-aware prefix.
    page = page.replace(f'href="{source_rel}"', f'href="{rel_prefix}{source_rel}"')
    out_path.write_text(page, encoding="utf-8")
    date_match = re.match(r"(\d{4}-\d{2}-\d{2})", doc.name)
    return RenderedDoc(doc, out_path, title, out_path.relative_to(ROOT).as_posix(), kind, date_match.group(1) if date_match else "")


def render_all() -> list[RenderedDoc]:
    PAGES.mkdir(exist_ok=True)
    rendered: list[RenderedDoc] = []
    for name in SOURCE_DOCS:
        source = ROOT / name
        if source.exists():
            title = doc_title(source.read_text(encoding="utf-8"), source.stem.title())
            rendered.append(reader_page(source, PAGES / f"{source.stem}.html", title, "Course page"))
    for source in sorted(JOURNAL.glob("*.md"), reverse=True):
        title = doc_title(source.read_text(encoding="utf-8"), source.stem.replace("-", " ").title())
        rendered.append(reader_page(source, PAGES / "journal" / f"{source.stem}.html", title, "Journal lesson"))
    return rendered


def render_index(rendered: list[RenderedDoc]) -> None:
    progress = {}
    progress_path = ROOT / "progress.json"
    if progress_path.exists():
        try:
            progress = json.loads(progress_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            progress = {}
    lessons = [d for d in rendered if d.kind == "Journal lesson"]
    latest = lessons[0] if lessons else None
    lesson_items = "\n".join(
        f'<li><div class="lesson-title"><a href="{d.rel_url}">{html.escape(d.title)}</a></div><div class="muted">{html.escape(d.date_label or d.source.name)}</div></li>'
        for d in lessons
    ) or '<li class="muted">No lessons yet.</li>'
    completed = progress.get("completed_lessons", len(lessons))
    streak = progress.get("streak", 0)
    focus = progress.get("current_focus", "greetings and friendly beginner chat")
    latest_block = ""
    if latest:
        latest_block = f"""
    <article class="card">
      <h2>Latest lesson</h2>
      <p><strong>{html.escape(latest.title)}</strong></p>
      <p class="muted">Continue from the newest rendered journal page.</p>
      <p><a href="{latest.rel_url}">Read the styled lesson</a> · <a href="{latest.source.relative_to(ROOT).as_posix()}">Raw Markdown</a></p>
    </article>"""
    body = f"""
<section class="hero">
  <span class="badge">Readable HTML</span><span class="badge">Markdown Source</span><span class="badge">30-day phrase habit</span>
  <h1>Tagalog Learning Course</h1>
  <p>A friendly beginner course for everyday Tagalog phrases, casual texting, useful reactions, and informal conversation with Filipino friends.</p>
</section>

<section class="dashboard-grid">
  <article class="card">
    <h2>Progress</h2>
    <div class="stat">{html.escape(str(completed))}</div>
    <p class="muted">completed lesson{'s' if completed != 1 else ''} · streak {html.escape(str(streak))}</p>
    <p><a href="pages/progress.html">Read progress</a> · <a href="progress.md">Raw Markdown</a></p>
  </article>
  {latest_block}
  <article class="card">
    <h2>Learning path</h2>
    <p class="muted">Current focus: {html.escape(str(focus))}</p>
    <p><a href="pages/curriculum.html">Read the 30-day curriculum</a></p>
  </article>
  <article class="card phrase-card">
    <h2>Today’s starter phrase</h2>
    <p class="phrase">Uy, musta?</p>
    <p class="translation">Hey, how are you? / What’s up?</p>
    <p><span class="tone-tag">friendly</span><span class="tone-tag">casual text</span><span class="tone-tag">beginner-safe</span></p>
  </article>
</section>

<section class="dashboard-grid" id="actions">
  <article class="card">
    <h2>Add to phrase inbox</h2>
    <p class="muted">Capture real phrases you hear, chat situations you want help with, or slang you want explained.</p>
    <form class="lab-form" id="inbox-form">
      <label for="inbox-section">Type of note</label>
      <select id="inbox-section" name="section">
        <option value="question">Open question</option>
        <option value="confusion">Confusing phrase</option>
        <option value="tried">Phrase I tried</option>
        <option value="note">Situation request</option>
      </select>
      <label for="inbox-text">Your text</label>
      <textarea id="inbox-text" name="text" placeholder="Example: What is a casual way to say ‘are you free later?’" required></textarea>
      <div class="action-row"><button class="primary-button" type="submit">Save to inbox.md</button><a href="pages/inbox.html">Read styled inbox</a></div>
      <div class="status-box" id="inbox-status">GitHub Pages can display this dashboard but cannot save notes. For local interactive saving, run ./start_lab_server.sh from the tlc folder, then visit http://127.0.0.1:8776/.</div>
    </form>
  </article>

  <article class="card">
    <h2>Manual lesson controls</h2>
    <p class="muted">Use these locally when you want to refresh styled pages after editing Markdown. Cron buttons are placeholders until you ask Hermes to create recurring TLC jobs.</p>
    <div class="action-row">
      <button class="primary-button" type="button" id="run-lesson-button">Run lesson cron now</button>
      <button class="secondary-button" type="button" id="render-button">Refresh HTML only</button>
    </div>
    <div class="status-box" id="lesson-run-status">Manual cron runs need the local server and configured TLC cron job IDs. Static GitHub Pages mode is read-only.</div>
  </article>

  <article class="card">
    <h2>30-day curriculum</h2>
    <p class="muted">The roadmap starts from zero and builds toward friendly informal chat, useful slang, and text-message confidence.</p>
    <p><a href="pages/curriculum.html">Read the styled 30-day plan</a></p>
    <button class="secondary-button" type="button" id="run-curriculum-button">Run curriculum refresh</button>
    <div class="status-box" id="curriculum-run-status">Curriculum refresh is separate from daily lessons. Ask Hermes before enabling persistent automation.</div>
  </article>
</section>

<section class="card" id="help">
  <h2>How to use TLC</h2>
  <ol class="help-steps">
    <li><strong>Read one tiny lesson daily.</strong> Keep the habit small: phrases first, grammar later.</li>
    <li><strong>Say the phrases aloud.</strong> Even text-message phrases become easier when your mouth knows them.</li>
    <li><strong>Use the tone labels.</strong> Do not use slang just because it exists; learn when it fits.</li>
    <li><strong>Add real phrases to the inbox.</strong> If a friend writes something you do not understand, save it for future lessons.</li>
    <li><strong>Review weekly.</strong> Every seventh day consolidates phrase confidence and practical situations.</li>
  </ol>
</section>

<section class="card">
  <h2>Journal entries</h2>
  <ul class="lesson-list">{lesson_items}</ul>
</section>

<section class="card">
  <h2>How this works</h2>
  <p>The Markdown files remain the source of truth in <code>/Users/jeffgordon/LocalFile/GitHub/cc/tlc</code>. The renderer creates matching HTML pages under <code>pages/</code> so they look good in a browser and on GitHub Pages.</p>
  <p>To refresh manually, run: <code>python3 scripts/render_lab.py</code></p>
</section>
"""
    (ROOT / "index.html").write_text(page_shell("Dashboard", body), encoding="utf-8")


def main() -> None:
    rendered = render_all()
    render_index(rendered)
    print(f"Rendered {len(rendered)} Markdown files into styled HTML pages at {datetime.now().isoformat(timespec='seconds')}")


if __name__ == "__main__":
    main()
