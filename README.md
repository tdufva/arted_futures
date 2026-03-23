# Utopiointi

Static prompt generator and writing canvas built with p5.js.

## Structure

- `index.html`: app shell and styling
- `utopiointi.js`: p5 sketch, prompt generation, persistence, exports
- `assets/fonts/`: bundled fonts used by the app
- `data/text/`: language prompt source text files

## Run Locally

Because the app loads text files and fonts, serve the folder through a local web server instead of opening `index.html` directly.

Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish With GitHub Pages

1. Create a GitHub repository and upload this folder.
2. Push the contents so that `index.html` is in the repository root.
3. In GitHub, open `Settings` -> `Pages`.
4. Under `Build and deployment`, choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or your default branch)
   - `Folder`: `/ (root)`
5. Save, then wait for GitHub Pages to publish the site.

The `.nojekyll` file is included so GitHub Pages serves the site as plain static files without Jekyll processing.

## Notes

- Writing is saved in the browser with `localStorage`.
- Export to PNG and PDF depends on the browser loading the included CDN libraries.
