"""Rebuilds the composite hero images in public/img/hero/.

Run from the repo root:  python3 tools/hero-mashups.py

Not part of the build - the .webp outputs are committed. This exists so a
composite can be re-cut (different crop, different grade, an extra tile)
without reverse-engineering it from the finished image. The originals live
outside the repo; point D at wherever they are.

Every output is 2600x2000, which is what components/HeroReveal's panel wants.
The layouts are chosen around one constraint that is easy to miss: the panel
goes portrait at narrow desktop widths and center-cover then shows only a band
through the middle of the frame. See CLAUDE.md, "Cutting a new hero photo".
"""

from PIL import Image, ImageOps
import math

D = '/home/tmp/Downloads/'
SRC = {
    'ct':        'pexels-contact-me-923323219715-262056873-13176452.jpg',  # 5472x3648 CT suite
    'fleet':     'pexels-introspectivedsgn-12700835.jpg',                  # 5472x3648 delivery vans
    'excavator': 'pexels-efeburakbaydar-35846752.jpg',                     # 6000x4000 JCB
    'servers':   'pexels-brett-sayles-5480781.jpg',                        # 6048x4024 racks
    'office':    'pexels-binyaminmellish-1500459.jpg',                     # 5288x3525 brick office
    'warehouse': 'pexels-andre-124356440-28321968.jpg',                    # 4032x2268 grey unit
}

def crop_box(im, aspect, fx=0.5, fy=0.5):
    w, h = im.size
    if w / h > aspect:
        nw = int(round(h * aspect)); x = int((w - nw) * fx); return im.crop((x, 0, x + nw, h))
    nh = int(round(w / aspect)); y = int((h - nh) * fy); return im.crop((0, y, w, y + nh))

DUO_LO, DUO_HI = (13, 20, 54), (244, 246, 249)

def grade(im, target=130, pull=0.75, duo=0.40, desat=0.34):
    """Pull tiles toward one exposure and one colour cast. Without this a
       clinical white CT suite, a night car park, full daylight and a red-lit
       server aisle read as four clippings rather than one image.
       `pull` < 1 keeps some of each photo's own exposure so they don't all
       flatten to the same grey."""
    g = im.convert('L')
    mean = sum(i * c for i, c in enumerate(g.histogram())) / (im.width * im.height)
    mean = max(6.0, min(249.0, mean))
    p = math.log(target / 255.0) / math.log(mean / 255.0)   # out = in**p hits the target
    p = 1.0 + pull * (p - 1.0)
    p = max(0.45, min(2.60, p))
    im = im.point([min(255, int(round(255 * (i / 255.0) ** p))) for i in range(256)] * 3)

    g = im.convert('L')
    im = Image.blend(im, g.convert('RGB'), desat)
    return Image.blend(im, ImageOps.colorize(g, DUO_LO, DUO_HI), duo)

def tile(key, size, fx=0.5, fy=0.5, **kw):
    im = Image.open(D + SRC[key]).convert('RGB')
    return grade(crop_box(im, size[0] / size[1], fx, fy).resize(size, Image.LANCZOS), **kw)

W, H, GUT = 2600, 2000, 14

def equipment(gutter=(255, 255, 255)):
    """2x2. A 2x2 is the only multi-tile layout that survives the panel going
       portrait at narrow widths: every tile touches the centre, so the middle
       band still shows a piece of all four. Columns or stripes would hide
       half of them. Bright/dark alternate on the diagonal."""
    cw, ch = (W - GUT) // 2, (H - GUT) // 2
    c = Image.new('RGB', (W, H), gutter)
    c.paste(tile('ct',        (cw, ch), 0.45), (0, 0))
    c.paste(tile('fleet',     (cw, ch), 1.00), (cw + GUT, 0))
    c.paste(tile('excavator', (cw, ch), 0.50), (0, ch + GUT))
    c.paste(tile('servers',   (cw, ch), 0.50), (cw + GUT, ch + GUT))
    return c

def cre(gutter=(255, 255, 255)):
    """Two stacked bands, not side by side: both subjects are wide buildings
       and a portrait slot would cut them to a sliver. Unequal heights because
       the grey unit fills more of its frame vertically than the office does."""
    th = 960; bh = H - th - GUT
    c = Image.new('RGB', (W, H), gutter)
    # duo/desat pushed harder than the equipment grid: the office is shot at a
    # warm sunset and the grey unit under a cool midday sky, and warm tones
    # fight this palette (see CLAUDE.md on --cream).
    c.paste(tile('office',    (W, th), 0.50, 0.46, duo=0.50, desat=0.40), (0, 0))
    c.paste(tile('warehouse', (W, bh), 0.50, 0.78, duo=0.50, desat=0.40), (0, th + GUT))
    return c


def contact():
    """Single image, NOT graded - it carries the KIBA logo and the grade would
       shift the brand blue. Cropped flush right so the logo lands at 67%
       across rather than 76%, which would put it outside the band the panel
       shows at narrow widths."""
    im = Image.open(D + 'A40.jpg').convert('RGB')
    return crop_box(im, W / H, 1.0).resize((W, H), Image.LANCZOS)

OUT = 'public/img/hero/'

if __name__ == '__main__':
    # q62 on the composites: checked at 1:1 against q76 on the server-rack mesh
    # (the worst case in either image) and the difference is not visible, but
    # it is ~90KB. The office render keeps q76 - it is mostly smooth wall
    # gradients, which is where WebP bands.
    for img, name, q in [(equipment(), 'equipment-mix', 62),
                         (cre(), 'commercial-property-mix', 62),
                         (contact(), 'kiba-office-lobby', 76)]:
        img.save(OUT + name + '.webp', 'WEBP', quality=q, method=6)
        print(name, img.size, q)
