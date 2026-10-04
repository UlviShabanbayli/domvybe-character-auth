// Liquid auth — one card for the whole sign-in flow, watched over by a character (the look's own: a drop of liquid, an
// owl, a cat — character-*.js) that peeks over the card's edge, or stands on it when there is room. It follows the
// letters as you type your email, hides its eyes when you type a password (and peeks when you press "show"), shakes
// its head at a mistake, gets surprised when you switch tabs, thinks while the form "sends", watches each code box
// fill, jumps for joy at the end — and dozes off if you leave it alone.
// The card's glass (the drop) springs to the size of whatever it holds. Switch from "Sign in" to "Create account" and
// the name field and a password-strength meter flow into the card while a lens slides across the tabs. Submit and the
// button shrinks into a liquid spinner, then the card reshapes into the code step: six boxes, digits that roll in, a
// lens that marks the next box. A wrong code shakes the card; the right one folds it into a drop, draws a tick, and the
// card opens again on "You're in". Nothing is sent anywhere: the checks run in the page, the code is a demo code.
// Real component: a <form> with labelled inputs and autocomplete (email, current/new password, one-time-code), tabs
// with roving focus and the arrow keys, each field checked as you go (a tick when it is right; a mark, a shake and a
// line under it when it is not, announced politely and with aria-invalid), a show-password toggle,
// paste into the code, Escape/Back, and prefers-reduced-motion (no morphs, short fades).
//
// The six stages of the tutorial:
//   1. the frame, the card's glass (the drop) and the lens     4. submitting: validation, the spinner, the steps
//   2. the form: tabs and fields that flow in and out          5. the code step: boxes, rolling digits, the lens
//   3. the springs that make it liquid                         6. the character, the done step and the loop

// ================================================================================================================
// STAGE 1 · the frame, the card's glass (the drop) and the lens
// ================================================================================================================
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const noteEl = $('.note'), auth = $('.auth'), dropEl = $('.drop'), sheen = $('.d-sheen'), ringEl = $('.d-ring'), checkEl = $('.check');
const form = $('#v-form'), codeView = $('#v-code'), doneView = $('#v-done');

// fit the 432 × 768 composition to the screen (?full=1: no frame, the page is the screen)
function fit() { html.style.setProperty('--k', 'full' in html.dataset ? '1' : Math.min(innerWidth / 432, innerHeight / 768).toFixed(4)); }
fit();
addEventListener('resize', fit);
$('meta[name="theme-color"]').content = getComputedStyle(html).getPropertyValue('--page').trim();

// the studio clock: ambient life reads time from here, so a capture tool can pause or drive it
const studio = (window.__studio = window.__studio || {});
if (!studio.now) studio.now = () => performance.now();

// With reduced motion every spring is critically damped: things still arrive, they just don't bounce.
const spring = (stiffness, damping) => ({ stiffness, damping: calm ? 2 * Math.sqrt(stiffness) : damping });
const critical = (stiffness) => ({ stiffness, damping: 2 * Math.sqrt(stiffness) });
const snap = (s) => { s.value = s.target; s.velocity = 0; };

// rendering helpers: write a style only when it changed; promote a layer only while it moves
const cache = new WeakMap(), promoted = new WeakMap();
function put(el, prop, v) {
  let c = cache.get(el);
  if (!c) cache.set(el, (c = {}));
  if (c[prop] !== v) { c[prop] = v; el.style[prop] = v; }
}
function promote(el, on) { if (promoted.get(el) !== on) { promoted.set(el, on); el.style.willChange = on ? 'transform, opacity' : ''; } }
const px = (v) => `${v.toFixed(2)}px`;

// the card follows its container: its width is measured, never assumed (a ResizeObserver keeps it, see the end)
let cardW = auth.offsetWidth;

