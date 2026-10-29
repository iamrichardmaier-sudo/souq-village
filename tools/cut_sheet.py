"""Cut a 4-pose magenta character sheet into transparent PNGs + a portrait.
usage: python3 -I cut_sheet.py sheet.png out_dir"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mag = np.minimum(r, b) - g            # how magenta each pixel is
alpha = np.clip((150 - mag) * 255 / 70, 0, 255).astype(np.uint8)  # >150 -> clear, <80 -> solid
# despill: pull magenta fringe toward neutral
rgb = a.copy()
spill = (mag > 30) & (alpha > 0)
rgb[..., 0] = np.where(spill, np.minimum(r, g + 60), r)
rgb[..., 2] = np.where(spill, np.minimum(b, g + 60), b)
rgba = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alpha])
img = Image.fromarray(rgba, "RGBA")
# tidy edges
al = img.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
img.putalpha(al)

solid = np.asarray(al) > 40
cols = solid.sum(0) > 4
# find runs of columns containing a figure
runs, start = [], None
for x, c in enumerate(cols):
    if c and start is None: start = x
    if not c and start is not None:
        if x - start > 40: runs.append((start, x))
        start = None
if start is not None: runs.append((start, len(cols)))
# merge runs separated by tiny gaps (e.g. a raised hand)
merged = []
for s, e in runs:
    if merged and s - merged[-1][1] < 25: merged[-1] = (merged[-1][0], e)
    else: merged.append((s, e))
runs = sorted(merged, key=lambda t: t[1] - t[0], reverse=True)[:4]
runs.sort()
if len(runs) != 4:  # poses touching: fall back to four equal columns
    q = im.width // 4
    runs = []
    for i in range(4):
        sub = cols[i * q:(i + 1) * q]
        xs = [i * q + j for j, c in enumerate(sub) if c]
        runs.append((min(xs), max(xs) + 1) if xs else (i * q, (i + 1) * q))
names = ["idle", "working", "wave", "walk"]
print("figures found:", len(runs))
for (s, e), n in zip(runs, names):
    sub = solid[:, s:e]
    rows = np.where(sub.sum(1) > 2)[0]
    y0, y1 = rows.min(), rows.max()
    crop = img.crop((max(0, s - 6), max(0, y0 - 6), min(img.width, e + 6), min(img.height, y1 + 6)))
    h = 512
    crop = crop.resize((max(1, round(crop.width * h / crop.height)), h), Image.LANCZOS)
    crop.save(os.path.join(out, n + ".png"))
    if n == "idle":
        # portrait: head and shoulders from the relaxed pose, on parchment
        hw = crop.width
        head = crop.crop((0, 0, hw, int(h * 0.42)))
        side = 320
        p = Image.new("RGBA", (side, side), (247, 236, 214, 255))
        d = ImageDraw.Draw(p)
        d.ellipse((30, 40, side - 30, side + 120), fill=(47, 122, 120, 70))
        sc = side * 0.95 / head.height
        hd = head.resize((round(head.width * sc), round(head.height * sc)), Image.LANCZOS)
        p.alpha_composite(hd, ((side - hd.width) // 2, side - hd.height + 6))
        p.convert("RGB").save(os.path.join(out, "portrait.png"))
