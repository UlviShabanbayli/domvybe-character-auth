// The cat (clay look): a ginger kitten lit like a film character — a warm key light from the top left, a soft shadow
// underneath, a pink rim of back light along its edge. Fluffy cheeks, big green-gold eyes with lined lids and two
// glints each, brows that do the talking with the ears, a glossy nose, a white muzzle, white paws and bib, a striped
// tail. Peeking, its head and paws come over the card's edge and its tail swishes up behind it; standing, it sits on
// the card, front paws on the edge. It covers its eyes with its paws for your password (one paw slips when you press
// "show"), flattens or perks its ears, puffs its tail when surprised and floats hearts for joy.
characters.cat = (() => {
  const { CX, EDGE, clamp, mix, n, lean, curve, set, fade } = characters;
  const RX = 62, RY = 50, EYE = 13.5;                               // the head's radii; an eye's radius (it is 7 % taller)
  const CY_PEEK = EDGE - 28;                                        // peeking: the head just over the edge
  const BODY = { rx: 48, ry: 40, up: 36 };                          // sitting: the body, and how high its centre is

  const grad = (id, kind, stops, at = '') => `<${kind}Gradient id="${id}" ${at}>${stops.map(([c, o]) => `<stop class="${c}" offset="${o}"/>`).join('')}</${kind}Gradient>`;
  const defs = [
    grad('ct-fur', 'radial', [['ct-f1', 0], ['ct-f2', 0.5], ['ct-f3', 1]], 'cx="36%" cy="26%" r="80%"'),
    grad('ct-white', 'radial', [['ct-w1', 0], ['ct-w2', 0.6], ['ct-w3', 1]], 'cx="40%" cy="30%" r="75%"'),
    grad('ct-shade', 'radial', [['ct-s1', 0], ['ct-s2', 1]], 'cx="50%" cy="100%" r="66%"'),
    grad('ct-rim', 'linear', [['ct-r1', 0.55], ['ct-r2', 1]], 'x1="0" y1="0" x2="1" y2="0"'),
    grad('ct-light', 'radial', [['ct-l1', 0], ['ct-l2', 1]]),
    grad('ct-iris', 'radial', [['ct-i1', 0], ['ct-i2', 0.55], ['ct-i3', 1]], 'cx="50%" cy="66%" r="62%"'),
    grad('ct-nose', 'linear', [['ct-n1', 0], ['ct-n2', 1]], 'x1="0" y1="0" x2="0" y2="1"'),
    grad('ct-ear', 'radial', [['ct-e1', 0], ['ct-e2', 1]], 'cx="50%" cy="80%" r="80%"'),
    grad('ct-contact', 'radial', [['ct-k1', 0], ['ct-k2', 1]]),
  ].join('');

  // the tabby marks: tapered stripes on the forehead (filled), curved ones on the cheeks (lines)
  const brow = 'M-2.6 -48Q0 -49.5 2.6 -48L1.2 -35Q0 -33.5 -1.2 -35ZM-16 -45Q-13 -47.5 -10 -45.5Q-11 -40 -13 -36Q-15.3 -40 -16 -45ZM16 -45Q13 -47.5 10 -45.5Q11 -40 13 -36Q15.3 -40 16 -45Z';
  const cheekLines = 'M-60 -2q7 -1 11 3M-59 7q6 0 10 3M60 -2q-7 -1 -11 3M59 7q-6 0 -10 3';
  const eye = `<g class="ct-eye">
      <ellipse class="ct-socket" rx="${EYE + 1.4}" ry="${(EYE + 1.4) * 1.07}"/><ellipse rx="${EYE}" ry="${EYE * 1.07}" fill="url(#ct-iris)"/>
      <ellipse class="ct-pupil" rx="6.2" ry="8"/><path class="ct-sheen" d="M-9 -7Q0 -13 9 -7Q0 -10 -9 -7Z"/>
      <circle class="ct-glint" r="3.9" cx="4.4" cy="-5"/><circle class="ct-glint" r="1.7" cx="-4.4" cy="5.4"/>
      <g transform="scale(1 1.07)"><path class="ct-lid"/><path class="ct-lash"/></g>
      <path class="ct-liner" d="M-15 -1Q-12 -15 0 -15.6Q12 -15 15 -1Q17 -4 18.5 -4.6"/><path class="ct-arc" d="M-10 3 Q0 -8 10 3"/>
    </g>`;
  const ear = `<g class="ct-ear"><path d="M-21 8Q-15 -30 -3 -38Q9 -31 21 6Z" fill="url(#ct-fur)"/><path d="M-11 3Q-9 -22 -2 -28Q6 -21 11 2Z" fill="url(#ct-ear)"/>
    <path class="ct-fur-line" d="M-6 2l1.5 -14M0 3l1 -15M5 2l-1 -12"/><path class="ct-ear-rim" d="M-3 -38Q9 -31 21 6"/></g>`;
  const haunch = `<g class="ct-haunch"><ellipse rx="22" ry="19" fill="url(#ct-fur)"/><path class="ct-stripe-line" d="M-13 -10q5 3 6 9M-5 -15q5 3 6 9"/></g>`;
  const whiskers = [-1, 1].map((s) => [0, 1, 2].map((k) => `<path class="ct-whisker" d="M0 0q${s * 13} ${-2 + k * 2} ${s * 27} ${(k - 1) * 7}"/>`).join('')).join('');
  const back = `
    <svg class="blob blob-back" viewBox="0 0 300 260" aria-hidden="true">
      <defs>${defs}</defs>
      <ellipse class="ct-seat" rx="60" ry="9" fill="url(#ct-contact)"/>
      <g class="ct-tail"><path class="ct-tail-skin"/><path class="ct-tail-band"/><circle class="ct-tail-tip" r="7.5" fill="url(#ct-white)"/></g>
      <g class="ct-sit">
        <path class="ct-body" fill="url(#ct-fur)"/><path class="ct-body" fill="url(#ct-shade)"/><path class="ct-body ct-rim"/>
        <path class="ct-stripe-line ct-body-lines" d="M-45 -14q8 1 11 7M-47 -2q8 1 10 7M45 -14q-8 1 -11 7M47 -2q-8 1 -10 7"/>
        ${haunch}${haunch}
        <path class="ct-chest" d="M-20 -22Q0 -30 20 -22Q25 -2 16 13Q12 21 7 15Q3 23 -1 16Q-5 22 -10 14Q-16 19 -17 9Q-25 -4 -20 -22Z" fill="url(#ct-white)"/>
        <ellipse class="ct-neck" rx="46" ry="10" fill="url(#ct-shade)"/>
      </g>
      ${ear}${ear}
      <path class="ct-head b-hit" fill="url(#ct-fur)"/><path class="ct-head-layer" fill="url(#ct-shade)"/><path class="ct-head-layer ct-rim"/>
      <ellipse class="ct-light" rx="26" ry="13" fill="url(#ct-light)"/>
      <g class="ct-face">
        <path class="ct-stripes" d="${brow}"/><path class="ct-stripe-line" d="${cheekLines}"/>
        <ellipse class="ct-cheek" rx="10" ry="6"/><ellipse class="ct-cheek" rx="10" ry="6"/>
        <ellipse class="ct-muzzle" rx="13" ry="10" fill="url(#ct-white)"/><ellipse class="ct-muzzle" rx="13" ry="10" fill="url(#ct-white)"/><ellipse class="ct-chin" rx="9" ry="6" fill="url(#ct-white)"/>
        ${eye}${eye}
        <path class="ct-brow"/><path class="ct-brow"/>
        <ellipse class="ct-open" rx="5.5" ry="6"/><ellipse class="ct-tongue" rx="3.6" ry="2.6"/>
        <path class="ct-mouth"/>
        <g class="ct-nose"><path d="M-5.5 -3Q0 -5.5 5.5 -3Q3 3 0 3.6Q-3 3 -5.5 -3Z" fill="url(#ct-nose)"/><ellipse class="ct-nose-hl" cx="-1.6" cy="-2.2" rx="1.8" ry="1"/></g>
        <g class="ct-whiskers">${whiskers}</g>
      </g>
    </svg>`;
  const paw = `<g class="ct-paw"><ellipse rx="13" ry="10.5" fill="url(#ct-white)"/><path class="ct-toes" d="M-5 -2v4M0 -3v5M5 -2v4"/></g>`;
  const front = `
    <svg class="blob blob-front" viewBox="0 0 300 260" aria-hidden="true">
      <ellipse class="ct-contact" rx="20" ry="5" fill="url(#ct-contact)"/><ellipse class="ct-contact" rx="20" ry="5" fill="url(#ct-contact)"/>
      <path class="ct-arm"/><path class="ct-arm"/>${paw}${paw}
      <g class="b-bits">${'<path d="M0 3.5C-7 -1.5 -5 -8 0 -4.5C5 -8 7 -1.5 0 3.5Z"/>'.repeat(8)}</g>
      <g class="b-zz"><text>z</text><text>z</text><text>Z</text></g>
    </svg>`;

  // the head: wider than tall, with fluffy cheeks — three soft tufts low on each side
  function headPath(cx, cy, rx, ry) {
    const pts = [], tuft = (a, at) => Math.exp(-((a - at) ** 2) / 0.006);
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * Math.PI * 2, s = Math.sin(a), b = Math.PI - a;
      const fluff = 1 + 0.06 * (Math.exp(-((a - 0.4) ** 2) / 0.04) + Math.exp(-((b - 0.4) ** 2) / 0.04))
        + 0.05 * [0.16, 0.42, 0.68].reduce((sum, at) => sum + tuft(a, at) + tuft(b, at), 0);
      pts.push([cx + Math.cos(a) * rx * fluff, cy + s * ry * (s > 0 ? 0.94 : 1)]);
    }
    return curve(pts);
  }
  // the sitting body: round, its bottom flat on the card
  function seatPath(cx, cy, rx, ry, floor) {
    const pts = [];
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; pts.push([cx + Math.cos(a) * rx, Math.min(cy + Math.sin(a) * ry, floor)]); }
    return curve(pts);
  }
  // an eyelid (fur) down to a share of the eye (0 … 1): the cap of the circle above that line
  function cap(k) {
    const y = clamp(k, 0, 0.995) * 2 * EYE - EYE, x = Math.sqrt(Math.max(0, EYE * EYE - y * y));
    const R = EYE + 2.2, X = Math.sqrt(Math.max(0, R * R - y * y));   // a little wider than the eye: it covers the dark rim too
    return { lid: `M${n(-X)} ${n(y)}A${n(R)} ${n(R)} 0 ${y > 0 ? 1 : 0} 1 ${n(X)} ${n(y)}Z`, lash: `M${n(-x)} ${n(y)}L${n(x)} ${n(y)}` };
  }

  function build(svgBack, svgFront) {
    const q = (s, r) => [...r.querySelectorAll(s)], one = (s, r) => r.querySelector(s);
    const head = [one('.ct-head', svgBack), ...q('.ct-head-layer', svgBack)], light = one('.ct-light', svgBack), face = one('.ct-face', svgBack), ears = q('.ct-ear', svgBack);
    const sit = one('.ct-sit', svgBack), body = q('.ct-body', svgBack), bodyLines = one('.ct-body-lines', svgBack), haunches = q('.ct-haunch', svgBack);
    const chest = one('.ct-chest', svgBack), neck = one('.ct-neck', svgBack), seat = one('.ct-seat', svgBack);
    const tail = [one('.ct-tail-skin', svgBack), one('.ct-tail-band', svgBack)], tailTip = one('.ct-tail-tip', svgBack);
    const eyes = q('.ct-eye', svgBack).map((g) => ({ g, pupil: one('.ct-pupil', g), liner: one('.ct-liner', g), lid: one('.ct-lid', g), lash: one('.ct-lash', g), arc: one('.ct-arc', g) }));
    const brows = q('.ct-brow', svgBack), cheeks = q('.ct-cheek', svgBack), muzzles = q('.ct-muzzle', svgBack), chinEl = one('.ct-chin', svgBack);
    const nose = one('.ct-nose', svgBack), mouth = one('.ct-mouth', svgBack), openEl = one('.ct-open', svgBack), tongue = one('.ct-tongue', svgBack), whiskers = q('.ct-whisker', svgBack);
    const contacts = q('.ct-contact', svgFront), arms = q('.ct-arm', svgFront), paws = q('.ct-paw', svgFront);
    muzzles.forEach((el, i) => set(el, 'transform', `translate(${i ? 10 : -10} 16)`));
    set(chinEl, 'transform', 'translate(0 24)');
    set(nose, 'transform', 'translate(0 9)');

    return function draw(r) {
      const { stand: st, sx, sy, lookX: lx, lookY: ly, shake: sh, edge, t } = r;
      const lift = Math.min(0, r.hop) * (0.12 + st), joy = clamp(r.joy, 0, 1), wide = clamp(r.wide, 0, 1);
      const rx = RX * (1 + sx), ry = RY * (1 + sy);
      const seatY = edge - BODY.up + lift;                          // the body's centre when it sits
      const cy = CY_PEEK + (seatY - BODY.ry - ry * 0.5 - CY_PEEK) * st + lift * (1 - st) + r.zz * 6;
      const L = lean({ x: CX + sh * st, y: cy + ry + (edge + lift - cy - ry) * st }, r.tilt + r.no * 6), M = L.attr;
      // the tail: from behind the card (peeking) or from its seat (standing), swishing; puffed when surprised
      const swish = (r.calm ? 0 : Math.sin(t * 1.7)) * 14 + r.sway * 1.2;
      const base = mix({ x: CX + 64, y: EDGE + 24 }, { x: CX + BODY.rx * 0.7, y: edge - 8 + lift }, st);
      const tip = mix({ x: CX + 94 + swish, y: EDGE - 48 }, { x: CX + 86 + swish, y: edge - 64 + lift }, st);
      const td = `M${n(base.x)} ${n(base.y)}C${n(base.x + 34)} ${n(base.y - 4)} ${n(tip.x + 4 - swish * 0.4)} ${n(tip.y + 30)} ${n(tip.x)} ${n(tip.y)}`;
      for (const el of tail) { set(el, 'd', td); el.style.strokeWidth = n(14 + 9 * wide); }
      set(tailTip, 'transform', `translate(${n(tip.x)} ${n(tip.y)}) scale(${n(1 + 0.6 * wide)})`);
      // the body it sits on (standing only): haunches, bib, the head's shadow on it, a soft shadow on the card
      const sitting = clamp(st * 2 - 1, 0, 1), bx = CX + sh * st;
      fade(sit, sitting);
      const bd = seatPath(bx, seatY, BODY.rx * (1 + sx * 0.5), BODY.ry, edge + lift);
      for (const el of body) set(el, 'd', bd);
      set(bodyLines, 'transform', `translate(${n(bx)} ${n(seatY)})`);
      haunches.forEach((el, i) => set(el, 'transform', `translate(${n(bx + (i ? 34 : -34))} ${n(edge - 18 + lift)}) scale(${i ? -1 : 1} 1)`));
      set(chest, 'transform', `translate(${n(bx)} ${n(seatY - 4)})`);
      set(neck, 'transform', `translate(${n(bx)} ${n(cy + ry * 0.86)})`);
      set(seat, 'transform', `translate(${n(bx)} ${n(edge)}) scale(${n(clamp(1 + lift / 40, 0.5, 1))})`);
      fade(seat, sitting * 0.8);
      // the ears: perked (brow up), flat (worried), one cocked (thinking), drooping (asleep); they trail a turn
      ears.forEach((el, i) => {
        const side = i ? 1 : -1;
        const ang = side * (10 - 8 * r.brow + 48 * r.knit + 30 * clamp(r.zz, 0, 1)) + r.sway * 0.7 + (i ? r.quirk * 16 : 0);
        set(el, 'transform', `${M} translate(${n(CX + side * rx * 0.58)} ${n(cy - ry * 0.64)}) rotate(${n(ang)}) scale(${side * (1 + 0.1 * wide)} ${n(1 + 0.1 * wide)})`);
      });
      // the head: fur, a shade underneath, the rim of back light, a soft key light on the forehead
      const hd = headPath(CX, cy, rx, ry);
      for (const el of head) { set(el, 'd', hd); set(el, 'transform', M); }
      set(light, 'transform', `${M} translate(${n(CX - rx * 0.3)} ${n(cy - ry * 0.58)}) rotate(-12)`);
      set(face, 'transform', `${M} translate(${n(CX + lx * 5)} ${n(cy + ly * 4)})`);
      // the eyes (the face's own coordinates from here): the pupils look and widen; fur lids close to blink or sleep;
      // joy closes them over happy arcs
      const shut = Math.max(r.blink, clamp(r.lid, 0, 1) * 0.7), lids = cap(Math.max(shut, joy));
      eyes.forEach((e, i) => {
        set(e.g, 'transform', `translate(${n((i ? 23 : -23) * (1 + sx) + lx * 2)} ${n(-4 + ly * 2)}) scale(${n(1 + 0.1 * wide)})`);
        set(e.pupil, 'transform', `translate(${n(lx * 3.5)} ${n(ly * 3)}) scale(${n(1 - 0.3 * wide)})`);
        set(e.lid, 'd', lids.lid); set(e.lash, 'd', lids.lash);
        fade(e.lash, shut * (1 - joy) > 0.04 ? 1 : 0);
        fade(e.liner, clamp(1 - Math.max(shut, joy) * 2, 0, 1));    // the lid line takes over from the liner as it closes
        fade(e.arc, joy);
      });
      brows.forEach((el, i) => {                                   // soft brows of darker fur
        const side = i ? 1 : -1, x = side * 23, by = -24 - r.brow * 4 - (i ? r.quirk * 5 : 0);
        set(el, 'd', `M${n(x - side * 9)} ${n(by + 2 - r.knit * 5)}Q${n(x)} ${n(by - 4 - Math.max(0, r.brow) * 2)} ${n(x + side * 10)} ${n(by + 1 + r.knit * 3)}`);
      });
      const blush = clamp(r.blush, 0, 1);
      cheeks.forEach((el, i) => { set(el, 'transform', `translate(${i ? 40 : -40} 10) scale(${n(0.75 + 0.4 * blush)})`); fade(el, blush); });
      // the mouth: a "w" under the nose that smiles or droops; it opens into a little "o" with a tongue
      const sm = r.smile, op = clamp(r.open, 0, 1);
      set(mouth, 'd', `M-9 ${n(15 - sm * 1.5)}Q-4.5 ${n(15 + sm * 5)} 0 ${n(13)}Q4.5 ${n(15 + sm * 5)} 9 ${n(15 - sm * 1.5)}M0 10.5V13`);
      set(openEl, 'transform', `translate(0 ${n(19 + op * 2)}) scale(1 ${n(op)})`);
      fade(openEl, clamp(op * 4 - 0.4, 0, 1));
      set(tongue, 'transform', `translate(0 ${n(21 + op * 3.5)}) scale(${n(op)})`);
      fade(tongue, clamp((op - 0.3) * 2.5, 0, 1));
      whiskers.forEach((el, k) => {
        const side = k < 3 ? -1 : 1, w = (r.calm ? 0 : Math.sin(t * 3 + k)) * 2 + side * r.smile * 4;
        set(el, 'transform', `translate(${n(side * 20)} 15) rotate(${n(w)})`);
      });
      // the paws: on the card's edge; over the eyes for the password (one slips to peek); one to the cheek to think;
      // up in the air for joy. Standing, they are the front legs, from the shoulders down to the edge.
      const c0 = clamp(r.cover, -0.1, 1.15), up = clamp(r.raise, -0.1, 1.1), chin = clamp(r.chin, 0, 1);
      paws.forEach((pEl, i) => {
        const side = i ? 1 : -1, c = i ? c0 * (1 - 0.55 * clamp(r.peek, 0, 1)) : c0;
        const shoulder = mix({ x: CX + side * 36 + sh, y: EDGE + 6 }, { x: CX + sh + side * 24, y: seatY - 20 }, st);
        let p = mix({ x: CX + side * 42 + sh, y: EDGE - 4 + lift * 0.2 }, { x: CX + sh + side * 20, y: edge - 7 + lift }, st);
        p = mix(p, L.at(CX + side * 22 + lx * 4, cy - 4), c);
        if (i) p = mix(p, mix(L.at(CX + 36, cy + 8), L.at(CX + 14, cy + 32), st), chin);
        p = mix(p, L.at(CX + side * 78, cy - 42 + Math.sin(t * 9 + i * Math.PI) * 6), up);
        set(arms[i], 'd', `M${n(shoulder.x)} ${n(shoulder.y)}Q${n((shoulder.x + p.x) / 2 + side * 5)} ${n((shoulder.y + p.y) / 2)} ${n(p.x)} ${n(p.y)}`);
        set(pEl, 'transform', `translate(${n(p.x)} ${n(p.y)}) rotate(${n(side * 8 * (1 - c))}) scale(${n(1 + 0.12 * c)})`);
        const onEdge = clamp(1 - Math.abs(edge - 4 - p.y) / 12, 0, 1);
        set(contacts[i], 'transform', `translate(${n(p.x)} ${n(edge + 3)}) scale(${n(0.8 - 0.2 * st)} 1)`);
        fade(contacts[i], onEdge * 0.9);
      });
      return { eye: L.at(CX, cy - 4), top: L.at(CX, cy - ry) };
    };
  }

  return { back, front, build, bits: { gravity: -140, drag: 2.2, fade: 0.9, spin: 0 } };
})();
