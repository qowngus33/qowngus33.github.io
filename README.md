# Juhyun Bae — Research Portfolio

## Version 7 — current

Background code now types, pauses, and erases in place with fewer lines and lower brightness. Timeline order: Samsung AI Challenge (2024), image aesthetics (2024), graduation ranked first in Computer Science (2025), DnSAD (2025), motion augmentation (2026). Graduation uses `assets/images/2025-graduation.jpeg`.

There are now **8 stars** and still 35 coins. **Re-run the included supabase-setup.sql even when upgrading from v6** to accept 8-star guestbook entries. Existing visits are preserved. The early finish remains 340px past the last project. Classic portfolio files are unchanged.


Static research portfolio prepared for GitHub Pages. No build step is required.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Game Mode

### Version 3 rules

- Bugs travel continuously left; respawning happens only outside the visible playfield.
- Space opens a project within 65 px of its sign while on the ground; elsewhere it jumps.
- Collect 35 coins along jump arcs. Each collision costs up to 3 coins, never below zero.
- Each coin and memory star can be collected only once per run (reload starts a new run).
- The finish screen shows stars, net coins, total collected and lost coins.
- Shared guestbook: the supplied Supabase API configuration replaces local storage. New entries are published immediately. One submission per run; scores are not verified. See START-HERE.md for rate limits and remaining anti-spam limitations. Backend setup is not executed automatically.
- Project/result dialogs intentionally pause gameplay, including bugs, while reading.

Open `game.html` directly or use the **Game Mode** button in the main navigation.

- Move: `A` / `D` or left / right arrow keys
- Jump over moving bugs: `Space`
- Open a nearby project: `Space`
- Close an open project: `Space`
- Goal: open all eight projects, collect their stars, and reach the final stage

Touch controls are shown automatically on mobile devices.

## Deploy to GitHub Pages

### Recommended: clone your already-created Pages repository

Replace `YOUR_USERNAME` below with your GitHub username.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git
cd YOUR_USERNAME.github.io
```

Copy **all files and folders from this package** into that cloned folder, then:

```bash
git add .
git commit -m "Build research portfolio"
git push origin main
```

Your site will be available at:

`https://YOUR_USERNAME.github.io`

If GitHub asks you to enable Pages: repository → **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**.

### If your repository is completely empty

You can also run these commands directly inside this package folder:

```bash
git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git
git add .
git commit -m "Build research portfolio"
git push -u origin main
```

If the remote already contains a README or another commit, use the **clone-and-copy method above** instead of force-pushing.

## What to customize

- `index.html`: text, email, publications, project descriptions.
- `assets/images/`: research figures and portrait.
- `assets/docs/`: downloadable CV / portfolio / career description.
- `assets/css/style.css`: color palette and layout.
- `game.html`, `assets/css/game.css`, `assets/js/game.js`: interactive timeline game.
- Add your GitHub / Google Scholar / LinkedIn links to the header or contact section when ready.

## Privacy note

The public site intentionally does **not** display the phone number contained in the CV. The email address is displayed because it is useful as a professional contact channel. If you do not want the email public either, remove the two `mailto:` links in `index.html`.
