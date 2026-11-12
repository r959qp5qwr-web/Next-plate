# Features film (60 s), concept B: the day says, the plate answers

Script: docs/film/SCRIPT-features.md (owner-approved). Screens: demo/reel/capture-features.js (live engine) plus four from demo/reel/capture.js.
The .wav files are not in git. Rebuild them before a render, or the mix comes out with chimes only:
- voice: `ffmpeg -i audio/vo/take-a.mp3 -ar 44100 -ac 1 audio/vo/calm-a.wav && (cd audio && uv run place.py 51)` (cuts at measured pauses; the slogan is the 30 s film's own read, film4/audio/vo/end-a.mp3)
- score: `ffmpeg -i ../promo3/audio/src/score-b.mp3 -filter_complex "[0:a]atrim=0:45,asetpts=PTS-STARTPTS[a];[0:a]atrim=52.5:60,asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=1.5:c1=tri:c2=tri" -ar 48000 -ac 2 /tmp/score51.wav && (cd audio && uv run music-env.py /tmp/score51.wav)` (51 s, ends on its closing chord, set beat by beat under the voice)
- then, from demo/reel: sfx.mjs film5, render.mjs --film film5 --format 9x16 --video-only, mix.mjs film5 (motion-reel skill scripts).
Check before mixing: the render starts at 0.0 s with 3060 frames and decodes without errors (`ffprobe -count_frames`, `ffmpeg -v error -f null -`).
Check before sending: `test/films/check.sh` (picture from 0 s, a frame for every 1/60 s, no decode errors, no picture held 7 s or more, mean level near the 30 s film's, not near -23 dB). The Stop gate runs it too.

Cut 2 (owner's notes): cuts moved into the silences (the first cut cut inside words and clicked); close = "Next Plate. Made for you." as in the 30 s film, reply line on screen only; 60 s -> 51 s.

Cut 3 (Critic round 1): screens re-captured from the legibility build with the live engine; beat 2 shows the menu photo; the score sits under the voice evenly across all beats (audio/music-env.py).

Cut 4 (Critic round 6): the round 5 render was corrupt (129 frames from 48.85 s; the level check alone passed it). Rendered again, checked frame by frame, mixed, and the film check added to the gate.
