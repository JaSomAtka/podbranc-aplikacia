#!/usr/bin/env python3
"""Stiahne aktuálne údaje z webu obce Podbranč a uloží ich do data/feed.json.

Zdroje:
  - RSS noviniek            https://www.podbranc.sk/rss
  - Hlásenia rozhlasu       https://www.podbranc.sk/p/9960/hlasenia-obecneho-rozhlasu.html
  - Kalendár udalostí       https://www.podbranc.sk/kalendar

Súbor sa prepíše len vtedy, keď sa údaje zmenili. Ak niektorý zdroj zlyhá,
ponechajú sa pre neho posledné známe údaje.

Spustenie:  python scripts/update_data.py
Potrebuje len štandardnú knižnicu Pythonu (3.9+).
"""
import hashlib
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path

BASE = "https://www.podbranc.sk"
SOURCES = {
    "news": BASE + "/rss",
    "hlasenia": BASE + "/p/9960/hlasenia-obecneho-rozhlasu.html",
    "events": BASE + "/kalendar",
}
OUT = Path(__file__).resolve().parent.parent / "data" / "feed.json"
UA = "Mozilla/5.0 (compatible; PodbrancApp/1.0; +https://www.podbranc.sk)"
MAX_NEWS = 30


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


class _TextExtractor(HTMLParser):
    """Prevedie kúsok HTML na zoznam odsekov čistého textu."""

    BLOCK = {"p", "li", "div", "br", "h1", "h2", "h3", "h4", "h5", "tr", "ul", "ol"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self._cur = [], []

    def handle_starttag(self, tag, attrs):
        if tag in self.BLOCK:
            self.flush()
        if tag == "li":
            self._cur.append("• ")

    def handle_endtag(self, tag):
        if tag in self.BLOCK:
            self.flush()

    def handle_data(self, data):
        self._cur.append(data)

    def flush(self):
        text = re.sub(r"\s+", " ", "".join(self._cur)).strip()
        if text and text != "•":
            self.parts.append(text)
        self._cur = []


def paragraphs(fragment):
    parser = _TextExtractor()
    parser.feed(fragment)
    parser.close()
    parser.flush()
    return parser.parts


def text(fragment):
    return " ".join(paragraphs(fragment))


# ---------------------------------------------------------------- novinky (RSS)
def parse_news(xml_text):
    root = ET.fromstring(xml_text)
    items = []
    for it in root.iter("item"):
        link = (it.findtext("link") or "").strip()
        guid = (it.findtext("guid") or link).strip()
        desc = it.findtext("description") or ""
        img = re.search(r'<img[^>]+src="([^"]+)"', desc)
        num = re.search(r"/novinka/(\d+)", guid)
        try:
            date = parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc)
            date = date.isoformat().replace("+00:00", "Z")
        except (TypeError, ValueError):
            date = None
        items.append({
            "id": num.group(1) if num else guid,
            "title": text(it.findtext("title") or ""),
            "text": text(desc),
            "url": link or guid,
            "image": img.group(1) if img else None,
            "date": date,
        })
    items.sort(key=lambda x: x["date"] or "", reverse=True)
    return items[:MAX_NEWS]


# ------------------------------------------------------- hlásenia rozhlasu (HTML)
def parse_hlasenia(page, previous):
    m = re.search(r'<article[^>]*tiny-body[^>]*>.*?<div dir="auto">(.*?)</div>\s*</article>', page, re.S)
    if not m:
        raise ValueError("na stránke sa nenašiel obsah hlásení")
    known = {h["id"]: h.get("firstSeen") for h in previous}
    # Pri úplne prvom spustení nepoznáme dátum pridania – nechá sa prázdny.
    seen_now = now_iso() if previous else None
    blocks = re.split(r"<p[^>]*>(?:\s|&nbsp;|<br\s*/?>)*[-–—]{3,}(?:\s|&nbsp;)*</p>|<hr[^>]*>", m.group(1))
    out = []
    for block in blocks:
        paras = paragraphs(block)
        if not paras:
            continue
        hid = hashlib.sha1("\n".join(paras).encode("utf-8")).hexdigest()[:12]
        out.append({"id": hid, "paragraphs": paras, "firstSeen": known.get(hid, seen_now)})
    return out


# --------------------------------------------------------------- kalendár (HTML)
def parse_events(page):
    events, seen = [], set()
    pattern = r'<a\s+href="(https://www\.podbranc\.sk/kalendar/(\d+)/[^"]*)"(.*?)</a>'
    for m in re.finditer(pattern, page, re.S):
        url, eid, body = m.groups()
        if eid in seen:
            continue
        title = re.search(r"<h3[^>]*>(.*?)</h3>", body, re.S)
        day = re.search(r'datetime="(\d{4}-\d{2}-\d{2})"', body)
        if not title or not day:
            continue
        seen.add(eid)
        # Čas v atribúte datetime je v UTC (napr. 04:00 = 06:00 letného času).
        start = re.search(r'datetime="(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}):\d{2}"', body)
        sub = re.search(r"<p[^>]*>(.*?)</p>", body, re.S)
        name = text(title.group(1))
        events.append({
            "id": eid,
            "title": name,
            "sub": text(sub.group(1)) if sub else "",
            "date": day.group(1),
            "start": start.group(1) + ":00Z" if start else None,
            "url": url,
            "category": "odpad" if re.search(r"odpad|vývoz|zber", name, re.I) else "podujatia",
        })
    events.sort(key=lambda e: e["start"] or e["date"])
    return events


def main():
    previous = {}
    if OUT.exists():
        try:
            previous = json.loads(OUT.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            previous = {}

    feed = {key: previous.get(key, []) for key in SOURCES}
    errors = []
    parsers = {
        "news": parse_news,
        "hlasenia": lambda page: parse_hlasenia(page, previous.get("hlasenia", [])),
        "events": parse_events,
    }
    for key, url in SOURCES.items():
        try:
            result = parsers[key](fetch(url))
            if not result:
                raise ValueError("zdroj nevrátil žiadne údaje")
            feed[key] = result
        except Exception as exc:  # zdroj zlyhal – ponecháme posledné známe údaje
            errors.append(f"{key}: {exc}")
            print(f"VAROVANIE – {key}: {exc}", file=sys.stderr)

    changed = any(feed[k] != previous.get(k) for k in SOURCES)
    if not changed and OUT.exists():
        print("Bez zmien.")
        return 0 if len(errors) < len(SOURCES) else 1

    old_ids = {h["id"] for h in previous.get("hlasenia", [])}
    new_hlasenia = [h for h in feed["hlasenia"] if h["id"] not in old_ids] if previous else []

    out = {"updated": now_iso(), **feed}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Uložené: {len(feed['news'])} noviniek, {len(feed['hlasenia'])} hlásení, "
          f"{len(feed['events'])} udalostí. Nové hlásenia: {len(new_hlasenia)}.")
    return 0 if len(errors) < len(SOURCES) else 1


if __name__ == "__main__":
    sys.exit(main())