// an element's box inside the card, in CSS px (offsets ignore transforms, so motion never feeds back into it)
function boxOf(el) {
  let x = 0, y = 0;
  for (let n = el; n && n !== auth; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// A drop: a box whose four edges are springs. When it reshapes, the edge that travels furthest leads with a jelly
// bounce and the others follow, so it pours rather than scales.
class Drop {
  constructor() { [this.l, this.r, this.t, this.b] = [0, 0, 0, 0].map(() => new Spring(0)); }
  to({ x, y, w, h }, lead = spring(300, 17), trail = spring(240, 24)) {
    const pair = (a, b, va, vb) => {
      const da = Math.abs(va - a.target), db = Math.abs(vb - b.target);
      a.set(da >= db ? lead : trail); b.set(db >= da ? lead : trail);
      a.target = va; b.target = vb;
    };
    pair(this.l, this.r, x, x + w);
    pair(this.t, this.b, y, y + h);
  }
  place(box) { this.to(box); this.springs().forEach(snap); }
  springs() { return [this.l, this.r, this.t, this.b]; }
  get box() { return { x: this.l.value, y: this.t.value, w: this.r.value - this.l.value, h: this.b.value - this.t.value }; }
}
// A lens: a small drop that follows its target. The edge in front leads and the one behind lags, so it stretches
// while it travels — and keeps its volume: the longer it gets, the thinner.
class Lens extends Drop {
  constructor(el) { super(); this.el = el; this.o = new Spring(0, spring(320, 28)); this.rest = { w: 1, h: 1 }; }
  to({ x, y, w, h }) {
    const lead = spring(620, 30), trail = spring(210, 17);
    if (this.o.value < 0.02) this.place({ x, y, w, h });
    const dx = x - this.l.target, dy = y - this.t.target;
    if (Math.abs(dx) > 0.5) { (dx > 0 ? this.r : this.l).set(lead); (dx > 0 ? this.l : this.r).set(trail); }
    if (Math.abs(dy) > 0.5) { (dy > 0 ? this.b : this.t).set(lead); (dy > 0 ? this.t : this.b).set(trail); }
    this.l.target = x; this.r.target = x + w; this.t.target = y; this.b.target = y + h;
    this.rest = { w, h };
    this.o.target = 1;
  }
  place(box) { [[this.l, box.x], [this.r, box.x + box.w], [this.t, box.y], [this.b, box.y + box.h]].forEach(([s, v]) => { s.value = s.target = v; s.velocity = 0; }); this.rest = { w: box.w, h: box.h }; }
  hide() { this.o.target = 0; }
  springs() { return [...super.springs(), this.o]; }
  render(origin = { x: 0, y: 0 }) {
    const { x, y, w, h } = this.box;
    const sw = w / Math.sqrt(Math.max(1, h / this.rest.h)), sh = h / Math.sqrt(Math.max(1, w / this.rest.w));   // keep the volume
    promote(this.el, !this.springs().every((s) => s.resting(0.01)));
    put(this.el, 'opacity', clamp(this.o.value, 0, 1).toFixed(3));
    put(this.el, 'transform', `translate(${px(x - origin.x + (w - sw) / 2)}, ${px(y - origin.y + (h - sh) / 2)})`);
    put(this.el, 'width', px(Math.max(0, sw))); put(this.el, 'height', px(Math.max(0, sh)));
  }
}

// ================================================================================================================
// STAGE 2 · the form: tabs and fields that flow in and out
// ================================================================================================================
const tabs = { in: $('#tab-in'), up: $('#tab-up') };
const segLens = new Lens($('.seg-lens'));
const inputs = { name: $('#name'), email: $('#email'), pass: $('#pass') };
const eye = $('.eye'), go = $('.go', form), spinEl = $('.spin', form);
const meterFill = $('.meter-fill'), meterLabel = $('.meter-label');
const goLabels = [$('.gl-a'), $('.gl-b')];
let mode = 'in';                                                   // 'in' sign in · 'up' create account

// every field that only one tab has: its height springs between 0 and its own, so the card grows around it
const flows = $$('.field[data-only]', form).map((el) => ({ el, only: el.dataset.only, inner: $('.field-in', el), h: new Spring(0, spring(320, 26)) }));

function setMode(next, { focus = false } = {}) {
  if (next === mode) return;
  const dir = next === 'up' ? 1 : -1;
  mode = next;
  for (const [k, t] of Object.entries(tabs)) {
    t.setAttribute('aria-selected', String(k === mode));
    t.tabIndex = k === mode ? 0 : -1;
  }
  if (focus) tabs[mode].focus();
  for (const f of flows) {
    const on = f.only === mode;
    f.h.target = on ? f.inner.offsetHeight : 0;
    $$('input, a, button', f.el).forEach((el) => { el.tabIndex = on ? 0 : -1; });
    f.el.toggleAttribute('inert', !on);
  }
  inputs.pass.autocomplete = mode === 'up' ? 'new-password' : 'current-password';
  topCta.textContent = mode === 'up' ? 'Sign in' : 'Create account';
  rollLabel(mode === 'up' ? 'Create account' : 'Sign in', dir);
  clearErrors();
  aimSegLens();
  react('surprised');
  wake();
}
Object.entries(tabs).forEach(([k, t]) => {
  t.addEventListener('click', () => setMode(k));
  t.addEventListener('keydown', (e) => {                           // the arrow keys move between the two tabs
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    setMode(e.key === 'ArrowLeft' || e.key === 'Home' ? 'in' : 'up', { focus: true });
  });
});
function aimSegLens() { const b = boxOf(tabs[mode]); segLens.to(b); }

// the page's top bar (?full=1) offers the other tab
const topCta = $('.top-cta');
topCta.addEventListener('click', () => { if (current === views[0]) setMode(mode === 'up' ? 'in' : 'up', { focus: true }); });

// show / hide the password: the eye's slash draws itself (CSS)
eye.addEventListener('click', () => {
  const show = inputs.pass.type === 'password';
  inputs.pass.type = show ? 'text' : 'password';
  eye.setAttribute('aria-pressed', String(show));
  eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

// the strength meter (create account only): a liquid bar that fills with the score
const STRENGTH = ['Use 8+ characters', 'Weak', 'Okay', 'Good', 'Strong'];
const meter = new Spring(0, spring(260, 20));
function score(p) {
  if (p.length < 8) return 0;
  return clamp(1 + (/[a-z]/.test(p) && /[A-Z]/.test(p)) + /\d/.test(p) + /[^\w\s]/.test(p) + (p.length >= 12) - 1, 1, 4);
}
inputs.pass.addEventListener('input', () => {
  const s = score(inputs.pass.value);
  meter.target = s / 4;
  meterLabel.textContent = STRENGTH[s];
  meterFill.dataset.s = s;
  wake();
});

// checking as you go. Each field says what is wrong right under itself: after you leave it, and then live while you fix
// it; it shakes when it turns wrong and draws a tick when it turns right (the tick shows as soon as you type something
// right). Submitting checks every field at once, empty ones too.
const RULES = {
  name: (v) => (v.trim().length >= 2 ? '' : 'At least 2 letters, please.'),
  email: (v) => {
    v = v.trim();
    if (/\s/.test(v)) return 'An email has no spaces.';
    if (!v.includes('@')) return 'Add an @, like you@example.com.';
    const [user, domain] = [v.slice(0, v.indexOf('@')), v.slice(v.indexOf('@') + 1)];
    if (!user) return 'Add your name before the @.';
    if (!domain || domain.includes('@')) return 'Add where your email lives, after the @.';
    if (!/^[^.]+(\.[^.]+)*\.[a-z]{2,}$/i.test(domain)) return 'Add the ending, like .com.';
    return '';
  },
  pass: (v) => { const left = 8 - v.length; return left > 0 ? `${left} more character${left === 1 ? '' : 's'}.` : ''; },
};
const EMPTY = { name: 'Tell us your name.', email: 'Enter your email.', pass: 'Enter your password.' };
const checks = Object.entries(inputs).map(([key, input]) => {
  const field = input.closest('.field');
  return {
    key, input, field, inner: $('.field-in', field), mark: $('.mark', field), tick: $('.mark-ok', field),
    msg: $('.msg', field), msgIn: $('.msg-in', field), text: $('.msg-text', field), state: 'idle', touched: false,
    h: new Spring(0, spring(320, 26)), pop: new Spring(0, spring(420, 18)), draw: new Spring(0, critical(90)), shake: new Spring(0, spring(900, 14)),
  };
});
function setCheck(c, state, message = '') {
  const was = c.state;
  c.state = state;
  c.field.dataset.state = state;
  if (state === 'bad') { c.input.setAttribute('aria-invalid', 'true'); if (c.text.textContent !== message) c.text.textContent = message; }
  else c.input.removeAttribute('aria-invalid');
  c.h.target = state === 'bad' ? 1 : 0;
  c.pop.target = state === 'idle' ? 0 : 1;
  c.draw.target = state === 'ok' ? 1 : 0;
  const covering = c.key === 'pass' && document.activeElement === inputs.pass;   // it keeps its eyes covered for the password
  if (state === 'ok' && was !== 'ok') { c.draw.value = 0; if (!calm) c.pop.velocity += 6; if (!covering) react('yes', 0.7); }
  if (state === 'bad' && was !== 'bad') { if (!calm) { c.shake.velocity += 260; c.pop.velocity += 6; } if (!covering) react('sad', 0.9); }
  wake();
}
// what a field says now: quiet until there is something to say (an empty field, or a wrong one you haven't left yet)
function recheck(c, { loud = false } = {}) {
  const v = c.input.value, problem = v ? RULES[c.key](v) : loud ? EMPTY[c.key] : '';
  if (!problem) setCheck(c, v ? 'ok' : 'idle');
  else if (loud || c.touched || c.state === 'bad') setCheck(c, 'bad', problem);
  else setCheck(c, 'idle');
  return !problem;
}
for (const c of checks) {
  c.input.addEventListener('input', () => recheck(c));
  c.input.addEventListener('blur', () => { if (c.input.value) { c.touched = true; recheck(c); } });
}

// ================================================================================================================
// STAGE 3 · the springs that make it liquid
// ================================================================================================================
const drop = new Drop();
const R = new Spring(28, spring(260, 20));                         // the corner radius: the card's, or a full circle when it folds
const RADIUS = parseFloat(getComputedStyle(html).getPropertyValue('--card-r')) || 28;
const shake = new Spring(0, spring(900, 14)), bump = new Spring(0, spring(320, 12));
const goW = new Spring(1, spring(320, 22));                        // the button: 1 full width … 0 a circle (the spinner)
const roll = new Spring(0, spring(420, 30));                       // the button label's roll
const check = new Spring(0, spring(160, 22)), ring = new Spring(0, critical(40));
const spotX = new Spring(cardW / 2, spring(170, 20)), spotY = new Spring(0, spring(170, 20));

let clock = 0;
const queue = [];
const later = (s, fn) => queue.push({ at: clock + s, fn });

// the views (steps) slide inside the drop: blocks of the leaving one go out the way you go, the new ones follow in
const SLIDE = 36, STAGGER = 0.05;
const views = [form, codeView, doneView].map((el) => ({ el, blocks: [...el.children].map((b) => ({ el: b, e: new Spring(1, spring(320, 24)) })), side: 0 }));
let current = views[0];
function show(view, dir) {
  if (view === current) return;
  const old = current;
  old.side = -dir;
  old.el.classList.add('is-out');
  old.blocks.forEach((b) => { b.e.set(critical(700)); b.e.target = 0; if (calm) b.e.value = 0; });
  old.el.inert = true;
  current = view;
  view.el.hidden = false; view.el.inert = false; view.el.classList.remove('is-out');
  view.side = dir;
  view.blocks.forEach((b, k) => {
    b.e.set(spring(320, 24)); b.e.value = calm ? 1 : 0; b.e.velocity = 0; b.e.target = calm ? 1 : 0;
    if (!calm) later(0.06 + k * STAGGER, () => { b.e.target = 1; });
  });
  sweep(dir);
  wake();
}
function retire(view) { if (view !== current && view.blocks.every((b) => b.e.value < 0.01)) { view.el.hidden = true; view.el.classList.remove('is-out'); } }

// the button label rolls up when the tab changes
let labelNext = 'Sign in', rollDir = 1;
function rollLabel(text, dir) {
  if (roll.target === 1) finishRoll();
  labelNext = text; rollDir = dir; goLabels[1].textContent = text;
  if (calm) { finishRoll(); return; }
  roll.value = 0; roll.velocity = 0; roll.target = 1;
}
function finishRoll() { goLabels[0].textContent = labelNext; goLabels[1].textContent = ''; roll.value = 0; roll.velocity = 0; roll.target = 0; }

// ================================================================================================================
// STAGE 4 · submitting: validation, the spinner, the steps
// ================================================================================================================
let busy = false;
function clearErrors() { for (const c of checks) { c.touched = false; setCheck(c, c.input.value && !RULES[c.key](c.input.value) ? 'ok' : 'idle'); } }
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (busy) return;
  const shown = checks.filter((c) => c.key !== 'name' || mode === 'up');
  const wrong = shown.filter((c) => !(c.input.value && !RULES[c.key](c.input.value)));
  if (wrong.length) {                                              // every wrong field speaks at once; the first one gets the focus
    wrong[0].input.focus();
    for (const c of shown) recheck(c, { loud: true });
    return;
  }
  const { email } = inputs;
  busy = true;
  go.setAttribute('aria-busy', 'true');
  goW.target = 0;                                                  // the button shrinks into a spinner …
  setMood('think');
  $$('.to').forEach((b) => { b.textContent = email.value.trim(); });
  later(calm ? 0.2 : 1.1, () => {                                  // … "sending" (simulated), then the code step
    busy = false; go.removeAttribute('aria-busy'); goW.target = 1;
    openCode();
  });
  wake();
});

// ================================================================================================================
// STAGE 5 · the code step: boxes, rolling digits, the lens
// ================================================================================================================
const DEMO_CODE = '246810';
const otp = $('#otp'), codeErr = $('#code-err'), boxes = $$('.box', codeView).map((el) => ({ el, b: $('b', el), e: new Spring(0, spring(420, 22)) }));
const otpLens = new Lens($('.otp-lens')), otpWrap = $('.otp');
const resendBtn = $('.resend .link'), timerEl = $('.resend .timer');
let resendAt = 0, checking = false;

function openCode() {
  show(views[1], 1);
  otp.value = ''; codeErr.textContent = ''; typed('');
  resendAt = clock + 30;
  setMood('code');
  later(0.25, () => otp.focus({ preventScroll: true }));
}
function typed(v) {
  boxes.forEach((bx, i) => {
    const d = v[i] || '';
    if (d && bx.b.textContent !== d) { bx.b.textContent = d; bx.e.value = calm ? 1 : 0; bx.e.target = 1; }   // a new digit rolls in
    if (!d && bx.b.textContent) { bx.e.target = 0; later(0.15, () => { if (!otp.value[i]) bx.b.textContent = ''; }); }
  });
  aimOtpLens();
  lastInput = clock;
  wake();
}
function aimOtpLens() {
  const i = Math.min(otp.value.length, 5), b = boxOf(boxes[i].el);
  otpLens.to(b);
}
otp.addEventListener('input', () => {
  otp.value = otp.value.replace(/\D/g, '').slice(0, 6);
  codeErr.textContent = '';
  typed(otp.value);
  if (otp.value.length === 6 && !checking) { checking = true; later(0.3, verify); }
});
function verify() {
  checking = false;
  if (otp.value === DEMO_CODE) return success();
  codeErr.textContent = `That code didn’t match. Try ${DEMO_CODE}.`;
  if (!calm) shake.velocity += 300;
  react('sad');
  later(0.45, () => { otp.value = ''; typed(''); otp.focus({ preventScroll: true }); });
  wake();
}
$('.back', codeView).addEventListener('click', () => { show(views[0], -1); setMood('idle'); later(0.2, () => inputs.email.focus()); });
codeView.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('.back', codeView).click(); });
resendBtn.addEventListener('click', () => { resendAt = clock + 30; codeErr.textContent = 'A new code is on its way (demo: same code).'; sweep(1); otp.focus(); });

