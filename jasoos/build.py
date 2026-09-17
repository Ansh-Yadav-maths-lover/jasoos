#!/usr/bin/env python3
"""Concatenate jasoos/src chunks into one self-contained outputs/jasoos.html.

Chunk order is the sorted filename order. Extension decides the wrapper:
  .html -> raw   .css -> <style>   .js -> <script>
A file named *_raw.js is injected verbatim (already wrapped).
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT.parent / "outputs" / "jasoos.html"

parts, css, js = [], [], []
for f in sorted(SRC.iterdir()):
    if f.name.startswith(".") or f.is_dir():
        continue
    txt = f.read_text(encoding="utf-8")
    if f.suffix == ".html":
        parts.append(("html", f.name, txt))
    elif f.suffix == ".css":
        parts.append(("css", f.name, txt))
    elif f.suffix == ".js":
        parts.append(("js", f.name, txt))

# assemble: html chunks in order; css merged at first css slot; js merged at first js slot
out, css_done, js_done = [], False, False
css_all = "\n".join(t for k, _, t in parts if k == "css")
js_all = "\n".join(t for k, _, t in parts if k == "js")
for kind, name, txt in parts:
    if kind == "html":
        out.append(txt)
    elif kind == "css" and not css_done:
        out.append("<style>\n" + css_all + "\n</style>")
        css_done = True
    elif kind == "js" and not js_done:
        out.append("<script>\n" + js_all + "\n</script>\n</body>\n</html>")
        js_done = True

html = "\n".join(out)
html = re.sub(r"\n{3,}", "\n\n", html)

# Syntax-check the bundled script before writing. A broken chunk kills the whole
# <script>, which looks like "half the page is missing" at runtime — fail here instead.
import shutil, subprocess, tempfile
if shutil.which("bun"):
    with tempfile.TemporaryDirectory() as d:
        p = pathlib.Path(d) / "check.js"
        p.write_text(js_all, encoding="utf-8")
        r = subprocess.run(["bun", "build", str(p), "--outfile", str(pathlib.Path(d) / "o.js")],
                           capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit(f"BUILD FAILED (bun): {r.stderr}")
        print("checked javascript syntax with bun — ok")
elif shutil.which("node"):
    with tempfile.TemporaryDirectory() as d:
        p = pathlib.Path(d) / "check.js"
        p.write_text(js_all, encoding="utf-8")
        r = subprocess.run(["node", "--check", str(p)], capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit(f"BUILD FAILED (node): {r.stderr}")
        print("checked javascript syntax with node — ok")
else:
    print("note: neither bun nor node found, skipping syntax check", file=sys.stderr)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
kb = len(html.encode()) / 1024
print(f"built {OUT} — {kb:.1f} KB")

# Copy index.html for root serving
(OUT.parent / "index.html").write_text(html, encoding="utf-8")
(ROOT.parent / "index.html").write_text(html, encoding="utf-8")

# Copy static assets into outputs/
assets_dir = ROOT / "assets"
if assets_dir.exists():
    for item in assets_dir.iterdir():
        if item.is_file():
            shutil.copy2(item, OUT.parent / item.name)
            print(f"copied asset {item.name} -> outputs/")

# Copy og.png
og_img = ROOT / "og.png"
if og_img.exists():
    shutil.copy2(og_img, OUT.parent / "og.png")
    print("copied og.png -> outputs/")

if "<script>" not in html or "<style>" not in html:
    print("WARN: missing style or script slot", file=sys.stderr)
