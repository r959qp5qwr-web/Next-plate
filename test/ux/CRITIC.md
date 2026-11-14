VERDICT: FAIL
BUILD: 10831bed8c31eea4df14a92fd22ab2b9197fb5305ec1cd94e4e7545200609db3

Round 34. Scope: git diff 9998595..HEAD (01bb2b5, 9033b32, 4c66adc, 3d1ef7b). Fingerprint taken after all measuring; it did not change.

Measured by the Critic (not taken from the builder's report)
- npm run rules: every rule check holds (exit 0), on all three built pages.
- npm run words: no banned words outside the 42 listed exceptions (exit 0). allow.json files are not touched by this diff.
- npm run films: 4 films ok, -16.7 / -16.8 dB, no decode errors, no freeze (exit 0). Films are not in this diff.
- Full review (node test/ux/review.js --pool 6, full set): 15 runs, 54 states, 810 checks, no violations (exit 0). The builder reported 9 runs and 486 checks; my full-set run is larger and also clean.
- npm run drill: every planted fault was caught (exit 0).
- Built pages: hosted/v6/index.html and index.min.html carry the new text and not the old one.

Findings, most serious first

1. MINOR. Plate (and every place that shows bad_key), first visit from the coach's link, all widths and schemes.
   What is wrong: the new message promises "After that, this phone remembers it." The app does not keep that promise until the person has
   finished all three set-up steps. On load, src/v6/app.js:30 reads ?k=, strips it from the address bar (history.replaceState), and keeps
   it only in memory. It is written to the phone only by save(), which runs at the end of set-up (app.js:180) or after plates come back
   (app.js:84). Measured with a probe on the built hosted/v6/index.html (fresh 360 px browser, opened /?k=SECRET123): the address bar
   lost the code, localStorage np6 = null; after a reload, still null. So if the page is reloaded, the tab is closed, or Android drops the
   background tab during set-up (common on small, low-memory phones, for someone answering one-handed mid-meal), the code and the answers
   are gone. The person does the set-up again and is then told to "open the link once", which they already did, and is promised something
   the phone just failed to do.
   Why it matters: this is the first screen a new client meets when anything goes wrong, and the message's own claim turns out untrue
   for them. It erodes trust at the exact moment the owner wanted to make the screen clearer.
   Criterion: B (copy plain and truthful; error states say what to do next and do what they say), UC.
   Evidence: src/v6/app.js:30, :34, :84, :180; the probe output (stored after open: null; stored after reload: null).
   Smallest correction: keep the owner's wording, and make it true. Call save() right after KEYCODE is set from ?k= at app.js:30 (load()
   has already run, so this writes back what was there plus the code). Then add a review or rules check: open /?k=X, read np6.k = X
   before set-up is finished.

2. COSMETIC (record). Builder's summary item 4 says hosted/v5/index.min.html was rebuilt. It is not in the diff and still carries the
   old wording ("This link needs the code from your coach's message. Open the link they sent you."). That is expected: build6 only
   refreshes the shared core in that page, and the core did not change. The live page is hosted/v6/index.min.html (PAGE_PATH), so clients
   are not affected. If the owner ever rolls back by removing PAGE_PATH, the v5 screens show the old wording.

3. COSMETIC (record). "v6 18/18" is 17 of 18 in eval/v6/results-live-r33.json (lose-diabetes-dinner: "tune failed: bad_request", the
   eval sent no grain), plus a rerun of that one scenario in results-live-r33-tune.json after the eval was fixed (passes). The commit
   message states this. The eval change (eval/v6/run.js:32 now sends grain) matches what the app sends (src/v6/app.js:95). No change to
   what a user sees. v5 26 of 26 and menu 8 of 8 confirmed from the files.

4. COSMETIC. Plate, no-code state, all widths (e.g. test/ux/out/screens/320-light/plate-no-code-3.png). The message card has no
   button, correctly, but the craving cards and the "Type a craving or a dish" field below stay active. Each tap leads to the same
   message. This was already so before; listed so the owner knows.

5. COSMETIC (carried from round 33, untouched by this diff): next question under the tab bar at 320 after No; 'or' grains in the answer
   line; a left-out grain still asked; a 'no roti' description line.

What holds
- The message, word by word: plain English, no jargon, no banned word, no secret shown, no figure, nothing that tells a client how to
  get past the lock (it only says to open the coach's link). Same text everywhere bad_key appears; no Try again is offered (NORETRY
  unchanged), which is right because trying again cannot help.
- Rendered: plate-no-code at 320, 360, 375, 390, 393, 412, 430, light and dark, and 360 at 130 % text. Read at 320 light/dark,
  360 light, 360 big text and 390 light (frames 1 to 4 at 320); light and dark frames are byte-identical at every width (owner
  decision D2, paper in dark mode). The message wraps in three lines at 320 and four at 360 with 130 % text, large ink on the surface
  card, no clipping, Raw Linen look, the same card as the other Plate errors. The plate area is empty, so the message is the first read.
- No change to the engine, safety lines (kidney, pregnancy, diabetes grain), units, bands, labels or focus in this diff. The note in
  docs/ux/UX-CRITERIA.md and the handoff decisions row record the owner's choice and pass the word check.

Not inspected
- The owner's own phone model and browser. In particular whether a link tapped in WhatsApp opens in a browser that shares storage
  with the browser where nextplate.in is later typed (WhatsApp in-app browser vs Chrome or Safari). If it does not, "this phone
  remembers it" is really "this browser remembers it", and no code change can fix that path.
- The bad_key message inside Rescue, Read the menu and "I had something else": not rendered by the review; same text and the same
  error styling as their other errors, read from source only.
- The full set-up then bad_key path end to end in a browser (I read it from source and probed storage; I did not click through set-up).
- The live server's reply to a missing or wrong code (server unchanged in this diff; not called).
- Live Gemini text variety; the films and audio by ear (films unchanged; measured only).
