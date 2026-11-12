# Next Plate promo film

`demo/next-plate-promo.mp4`: 80 s, 9:16, narrated in the owner's voice. It says what the app does for the person using it.
The film is code: `promo/film.js` paints any frame from its time, so it can be changed and rendered again.

| File | What it is |
|---|---|
| `promo/film.js` | The film. Scenes, type, camera, pen marks, sound list. |
| `promo/vo.js`, `promo/audio/place.py` | The narration on the beat grid. `place.py` holds the script and which take is used for each line. |
| `promo/audio/vo/` | The voiced takes (ElevenLabs, voice "Mine"), and their word timings. |
| `promo/assets/shots/` | Captures of the v6 Phase 1 screens at 3x. `promo/assets/rects.json`: where each element sits on them. |
| `capture.js` | Takes those captures from the page in `hosted/v6/` with the live engine answering. |
| `promo/docs/shotlist.md`, `promo/docs/critique.md` | The plan and the review rounds. |

## Change a line of narration
1. Voice the new line (ElevenLabs, voice "Mine") and save it in `promo/audio/vo/` as a new take, for example `l07c.mp3`.
2. In `promo/audio/place.py`, put the new text and take name on that line. Add its word timings to `promo/audio/vo/words.json`.
3. `uv run promo/audio/place.py` rewrites `vo.wav` and `vo.js`. Update the same sentence in `SEGS` in `film.js` (the film checks that the two match).
4. Render (below).

## Render
From this folder, with the motion-reel skill's scripts (`$S`):

    ffmpeg -i promo/audio/music.flac promo/audio/music.wav      # the music bed (its beat grid is promo/beats.json)
    uv run promo/audio/place.py                                 # the narration on the grid -> audio/vo.wav, vo.js
    node $S/render.mjs --film promo --format 9x16 --video-only
    node $S/sfx.mjs promo && node $S/mix.mjs promo                            # -> out/promo/final.mp4

The `.wav` files and `out/` are not kept in the repository; they are rebuilt by the steps above.

## Re-rendering film4 (the approved 30 s film)
`film4/audio/vo.wav` and `music.wav` are not in git, so `mix.mjs` on a fresh clone mixes only the chimes and still reports success.
When only the screens change (timeline, `vo.js` and `beats.json` unchanged), keep the approved soundtrack:
render with `--video-only`, then `ffmpeg -i out/film4/video_9x16.mp4 -i <approved film> -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart <out>`.
Before sending, check the level: `ffmpeg -i <film> -vn -af volumedetect -f null -` should read a mean near -16.7 dB (chimes alone read about -23 dB).
