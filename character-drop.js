// The drop (glass look): a little liquid with eyes. Not a drawn-perfect drop: soft and a little lopsided, its outline
// never still. Peeking, it holds the card's edge with both hands; standing, it sits on the card spread out like a drop
// on a table, a drip running over the edge — it gathers itself up to jump and splats flat when it lands.
characters.drop = (() => {
  const { CX, EDGE, clamp, mix, n, lean, curve, set, fade } = characters;
  const RX = 64, RY = 54, BASE = 0.82;                             // its radii; where it sits, as a share of RY below the centre
  const CY_PEEK = EDGE - 22;                                        // peeking, its centre is just above the edge

  const back = `
    <svg class="blob blob-back" viewBox="0 0 300 260" aria-hidden="true">
      <defs>
        <radialGradient id="dr-fill" cx="36%" cy="30%" r="80%"><stop class="dr-f1" offset="0"/><stop class="dr-f2" offset=".42"/><stop class="dr-f3" offset=".8"/><stop class="dr-f4" offset="1"/></radialGradient>
        <radialGradient id="dr-tint" cx="50%" cy="54%" r="56%"><stop class="dr-t1" offset=".6"/><stop class="dr-t2" offset="1"/></radialGradient>
        <radialGradient id="dr-shade" cx="50%" cy="100%" r="62%"><stop class="dr-s1" offset="0"/><stop class="dr-s2" offset="1"/></radialGradient>
        <linearGradient id="dr-rim" x1="0" y1="0" x2="0" y2="1"><stop class="dr-r1" offset="0"/><stop class="dr-r2" offset=".5"/></linearGradient>
        <linearGradient id="dr-spec" x1="0" y1="0" x2="0" y2="1"><stop class="dr-p1" offset="0"/><stop class="dr-p2" offset="1"/></linearGradient>
        <radialGradient id="dr-caustic"><stop class="dr-q1" offset="0"/><stop class="dr-q2" offset="1"/></radialGradient>
        <linearGradient id="dr-eye" x1="0" y1="0" x2="0" y2="1"><stop class="dr-e1" offset=".45"/><stop class="dr-e2" offset="1"/></linearGradient>
        <radialGradient id="dr-cheek"><stop class="dr-c1" offset="0"/><stop class="dr-c2" offset="1"/></radialGradient>
        <radialGradient id="dr-contact"><stop class="dr-k1" offset="0"/><stop class="dr-k2" offset="1"/></radialGradient>
      </defs>
      <path class="dr-body b-hit" fill="url(#dr-fill)"/>
      <path class="dr-skin" fill="url(#dr-tint)"/>
      <path class="dr-skin" fill="url(#dr-shade)"/>
      <ellipse class="dr-caustic" rx="26" ry="7" fill="url(#dr-caustic)"/>
      <path class="dr-skin dr-rim" stroke="url(#dr-rim)"/>
      <ellipse class="dr-shine" rx="17" ry="8" fill="url(#dr-spec)"/><circle class="dr-dot" r="2.6"/>
      <ellipse class="dr-cheek" rx="9" ry="5" fill="url(#dr-cheek)"/><ellipse class="dr-cheek" rx="9" ry="5" fill="url(#dr-cheek)"/>
      <g class="dr-eye"><ellipse class="dr-iris" rx="9" ry="11.5" fill="url(#dr-eye)"/><circle class="dr-glint" r="3.2"/><circle class="dr-glint" r="1.4"/><path class="dr-arc" d="M-9 3 Q0 -8 9 3"/></g>
      <g class="dr-eye"><ellipse class="dr-iris" rx="9" ry="11.5" fill="url(#dr-eye)"/><circle class="dr-glint" r="3.2"/><circle class="dr-glint" r="1.4"/><path class="dr-arc" d="M-9 3 Q0 -8 9 3"/></g>
      <path class="dr-brow"/><path class="dr-brow"/>
      <path class="dr-mouth"/><ellipse class="dr-tongue" rx="4" ry="2.6"/>
    </svg>`;
  const front = `
    <svg class="blob blob-front" viewBox="0 0 300 260" aria-hidden="true">
      <ellipse class="dr-contact" rx="22" ry="6" fill="url(#dr-contact)"/><ellipse class="dr-contact" rx="22" ry="6" fill="url(#dr-contact)"/>
      <path class="dr-drip" fill="url(#dr-fill)"/>
      <path class="dr-arm"/><path class="dr-arm"/>
      <ellipse class="dr-hand" rx="10" ry="9" fill="url(#dr-fill)"/><ellipse class="dr-hand" rx="10" ry="9" fill="url(#dr-fill)"/>
      <g class="b-bits"><circle r="4"/><circle r="3"/><circle r="5"/><circle r="2.5"/><circle r="3.5"/><circle r="2"/><circle r="4"/><circle r="3"/></g>
      <g class="b-zz"><text>z</text><text>z</text><text>Z</text></g>
    </svg>`;

  // the outline: points round an ellipse, each pushed by slow waves (so it is never quite round) and a soft crown that
  // leans; below the waterline (where it sits) the points flatten and, the more it spreads, run outwards over the card
  function outline(cx, cy, rx, ry, spread, crownAt, t) {
    const pts = [], m = 22, base = cy + ry * BASE;
    for (let k = 0; k < m; k++) {
      const a = (k / m) * Math.PI * 2, s = Math.sin(a);
      const crown = 0.14 * Math.exp(-((a - 1.5 * Math.PI - crownAt) ** 2) / 0.22);
      const w = 1 + 0.035 * Math.sin(3 * a + 1.7 * t) + 0.025 * Math.sin(5 * a - 1.1 * t + 1) + 0.02 * Math.sin(2 * a + 0.6 * t) + crown;
      let x = cx + Math.cos(a) * rx * w;
      if (s > 0.1) x += Math.sign(Math.cos(a)) * spread * rx * 0.72 * ((s - 0.1) / 0.9) ** 2.4;
      pts.push([x, Math.min(cy + s * ry * w, base)]);
    }
    return curve(pts);
  }

  function build(svgBack, svgFront) {
    const q = (s, r) => [...r.querySelectorAll(s)];
    const [body] = q('.dr-body', svgBack), skin = [body, ...q('.dr-skin', svgBack)];
    const [caustic] = q('.dr-caustic', svgBack), [shine] = q('.dr-shine', svgBack), [dot] = q('.dr-dot', svgBack);
    const cheeks = q('.dr-cheek', svgBack), brows = q('.dr-brow', svgBack), [mouth] = q('.dr-mouth', svgBack), [tongue] = q('.dr-tongue', svgBack);
    const eyes = q('.dr-eye', svgBack).map((g) => ({ g, iris: q('.dr-iris', g)[0], glints: q('.dr-glint', g), arc: q('.dr-arc', g)[0] }));
    const contacts = q('.dr-contact', svgFront), [drip] = q('.dr-drip', svgFront), arms = q('.dr-arm', svgFront), hands = q('.dr-hand', svgFront);

    return function draw(r) {
      const { stand: st, sx, sy, lookX: lx, lookY: ly, shake: sh, edge, t } = r;
      const lift = Math.min(0, r.hop) * (0.12 + st);              // a bob when it peeks, a real jump when it stands …
      const splat = Math.max(0, r.hop) * 0.012 * st;              // … and when it lands, it splats
      const spread = st * clamp(1 + lift / 10, 0, 1);             // standing it spreads over the card; in the air it gathers
      const rx = RX * (1 + sx + 0.08 * spread + splat), ry = RY * (1 + sy - 0.14 * spread - splat);
      const cy = CY_PEEK + (edge - ry * BASE - CY_PEEK) * st + lift;
      // the lean: a turn round its bottom when it peeks; standing, a shear, so it stays sitting where it sits
      const L = lean({ x: CX + sh * st, y: cy + ry * BASE }, r.tilt + r.no * 6, st), M = L.attr;
      // the skin: the body, a cool tint at its edge, a shade at the bottom, the light it focuses at the bottom (a caustic),
      // a rim of light along the top, a window of light and a dot on the crown
      const crownAt = clamp(r.sway / 24, -0.5, 0.5);
      const d = outline(CX, cy, rx, ry, spread, crownAt, r.calm ? 0 : t);
      for (const el of skin) { set(el, 'd', d); set(el, 'transform', M); }
      set(caustic, 'transform', `${M} translate(${n(CX + rx * 0.16)} ${n(cy + ry * 0.6)})`);
      set(shine, 'transform', `${M} translate(${n(CX - rx * 0.46)} ${n(cy - ry * 0.4)}) rotate(-40)`);
      set(dot, 'transform', `${M} translate(${n(CX + crownAt * 40 - 6)} ${n(cy - ry * 0.98)})`);
      // the eyes: they look, blink, narrow, widen — or turn into happy arcs
      const open = clamp(1 - r.blink, 0.08, 1) * (1 - clamp(r.lid, 0, 0.95) * 0.75) * (1 + 0.25 * r.wide), joy = clamp(r.joy, 0, 1);
      const at = [-1, 1].map((side) => ({ side, x: CX + side * 24 * (1 + sx) + lx * 9, y: cy - 8 * (1 + sy) + ly * 6 }));
      eyes.forEach((e, i) => {
        set(e.g, 'transform', `${M} translate(${n(at[i].x)} ${n(at[i].y)})`);
        set(e.iris, 'transform', `scale(${n(1 + 0.15 * r.wide)} ${n(Math.max(0.05, open * (1 - joy)))})`);
        set(e.glints[0], 'transform', `translate(${n(2.8 + lx * 1.2)} ${n(-3.6 * open)})`);
        set(e.glints[1], 'transform', `translate(${n(-3 + lx * 1.2)} ${n(4.4 * open)})`);
        e.glints.forEach((g) => fade(g, open * (1 - joy) > 0.35 ? 1 : 0));
        fade(e.arc, joy);
      });
      // the brows: raised (surprise), worried (shy, sad), one up (thinking), low (sleepy)
      brows.forEach((el, i) => {
        const { side, x, y } = at[i], by = y - 18 - r.brow * 5 - (i ? r.quirk * 5 : 0) - r.wide * 2;
        set(el, 'd', `M${n(x + side * 8)} ${n(by + r.knit * 2)} Q${n(x)} ${n(by - 3 - Math.max(0, r.brow))} ${n(x - side * 7)} ${n(by - r.knit * 4)}`);
        set(el, 'transform', M);
      });
      // the cheeks: a blush under each eye, warmer when shy or happy
      const blush = clamp(r.blush, 0, 1);
      cheeks.forEach((el, i) => {
        set(el, 'transform', `${M} translate(${n(CX + at[i].side * 40 * (1 + sx) + lx * 7)} ${n(cy + 9 * (1 + sy) + ly * 4)}) scale(${n(0.75 + 0.4 * blush)})`);
        fade(el, blush);
      });
      // the mouth: a curve that smiles or frowns, opening into an "o" (filled, with a tongue)
      const sm = r.smile, op = clamp(r.open, 0, 1), my = cy + 13 * (1 + sy) + ly * 3, mx = CX + lx * 5, w = 8 - op * 3;
      set(mouth, 'd', `M${n(mx - w)} ${n(my)} Q${n(mx)} ${n(my + sm * 8 + op * 6)} ${n(mx + w)} ${n(my)}` + (op > 0.05 ? ` Q${n(mx)} ${n(my - op * 5)} ${n(mx - w)} ${n(my)}` : ''));
      set(mouth, 'transform', M);
      mouth.style.fillOpacity = clamp((op - 0.15) * 3, 0, 1).toFixed(3);
      set(tongue, 'transform', `${M} translate(${n(mx)} ${n(my + (sm * 8 + op * 6) * 0.3)}) scale(${n(w / 8)} ${n(op)})`);
      fade(tongue, clamp((op - 0.3) * 2.5, 0, 1));
      // the drip: standing, a little of it runs over the card's edge, slowly, and pulls back
      const dl = 3 + 10 * (0.5 - 0.5 * Math.cos(t * 0.8)), dx = CX + sh + 30;
      set(drip, 'd', `M${n(dx - 7)} ${n(edge - 2)}Q${n(dx - 3)} ${n(edge + dl * 0.4)} ${n(dx - 3.6)} ${n(edge + dl)}A4 4 0 1 0 ${n(dx + 3.6)} ${n(edge + dl)}Q${n(dx + 3)} ${n(edge + dl * 0.4)} ${n(dx + 7)} ${n(edge - 2)}Z`);
      fade(drip, clamp(spread * 1.6 - 0.6, 0, 1));
      // the arms and hands: holding the edge (peeking) or resting on the card beside it (standing); over the eyes when
      // shy (one comes down a little to peek); a hand on the chin (peeking: on the head) to think; up in the air for joy
      const c0 = clamp(r.cover, -0.1, 1.15), up = clamp(r.raise, -0.1, 1.1), chin = clamp(r.chin, 0, 1);
      hands.forEach((h, i) => {
        const side = i ? 1 : -1, c = i ? c0 * (1 - 0.55 * clamp(r.peek, 0, 1)) : c0;
        const shoulder = L.at(CX + side * rx * 0.8, cy + 4);
        let p = mix({ x: CX + side * 46 + sh, y: EDGE - 3 + lift * 0.2 }, { x: CX + sh + side * (rx * (1.02 + 0.34 * spread) + 4), y: edge - 9 + lift }, st);
        p = mix(p, L.at(CX + side * 20 + lx * 4, cy - 6), c);
        if (i) p = mix(p, mix(L.at(CX + 46, cy - 34), L.at(CX + 18, cy + 30), st), chin);
        p = mix(p, L.at(CX + side * 84, cy - 40 + Math.sin(t * 9 + i * Math.PI) * 6), up);
        const ang = (Math.atan2(p.y - shoulder.y, p.x - shoulder.x) * 180) / Math.PI;
        set(arms[i], 'd', `M${n(shoulder.x)} ${n(shoulder.y)} Q${n((shoulder.x + p.x) / 2 + side * 6)} ${n((shoulder.y + p.y) / 2 + 4)} ${n(p.x)} ${n(p.y)}`);
        set(h, 'transform', `translate(${n(p.x)} ${n(p.y)}) rotate(${n(ang)}) scale(${n(1 + 0.2 * c)})`);
        // the contact shadow: under the hand on the edge (peeking) or under its base (standing); it fades as they lift
        const onHand = clamp(1 - (EDGE - 3 - p.y) / 14, 0, 1) * (1 - st), onBase = clamp(1 + lift / 24, 0, 1) * st;
        set(contacts[i], 'transform', `translate(${n(p.x + (CX + sh + side * rx * 0.6 - p.x) * st)} ${n(edge + 3)}) scale(${n(1 + 0.6 * spread)} 1)`);
        fade(contacts[i], (onHand + onBase) * 0.9);
      });
      return { eye: L.at(CX, cy - 8), top: L.at(CX + crownAt * 40, cy - ry * 1.12) };
    };
  }

  return { back, front, build, bits: { gravity: 640, drag: 0.6, fade: 1.1, spin: 0 } };
})();