// ================================================================================================================
// STAGE 6 · done: the fold, the tick, the word, the loop
// ================================================================================================================
let folded = false;
function success() {
  folded = true;                                                   // the card folds into a drop …
  views[1].blocks.forEach((b) => { b.e.set(critical(700)); b.e.target = 0; });
  views[1].el.inert = true;
  later(calm ? 0 : 0.42, () => { check.target = 1; ring.value = 0; ring.target = 1; bump.velocity += 5; burst(8); });   // … a tick, a ring, a splash
  later(calm ? 0.1 : 1.15, () => {                                  // … and it opens on "You're in"
    folded = false; check.target = 0;
    views[1].side = 0; current = views[1];
    show(views[2], 1);
    later(0.3, () => $('.go-again').focus({ preventScroll: true }));
  });
  setMood('joy');
  wake();
}
$('.go-again').addEventListener('click', () => {
  Object.values(inputs).forEach((i) => { i.value = ''; });
  inputs.pass.dispatchEvent(new Event('input'));
  clearErrors();
  show(views[0], -1);
  setMode('in');
  setMood('idle');
  later(0.2, () => inputs.email.focus());
});

// ---- the sheen: a band of light that crosses the card when the step changes ----
let sheenAge = 9, sheenDir = 1;
function sweep(dir) { if (!calm) { sheenAge = 0; sheenDir = dir || 1; } }

