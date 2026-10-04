// The owl (nordic look): a glazed porcelain figurine, hand-painted in cobalt with touches of gold — white glaze lit
// from the top left, a cool shade underneath, a window of light and a reflection on the right that sit over the
// painting. Painted rings and strokes round its eyes, painted scallops on its belly, a gold beak and gold feet.
// It doesn't cover its eyes for your password — it turns its head away (the face slides round the side and the painted
// back of its head shows), and peeks back with one eye when you press "show". Peeking, its wings hang over the card's
// edge; standing, it perches on the edge with its toes over it. Its brows are painted strokes; its glazed lids come
// down when it is sleepy; it flaps for joy.
characters.owl = (() => {
  const { CX, EDGE, clamp, mix, n, lean, curve, set, fade } = characters;
  const RX = 54, RY = 66, FEET = 6, EYE = 17;                       // the body's radii; how far the feet lift it; an eye ring's radius
  const CY_PEEK = EDGE - 12;                                        // peeking, only the head shows over the edge

  // the painting, in the body's own coordinates (the centre is 0 0): scallops on the belly, three leaves on the crown,
  // chevrons down the back of the head (they show when it turns away)
  const scallops = [[6, [-12, 0, 12]], [16, [-24, -12, 0, 12, 24]], [26, [-18, -6, 6, 18]], [36, [-24, -12, 0, 12, 24]], [46, [-18, -6, 6, 18]], [56, [-6, 6]]]
    .map(([y, xs]) => xs.map((x) => `M${x - 5} ${y}q5 6 10 0`).join('')).join('');
  const crown = 'M-12 -56q4 -7 0 -12q-4 5 0 12ZM0 -60q4 -7 0 -12q-4 5 0 12ZM12 -56q4 -7 0 -12q-4 5 0 12Z';
  const backPaint = 'M-8 -44l8 6l8 -6M-10 -32l10 7l10 -7M-12 -20l12 8l12 -8M-10 -7l10 7l10 -7';
  // round each eye a painted ring, with short strokes along its top like lashes (the face's coordinates)
  const ring = (x) => `M${x - EYE} 0a${EYE} ${EYE} 0 1 0 ${EYE * 2} 0a${EYE} ${EYE} 0 1 0 ${-EYE * 2} 0`;
  const lashes = (x) => Array.from({ length: 7 }, (_, k) => {
    const a = ((-160 + k * 23.3) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return `M${n(x + c * 20.5)} ${n(s * 20.5)}L${n(x + c * 25)} ${n(s * 25)}`;
  }).join('');
  const eye = `<g class="ow-eye"><circle class="ow-iris" r="12"/><circle class="ow-pupil" r="6.5"/>
    <circle class="ow-glint" r="3.2" cx="4.2" cy="-4.2"/><circle class="ow-glint" r="1.4" cx="-4" cy="4"/>
    <path class="ow-lid"/><path class="ow-lash"/><path class="ow-arc" d="M-10 3 Q0 -8 10 3"/></g>`;
  const tuft = `<g class="ow-tuft"><path class="ow-tuft-skin" fill="url(#ow-glaze)"/><path class="ow-paint ow-tuft-paint"/></g>`;
  const back = `
    <svg class="blob blob-back" viewBox="0 0 300 260" aria-hidden="true">
      <defs>
        <clipPath id="ow-clip"><path class="ow-clip"/></clipPath>
        <radialGradient id="ow-glaze" cx="36%" cy="28%" r="82%"><stop class="ow-g1" offset="0"/><stop class="ow-g2" offset=".5"/><stop class="ow-g3" offset=".86"/><stop class="ow-g4" offset="1"/></radialGradient>
        <radialGradient id="ow-shade" cx="52%" cy="100%" r="62%"><stop class="ow-s1" offset="0"/><stop class="ow-s2" offset="1"/></radialGradient>
        <linearGradient id="ow-spec" x1="0" y1="0" x2="0" y2="1"><stop class="ow-p1" offset="0"/><stop class="ow-p2" offset="1"/></linearGradient>
        <linearGradient id="ow-reflect" x1="0" y1="0" x2="1" y2="0"><stop class="ow-r1" offset="0"/><stop class="ow-r2" offset="1"/></linearGradient>
        <radialGradient id="ow-wash"><stop class="ow-w1" offset="0"/><stop class="ow-w2" offset="1"/></radialGradient>
        <linearGradient id="ow-gold" x1="0" y1="0" x2="0" y2="1"><stop class="ow-o1" offset="0"/><stop class="ow-o2" offset=".55"/><stop class="ow-o3" offset="1"/></linearGradient>
        <radialGradient id="ow-contact"><stop class="ow-k1" offset="0"/><stop class="ow-k2" offset="1"/></radialGradient>
      </defs>
      ${tuft}${tuft}
      <path class="ow-body b-hit" fill="url(#ow-glaze)"/>
      <g class="ow-in" clip-path="url(#ow-clip)">
        <path class="ow-shade" fill="url(#ow-shade)"/>
        <g class="ow-belly"><ellipse class="ow-paint ow-thin" cy="26" rx="36" ry="40"/><path class="ow-paint" d="${scallops}"/></g>
        <path class="ow-crown" d="${crown}"/>
        <path class="ow-paint ow-back" d="${backPaint}"/>
        <g class="ow-face">
          <path class="ow-paint ow-thin" d="${ring(-21)}${ring(21)}"/>
          <path class="ow-paint ow-thin" d="${lashes(-21)}${lashes(21)}"/>
          <circle class="ow-cheek" r="7" fill="url(#ow-wash)"/><circle class="ow-cheek" r="7" fill="url(#ow-wash)"/>
          ${eye}${eye}
          <path class="ow-brow"/><path class="ow-brow"/>
          <path class="ow-beak-lo" d="M-4.5 0Q0 1 4.5 0Q2 4 0 6Q-2 4 -4.5 0Z" fill="url(#ow-gold)"/>
          <g class="ow-beak"><path d="M-6.5 -6Q0 -9 6.5 -6Q4 1 0 8Q-4 1 -6.5 -6Z" fill="url(#ow-gold)"/><path class="ow-beak-hl" d="M-3 -5Q-1 -6 0 -5.6Q-1 -1 -1.6 1"/></g>
        </g>
        <ellipse class="ow-reflect" rx="6" ry="30" fill="url(#ow-reflect)"/>
        <path class="ow-spec" d="M-30 -30Q-26 -50 -6 -58Q-20 -46 -22 -28Q-26 -24 -30 -30Z" fill="url(#ow-spec)"/><circle class="ow-dot" r="2.6"/>
      </g>
    </svg>`;
  const wing = `<g class="ow-wing"><path class="ow-wing-skin" fill="url(#ow-glaze)"/><path class="ow-paint ow-wing-paint"/><path class="ow-wing-gloss"/></g>`;
  const foot = `<path class="ow-foot" d="M-5 -6h10M-7 -2q-2.5 3 -2.5 7M0 -2v8M7 -2q2.5 3 2.5 7"/>`;
  const front = `
    <svg class="blob blob-front" viewBox="0 0 300 260" aria-hidden="true">
      <ellipse class="ow-contact" rx="22" ry="6" fill="url(#ow-contact)"/><ellipse class="ow-contact" rx="22" ry="6" fill="url(#ow-contact)"/>
      ${foot}${foot}${wing}${wing}
      <g class="b-bits"><ellipse rx="5" ry="2.2"/><ellipse rx="4" ry="1.8"/><ellipse rx="5.5" ry="2.4"/><ellipse rx="4" ry="1.8"/><ellipse rx="5" ry="2.2"/><ellipse rx="3.5" ry="1.6"/><ellipse rx="5" ry="2.2"/><ellipse rx="4.5" ry="2"/></g>
      <g class="b-zz"><text>z</text><text>z</text><text>Z</text></g>
    </svg>`;

  // the body: an egg, a little narrower at the top, round at the bottom
  function egg(cx, cy, rx, ry) {
    const pts = [];
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2, s = Math.sin(a);
      pts.push([cx + Math.cos(a) * rx * (s < 0 ? 1 + s * 0.1 : 1), cy + s * ry]);
    }
    return curve(pts);
  }
  // a lid over an eye ring, down to a share of it (0 … 1): the cap of the circle above that line
  function cap(k) {
    const y = clamp(k, 0, 0.995) * 2 * EYE - EYE, x = Math.sqrt(Math.max(0, EYE * EYE - y * y));   // never a full circle: the arc needs two ends
    return { lid: `M${n(-x)} ${n(y)}A${EYE} ${EYE} 0 ${y > 0 ? 1 : 0} 1 ${n(x)} ${n(y)}Z`, lash: `M${n(-x)} ${n(y)}L${n(x)} ${n(y)}` };
  }
  // a brow: a brush stroke that tapers from its inner end (over the beak) to its outer end
  function brow(ix, iy, ox, oy, lift) {
    const mx = (ix + ox) / 2, my = (iy + oy) / 2 - 5 - lift;
    return `M${n(ix)} ${n(iy)}Q${n(mx)} ${n(my - 3)} ${n(ox)} ${n(oy)}Q${n(mx)} ${n(my + 2.5)} ${n(ix)} ${n(iy + 2.6)}Z`;
  }

  function build(svgBack, svgFront) {
    const q = (s, r) => [...r.querySelectorAll(s)], one = (s, r) => r.querySelector(s);
    const body = one('.ow-body', svgBack), shade = one('.ow-shade', svgBack), clip = one('.ow-clip', svgBack), inner = one('.ow-in', svgBack);
    const tufts = q('.ow-tuft', svgBack).map((g) => ({ g, skin: one('.ow-tuft-skin', g), paint: one('.ow-tuft-paint', g) }));
    const belly = one('.ow-belly', svgBack), crown = one('.ow-crown', svgBack), backEl = one('.ow-back', svgBack), face = one('.ow-face', svgBack);
    const reflect = one('.ow-reflect', svgBack), spec = one('.ow-spec', svgBack), dot = one('.ow-dot', svgBack);
    const cheeks = q('.ow-cheek', svgBack), brows = q('.ow-brow', svgBack), beak = one('.ow-beak', svgBack), beakLo = one('.ow-beak-lo', svgBack);
    const eyes = q('.ow-eye', svgBack).map((g) => ({ g, pupil: one('.ow-pupil', g), lid: one('.ow-lid', g), lash: one('.ow-lash', g), arc: one('.ow-arc', g) }));
    const contacts = q('.ow-contact', svgFront), feet = q('.ow-foot', svgFront);
    const wings = q('.ow-wing', svgFront).map((g) => ({ g, skin: one('.ow-wing-skin', g), paint: one('.ow-wing-paint', g), gloss: one('.ow-wing-gloss', g) }));

    return function draw(r) {
      const { stand: st, sx, sy, lookX: lx, lookY: ly, shake: sh, edge, t } = r;
      const lift = Math.min(0, r.hop) * (0.12 + st);
      const rx = RX * (1 + sx), ry = RY * (1 + sy);
      const cy = CY_PEEK + (edge - FEET - ry * 0.95 - CY_PEEK) * st + lift;
      const L = lean({ x: CX + sh * st, y: CY_PEEK + RY + (edge + lift - CY_PEEK - RY) * st }, r.tilt + r.no * 6), M = L.attr;
      // the porcelain: body, shade, the painting on it (it squashes with the body), and the gloss over it all
      const d = egg(CX, cy, rx, ry), at = `translate(${n(CX)} ${n(cy)})`;
      set(body, 'd', d); set(body, 'transform', M); set(clip, 'd', d); set(inner, 'transform', M); set(shade, 'd', d);
      set(belly, 'transform', `${at} scale(${n(1 + sx)} ${n(1 + sy)})`);
      set(crown, 'transform', at); set(backEl, 'transform', at);
      set(reflect, 'transform', `translate(${n(CX + rx * 0.8)} ${n(cy + ry * 0.12)}) rotate(-6)`);
      set(spec, 'transform', `${at} scale(${n(rx / RX)} ${n(ry / RY)})`);
      set(dot, 'transform', `translate(${n(CX - rx * 0.06)} ${n(cy - ry * 0.86)})`);
      tufts.forEach((tf, i) => {                                   // two-pronged tufts, cobalt at the tips; they perk, droop, trail
        const side = i ? 1 : -1, ang = side * (16 - 10 * r.brow + 26 * r.knit) + r.sway * 0.8 + (i ? -r.quirk * 8 : 0);
        set(tf.skin, 'd', `M${-side * 12} 8Q${-side * 13} -8 ${-side * 5} -24Q${-side * 1} -14 ${side * 2} -13Q${side * 5} -26 ${side * 13} -32Q${side * 10} -10 ${side * 13} 8Z`);
        set(tf.paint, 'd', `M${-side * 5.5} -22L${-side * 8} -9M${side * 12} -29L${side * 9.5} -13`);
        set(tf.g, 'transform', `${M} translate(${n(CX + side * rx * 0.6)} ${n(cy - ry * 0.76)}) rotate(${n(ang)})`);
      });
      // the head turn: the face slides round the side (clipped by the body) and narrows; the painted back shows.
      // Peeking (password shown) it turns only part way back: one eye looks round the edge.
      const turn = clamp(r.cover, 0, 1.1) * (1 - 0.42 * clamp(r.peek, 0, 1));
      set(face, 'transform', `translate(${n(CX + turn * 92 + lx * 4)} ${n(cy - 18 + ly * 3)}) scale(${n(1 - 0.35 * clamp(turn, 0, 1))} 1)`);
      fade(backEl, clamp(turn * 1.4 - 0.2, 0, 1));
      // the eyes (the face's own coordinates: the centre between them is 0 0): the glaze glints stay put, the pupils look
      const joy = clamp(r.joy, 0, 1), shut = Math.max(r.blink, clamp(r.lid, 0, 1) * 0.72), lids = cap(Math.max(shut, joy));
      eyes.forEach((e, i) => {
        set(e.g, 'transform', `translate(${i ? 21 : -21} 0) scale(${n(1 + 0.08 * r.wide)})`);
        set(e.pupil, 'transform', `translate(${n(lx * 3.5)} ${n(ly * 3.5)}) scale(${n(1 - 0.25 * r.wide)})`);
        set(e.lid, 'd', lids.lid); set(e.lash, 'd', lids.lash);    // joy: the lids close over smiling arcs
        fade(e.lash, shut * (1 - joy) > 0.04 ? 1 : 0);
        fade(e.arc, joy);
      });
      brows.forEach((el, i) => {
        const side = i ? 1 : -1, by = -22 - r.brow * 4 - (i ? r.quirk * 5 : 0), x = side * 21;
        set(el, 'd', brow(x - side * 15, by + 4 - r.knit * 6, x + side * 17, by + 1 + r.knit * 3 - r.brow * 2, r.brow * 2));
      });
      const blush = clamp(r.blush, 0, 1);
      cheeks.forEach((el, i) => { set(el, 'transform', `translate(${i ? 38 : -38} 16) scale(${n(0.7 + 0.5 * blush)})`); fade(el, blush); });
      const op = clamp(r.open, 0, 1);
      set(beak, 'transform', `translate(0 ${n(13 - op * 2)})`);
      set(beakLo, 'transform', `translate(0 ${n(14 + op * 5)})`);
      fade(beakLo, clamp(op * 3, 0, 1));
      // the wings: draped over the card's edge (peeking) or folded at its sides (standing); one to the beak to think;
      // flapping, up in the air, for joy
      const up = clamp(r.raise, -0.1, 1.1), chin = clamp(r.chin, 0, 1);
      wings.forEach((w, i) => {
        const side = i ? 1 : -1, shoulder = L.at(CX + side * rx * 0.78, cy + 4);
        let p = mix({ x: CX + side * 52 + sh, y: EDGE + 3 + lift * 0.2 }, L.at(CX + side * rx * 0.88, cy + ry * 0.6), st);
        if (i) p = mix(p, L.at(CX + 20, cy - 4), chin);
        p = mix(p, L.at(CX + side * 92, cy - 30 + Math.sin(t * 14 + i * Math.PI) * 10), up);
        const len = clamp(Math.hypot(p.x - shoulder.x, p.y - shoulder.y), 24, 80), ang = (Math.atan2(p.y - shoulder.y, p.x - shoulder.x) * 180) / Math.PI;
        const k = (v) => n(len * v);
        set(w.skin, 'd', `M0 -10C${k(0.45)} -16 ${k(0.9)} -8 ${k(1)} 0Q${k(0.94)} 6 ${k(0.8)} 5Q${k(0.77)} 11 ${k(0.6)} 9Q${k(0.55)} 14 ${k(0.38)} 12C${k(0.2)} 13 0 12 0 10Z`);
        // painted: the three feather tips outlined, and two quills along the wing
        set(w.paint, 'd', `M${k(0.38)} 12Q${k(0.55)} 14 ${k(0.6)} 9Q${k(0.77)} 11 ${k(0.8)} 5Q${k(0.94)} 6 ${k(1)} 0M${k(0.2)} 3L${k(0.58)} 4M${k(0.24)} -3L${k(0.72)} -1`);
        set(w.gloss, 'd', `M${k(0.14)} -8C${k(0.4)} -12 ${k(0.7)} -8 ${k(0.86)} -3`);
        set(w.g, 'transform', `translate(${n(shoulder.x)} ${n(shoulder.y)}) rotate(${n(ang)})`);
        // the feet: gold, perched on the edge, toes over it (standing only)
        const foot = { x: CX + sh * st + side * 16, y: edge + lift };
        set(feet[i], 'transform', `translate(${n(foot.x)} ${n(foot.y)})`);
        fade(feet[i], clamp(st * 2 - 1, 0, 1));
        // the contact shadow: under the wing tip on the edge (peeking) or under the feet (standing)
        const onWing = clamp(1 - Math.abs(EDGE + 3 - p.y) / 12, 0, 1) * (1 - st), onFeet = clamp(1 + lift / 24, 0, 1) * st;
        set(contacts[i], 'transform', `translate(${n(p.x + (foot.x - p.x) * st)} ${n(edge + 4)}) scale(${n(1 - 0.35 * st)} 1)`);
        fade(contacts[i], (onWing + onFeet) * 0.9);
      });
      return { eye: L.at(CX, cy - 18), top: L.at(CX, cy - ry) };
    };
  }

  return { back, front, build, bits: { gravity: 160, drag: 3.5, fade: 0.55, spin: 170 } };
})();
