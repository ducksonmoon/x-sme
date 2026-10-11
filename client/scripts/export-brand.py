"""Compile the approved vector mark and Persian wordmark into portable SVGs.

Run from client: python3 scripts/export-brand.py
Requires fonttools, brotli and uharfbuzz; see brand-assets-requirements.txt.
SVG text is outlined, so exported signatures need no installed fonts.
"""
from io import BytesIO
from pathlib import Path
from html import escape
import json
import argparse
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import DecomposingRecordingPen, RecordingPen
from fontTools.pens.boundsPen import BoundsPen

CLIENT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--source", type=Path, default=CLIENT / "src/brand/circle")
parser.add_argument("--output", type=Path, default=CLIENT / "public/brand")
args = parser.parse_args()
SOURCE = args.source.resolve()
OUT = args.output.resolve()
PALETTE = json.loads((SOURCE / "palette.json").read_text())
MARK = json.loads((SOURCE / "mark.json").read_text())
FONTS = {}


def font_for(latin=False, weight=800):
    key = (latin, weight)
    if key not in FONTS:
        filename = "vazirmatn-latin.woff2" if latin else "vazirmatn-arabic.woff2"
        tt = instantiateVariableFont(TTFont(SOURCE / "fonts" / filename), {"wght": weight}, inplace=True)
        tt.flavor = None
        stream = BytesIO()
        tt.save(stream)
        units = tt["head"].unitsPerEm
        font = hb.Font(hb.Face(stream.getvalue()))
        font.scale = (units, units)
        hb.ot_font_set_funcs(font)
        FONTS[key] = (tt, font, units)
    return FONTS[key]


def outline(text, size, baseline, x=0, latin=False, weight=800, replace_he=False):
    tt, font, units = font_for(latin, weight)
    glyphs = tt.getGlyphSet()
    buffer = hb.Buffer()
    buffer.add_str(text)
    buffer.guess_segment_properties()
    hb.shape(font, buffer)
    scale = size / units
    cursor, shift, paths, accents = 0, 0, [], []
    for info, position in zip(buffer.glyph_infos, buffer.glyph_positions):
        if replace_he and info.cluster == 4:
            shift = 44 - position.x_advance * scale
        else:
            recording = DecomposingRecordingPen(glyphs)
            glyphs[tt.getGlyphName(info.codepoint)].draw(recording)
            contours, current = [], []
            for operation in recording.value:
                current.append(operation)
                if operation[0] in ("closePath", "endPath"):
                    contours.append(current)
                    current = []
            if current:
                contours.append(current)
            base_recording, accent_recording = RecordingPen(), RecordingPen()
            for contour in contours:
                segment = RecordingPen()
                segment.value = contour
                bounds = BoundsPen(glyphs)
                segment.replay(bounds)
                is_dot = replace_he and info.cluster == 2 and bounds.bounds and bounds.bounds[3] < 0
                (accent_recording if is_dot else base_recording).value.extend(contour)
            for source, destination in [(base_recording, paths), (accent_recording, accents)]:
                if not source.value:
                    continue
                pen = SVGPathPen(glyphs)
                source.replay(TransformPen(pen, (scale, 0, 0, -scale,
                    x + cursor * scale + shift + position.x_offset * scale,
                    baseline - position.y_offset * scale)))
                destination.append(pen.getCommands())
        cursor += position.x_advance
    return paths, accents, cursor * scale + shift


def paths_markup(paths):
    return "".join(f'<path d="{path}"/>' for path in paths)


def mark_markup(color, x=0, y=0, size=200):
    return f'<g fill="{color}" fill-rule="evenodd" transform="translate({x} {y}) scale({size / 200})">{paths_markup(MARK["paths"])}</g>'


