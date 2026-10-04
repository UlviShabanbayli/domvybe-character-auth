// The characters that watch the card: one per look (glass: the drop, nordic: the owl, clay: the cat). Each
// character-<name>.js adds itself here; app.js picks the one for the look, puts its two SVGs around the card and calls
// its draw() every frame with the moods' springs.
//
// A character is { back, front, bits, build }:
//   back, front   two SVGs (class blob blob-back / blob blob-front), each a 300 × 260 box centred over the card, whose
//                 top edge is at y 190 (EDGE). back is drawn behind the card's glass (what hides below the edge shows
//                 through it, blurred), front in front of it. front holds .b-bits (8 particles) and .b-zz (3 z's);
//                 whatever has .b-hit takes a poke.
//   bits          how its particles fly: { gravity (px/s²), drag (1/s), fade (1/s), spin (deg/s) } — droplets fall,
//                 feathers drift, hearts float up
//   build(back, front) → draw(rig) → { eye, top }: finds its parts once; draw() renders one frame and says where its
//                 eyes and the top of its head are (box px), for where it looks from and where particles start
// rig: every mood spring's value (lookX lookY sx sy hop tilt sway cover peek raise chin smile open lid wide joy no brow
//      knit quirk blush zz, see app.js), stand (0 peeking over the edge … 1 standing on it), edge (the card's top edge
//      now: it moves when the card folds), shake (px), blink (0 … 1), t (s), calm.
const characters = {
  CX: 150, EDGE: 190,
  clamp: (v, a, b) => Math.min(b, Math.max(a, v)),
  mix: (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }),
  n: (v) => v.toFixed(2),                                         // a number for an SVG attribute
  // a lean around a pivot: a turn, or (shear 1) for something soft standing on its base, a shear — the base stays put
  lean(pv, deg, shear = 0) {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), t = Math.tan(a), k = shear;
    const A = c + (1 - c) * k, B = s * (1 - k), C = -s + (s - t) * k, D = c + (1 - c) * k;
    const e = pv.x - A * pv.x - C * pv.y, f = pv.y - B * pv.x - D * pv.y;
    return { attr: `matrix(${[A, B, C, D, e, f].map(characters.n).join(' ')})`, at: (x, y) => ({ x: A * x + C * y + e, y: B * x + D * y + f }) };
  },
  // a closed, smooth outline through points (Catmull-Rom, as cubic curves)
  curve(pts) {
    const m = pts.length, n = characters.n;
    let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
    for (let k = 0; k < m; k++) {
      const p0 = pts[(k - 1 + m) % m], p1 = pts[k], p2 = pts[(k + 1) % m], p3 = pts[(k + 2) % m];
      d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
    }
    return d + 'Z';
  },
  // set an attribute, or the opacity, only when it changed
  set(el, name, v) { if (el.getAttribute(name) !== v) el.setAttribute(name, v); },
  fade(el, v) { const o = v.toFixed(3); if (el.dataset.o !== o) { el.dataset.o = o; el.style.opacity = o; } },
};
