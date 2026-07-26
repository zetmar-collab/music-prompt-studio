# Generuje build/icon.png (512) i build/icon.ico (wielorozdzielczościowy)
# Ikona: gradientowy zaokrąglony kafelek + nuta + fala dźwiękowa.
import os
import math
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "..", "build")
os.makedirs(BUILD, exist_ok=True)

S = 1024  # render at high res, downscale later


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def make_base():
    img = Image.new("RGB", (S, S), (15, 16, 32))
    px = img.load()
    # diagonal gradient: violet -> indigo -> pink
    c1 = (139, 92, 246)   # #8b5cf6
    c2 = (109, 94, 252)   # #6d5efc
    c3 = (236, 72, 153)   # #ec4899
    for y in range(S):
        for x in range(S):
            t = (x + y) / (2 * S)
            if t < 0.5:
                col = lerp(c1, c2, t / 0.5)
            else:
                col = lerp(c2, c3, (t - 0.5) / 0.5)
            px[x, y] = col
    return img


def draw_icon():
    base = make_base()
    d = ImageDraw.Draw(base, "RGBA")

    # subtle glow circle
    d.ellipse([S * 0.18, S * 0.12, S * 0.95, S * 0.9], fill=(255, 255, 255, 18))

    white = (255, 255, 255, 255)
    soft = (255, 255, 255, 210)

    # --- Sound wave bars (equalizer) on the left ---
    bar_w = S * 0.055
    gap = S * 0.038
    x0 = S * 0.20
    cy = S * 0.60
    heights = [0.14, 0.26, 0.40, 0.22, 0.32, 0.16]
    for i, h in enumerate(heights):
        x = x0 + i * (bar_w + gap)
        bh = S * h
        d.rounded_rectangle(
            [x, cy - bh / 2, x + bar_w, cy + bh / 2],
            radius=bar_w / 2,
            fill=(255, 255, 255, 235),
        )

    # --- Musical note (eighth note) on the right ---
    # note head
    head_r = S * 0.085
    hx, hy = S * 0.66, S * 0.66
    d.ellipse([hx - head_r * 1.15, hy - head_r, hx + head_r * 1.15, hy + head_r], fill=white)
    # stem
    stem_w = S * 0.028
    stem_top = S * 0.30
    d.rounded_rectangle(
        [hx + head_r * 0.75, stem_top, hx + head_r * 0.75 + stem_w, hy],
        radius=stem_w / 2,
        fill=white,
    )
    # flag
    fx = hx + head_r * 0.75 + stem_w
    d.polygon(
        [
            (fx, stem_top),
            (fx + S * 0.13, stem_top + S * 0.05),
            (fx + S * 0.11, stem_top + S * 0.16),
            (fx, stem_top + S * 0.09),
        ],
        fill=soft,
    )

    # apply rounded corners (app-tile look)
    mask = rounded_mask(S, int(S * 0.22))
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)
    return out


def main():
    icon = draw_icon()

    png = icon.resize((512, 512), Image.LANCZOS)
    png.save(os.path.join(BUILD, "icon.png"))
    png.resize((256, 256), Image.LANCZOS).save(os.path.join(BUILD, "icon@256.png"))

    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    icon.save(
        os.path.join(BUILD, "icon.ico"),
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
    )
    print("Zapisano build/icon.png (512), build/icon.ico (16-256)")


if __name__ == "__main__":
    main()
