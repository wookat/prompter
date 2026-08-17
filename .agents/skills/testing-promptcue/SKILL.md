---
name: testing-promptcue
description: How to run and test the PromptCue teleprompter app (wookat/prompter) locally and on the live site, including camera-recording tests with fake media devices.
---

# Testing PromptCue (wookat/prompter)

- Dev server: `npm run dev` → http://localhost:5173 (plain Vite; worker APIs like /api/pulse 404 locally — expected). Live site: https://prompter.zalize.com.
- Camera/mic tests without hardware: launch Chrome with `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` (fake green camera feed, permission auto-granted). Recordings download to `~/Downloads/promptcue-take-*.mp4|webm`.
- StrictMode dev countdown freeze was fixed in r24 round 2 (auto-start effect cleanup resets startedRef). If a dev-mode countdown still freezes at "3", press Space twice to work around.
- Prompter control bar auto-hides after ~3.5s. Since r24 round 2, plain mouse movement reveals it (pointerType === 'mouse'); wheel scroll/keys also work. A click on the background toggles play/pause — aim precisely at control-bar icons.
- The live homepage may serve a cached old bundle — always hard-reload (Ctrl+Shift+R) before asserting on newly deployed UI.
- Chrome fetches `loading="lazy"` images that are within its large lazy-load distance threshold even without scrolling — don't treat an early fetch as a lazy-loading failure; verify the `loading` attribute via CDP instead.
- The browser_console tool may fail with "Could not connect to Chrome via CDP" for manually-launched Chrome; use a python websockets script against ws url from http://localhost:9222/json (pick the tab whose url matches the app, not the devtools:// one).
- Clicking prompter background toggles play/pause — aim precisely at control-bar icons (record button = VideoOff icon right of the divider after the +/AA controls).
- Chrome's minimum window width (~564px) is above 375px; use DevTools device toolbar (F12 → Ctrl+Shift+M, set width 375) for mobile-viewport checks.
- /api/pulse social-proof line on homepage only renders when `starts >= 500`.
- Since r24 round 3 the Prompter is code-split (`Prompter-*.js` lazy chunk, preloaded ~2s after page load); when asserting on initial-JS size, count only `index-*.js`.
- The old Start-click leak that cancelled the countdown was fixed in r24 round 3 (PR #25): taps on the prompter background within 400ms of mount are intentionally ignored, so wait >0.5s after entry before testing tap-to-pause.