// ---- the character: it watches the card. Each look has its own (character-*.js: the drop, the owl, the cat) and the same
// moods drive them all: every feature is a spring, a mood sets their targets. It sits in a 300 × 260 box centred over
// the card, whose top edge is at y 190; on a narrow card it peeks over the edge, on a wide one (the container decides:
// --pose) it stands on it. Where it looks is measured on screen, so it holds at any size.
const cardSide = $('.card-side');
const character = characters[{ glass: 'drop', nordic: 'owl', clay: 'cat' }[html.dataset.look]];
cardSide.insertAdjacentHTML('afterbegin', character.back);
auth.insertAdjacentHTML('afterend', character.front);
const blobBack = $('.blob-back', cardSide), blobFront = $('.blob-front', cardSide);
const draw = character.build(blobBack, blobFront);
const B = {
  stand: new Spring(0, spring(140, 15)),                                          // 0 peeking over the edge … 1 standing on it
  lookX: new Spring(0, spring(150, 16)), lookY: new Spring(0, spring(150, 16)),   // where it looks (-1 … 1)
  sx: new Spring(0, spring(280, 9)), sy: new Spring(0, spring(280, 9)),           // squash and stretch: jelly
  hop: new Spring(0, spring(240, 13)), tilt: new Spring(0, spring(180, 13)),      // a jump, a lean
  sway: new Spring(0, spring(160, 13)),                                           // what trails a turn (a crown, tufts, a tail)
  cover: new Spring(0, spring(240, 18)), peek: new Spring(0, spring(240, 18)),    // not looking (eyes covered); peeking anyway
  raise: new Spring(0, spring(200, 14)), chin: new Spring(0, spring(200, 16)),    // up in the air; a hand on the chin
  smile: new Spring(0.35, spring(200, 18)), open: new Spring(0, spring(300, 18)), // the mouth: a curve and an "o"
  lid: new Spring(0, spring(200, 20)), wide: new Spring(0, spring(260, 16)),      // eyelids half down; eyes wide
  joy: new Spring(0, spring(220, 20)), no: new Spring(0, spring(420, 9)),         // happy ^ ^ eyes; shaking the head "no"
  brow: new Spring(0, spring(260, 15)), knit: new Spring(0, spring(260, 18)),     // the brows: raised; worried (inner ends up)
  quirk: new Spring(0, spring(220, 15)), blush: new Spring(0.35, spring(120, 16)),// one brow up; the cheeks
  zz: new Spring(0, critical(30)),                                                // asleep
};
let mood = 'idle', moodUntil = 0, lastInput = 0, blinkAt = 2.4, blink = 0, ptr = null, petting = false;
let pose = { eye: { x: 150, y: 160 }, top: { x: 150, y: 100 } };   // where its eyes and the top of its head are (box px)
const charW = (() => { const c = document.createElement('canvas').getContext('2d'); return (text, el) => { const cs = getComputedStyle(el); c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; return c.measureText(text).width; }; })();

