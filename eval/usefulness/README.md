# Usefulness replay (15 Nov)

These scripts replay raw live model replies recorded in `eval/v6` through a build's own checks. Each build is unpacked with `git archive <commit> hosted/v6`. The tags are supplied from the engine's word lists plus a fixed grain list, as a stand-in for an honest model.

    node eval/usefulness/harness-check.js <unpacked 6febc1a> .          # replay matches the plates shown on the build that recorded them
    node eval/usefulness/replay-meals-clean.js <unpacked build> . [plain] # r33 and r37 only; "plain" for builds that need a plain tag
    node eval/usefulness/replay-menu.js <unpacked build> . [plain]

`clean-*.json` holds the clean-corpus results for 6febc1a, 06d880f and fa486dd. The reading is in `docs/review/usefulness-brief.md`.
