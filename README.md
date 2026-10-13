# danielliu33.github.io

Personal site and blog of Daniel Liu. Static [Astro](https://astro.build) site, deployed to GitHub Pages.

- Home, About, Work (case studies), Writing (blog), Résumé (HTML + one-page PDF)
- RSS (`/rss.xml`), sitemap, `robots.txt`, `llms.txt`
- Build-time KaTeX math, Shiki code highlighting (light + dark), footnotes, heading anchors, reading time, tags
- Light and dark themes with a toggle; no client-side framework (two tiny inline scripts: theme and email)

## Run locally

Requires Node 22.12+ (CI uses Node 24) and npm.

```sh
npm ci            # install exact versions from package-lock.json
npm run dev       # http://localhost:4321 (drafts are visible here, labelled "Draft")
npm run build     # production build into dist/ (drafts excluded), then post-build checks
npm run preview   # serve dist/ locally
```

`npm run build` ends with `scripts/check-dist.mjs`, which fails the build if anything from `drafts/` was built, if a page contains a KaTeX error (invalid TeX), or if the sitemap lists a `noindex` page.

URLs use trailing slashes (`/about/`). The dev server returns 404 for `/about` without the slash; GitHub Pages redirects it.

## Project layout

```
src/
  data/profile.ts        single source for name, links, experience, education, research,
                         publications, patents, and the résumé
  content/work/          case studies (Markdown)
  content/writing/       blog posts (Markdown or MDX)
  content.config.ts      collection schemas
  pages/                 routes (home, about, work, writing, résumé, rss.xml, robots.txt, llms.txt, 404)
  layouts/BaseLayout.astro   <head> meta, theme script, header/footer
  components/            header, footer, timeline, lists, obfuscated email
  styles/global.css      design tokens (light/dark) and typography
scripts/
  render-resume-pdf.mjs  builds and prints /resume/ to public/resume.pdf
  render-og-image.mjs    renders public/og-default.png (1200×630)
  render-icons.mjs       renders public/apple-touch-icon.png and public/favicon.ico from favicon.svg
  check-dist.mjs         post-build checks (drafts, KaTeX errors, sitemap vs noindex)
public/                  favicons, social image, résumé PDF
```

## Edit the profile

Everything about the person lives in `src/data/profile.ts`: headline, bios, links, experience, education, research, publications, patents, and the résumé text. The home page, About page, HTML résumé and PDF all read from it, so they never disagree.

The home page timeline shows each role's summary plus only the bullets listed in its `featured` array (indexes into `bullets`); the résumé shows every bullet. About paragraphs may contain Markdown links: `[text](https://…)`.

Conventions: career and education dates are **years only** (`2020–2026`). Use an en dash between years.

After changing anything the résumé shows, regenerate the PDF (see below).

## Edit case studies

One Markdown file per case study in `src/content/work/`. The file name is the URL slug (`/work/<file-name>/`).

```md
---
title: 'A short, specific title'
org: 'Company — Team'
years: '2023–2024'
one_liner: 'One or two sentences shown on the home page and as the page lede.'
order: 1        # position in "Selected work" (ascending)
---

## Context
...
```

## Write a new post

1. **Draft privately.** Create the file in `src/content/writing/drafts/`. That folder is git-ignored, so a draft can never be committed or pushed by accident. The dev server shows it, labelled "Draft". Production builds never read `drafts/` at all, with or without `draft: true`, and the post-build check fails if anything from it reaches `dist/`.
2. **Publish.** Move the file to `src/content/writing/`, remove the `draft` line (or set `draft: false`), and commit. The file name becomes the URL: `src/content/writing/my-post.md` → `/writing/my-post/`.

A post in `src/content/writing/` with `draft: true` is committed (so it is public in the repository) but left out of the built site. Use the `drafts/` folder for anything that should stay private.

The "Writing" link in the header, the "Writing" section on the home page, the footer's RSS link and the feed's `<link rel="alternate">` all appear automatically once at least one published post exists. Until then `/writing/` is `noindex` and left out of the sitemap. If the dev server was started before the first post existed, restart it.

### Front matter

```md
---
title: 'Post title'
description: 'One sentence for the index, RSS, and social cards.'
date: 2026-10-20
updated: 2026-11-02
tags: ['evaluation', 'agents']
draft: true
---
```

- `updated` is optional and shown as "Updated …".
- `tags` must be lower-case slugs (`post-training`, not `Post training`); the build fails otherwise. Keep a small, fixed set.
- `draft: true` is optional and keeps a committed post out of the production build.

### Math (KaTeX, rendered at build time)

Same syntax as Obsidian. Inline math uses single (or double) dollar signs inside a sentence:

```md
The policy $\pi_\theta(y \mid x)$ is updated with DPO.
```

Display math is a paragraph of its own, either on one line or with `$$` on separate lines:

```md
$$\beta \log \frac{\pi_\theta(y \mid x)}{\pi_{\mathrm{ref}}(y \mid x)}$$

$$
\mathcal{L} = -\log \sigma\left(\beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{\mathrm{ref}}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{\mathrm{ref}}(y_l \mid x)}\right)
$$
```

**Write a literal dollar sign as `\$`** (e.g. `costs \$5 a month`); otherwise two prices in one paragraph turn into math. Invalid TeX fails the build (the post-build check reports the page). The KaTeX stylesheet is only loaded on pages that contain math.

### Code

Fenced code blocks with a language get Shiki highlighting in both themes:

````md
```python
def accuracy(preds, labels):
    return sum(p == y for p, y in zip(preds, labels)) / len(labels)
```
````

### Markdown or MDX

Prefer `.md`. Use `.mdx` only when a post needs components. Builds with an `.mdx` post print a `[WARN] [vite] [MODULE_LEVEL_DIRECTIVE] … "use astro:head-inject"` warning; it is expected and harmless.

### Footnotes, headings, images

- Footnotes: `A claim.[^1]` and, anywhere below, `[^1]: The caveat.`
- `##`/`###` headings get anchor links automatically.
- Put images next to the post (or in `public/`) and reference them with standard Markdown.
- Reading time is computed automatically.

## Résumé PDF

```sh
npm run pdf
```

This builds the site, serves it on a free local port, prints `/resume/` with headless Chrome to `public/resume.pdf`, checks that it is exactly one Letter page with no Type 3 fonts, and rebuilds. Commit the updated `public/resume.pdf`.

Needs Google Chrome (set `CHROME_PATH` for another Chrome/Chromium binary). `pdfinfo` and `pdffonts` (poppler) are used for the checks when available. If the page check fails, tighten the `@media print` styles in `src/pages/resume.astro`.

The print styles use static Newsreader (`@fontsource/newsreader`) and Arial instead of the site's variable fonts. Chrome embeds variable fonts as Type 3, which copy-pastes as garbled text in macOS Preview and some applicant-tracking systems.

## Social image

`public/og-default.png` is the default Open Graph / Twitter card. Regenerate it after changing the name or headline (edit the strings at the top of the script first):

```sh
npm run og
```

## Icons

`public/favicon.svg` is the main icon. `public/apple-touch-icon.png` (180×180) and `public/favicon.ico` (32×32) are rendered from it:

```sh
npm run icons
```

## Deploy

`.github/workflows/deploy.yml` builds with `withastro/action` and publishes with `actions/deploy-pages` on every push to `main` (or a manual run).

This repository is public: every committed file, and its full git history, is visible. Keep private notes and unpublished drafts in `src/content/writing/drafts/` (git-ignored) or outside the repo.

### First deploy

1. On GitHub, create a **public** repository named exactly **`danielliu33.github.io`**. Leave it empty: no README, license or `.gitignore`. The site has no `base` path and every link is root-absolute (`/work/`, `/_astro/…`), so it only works when served from the root of the user site. Any other repository name serves it under `/<repo>/` with broken styles and links, unless `base` is set in `astro.config.mjs`.
2. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**. Do this before the first push; otherwise the first run's deploy job fails (re-run it after this step).
3. Push:

   ```sh
   git remote add origin https://github.com/danielliu33/danielliu33.github.io.git
   git push -u origin main
   ```

4. Check the **Actions** tab, then open https://danielliu33.github.io.

Before the first push, check the commit author email (`git log --format='%ae'`): it becomes public. GitHub's `<id>+<username>@users.noreply.github.com` address keeps it private.

### Dependencies

`npm audit` reports a KaTeX advisory (prototype pollution) that only matters for untrusted TeX input; this site renders only its own posts at build time. `katex` is pinned to 0.16.x by `overrides` until `rehype-katex` supports KaTeX 0.19. The other advisories are in build-time transitive dependencies; `npm audit fix` (no `--force`) updates them in the lockfile only. Rebuild and check `dist/` afterwards.

## Custom domain (later)

1. Add `public/CNAME` containing only the domain, e.g. `www.example.com`.
2. DNS: for `www`, a `CNAME` record pointing to `danielliu33.github.io`; for an apex domain, `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and the matching `AAAA` records from GitHub's docs).
3. Repository **Settings → Pages → Custom domain**: enter the domain, then enable **Enforce HTTPS**.
4. Update the URL in `astro.config.mjs` (`site`), `src/data/profile.ts` (`site.url`) and `scripts/render-og-image.mjs` (`host`), then run `npm run og` and `npm run pdf` and commit.