// the pose comes from the container (CSS --pose on the card side): it climbs up or sinks back when that changes
function readPose(instant) {
  B.stand.target = getComputedStyle(cardSide).getPropertyValue('--pose').trim() === 'stand' ? 1 : 0;
  if (instant) snap(B.stand);
  wake();
}

function setMood(m) { mood = m; moodUntil = 0; lastInput = clock; wake(); }
// a short reaction, then back to what the page asks for (the field in focus, the step)
function react(m, seconds = 1.1) {
  mood = m; moodUntil = clock + seconds; lastInput = clock;
  if (m === 'sad' && !calm) B.no.velocity += 34;
  if (m === 'surprised' && !calm) { B.hop.velocity -= 140; B.sy.velocity += 3; }
  if (m === 'yes' && !calm) { B.hop.velocity -= 80; B.sy.velocity -= 1.5; }   // a happy little nod
  wake();
}
function moodFromFocus() {
  const a = document.activeElement;
  if (folded || current === views[2]) return 'joy';
  if (a === inputs.pass) return inputs.pass.type === 'text' ? 'peek' : 'shy';
  if (a === inputs.email || a === inputs.name) return 'watch';
  if (current === views[1]) return 'code';
  return 'idle';
}
// a point on the screen as a look direction (-1 … 1), from the character's eyes
function lookAt(x, y) {
  const r = blobBack.getBoundingClientRect(), k = r.width / 300;
  return { x: clamp((x - r.left - pose.eye.x * k) / (110 * k), -1, 1), y: clamp((y - r.top - pose.eye.y * k) / (90 * k), -1, 1) };
}
// where the caret is on the screen: the input's left edge, its padding, the text up to the caret (measured)
function caretX(input) {
  const n = input.selectionStart ?? input.value.length;
  const before = input.type === 'password' ? '•'.repeat(n) : input.value.slice(0, n);
  const r = input.getBoundingClientRect(), k = r.width / input.offsetWidth, pad = parseFloat(getComputedStyle(input).paddingLeft);
  return r.left + (pad + Math.min(charW(before || ' ', input), input.clientWidth - 2 * pad)) * k;
}
Object.values(inputs).forEach((i) => {
  i.addEventListener('focus', () => setMood(moodFromFocus()));
  i.addEventListener('blur', () => setTimeout(() => { if (!auth.contains(document.activeElement) || document.activeElement === document.body) setMood('idle'); }, 0));
  ['input', 'keyup', 'click'].forEach((ev) => i.addEventListener(ev, () => { lastInput = clock; if (mood === 'sleepy') setMood(moodFromFocus()); wake(); }));
});
eye.addEventListener('click', () => { if (document.activeElement === inputs.pass || mood === 'shy' || mood === 'peek') setMood(inputs.pass.type === 'text' ? 'peek' : 'shy'); inputs.pass.focus(); });
// the pointer on it is a pet: it holds still and closes its eyes, content (it doesn't chase a pointer that is on it).
// A poke: it wobbles, giggles and throws off a few bits
$$('.b-hit', blobBack).forEach((el) => {
  el.addEventListener('pointerenter', () => { petting = true; wake(); });
  el.addEventListener('pointerleave', () => { petting = false; wake(); });
  el.addEventListener('pointerdown', () => {
    if (!calm) { B.sx.velocity += 3; B.sy.velocity -= 4; B.hop.velocity -= 160; B.sway.velocity += 160; burst(3); }
    react('giggle', 0.9);
  });
});

// each mood is a set of targets (the springs make the motion); some also look somewhere
function aim(t, dt) {
  if (moodUntil && clock > moodUntil) { moodUntil = 0; mood = moodFromFocus(); }
  if (mood === 'idle' && clock - lastInput > 9) mood = 'sleepy';
  if (petting && (mood === 'idle' || mood === 'sleepy')) { mood = 'pet'; lastInput = clock; }
  if (!petting && mood === 'pet') mood = moodFromFocus();
  const T = { lookX: 0, lookY: 0, tilt: 0, cover: 0, peek: 0, raise: 0, chin: 0, smile: 0.35, open: 0, lid: 0, wide: 0, joy: 0, brow: 0, knit: 0, quirk: 0, blush: 0.35, zz: 0 };
  const a = document.activeElement;
  switch (mood) {
    case 'idle':
      if (ptr && clock - ptr.at < 2.5) { const l = lookAt(ptr.x, ptr.y); T.lookX = l.x; T.lookY = l.y; T.tilt = l.x * 6; T.brow = 0.15; }   // it follows the pointer …
      else { T.lookX = Math.sin(t * 0.7) * 0.6; T.lookY = Math.sin(t * 0.45) * 0.3; T.tilt = Math.sin(t * 0.5) * 3; }                    // … or looks around
      break;
    case 'watch': T.lookX = lookAt(caretX(a.tagName === 'INPUT' ? a : inputs.email), 0).x; T.lookY = 0.9; T.tilt = T.lookX * 9; T.smile = 0.5; T.brow = 0.2; break;
    case 'shy': T.cover = 1; T.smile = 0.15; T.lid = 0.3; T.tilt = -4; T.brow = 0.2; T.knit = 0.6; T.blush = 0.95; break;
    case 'peek': T.cover = 1; T.peek = 1; T.lookX = lookAt(caretX(inputs.pass), 0).x; T.lookY = 0.9; T.open = 0.35; T.wide = 0.3; T.tilt = 6; T.brow = 0.7; T.blush = 0.7; break;
    case 'think': T.chin = 1; T.lookX = -0.45 + Math.sin(t * 1.3) * 0.35; T.lookY = -0.7; T.smile = 0.1; T.tilt = -5 + Math.sin(t * 1.2) * 2; T.quirk = 1; break;
    case 'sad': T.smile = -0.9; T.lid = 0.35; T.lookY = 0.5; T.tilt = -6; T.knit = 1; T.blush = 0.15; break;
    case 'surprised': T.open = 0.9; T.wide = 1; T.smile = 0; T.lookY = 0.3; T.brow = 1; T.raise = 0.3; break;
    case 'code': { const r = boxes[Math.min(otp.value.length, 5)].el.getBoundingClientRect(); T.lookX = lookAt(r.left + r.width / 2, 0).x; T.lookY = 0.9; T.tilt = T.lookX * 8; T.smile = 0.45; T.brow = 0.25; break; }
    case 'joy': T.joy = 1; T.smile = 1; T.open = 0.3; T.tilt = Math.sin(t * 6) * 5; T.raise = 1; T.brow = 0.5; T.blush = 1; break;
    case 'giggle': T.joy = 1; T.smile = 1; T.open = 0.55; T.tilt = Math.sin(t * 16) * 6; T.raise = 0.6; T.brow = 0.55; T.blush = 1; break;
    case 'yes': T.lookX = a.tagName === 'INPUT' ? lookAt(caretX(a), 0).x : 0; T.lookY = 0.8; T.smile = 1; T.open = 0.25; T.brow = 0.45; T.blush = 0.7; break;
    case 'pet': T.joy = 1; T.smile = 0.8; T.blush = 1; T.lookY = 0.2; T.brow = 0.3; break;
    case 'sleepy': T.lid = 0.75; T.lookY = 0.4; T.smile = 0.1; T.tilt = 7 + Math.sin(t * 0.8) * 2; T.brow = -0.5; T.zz = 1; break;
  }
  for (const k of Object.keys(T)) B[k].target = T[k];
  B.sway.target = clamp(-B.tilt.velocity * 0.04, -7, 7) - B.lookX.value * 3;   // it trails every turn of the head
  // a blink every few seconds
  if (clock > blinkAt) { blink = 1; blinkAt = clock + 2.2 + ((t * 7.3) % 2.4); }
  blink = Math.max(0, blink - dt * 7);
  // it breathes: a slow swell, slower when it sleeps; joy makes it jump
  const breath = Math.sin(t * (mood === 'sleepy' ? 1.6 : 2.6)) * (mood === 'sleepy' ? 0.035 : 0.02);
  B.sy.target = breath; B.sx.target = -breath * 0.6;
  if (mood === 'joy' && B.hop.resting(1)) { B.hop.velocity -= 260; B.sy.velocity -= 2.5; B.sx.velocity += 1.5; B.sway.velocity -= 120; }
}

