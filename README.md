# Character auth — UI component

**[Live demo](https://domvybe.com/components/character-auth/)** · [Step-by-step tutorial](https://domvybe.com/library/character-auth/) · [Download the ZIP](https://github.com/UlviShabanbayli/domvybe-character-auth/releases/latest/download/character-auth-source.zip)

A sign-in card watched by a character that follows your typing, covers its eyes for the password and jumps for joy; three looks, three characters.

Open `index.html` through any local static server (for example `python3 -m http.server`) and try it with a mouse,
a finger or the keyboard. Plain HTML, CSS and JavaScript; no build step, no libraries.

- `index.html` — the component and its stage
- `style.css` — the look (colours are variables at the top)
- `app.js` — the interaction and the animation
- `spring.js` — a small spring, written from scratch, that every motion uses
- `characters.js` — what a character is: the shared helpers and the interface every character follows
- `character-drop.js` — the drop (the glass look)
- `character-owl.js` — the porcelain owl (the nordic look)
- `character-cat.js` — the cat (the clay look)

It respects `prefers-reduced-motion`. Made by Ulvi (Code with Ulvi) · domvybe.com

## Licence

MIT — see [LICENSE](LICENSE). Use it in your own projects, commercial ones included.
