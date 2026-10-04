"""
Fredoka'ya Türkçe harfleri ekler: ş Ş ğ Ğ İ.

Fredoka (Google Fonts v17) bu harfleri içermiyor; tarayıcı onları yedek yazı tipiyle (Nunito) çizdiği için
başlıklarda "ince harfler" görünüyordu. Harfler Fredoka'nın kendi parçalarından kurulur:
  ş/Ş = s/S + ç'deki çengel (uni0327)      İ = I + i'nin noktası      ğ/Ğ = g/G + çizilen kısa yay (breve)
Yay, Fredoka'nın çizgi kalınlığında, yuvarlak uçlu olarak çizilir ve şapka (uni0302) ile aynı yüksekliğe konur.

Kullanım:  python scripts/patch-fredoka.py   →  src/assets/fonts/fredoka-tr-{500,600,700}.woff2
"""
from pathlib import Path

from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules" / "@fontsource" / "fredoka" / "files"
OUT = ROOT / "src" / "assets" / "fonts"
K = 0.5523  # çeyrek elips için kübik eğri katsayısı


def bbox(font, name):
    g = font["glyf"][name]
    g.recalcBounds(font["glyf"])
    return g.xMin, g.yMin, g.xMax, g.yMax


def draw(font, pen, name, dx=0, dy=0):
    font.getGlyphSet()[name].draw(TransformPen(pen, (1, 0, 0, 1, dx, dy)))


def contours(font, name):
    """Basit bir glifin konturlarını ayrı ayrı (nokta listesi, bayraklar) döner."""
    g = font["glyf"][name]
    coords, ends, flags = g.getCoordinates(font["glyf"])
    out, start = [], 0
    for end in ends:
        out.append((list(coords[start : end + 1]), list(flags[start : end + 1])))
        start = end + 1
    return out


def draw_contour(pen, pts, flags, dx=0, dy=0):
    """TrueType konturunu (on/off-curve noktaları) kaleme çizer."""
    pts = [(x + dx, y + dy) for x, y in pts]
    on = [bool(f & 1) for f in flags]
    # Bir on-curve noktadan başla
    s = on.index(True) if any(on) else 0
    pts, on = pts[s:] + pts[:s], on[s:] + on[:s]
    pen.moveTo(pts[0])
    buf = []
    for p, o in zip(pts[1:] + [pts[0]], on[1:] + [True]):
        if o:
            if buf:
                pen.qCurveTo(*buf, p)
                buf = []
            else:
                pen.lineTo(p)
        else:
            buf.append(p)
    pen.closePath()


def breve(pen, cx, top, width, depth, t):
    """Yuvarlak uçlu kısa yay: merkez çizgisi (cx±a, top) → (cx, top-depth) yarım elipsi, kalınlık t."""
    a, r = width / 2 - t / 2, t / 2
    ox, oy, ix, iy = a + r, depth + r, a - r, depth - r

    def arc(rx, ry, sx, ex, ccw):
        # (cx+sx*rx, top) → alt (cx, top-ry) → (cx+ex*rx, top)
        p0 = (cx + sx * rx, top)
        p1 = (cx, top - ry)
        p2 = (cx + ex * rx, top)
        pen.curveTo((p0[0], top - ry * K), (cx + sx * rx * K, p1[1]), p1)
        pen.curveTo((cx + ex * rx * K, p1[1]), (p2[0], top - ry * K), p2)

    def cap(x0, x1):
        # (x0, top) → yukarıdan yarım daire → (x1, top)
        mx = (x0 + x1) / 2
        pen.curveTo((x0, top + r * K), (mx + (x0 - mx) * K, top + r), (mx, top + r))
        pen.curveTo((mx + (x1 - mx) * K, top + r), (x1, top + r * K), (x1, top))

    pen.moveTo((cx - ox, top))
    arc(ox, oy, -1, 1, True)  # dış yay (soldan sağa, alttan)
    cap(cx + ox, cx + ix)  # sağ uç
    # iç yay sağdan sola
    pen.curveTo((cx + ix, top - iy * K), (cx + ix * K, top - iy), (cx, top - iy))
    pen.curveTo((cx - ix * K, top - iy), (cx - ix, top - iy * K), (cx - ix, top))
    cap(cx - ix, cx - ox)  # sol uç
    pen.closePath()


