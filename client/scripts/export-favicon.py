"""Render browser favicons directly from the native Circle SVG.

Run after export-brand.py from client: python3 scripts/export-favicon.py
Requires the packages in brand-assets-requirements.txt.
"""
from io import BytesIO
from pathlib import Path
import shutil

import cairosvg
from PIL import Image


PUBLIC = Path(__file__).resolve().parents[1] / "public"
SOURCE = PUBLIC / "brand/favicon.svg"


def main():
    # Keep the conventional root URL available for browsers and external tools.
    shutil.copyfile(SOURCE, PUBLIC / "favicon.svg")
    raster = cairosvg.svg2png(url=str(SOURCE), output_width=256, output_height=256)
    with Image.open(BytesIO(raster)) as rendered:
        master = rendered.convert("RGBA")
        for size in (16, 32, 48):
            icon = master.resize((size, size), Image.Resampling.LANCZOS)
            icon.save(PUBLIC / f"favicon-{size}x{size}.png")
        master.save(
            PUBLIC / "favicon.ico",
            sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
        )
    print("Exported SVG, 16/32/48px PNGs and a multi-size ICO from the Circle mark.")


if __name__ == "__main__":
    main()
