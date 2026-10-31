# CrAIgCo Version 2 — Safety First widget integration

Integrated 2026-10-31 into the uploaded CraigCo_ver2-main website.

## Files added
- `assets/craigco-safety-first.png` — original notice artwork
- `widgets/safety-widget.css` — button and responsive modal styling
- `widgets/safety-widget.js` — opens and closes notice
- `_headers` — Cloudflare Pages X-Robots-Tag noindex directive for all paths
- `robots.txt` — permits crawlers to read the noindex directive

## Updated
- `index.html` — additional widget CSS and script, enhanced meta robots directive

## Deployment
Extract contents so `index.html` is at the repository or Cloudflare output root (not nested inside an extra folder). Upload the updated files to the **CraigCo_ver2** GitHub repository and trigger the Cloudflare Pages deploy connected to it. If Cloudflare build output is a custom directory, copy `_headers` and `robots.txt` into that output directory. The original HTML, CSS, JS, and all original images/videos are preserved.

## IMPORTANT access distinction
`noindex` affects cooperative search engines only. Anyone who has or discovers a public URL may still open the site. For actual restricted-access invitations use Cloudflare Access or another authentication gate. Existing footer labels such as 'Private' are descriptive, not access controls.

## Test
Open `index.html`, click the Safety First button at lower-right, close with X or Escape. Verify the image displays and the original page remains usable.