// the bits: what it throws off the top of its head (a poke, the success) — droplets, feathers, hearts; how they fly is
// the character's (character.bits)
const bits = $$('.b-bits > *', blobFront).map((el) => ({ el, x: 0, y: 0, vx: 0, vy: 0, a: 0, life: 0 }));
let seed = 0;
const spread = () => (seed = (seed + 0.6180339887) % 1);          // evenly spread and repeatable (no Math.random)
function burst(n) {
  if (calm) return;
  for (const p of bits.filter((b) => b.life <= 0).slice(0, n)) {
    const a = -Math.PI / 2 + (spread() - 0.5) * 2.4, v = 150 + spread() * 110;
    Object.assign(p, { x: pose.top.x + Math.cos(a) * 10, y: pose.top.y + 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, a: spread() * 360, life: 1 });
  }
}
function stepBits(dt) {
  const { gravity, drag, fade, spin } = character.bits, keep = Math.max(0, 1 - drag * dt);
  for (const p of bits) if (p.life > 0) { p.vx *= keep; p.vy = p.vy * keep + gravity * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += spin * dt; p.life -= dt * fade; }
}
const zzs = $$('.b-zz text', blobFront);
const nn = characters.n;
function renderCharacter(t) {
  const rig = { calm, t, blink, shake: shake.value, edge: characters.EDGE + drop.box.y * clamp(B.stand.value, 0, 1) };   // standing, it rides the card's edge
  for (const k in B) rig[k] = B[k].value;
  rig.stand = clamp(rig.stand, 0, 1);
  pose = draw(rig);
  for (const p of bits) {
    characters.fade(p.el, p.life > 0 ? clamp(p.life * 2.5, 0, 1) : 0);
    if (p.life > 0) p.el.setAttribute('transform', `translate(${nn(p.x)} ${nn(p.y)}) rotate(${nn(p.a)}) scale(${nn(0.5 + 0.5 * p.life)})`);
  }
  const zz = clamp(B.zz.value, 0, 1);                              // asleep: z's rise from its head
  zzs.forEach((el, k) => {
    const q = (t * 0.4 + k / 3) % 1;
    characters.fade(el, zz * Math.sin(Math.PI * q));
    if (zz > 0.01) el.setAttribute('transform', `translate(${nn(pose.top.x + 26 + q * 30 + Math.sin(q * 6 + k) * 4)} ${nn(pose.top.y + 20 - q * 44)}) scale(${nn(0.7 + q * 0.6)})`);
  });
}

// ---- the pointer: the light on the glass trails it; with no pointer it drifts by itself ----
let pointerIn = false;
auth.addEventListener('pointermove', (e) => {
  const r = auth.getBoundingClientRect(), k = r.width / auth.offsetWidth;
  spotX.target = (e.clientX - r.left) / k; spotY.target = (e.clientY - r.top) / k; pointerIn = true; wake();
});
auth.addEventListener('pointerleave', () => { pointerIn = false; });

// the touch circle, for the video; the pointer, for the character
const touch = $('.touch');
let down = false;
const showTouch = (e) => { touch.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; touch.classList.add('is-on'); };
addEventListener('pointerdown', (e) => { down = true; showTouch(e); });
addEventListener('pointermove', (e) => {
  if (down) showTouch(e);
  ptr = { x: e.clientX, y: e.clientY, at: clock };                 // the character follows it when it has nothing else to watch
  if (mood === 'sleepy' && !petting) react('surprised', 0.7);      // … and wakes with a start
  else if (mood === 'idle') lastInput = clock;
  wake();
});
addEventListener('pointerup', () => { down = false; touch.classList.remove('is-on'); });

