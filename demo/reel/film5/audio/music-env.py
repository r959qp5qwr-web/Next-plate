# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""Score for the features film: score B spliced to 51 s (0-45 s + its closing chord), then set beat by beat so the voice sits about as far
above the music in every beat as in beats 1-2 (Critic round 1: the score swells in the second half and the ducking did not make up for it).
uv run music-env.py <score51.wav> -> music.wav.  Points are (film seconds, dB)."""
import sys, numpy as np, soundfile as sf, pathlib
x, sr = sf.read(sys.argv[1]); t = np.arange(len(x)) / sr
P = [(0, 0), (12.4, 0), (13.0, -2.5), (18.1, -2.5), (18.7, -5.5), (24.5, -5.5), (25.1, -7.6), (39.7, -7.7), (40.3, -9.5), (44.3, -9.5),
     (45.2, -6.5), (48.1, -6.5), (49.2, -2.0), (51.0, -2.0)]
g = 10 ** (np.interp(t, [p[0] for p in P], [p[1] for p in P]) / 20)
sf.write(pathlib.Path(__file__).parent / 'music.wav', x * (g[:, None] if x.ndim == 2 else g), sr)
print('music.wav written', len(x) / sr, 's')