def add(font, name, uni, advance, lsb_from, build):
    glyf, order = font["glyf"], font.getGlyphOrder()
    pen = TTGlyphPen(font.getGlyphSet())
    build(pen)
    glyph = pen.glyph()
    glyph.recalcBounds(glyf)
    if name not in order:
        font.setGlyphOrder(order + [name])
    glyf[name] = glyph
    font["hmtx"][name] = (advance, glyph.xMin if hasattr(glyph, "xMin") else font["hmtx"][lsb_from][1])
    for table in font["cmap"].tables:
        if table.isUnicode():
            table.cmap[uni] = name


def patch(weight):
    font = TTFont(SRC / f"fredoka-latin-{weight}-normal.woff2")
    hmtx, cmap = font["hmtx"], font.getBestCmap()

    # Kalınlık: I'nın gövde genişliği; şapka ve çengelin yerleri hazır bileşik harflerden alınır.
    ix0, iy0, ix1, iy1 = bbox(font, "I")
    t = ix1 - ix0
    comps = {c.glyphName: c for c in font["glyf"]["acircumflex"].components}
    circ_dy_lower = comps["uni0302"].y
    comps_up = {c.glyphName: c for c in font["glyf"]["Acircumflex"].components}
    circ_dy_upper = comps_up["uni0302"].y
    cx0, cy0, cx1, cy1 = bbox(font, "uni0302")
    circ_w = cx1 - cx0
    ced = {c.glyphName: c for c in font["glyf"]["ccedilla"].components}["uni0327"]
    ced_up = {c.glyphName: c for c in font["glyf"]["Ccedilla"].components}["uni0327"]

    def center(name):
        x0, _, x1, _ = bbox(font, name)
        return (x0 + x1) / 2

    # ş Ş: s/S + çengel (ç'deki konumu, harfin ortasına kaydırılarak)
    for base, cbase, comp, name, uni in (("s", "c", ced, "scedilla", 0x15F), ("S", "C", ced_up, "Scedilla", 0x15E)):
        dx = comp.x + center(base) - center(cbase)

        def build(pen, base=base, dx=dx, comp=comp):
            draw(font, pen, base)
            draw(font, pen, "uni0327", dx, comp.y)

        add(font, name, uni, hmtx[base][0], base, build)

    # İ: I + i'nin noktası (i'deki boşlukla aynı aralıkta)
    parts = contours(font, "i")
    parts.sort(key=lambda c: max(y for _, y in c[0]))
    stem, dot = parts[0], parts[1]
    stem_top = max(y for _, y in stem[0])
    dot_bottom = min(y for _, y in dot[0])
    dot_cx = (min(x for x, _ in dot[0]) + max(x for x, _ in dot[0])) / 2
    gap = dot_bottom - stem_top

    def build_I(pen):
        draw(font, pen, "I")
        draw_contour(pen, *dot, (ix0 + ix1) / 2 - dot_cx, iy1 + gap - dot_bottom)

    add(font, "Idotaccent", 0x130, hmtx["I"][0], "I", build_I)

    # ğ Ğ: g/G + yay (şapka yüksekliğinde; şapkanın tabanı yayın tabanı olur)
    bw = circ_w * 0.92
    depth = (cy1 - cy0) * 0.5
    for base, dy, name, uni in (("g", circ_dy_lower, "gbreve", 0x11F), ("G", circ_dy_upper, "Gbreve", 0x11E)):
        bottom = cy0 + dy  # şapkanın alt kenarı (harfin üstündeki konumu)

        def build(pen, base=base, bottom=bottom):
            draw(font, pen, base)
            breve(Cu2QuPen(pen, 1.0, reverse_direction=True), center(base), bottom + depth + t / 2, bw, depth, t * 0.9)

        add(font, name, uni, hmtx[base][0], base, build)

    # Gereksiz tablo farklarını önlemek için maxp vb. kayıtta yeniden hesaplanır.
    font.flavor = "woff2"
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f"fredoka-tr-{weight}.woff2"
    font.save(out)
    check = TTFont(out).getBestCmap()
    missing = [c for c in "şŞğĞİçÇöÖüÜıâÂ" if ord(c) not in check]
    print(f"{out.name}: {'tamam' if not missing else 'eksik ' + ''.join(missing)}")


if __name__ == "__main__":
    for w in (500, 600, 700):
        patch(w)
