# Arpit Rathi · Meta Ads Specialist portfolio

A one-page portfolio site whose main job is to get qualified visitors to **book a call**.
It's plain HTML, CSS and JavaScript, so there is no build step and nothing to install.

```
index.html              ← all page content (edit copy here)
assets/css/styles.css   ← colours, fonts, layout, animation
assets/js/main.js       ← menu, scroll reveals, count-up, calculator, sticky mobile CTA
assets/img/             ← favicon (SVG + PNG), apple-touch-icon, og-image.png (social preview)
.nojekyll               ← tells GitHub Pages to serve files as-is
```

All paths are relative, so the site works at a project URL like
`https://<user>.github.io/Personal-Portfolio/` and on a custom domain.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. You can also double-click `index.html`, which works for most things.

## Editing content

Everything visible lives in `index.html`, grouped by section comments (`<!-- ============ HERO ============ -->`).

| What | Where |
| --- | --- |
| Headline / positioning | `HERO` section |
| Services | `SERVICES`: one `<li class="card service">` per service |
| Case-study numbers | `CASE STUDY`: each number is a `<span data-count="…">`. Update **both** `data-count` (what the animation counts to) and the text inside the span. The bar widths are the `--w:` percentages (spend ÷ revenue × 100). Update the `aria-label` on `#case-bars` too. |
| Packages | `PACKAGES`: three `<article class="plan">` cards **and** the comparison `<table>` below them. Keep the two in sync. |
| Calculator defaults | `index.html` (`value="…"` on the inputs) for INR; `defaults` in `assets/js/main.js` for the USD values used when the currency is switched. |
| FAQ | `FAQ`: one `<details>` per question |
| Phone / email / Calendly | Search `index.html` for `tel:`, `mailto:` and `calendly.com`. The Calendly link appears several times, so use find-and-replace. |
| Colours | CSS variables at the top of `assets/css/styles.css` (`--navy-900`, `--blue`, `--yellow`, `--coral`, …) |
| Social preview | `og:*` / `twitter:*` tags in `<head>`, plus `assets/img/og-image.png` (1200×630) |

### Optional additions

Add these only when you have real material for them:

- A headshot (with alt text) in the hero
- An about/bio section, testimonials, or more case studies (with written permission)
- If you move to a custom domain, update `og:url` and `og:image` in `<head>`

### Content rules

- Do not add client names, testimonials, logos or results without written permission and real data.
- Keep the "Meta-tracked results" disclaimer next to any campaign numbers.
- Do not use Meta, Facebook or Instagram logos or branding.

## Deploying to GitHub Pages

The site is served straight from the repository with no build.

1. Merge the work into `main`, or pick the branch you want to publish.
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, then click **Save**.
4. Wait a minute or two. The site appears at
   `https://arpitrathi-work.github.io/Personal-Portfolio/`.

> GitHub Pages on a **private** repository needs a paid GitHub plan (Pro, Team or Enterprise).
> On a free plan, make the repository public first (**Settings → General → Danger Zone → Change visibility**).

### Using the GitHub CLI instead

```bash
gh auth login            # choose GitHub.com → HTTPS → login with a web browser
gh auth status           # confirm you're logged in
gh api -X POST repos/arpitrathi-work/Personal-Portfolio/pages \
  -f "source[branch]=main" -f "source[path]=/"
gh api repos/arpitrathi-work/Personal-Portfolio/pages --jq .html_url
```

After each push to the published branch, Pages redeploys automatically.

### Custom domain (optional)

Add the domain in **Settings → Pages → Custom domain**, then point a DNS `CNAME` record to
`arpitrathi-work.github.io`. Update `og:url` and `og:image` in `index.html` to the new address.

## Accessibility and behaviour notes

- Semantic sections and headings, a skip link, visible yellow focus rings, and native `<details>` for the FAQ and comparison table, so they work with the keyboard out of the box.
- Animations turn off when the visitor's system has *Reduce motion* enabled. Counters then show their final values right away.
- Screen readers get the final case-study numbers instead of the animated ones.
- The sticky mobile "Book a call" bar hides while the hero or contact booking button is on screen.
