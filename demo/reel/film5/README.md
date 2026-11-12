# Features film (60 s), concept B: the day says, the plate answers

Script: docs/film/SCRIPT-features.md (owner-approved). Screens: demo/reel/capture-features.js (live engine) plus four from demo/reel/capture.js.
The .wav files are not in git. Rebuild them before a render, or the mix comes out with chimes only:
- voice: `ffmpeg -i audio/vo/take-a.mp3 -ar 44100 -ac 1 audio/vo/calm-a.wav && (cd audio && uv run place.py 60)`
- score: `ffmpeg -i ../promo3/audio/src/score-b.mp3 -t 60 -af "afade=t=out:st=58.6:d=1.4" -ar 48000 -ac 2 audio/music.wav`
- then, from demo/reel: sfx.mjs film5, render.mjs --film film5 --format 9x16 --video-only, mix.mjs film5 (motion-reel skill scripts).
Check before sending: the mean level (ffmpeg volumedetect) should sit near the 30 s film's, not near -23 dB.
