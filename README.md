# shaswata56.github.io

My personal portfolio — live at [shaswata.me](https://shaswata.me).

## Stack

- [Nuxt 3](https://nuxt.com) + Vue 3, statically generated
- [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite`
- Font Awesome (self-hosted SVG icons) + a self-hosted Devicon subset

## Development

```bash
npm install
npm run dev        # local dev server
npm run generate   # static build → .output/public
```

## Deployment

Push to `master` and GitHub Actions (`.github/workflows/deploy.yml`) runs
`npm run generate` and publishes `.output/public` to the `gh-pages` branch.

## Devicon subset

The Technologies section uses ~35 of Devicon's ~1,000 glyphs, so instead of the
full 1.5 MB CDN font we ship a self-hosted subset. After adding or removing a
`devicon-*` class in `components/TechnologiesSection.vue`:

```bash
pip install fonttools brotli
python scripts/build-devicon-subset.py
```

Commit the regenerated `assets/fonts/devicon-subset.woff2` and
`assets/css/devicon-subset.css`.

## Arcade

`public/` contains a few standalone mini-games (plain HTML + three.js, no build
step). Open [shaswata.me/arcade.html](https://shaswata.me/arcade.html) or click
the dice icon on the homepage.
