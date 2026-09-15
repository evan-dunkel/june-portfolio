# June Portfolio

A single-page portfolio site for illustrator June Lee. The page uses browser
default styles, section headings, images, captions, and an email link.
Artwork links open the original files. Animated artwork appears as text links
and opens on demand. The page has no client-side scripts or interface animations.

## Stack

- [Astro](https://astro.build) 7 (static output)
- Content collections with Zod validation (`src/content.config.ts`)
- Images optimized at build time with `sharp`

## Develop

Uses [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev --background # start the local dev server
pnpm dev status       # check the background server
pnpm dev logs         # read server logs
pnpm dev stop         # stop the background server
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