// ---- rendering ----
const drifts = $$('.amb .drift');                                  // the backdrop's glows and shapes drift slowly
const ripples = html.dataset.look === 'glass' ? $$('.ripple') : [];  // glass: rings spread from under the drop
function render(dt) {
  // the drop: around the current step, or folded into a round drop in the middle of it
  const vh = current.el.offsetHeight;
  if (folded) { const s = 96; drop.to({ x: cardW / 2 - s / 2, y: Math.max(0, vh / 2 - s / 2), w: s, h: s }); R.target = 999; }
  else { followDrop({ x: 0, y: 0, w: cardW, h: vh }); R.target = RADIUS; }
  const { x, y, w, h } = drop.box, r = Math.min(Math.max(0, R.value), w / 2, h / 2);
  promote(dropEl, !drop.springs().every((s) => s.resting(0.05)));
  put(dropEl, 'transform', `translate(${px(x)}, ${px(y)})`);
  put(dropEl, 'width', px(Math.max(0, w))); put(dropEl, 'height', px(Math.max(0, h))); put(dropEl, 'borderRadius', px(r));
  dropEl.style.setProperty('--mx', px(spotX.value - x)); dropEl.style.setProperty('--my', px(spotY.value - y));
  put(auth, 'transform', `translateX(${px(shake.value)})`);
  put(noteEl, 'transform', `translateY(${px(auth.offsetTop + (folded ? vh : Math.max(0, drop.b.value)) + 18)})`);   // the note rides under the glass
  // the sheen
  const sw = clamp(sheenAge / 0.65, 0, 1), from = sheenDir > 0 ? -0.6 : 1.1, to = sheenDir > 0 ? 1.1 : -0.6;
  put(sheen, 'opacity', sheenAge < 0.65 ? Math.sin(Math.PI * sw).toFixed(3) : '0');
  put(sheen, 'transform', `translateX(${px(w * (from + (to - from) * (1 - (1 - sw) ** 2)))}) skewX(-14deg)`);
  // the ring and the tick when the code is right
  const ra = clamp(ring.value, 0, 1);
  put(ringEl, 'opacity', ra > 0 && ra < 1 ? ((1 - ra) * 0.9).toFixed(3) : '0');
  put(ringEl, 'transform', `scale(${(1 + ra * 0.6).toFixed(3)})`);
  const c = clamp(check.value, 0, 1.1);
  put(checkEl, 'opacity', clamp(c * 3, 0, 1).toFixed(3));
  put(checkEl, 'strokeDashoffset', (34 * (1 - clamp(c, 0, 1))).toFixed(2));
  put(checkEl, 'transform', `translate(${px(x + w / 2)}, ${px(y + h / 2)}) scale(${(0.8 + 0.2 * c).toFixed(3)})`);
  // the steps: clipped to the drop, their blocks sliding in and out
  for (const v of views) {
    retire(v);
    if (v.el.hidden) continue;
    const vhh = v.el.offsetHeight;
    put(v.el, 'clipPath', `inset(${px(Math.max(0, y))} ${px(Math.max(0, cardW - (x + w)))} ${px(Math.max(0, vhh - (y + h)))} ${px(Math.max(0, x))} round ${px(r)})`);
    for (const b of v.blocks) {
      const e = clamp(b.e.value, 0, 1.2), moving = !b.e.resting(0.004);
      promote(b.el, moving);
      put(b.el, 'opacity', clamp(b.e.value, 0, 1).toFixed(3));
      put(b.el, 'transform', moving ? `translateX(${px(v.side * (1 - e) * SLIDE)})` : '');
    }
  }
  // the checks: the line under a field opens and fades in, the mark pops, the tick draws itself, a wrong field shakes
  for (const c of checks) {
    const hv = clamp(c.h.value, 0, 1.2), pv = clamp(c.pop.value, 0, 1.4);
    put(c.msg, 'height', px(hv * c.msgIn.offsetHeight));
    put(c.msgIn, 'opacity', clamp(hv * 1.6 - 0.4, 0, 1).toFixed(3));
    put(c.msgIn, 'transform', `translateY(${px((1 - clamp(hv, 0, 1)) * -6)})`);
    put(c.inner, 'transform', Math.abs(c.shake.value) > 0.05 ? `translateX(${px(c.shake.value)})` : '');
    put(c.mark, 'opacity', clamp(pv * 2, 0, 1).toFixed(3));
    put(c.mark, 'transform', `scale(${pv.toFixed(3)})`);
    put(c.tick, 'strokeDashoffset', (1 - clamp(c.draw.value, 0, 1)).toFixed(3));
  }
  // the flowing fields (the ones shown follow their own height, which grows with their line), the meter, the button
  for (const f of flows) if (f.only === mode) f.h.target = f.inner.offsetHeight;
  for (const f of flows) { const hh = Math.max(0, f.h.value); put(f.el, 'height', px(hh)); put(f.el, 'opacity', clamp(hh / Math.max(1, f.inner.offsetHeight), 0, 1).toFixed(3)); }
  put(meterFill, 'width', `calc(${(clamp(meter.value, 0, 1) * 100).toFixed(2)}% - ${px(clamp(meter.value, 0, 1) * 122)})`);
  put(meterFill, 'background', `var(--au-m${meter.target >= 1 ? 3 : meter.target >= 0.5 ? 2 : 1})`);
  const gw = clamp(goW.value, 0, 1.05);
  put(go, 'width', `calc(50px + ${gw.toFixed(4)} * (100% - 50px))`);
  put(goLabels[0].parentElement, 'opacity', clamp((gw - 0.4) * 2, 0, 1).toFixed(3));
  put(spinEl, 'opacity', clamp((0.6 - gw) * 2.5, 0, 1).toFixed(3));
  put(spinEl, 'transform', `rotate(${((studio.now() / 1000) * 400 % 360).toFixed(1)}deg)`);
  const q = clamp(roll.value, 0, 1.05);
  put(goLabels[0], 'transform', roll.target === 1 ? `translateY(${px(-22 * q * rollDir)})` : '');
  put(goLabels[0], 'opacity', roll.target === 1 ? clamp(1 - q * 1.5, 0, 1).toFixed(3) : '1');
  put(goLabels[1], 'transform', `translateY(${px(22 * (1 - q) * rollDir)})`);
  put(goLabels[1], 'opacity', clamp(q * 1.5, 0, 1).toFixed(3));
  // the code boxes: digits roll in; the countdown to "Resend"
  for (const bx of boxes) { const e = clamp(bx.e.value, 0, 1.2); put(bx.b, 'transform', `translateY(${px((1 - e) * 18)}) scale(${(0.7 + 0.3 * e).toFixed(3)})`); put(bx.b, 'opacity', clamp(e, 0, 1).toFixed(3)); }
  const left = Math.max(0, Math.ceil(resendAt - clock));
  resendBtn.disabled = left > 0;
  put(timerEl, 'opacity', left > 0 ? '1' : '0');
  if (timerEl.textContent !== ` in 0:${String(left).padStart(2, '0')}`) timerEl.textContent = ` in 0:${String(left).padStart(2, '0')}`;
  // the lenses
  segLens.render(boxOf($('.seg')));
  const ob = boxOf(otpWrap);
  otpLens.render({ x: ob.x, y: ob.y });
}
// the drop follows the step's height as it changes (fields flowing in), without resetting its edges' feel
function followDrop({ x, y, w, h }) {
  if (Math.abs(drop.b.target - (y + h)) > 0.5 || Math.abs(drop.r.target - (x + w)) > 0.5 || Math.abs(drop.l.target - x) > 0.5 || Math.abs(drop.t.target - y) > 0.5) drop.to({ x, y, w, h });
}
// ---- the loop: with ambient life it runs every frame; with reduced motion only while something moves ----
const springs = () => [...drop.springs(), R, shake, bump, goW, roll, check, ring, spotX, spotY, meter, ...Object.values(B), ...segLens.springs(), ...otpLens.springs(),
  ...checks.flatMap((c) => [c.h, c.pop, c.draw, c.shake]),
  ...flows.map((f) => f.h), ...views.flatMap((v) => v.blocks.map((b) => b.e)), ...boxes.map((b) => b.e)];
