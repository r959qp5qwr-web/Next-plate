# Sample window on the live service: 72758ac under its own prompt (16 Nov)

**Approval:** the owner chose option 2, a short sample window.

**Window:**
- The live service pointed at 72758ac for the window. The served page matched the repository byte for byte (`test/deploy/verify-live.sh`).
- Afterwards it returned to 6febc1a, and the served bytes were checked again.
- EVAL_CODE was set for the window and cleared after it.

**Calls:**
- 80 at-risk calls (`results-window-72758ac.json`), 79 answered.
- The original 18 meal scenarios and 8 menus (`eval/v6/results-*window-72758ac.json`).

## Plates and orders shown
- **At-risk sample:** 236 of 245 raw plates and orders are shown. Menus show at most 3 orders by design.
- **Every profile group gets its plates:**
  - diabetes with medicines: 18 of 18. The live build showed 17, and 4622220 under the old prompt would show 1. The prompt now asks for at least the usual size.
  - wheat-free: 18 of 18 (live 9).
- **Pizza menu, wheat-free client:** the engine's "Nothing on this menu fits your food rules (no meat, fish, egg or wheat)…". Live said "unreadable".
- **Original scenarios:**
  - 15 of 18 pass. The 3 failures are the follow-up one-tap call, which this runner sent without the tags the app sends (fixed in `eval/v6/run.js`). The app's own request body is accepted by the engine.
  - So **one-tap changes under the new prompt were not exercised live** in this window.
- **Original menus:** 8 of 8.

## Tags under the new prompt (hand-read)
- **918 plate items:** 342 declared "plain".
- **Where the word lists see a tag the model did not declare: 42 items.**
  - 36 are jowar, bajra, ragi or oats rotis read as wheat by the word "roti". That is the list, not the model.
  - 3 are lemon juice read as sweet.
  - 1 is "Ghee on roti" declared dairy.
  - 1 is "Hard boiled egg thokku" seen as a salty side.
  - 1 is "Rolled Oats Upma" seen as wheat.
  - **None is a missed barred tag for its profile.**
- **Shown names for the strictest profiles,** read by hand (Jain; vegan; dairy-, wheat-, nut- and soya-free; Jain with diabetes; vegan with BP): **no barred food shown.**
- **Soft spots:**
  - "Kala chana curry" for a Jain client. It usually has onion and garlic; it is a home plate the client cooks.
  - "Toasted whole wheat bread slice" for a vegan client. Bread may contain milk.
  - On the vegan South Indian menu, "Masala Dosa" and "Sambar Rice" with no request. Restaurants may use ghee.

## Menu requests (engine-written line)
- Jain requests on 3 north Indian dishes and on 3 canteen orders.
- "oil instead of ghee or butter" on pongal for a vegan client.
- "Go easy on the salt" on 3 buffet dishes for a BP client.
- **Open for the owner:**
  - the app now relies on the restaurant honouring the request;
  - a pre-made canteen "Veg Thali" was offered to a Jain client with a Jain request.