def svg(filename, width, height, title, body):
    content = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img"><title>{escape(title)}</title>{body}</svg>\n'
    (OUT / filename).write_text(content)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    paths, accents, width = outline("دایره", 52, 55, replace_he=True)
    wordmark = {"viewBox": f"0 0 {round(width + 2, 2)} 76", "paths": paths,
                "accents": accents, "markTransform": "translate(0 17) scale(0.2)"}
    (SOURCE / "wordmark.json").write_text(json.dumps(wordmark, ensure_ascii=False, indent=2) + "\n")
    p, paper, copper = PALETTE["petrol"], PALETTE["ivory"], PALETTE["copper"]
    for name, color in [("petrol", p), ("paper", paper), ("black", "#000000"), ("white", "#FFFFFF")]:
        svg(f"mark-{name}.svg", 200, 200, "نشان دایره", mark_markup(color))

    def name_markup(color, accent, x=0, y=0, scale=1):
        return f'<g transform="translate({x} {y}) scale({scale})"><g fill="{color}">{paths_markup(paths)}</g><g fill="{accent}">{paths_markup(accents)}</g>{mark_markup(color, 0, 17, 40)}</g>'

    english, _, english_width = outline("CIRCLE GROUP", 11, 83, latin=True, weight=600)
    for name, color, accent in [("light", p, copper), ("dark", paper, paper), ("black", "#000000", "#000000"), ("white", "#FFFFFF", "#FFFFFF")]:
        svg(f"logo-{name}.svg", round(width + 2), 96, "دایره — Circle Group",
            name_markup(color, accent) + f'<g fill="{color}" transform="translate({(width - english_width) / 2} 0)">{paths_markup(english)}</g>')
        caption, _, caption_width = outline("طراحی و توسعه توسط", 12, 23, weight=500)
        credit_width = round(width * .27 + 28 + caption_width + 16)
        bg = f'<rect width="{credit_width + 24}" height="44" rx="22" fill="{p}"/>' if name == "dark" else ""
        body = name_markup(color, color, 0, 2, .27) + mark_markup(color, width * .27 + 5, 8, 20)
        body += f'<g fill="{color}" transform="translate({width * .27 + 33} 0)">{paths_markup(caption)}</g>'
        svg(f"website-credit-{name}.svg", credit_width, 36, "طراحی و توسعه توسط دایره", body)
        if name == "dark":
            svg("website-credit-pill.svg", credit_width + 24, 44, "طراحی و توسعه توسط دایره", bg + f'<g transform="translate(12 4)">{body}</g>')

    caption, _, caption_width = outline("طراحی و توسعه توسط دایره", 14, 29, weight=600)
    url, _, url_width = outline("circlegroup.ir", 12, 51, latin=True, weight=400)
    sign_width = round(max(caption_width, url_width) + 82)
    for name, color, bg in [("light", p, paper), ("dark", paper, p)]:
        svg(f"software-signature-{name}.svg", sign_width, 76, "نرم‌افزار ساخته‌شده توسط دایره",
            f'<rect width="{sign_width}" height="76" rx="12" fill="{bg}"/>' + mark_markup(color, sign_width - 64, 16, 44)
            + f'<g fill="{color}" transform="translate(16 0)">{paths_markup(caption)}{paths_markup(url)}</g>')
    svg("app-icon.svg", 256, 256, "آیکون دایره", f'<rect width="256" height="256" fill="{p}"/>' + mark_markup(paper, 51, 51, 154))
    svg("favicon.svg", 64, 64, "دایره", f'<rect width="64" height="64" rx="14" fill="{p}"/>' + mark_markup(paper, 10, 10, 44))
    description, _, description_width = outline("وب، نرم‌افزار و هوش مصنوعی", 28, 425, weight=500)
    svg("social-card.svg", 1200, 630, "دایره — وب، نرم‌افزار و هوش مصنوعی",
        f'<rect width="1200" height="630" fill="{p}"/>' + mark_markup(paper, 78, 152, 310)
        + name_markup(paper, paper, 680, 155, 3)
        + f'<g fill="{paper}" transform="translate({1080 - description_width} 0)">{paths_markup(description)}</g>'
        + f'<rect x="990" y="466" width="90" height="5" fill="{copper}"/>'
        + '<g fill="' + paper + '" transform="translate(913 500)">' + paths_markup(outline("circlegroup.ir", 24, 36, latin=True, weight=500)[0]) + '</g>')
    print(f"Exported {len(list(OUT.glob('*.svg')))} SVGs; Persian lettering is outlined.")


if __name__ == "__main__":
    main()