let running = false, last = 0;
function wake() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
function frame(now) {
  const dt = Math.min(0.032, Math.max(0, (now - last) / 1000));
  last = now;
  clock += dt;
  sheenAge += dt;
  for (let i = queue.length - 1; i >= 0; i--) if (queue[i].at <= clock) queue.splice(i, 1)[0].fn();
  if (roll.target === 1 && roll.resting(0.004)) finishRoll();
  const all = springs();
  all.forEach((s) => s.step(dt));
  const t = calm ? 0 : studio.now() / 1000;
  if (!pointerIn) { spotX.target = cardW * (0.5 + 0.44 * Math.sin(t * 0.55)); spotY.target = 30; }
  html.style.setProperty('--bump', (1 + 0.008 * bump.value).toFixed(4));
  drifts.forEach((g, i) => put(g, 'transform', `translate(${px(Math.sin(t * (0.13 + i * 0.05) + i * 2) * 26)}, ${px(Math.cos(t * (0.11 + i * 0.04) + i) * 18)})`));
  ripples.forEach((el, k) => {
    const q = (t * 0.2 + k / ripples.length) % 1;
    put(el, 'transform', `scale(${(0.3 + q).toFixed(3)})`);
    put(el, 'opacity', (q * (1 - q) * 3).toFixed(3));
  });
  stepBits(dt);
  aim(t, dt);
  render(dt);
  renderCharacter(t);
  const still = all.every((s) => s.resting(0.002)) && !queue.length && sheenAge > 0.7 && bits.every((p) => p.life <= 0);
  if (!calm || !still) requestAnimationFrame(frame); else running = false;
}

// first paint: the fields that only "Create account" has start closed; the drop sits on the form without motion
for (const f of flows) {
  const on = f.only === mode;
  f.h.value = f.h.target = on ? f.inner.offsetHeight : 0;
  f.el.toggleAttribute('inert', !on);
}
views.slice(1).forEach((v) => { v.el.inert = true; v.blocks.forEach((b) => { b.e.value = b.e.target = 0; }); });
// the card is as tall as its tallest step (plus two lines for checks), so nothing below it moves while it reshapes
function sizeCard() {
  const base = form.offsetHeight - flows.reduce((sum, f) => sum + Math.max(0, f.h.value), 0);
  const open = (m) => base + flows.reduce((sum, f) => sum + (f.only === m ? f.inner.offsetHeight : 0), 0);
  auth.style.setProperty('--au-h', px(Math.ceil(Math.max(open('in'), open('up'), codeView.offsetHeight, doneView.offsetHeight) + 44)));
}
// a new width (the container changed): everything that was measured is measured again, in place, without motion
function settle() {
  cardW = auth.offsetWidth;
  for (const f of flows) if (f.only === mode) f.h.value = f.h.target = f.inner.offsetHeight;
  if (!folded) drop.place({ x: 0, y: 0, w: cardW, h: current.el.offsetHeight });
  segLens.place(boxOf(tabs[mode]));
  otpLens.place(boxOf(boxes[Math.min(otp.value.length, 5)].el));
  sizeCard();
  wake();
}
let seenW = 0;
new ResizeObserver(() => {
  if (auth.offsetWidth !== seenW) { seenW = auth.offsetWidth; settle(); }
  readPose(clock < 0.1);                                           // the first time in place, later it climbs or sinks
}).observe($('#signin'));
document.fonts.ready.then(() => { settle(); segLens.o.value = segLens.o.target = 1; });
wake();

// the starting step: ?view=code or ?view=done (stills and links)
requestAnimationFrame(() => {
  const v = params.get('view');
  if (v === 'up') setMode('up');
  if (v === 'code' || v === 'done') { inputs.email.value = 'you@example.com'; $$('.to').forEach((b) => { b.textContent = 'you@example.com'; }); openCode(); }
  if (v === 'done') later(0.6, () => { otp.value = DEMO_CODE; typed(DEMO_CODE); success(); });
});

// for scripts and the tutorial's console
window.__auth = {
  mode: (m) => setMode(m),
  fill: (o) => { Object.entries(o).forEach(([k, v]) => { inputs[k].value = v; inputs[k].dispatchEvent(new Event('input')); }); },
  submit: () => form.requestSubmit(),
  code: (v) => { otp.value = v; otp.dispatchEvent(new Event('input')); },
  state: () => ({ mode, mood, step: ['form', 'code', 'done'][views.indexOf(current)], folded, busy, err: checks.find((c) => c.state === 'bad')?.text.textContent || codeErr.textContent, focus: document.activeElement?.id || document.activeElement?.className }),
};
