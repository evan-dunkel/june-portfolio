# June Portfolio

A single-page portfolio site for illustrator June Lee. Static, image-first, with a
justified gallery and a PhotoSwipe lightbox.

## Stack

- [Astro](https://astro.build) 7 (static output)
- [Tailwind CSS](https://tailwindcss.com) v4 (via `@tailwindcss/vite`)
- [PhotoSwipe](https://photoswipe.com) for the lightbox
- Content collections with Zod validation (`src/content.config.ts`)
- Images optimized at build time with `sharp`

## Develop

Uses [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev      # local dev server
pnpm build    # static build to dist/
pnpm preview  # preview the production build
```

## Editing content

Content lives in YAML and is edited through [Pages CMS](https://pagescms.org) (see
`.pages.yml`):

- **Settings** (`src/content/settings/settings.yml`) — name, email, tagline, and an
  optional About blurb (leave empty to hide the About section).
- **Portfolio** (`src/content/portfolio/works.yml`) — sections, each holding works
  with an image (`src`), alt text, and an optional caption. Images are uploaded into
  `src/assets/works/`.

## Deploy

The site deploys to Cloudflare Pages as static assets. `pnpm build` produces `dist/`,
which is served directly (see `wrangler` config). A "Deploy to Cloudflare" action is
also wired up in `.pages.yml` for editors.
