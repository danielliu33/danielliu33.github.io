# danielliu33.github.io

Personal site and blog of Daniel Liu. Static [Astro](https://astro.build) site, deployed to GitHub Pages.

- Home (short bio, links, dated lists of work, papers & patents, writing), Work (case studies), Writing (blog), CV (PDF at `/cv.pdf`)
- Quiet academic layout: EB Garamond, black on `#f4f4f3`, one narrow column
- RSS (`/rss.xml`), sitemap, `robots.txt`, `llms.txt`
- Build-time KaTeX math, Shiki code highlighting (light + dark), footnotes, heading anchors, reading time, tags
- Dark colors follow the system setting (no toggle); no client-side framework (one tiny inline script assembles the email link)

## Run locally

Requires Node 22.12+ (CI uses Node 24) and npm.

```sh
npm ci            # install exact versions from package-lock.json
npm run dev       # http://localhost:4321 (drafts are visible here, labelled "Draft")
npm run build     # production build into dist/ (drafts excluded), then post-build checks
npm run preview   # serve dist/ locally
```

`npm run build` ends with `scripts/check-dist.mjs`, which fails the build if anything from `drafts/` was built, if a page contains a KaTeX error (invalid TeX), if the sitemap lists a `noindex` page, if `cv.pdf` is missing or stale (the CV content changed since it was printed), if a redirect page for an old URL is missing (or a page links to an old URL), or if a page links to a site path or `#anchor` that does not exist.

URLs use trailing slashes (`/work/`). The dev server returns 404 for `/work` without the slash; GitHub Pages redirects it.

## Project layout

```
src/
  data/profile.ts        single source for name, links (Twitter), photo, bio, work and papers lists, and the CV
  content/work/          case studies (Markdown)
  content/writing/       blog posts (Markdown or MDX)
  content.config.ts      collection schemas
  lib/legacy-redirects.mjs   old URLs and where they now go
  pages/                 routes (home, work, writing, cv, rss.xml, robots.txt, llms.txt, 404)
  layouts/BaseLayout.astro   <head> meta, header/footer, email script
  components/            header, footer, dated lists (work, papers, posts), CV entry, obfuscated email
  styles/global.css      color tokens (light/dark), typography and layout
scripts/
  render-cv-pdf.mjs      builds and prints /cv/ to public/cv.pdf
  cv-fingerprint.mjs     hashes that tie public/cv.pdf to the CV content (cv-pdf-source.json)
  render-og-image.mjs    renders public/og-default.png (1200×630)
  render-icons.mjs       renders public/apple-touch-icon.png and public/favicon.ico from favicon.svg
  check-dist.mjs         post-build checks (drafts, KaTeX errors, sitemap vs noindex, CV PDF, old URLs, internal links)
public/                  favicons, social image, CV PDF (and your photo, if you add one)
```

## Edit the profile

Everything about the person lives in `src/data/profile.ts`. The home page, the `/cv/` page and the CV PDF all read from it, so they never disagree.

- `bio`: the home-page paragraphs, one short sentence or two each. They may contain Markdown links: `[text](https://…)` or `[text](/work/…/)`.
- `selectedWork`: the "Work" list (order and one-line text). Each `slug` is a file in `src/content/work/`; the years come from that file.
- `papers`: the "Papers & patents" list (year, title, link, note).
- `cv`: every section of the CV.
- `links.linkedin`, `links.cvPdf`; the email address is split in `email` so it never appears whole in the HTML source.

### Twitter

`links.twitter` is empty, so no Twitter link is shown anywhere. Set it to the full profile URL:

```ts
twitter: 'https://x.com/yourhandle',
```

That adds "Twitter" as the first item of the home-page link row (Twitter / CV / LinkedIn / Email), `x.com/yourhandle` to the CV header, the profile to the JSON-LD `sameAs`, and a `twitter:creator` tag. Pasted forms such as `https://www.x.com/yourhandle/`, `https://x.com/yourhandle?s=21` or `twitter.com/yourhandle` are accepted and shown as `https://x.com/yourhandle`; anything that is not an X profile URL fails the build. Then regenerate the CV PDF (`npm run pdf`); the build fails until you do.

### Photo

`site.photo` is empty, so the home page is a single column. To add a photo, put your photo at `public/photo.jpg` and set:

```ts
photo: '/photo.jpg',
```

On wide screens it sits about 180px wide to the left of the bio; on phones it stacks above the text. It is decorative (empty alt text, since the page heading already names you), and its width and height are read from the file at build time so the page does not shift while it loads. Use a JPEG, PNG or WebP file; the build fails if the file is missing or unreadable.

Conventions: career and education dates are **years only** (`2020–2026`). Use an en dash between years. Blog posts show year and month only.

After changing anything the CV shows, regenerate the PDF (see below).

## Edit case studies

One Markdown file per case study in `src/content/work/`. The file name is the URL slug (`/work/<file-name>/`). Add it to `selectedWork` in `src/data/profile.ts` too (the build fails otherwise); that list sets the order and the home-page line.

```md
---
title: 'A short, specific title'
org: 'Company — Team'
years: '2023–2024'
one_liner: 'One or two sentences shown on /work/ and as the page lede.'
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

- Dates show as year and month only (`2026 Oct` in lists, `October 2026` on the post).
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

## CV PDF

```sh
npm run pdf
```

This builds the site, serves it on a free local port, prints `/cv/` with headless Chrome to `public/cv.pdf`, checks it, records which CV content it was printed from in `scripts/cv-pdf-source.json`, and rebuilds. Commit both `public/cv.pdf` and `scripts/cv-pdf-source.json`. The script fails if the PDF is more than two Letter pages, embeds a Type 3 font, or embeds any font other than static EB Garamond (a character missing from EB Garamond falls back to a system font; replace it). It currently runs to about one and a quarter pages; page 2 carries a "Daniel Liu · 2 / 2" footer.

The post-build check compares the built `/cv/` page (its text, links and email parts, not its styling) with `scripts/cv-pdf-source.json`, so a change to the CV data or to `links.twitter` without `npm run pdf` fails the build, locally and in CI. After a print-style-only change, run `npm run pdf` anyway.

Needs Google Chrome (set `CHROME_PATH` for another Chrome/Chromium binary) and poppler (`brew install poppler`) for `pdfinfo` and `pdffonts`. If the page check fails, tighten the `@media print` styles in `src/pages/cv.astro`.

`/cv/` is the print source: `noindex`, not in the nav or the sitemap. The home page's CV link opens `/cv.pdf` in the browser; the Download link on `/cv/` saves it as `Daniel-Liu-CV.pdf`.

The site uses static EB Garamond (`@fontsource/eb-garamond`, weights 400 and 500 plus italic), not a variable font: Chrome embeds variable fonts as Type 3, which copy-pastes as garbled text in macOS Preview and some applicant-tracking systems.

## Old URLs

Links shared since launch keep working. `src/lib/legacy-redirects.mjs` lists them: `/about/` goes to the home page and the old résumé paths go to `/cv.pdf`. Page paths get static redirect pages (meta refresh, `rel=canonical`, `noindex`, left out of the sitemap); a missing file path is forwarded by the 404 page.

## Social image

`public/og-default.png` is the default Open Graph / Twitter card (EB Garamond on `#f4f4f3`, like the site). Regenerate it after changing the name or headline (edit the strings at the top of the script first):

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
