#!/usr/bin/env bash
# Picture and sound check for the delivered films (Critic round 6: a film passed the level check with no picture).
# For each film and its WhatsApp copy: the video starts at 0 s, has a frame for every 1/fps of its length,
# decodes without errors, never holds one picture for 7 s or more, and the sound sits near the 30 s film's level (not chimes only).
# Exit 0 when every film holds, 1 otherwise.
cd "$(dirname "$0")/../.." || exit 2
bad=0
for f in demo/next-plate-film-30s.mp4 demo/next-plate-film-30s-whatsapp.mp4 demo/next-plate-features-51s.mp4 demo/next-plate-features-51s-whatsapp.mp4; do
  [ -f "$f" ] || { echo "FAIL $f: missing"; bad=1; continue; }
  st=$(ffprobe -v error -select_streams v:0 -show_entries stream=start_time -of csv=p=0 "$f")
  fr=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$f")
  vd=$(ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "$f")
  n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f")
  err=$(ffmpeg -v error -i "$f" -f null - 2>&1 | wc -l)
  frz=$(ffmpeg -v info -i "$f" -vf "freezedetect=n=0.001:d=7" -an -f null - 2>&1 | sed -n 's/.*freeze_duration: \([0-9.]*\).*/\1/p' | sort -n | tail -1)
  mean=$(ffmpeg -i "$f" -af volumedetect -vn -f null - 2>&1 | sed -n 's/.*mean_volume: \(-*[0-9.]*\) dB.*/\1/p')
  verdict=$(python3 -c "
st=float('$st' or 99); a,b='$fr'.split('/'); fps=float(a)/float(b); d=float('$vd'); n=int('$n' or 0); m=float('$mean' or -99); e=int('$err'); fz=float('$frz' or 0)
want=d*fps; probs=[]
if abs(st)>0.05: probs.append('video starts at %.2f s'%st)
if n<0.97*want: probs.append('%d frames for %.1f s at %g fps (%d expected)'%(n,d,fps,want))
if e>0: probs.append('%d decode errors'%e)
if fz>=7: probs.append('picture frozen for %.1f s'%fz)
if m<-20: probs.append('mean level %.1f dB (chimes only?)'%m)
print('FAIL '+'; '.join(probs) if probs else 'ok   %d frames from %.2f s, %.1f s at %g fps, %.1f dB, no decode errors, no freeze of 7 s'%(n,st,d,fps,m))")
  echo "$verdict  $f"; case "$verdict" in FAIL*) bad=1;; esac
done
exit $bad
