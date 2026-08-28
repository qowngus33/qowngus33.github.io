# Juhyun Bae — Research Portfolio

Static research portfolio prepared for GitHub Pages. No build step is required.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

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
- Add your GitHub / Google Scholar / LinkedIn links to the header or contact section when ready.

## Privacy note

The public site intentionally does **not** display the phone number contained in the CV. The email address is displayed because it is useful as a professional contact channel. If you do not want the email public either, remove the two `mailto:` links in `index.html`.
