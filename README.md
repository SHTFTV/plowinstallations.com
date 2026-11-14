<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8a927e93-8275-49c6-bdbe-fd6a14cfbdce

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`



## Existing production and editorial feature

The live custom domain is www.plowinstallations.com on existing Vercel project plowinstallations (prj_sHeDAOfLNnXXmpSADwTxI29YnatY), linked to this repository. The separate plowinstallations-com project is not the canonical custom-domain target. Preserve the existing Vite app, Full Flow Hydraulics/Durand contact ownership, static public/guides pages, original post dates and retained advertising. Do not change DNS.

The November9 user-requested main feature is Metal Pless PlowMaxx PLBH0836-16, not the19-foot TruckMaxx. Editable article data: content/articles/metal-pless-plbh-0836-16-hydraulic-wing-plow.json. Exact model/carrier/source rules and corrections: operations/site-sop.json. Rebuild this feature with python3 scripts/render-feature.py. Its timestamp is stored, not reset by builds. Original SVG diagrams and share PNG are authored assets, not copied manufacturer photographs or installation drawings.

The publication-results GitHub workflow observes newly added guide pages on main, waits for the actual canonical public article, exact timestamp, source link, facts, guide index, RSS, sitemap and original share image, then appends a sanitized done/failed event to /publication-results.json for the command center. Private verification reasons and cloud-run references stay in operations/publication-checks.json, outside Vite's public output. A source commit or READY build is not counted as publication. Existing events are deduplicated by canonical URL plus original publication timestamp. No source/SOP text, credentials or personal records are emitted publicly.

## November 13 flow repair

The existing observer now runs hourly as well as on guide changes. JPEG/WebP source images are accepted alongside PNG only after exact source-byte identity verification. Valid calendar-only Article dates are retained, not rewritten. One failed guide does not stop checks of others. The public publication-status.json separates fresh observer execution from automatic authoring, which is not connected. Empty/new-output-free runs do not claim a new publication. Private failure detail remains in operations/latest-observer-run.json; public status contains only sanitized attention codes.
