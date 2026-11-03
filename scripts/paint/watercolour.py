"""Watercolour pass: gives flat drawings a wobbling line, pooled pigment at edges, uneven washes and paper grain."""
import sys, numpy as np, cv2
from PIL import Image

def noise(h, w, cell, rng):
    small = rng.random((max(2, h // cell + 2), max(2, w // cell + 2)), dtype=np.float32)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)

def fbm(h, w, cell, rng, oct=3):
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for _ in range(oct):
        out += amp * noise(h, w, max(2, cell), rng); tot += amp; amp *= .5; cell //= 2
    return out / tot - .5

def paint(src, dst, seed, q, scale):
    rng = np.random.default_rng(seed)
    im = np.asarray(Image.open(src).convert("RGBA"), np.float32) / 255
    h, w = im.shape[:2]
    a = im[..., 3:]; rgb = im[..., :3] * a  # premultiplied
    amp = 3.2 * scale
    dx = fbm(h, w, 70, rng) * 2 * amp; dy = fbm(h, w, 70, rng) * 2 * amp
    dx += fbm(h, w, 9, rng, 2) * 1.5 * scale; dy += fbm(h, w, 9, rng, 2) * 1.5 * scale
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    pm = np.dstack([rgb, a[..., 0]])
    pm = cv2.remap(pm, gx + dx, gy + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    a2 = pm[..., 3:]; col = pm[..., :3] / np.maximum(a2, 1e-3)
    # soften the pen line slightly so shapes bleed
    col = cv2.GaussianBlur(col, (0, 0), .7 * scale) * .6 + col * .4
    L = col.mean(axis=2)
    # pigment pools at the edge of each wash
    edge = np.abs(L - cv2.GaussianBlur(L, (0, 0), 2.6 * scale))
    edge = np.clip(edge * 5, 0, 1)[..., None]
    col *= 1 - .3 * edge
    # uneven washes: large blooms and mid-sized backruns
    wash = fbm(h, w, 420, rng, 2) * .7 + fbm(h, w, 60, rng, 2) * .14
    wash = wash[..., None]
    lifted = col + (1 - col) * np.clip(wash * .75 + .05, 0, .3) * (.08 + .92 * L[..., None] ** 1.5)
    col = lifted * (1 - np.clip(-wash * .12, 0, .05))
    # granulation
    grain = rng.normal(0, 1, (h, w)).astype(np.float32)
    grain = cv2.GaussianBlur(grain, (0, 0), .8)[..., None]
    col = col * (1 + grain * .05)
    # warm paper shows through
    paper = np.array([.98, .96, .93], np.float32)
    col = col * .97 + paper * .03
    out = np.clip(np.dstack([col, a2]), 0, 1)
    img = Image.fromarray((out * 255 + .5).astype(np.uint8), "RGBA")
    if a.min() > .999:
        img.convert("RGB").save(dst, "WEBP", quality=q, method=6)
    else:
        img.save(dst, "WEBP", quality=q, method=6, alpha_quality=80)

for i, line in enumerate(open(sys.argv[1])):
    src, dst, scale, q = line.split()
    paint(src, dst, 100 + i, int(q), float(scale))
    print(dst.rsplit("/", 1)[1], flush=True)
