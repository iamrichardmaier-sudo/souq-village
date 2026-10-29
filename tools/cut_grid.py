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
n = first
for row in range(rows):
    for col in range(cols):
        x0, x1, y0, y1 = col * W // cols, (col + 1) * W // cols, row * H // rows, (row + 1) * H // rows
        cell = solid[y0:y1, x0:x1]
        ys, xs = np.where(cell)
        if len(xs) < 50:
            print("empty cell", row, col); n += 1; continue
        crop = img.crop((x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1))
        side = 256
        sc = (side - 16) / max(crop.size)
        crop = crop.resize((max(1, round(crop.width * sc)), max(1, round(crop.height * sc))), Image.LANCZOS)
        tile = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        tile.alpha_composite(crop, ((side - crop.width) // 2, side - crop.height - 6))
        tile.save(os.path.join(out, f"{n:02d}.png"))
        n += 1
print("cut", n - first, "icons")
