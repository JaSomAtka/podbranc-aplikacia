#!/usr/bin/env python3
"""Vygeneruje ikony aplikácie (PNG + SVG) do priečinka icons/.

Motív: zrúcanina hradu Branč na kopci, vo farbe webu obce.
Používa len štandardnú knižnicu Pythonu. Spustenie: python scripts/make_icons.py
Ak obec chce použiť vlastný erb, stačí nahradiť súbory v icons/ (rovnaké názvy a rozmery).
"""
import math
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "icons"

BG = (0x2D, 0x4A, 0x2B)
HILL = (0x4E, 0x77, 0x48)
CASTLE = (0xF4, 0xF1, 0xE8)

# Geometria v súradniciach 512 × 512.
HILL_POLY = [(0, 512), (0, 420), (60, 392), (120, 365), (180, 342), (230, 330), (282, 330),
             (332, 342), (392, 365), (452, 392), (512, 420), (512, 512)]
CASTLE_POLY = [(196, 332), (196, 158), (210, 158), (210, 172), (220, 172), (220, 158), (234, 158),
               (234, 172), (244, 172), (244, 158), (258, 158), (258, 236), (278, 236), (278, 222),
               (292, 222), (292, 250), (306, 250), (306, 272), (320, 272), (320, 332)]
WINDOW_POLY = [(220, 228), (220, 204), (223, 197), (227, 194), (231, 197), (234, 204), (234, 228)]


def corners(r, n=12):
    """Štyri rohy štvorca mimo zaobleného obdĺžnika (kreslia sa ako priehľadné)."""
    out = []
    for (cx, cy, a0), corner in zip(((512 - r, r, -90), (512 - r, 512 - r, 0), (r, 512 - r, 90), (r, r, 180)),
                                    ((512, 0), (512, 512), (0, 512), (0, 0))):
        arc = [(cx + r * math.cos(math.radians(a0 + 90 * i / n)), cy + r * math.sin(math.radians(a0 + 90 * i / n)))
               for i in range(n + 1)]
        out.append((arc + [corner], None))
    return out


def render(size, layers, ss=4):
    """Vyplní polygóny (scanline) v nadvzorkovaní ss× a zmenší priemerovaním na RGBA.
    Vrstva s farbou None vymaže všetko pod sebou (priehľadné)."""
    hi = size * ss
    scale = hi / 512
    grid = [bytearray(hi) for _ in range(hi)]  # index farby, 0 = priehľadné
    for idx, (poly, _) in enumerate(layers, start=1):
        pts = [(x * scale, y * scale) for x, y in poly]
        edges = list(zip(pts, pts[1:] + pts[:1]))
        for row in range(hi):
            y = row + 0.5
            xs = sorted(x0 + (y - y0) * (x1 - x0) / (y1 - y0)
                        for (x0, y0), (x1, y1) in edges if (y0 <= y < y1) or (y1 <= y < y0))
            line = grid[row]
            for a, b in zip(xs[::2], xs[1::2]):
                start, end = max(0, int(round(a))), min(hi, int(round(b)))
                if end > start:
                    line[start:end] = bytes([idx]) * (end - start)
    colors = [None] + [c for _, c in layers]
    n = ss * ss
    rows = []
    for oy in range(size):
        out = bytearray()
        block = grid[oy * ss:(oy + 1) * ss]
        for ox in range(size):
            r = g = b = a = 0
            for line in block:
                for v in line[ox * ss:(ox + 1) * ss]:
                    c = colors[v]
                    if c:
                        r += c[0]; g += c[1]; b += c[2]; a += 1
            if a:
                out += bytes((r // a, g // a, b // a, 255 * a // n))
            else:
                out += b"\0\0\0\0"
        rows.append(bytes(out))
    return rows


def write_png(path, size, rows):
    raw = b"".join(b"\0" + r for r in rows)

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    path.write_bytes(png)


def svg(rounded):
    def poly(points, color):
        p = " ".join(f"{x:g},{y:g}" for x, y in points)
        return f'<polygon points="{p}" fill="#{color[0]:02X}{color[1]:02X}{color[2]:02X}"/>'
    bg = '<rect width="512" height="512" rx="112" fill="#2D4A2B"/>' if rounded else '<rect width="512" height="512" fill="#2D4A2B"/>'
    clip = '<clipPath id="c"><rect width="512" height="512" rx="112"/></clipPath>' if rounded else ""
    body = poly(HILL_POLY, HILL) + poly(CASTLE_POLY, CASTLE) + poly(WINDOW_POLY, BG)
    group = f'<g clip-path="url(#c)">{body}</g>' if rounded else body
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs>{clip}</defs>{bg}{group}</svg>\n'


def main():
    OUT.mkdir(exist_ok=True)
    full = [([(0, 0), (512, 0), (512, 512), (0, 512)], BG), (HILL_POLY, HILL), (CASTLE_POLY, CASTLE), (WINDOW_POLY, BG)]
    rounded = full + corners(112)
    targets = [
        ("icon-512.png", 512, rounded),
        ("icon-192.png", 192, rounded),
        ("maskable-512.png", 512, full),
        ("apple-touch-icon.png", 180, full),
        ("favicon-32.png", 32, rounded),
    ]
    for name, size, layers in targets:
        write_png(OUT / name, size, render(size, layers))
        print("icons/" + name)
    (OUT / "icon.svg").write_text(svg(True), encoding="utf-8")
    print("icons/icon.svg")


if __name__ == "__main__":
    main()
