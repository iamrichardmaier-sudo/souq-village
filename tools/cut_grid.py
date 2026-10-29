"""Cut a grid sheet of icons on flat magenta into square transparent PNGs.
usage: python3 -I tools/cut_grid.py sheet.png out_dir first_number [cols rows]
Writes out_dir/01.png, 02.png ... numbered left to right, top to bottom."""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

src, out, first = sys.argv[1], sys.argv[2], int(sys.argv[3])
cols, rows = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (5, 2)
os.makedirs(out, exist_ok=True)
a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mag = np.minimum(r, b) - g
alpha = np.clip((150 - mag) * 255 / 70, 0, 255).astype(np.uint8)
rgb = a.copy()
spill = (mag > 30) & (alpha > 0)
rgb[..., 0] = np.where(spill, np.minimum(r, g + 60), r)
rgb[..., 2] = np.where(spill, np.minimum(b, g + 60), b)
img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alpha]), "RGBA")
img.putalpha(img.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6)))
solid = np.asarray(img.getchannel("A")) > 40
H, W = solid.shape

# Label connected shapes on a 4x smaller mask, so a neighbour's tail or ear
# reaching into a cell is not mistaken for part of that cell's animal.
F = 4
small = solid[: H // F * F, : W // F * F].reshape(H // F, F, W // F, F).any(axis=(1, 3))
labels = np.zeros(small.shape, np.int32)
comps = []  # (label, area, cx, cy)
h, w = small.shape
for y in range(h):
    for x in range(w):
        if not small[y, x] or labels[y, x]:
            continue
        lab = len(comps) + 1
        stack, area, sx, sy = [(y, x)], 0, 0, 0
        labels[y, x] = lab
        while stack:
            cy, cx = stack.pop()
            area += 1; sx += cx; sy += cy
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1), (cy + 1, cx + 1), (cy - 1, cx - 1), (cy + 1, cx - 1), (cy - 1, cx + 1)):
                if 0 <= ny < h and 0 <= nx < w and small[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = lab
                    stack.append((ny, nx))
        comps.append((lab, area, sx / area * F, sy / area * F))
full_labels = np.kron(labels, np.ones((F, F), np.int32))
full_labels = np.pad(full_labels, ((0, H - full_labels.shape[0]), (0, W - full_labels.shape[1])))

n = first
for row in range(rows):
    for col in range(cols):
        x0, x1, y0, y1 = col * W // cols, (col + 1) * W // cols, row * H // rows, (row + 1) * H // rows
        mine = [c for c in comps if x0 <= c[2] < x1 and y0 <= c[3] < y1]
        if not mine:
            print("empty cell", row, col); n += 1; continue
        biggest = max(c[1] for c in mine)
        keep = [c[0] for c in mine if c[1] >= biggest * 0.04]
        mask = np.isin(full_labels, keep) & solid
        ys, xs = np.where(mask)
        bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        crop = img.crop((bx0, by0, bx1, by1))
        a = np.asarray(crop).copy()
        a[..., 3] = np.where(mask[by0:by1, bx0:bx1] | (np.isin(full_labels[by0:by1, bx0:bx1], keep)), a[..., 3], 0)
        crop = Image.fromarray(a, "RGBA")
        side = 256
        sc = (side - 16) / max(crop.size)
        crop = crop.resize((max(1, round(crop.width * sc)), max(1, round(crop.height * sc))), Image.LANCZOS)
        tile = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        tile.alpha_composite(crop, ((side - crop.width) // 2, side - crop.height - 6))
        tile.save(os.path.join(out, f"{n:02d}.png"))
        n += 1
print("cut", n - first, "icons")
