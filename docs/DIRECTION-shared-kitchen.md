# Direction: the shared kitchen (owner, 23 Nov 2026)

Status: owner direction for the next piece of work after the current gates pass. Recorded here so that it lives in product
state, not in conversation memory. Nothing in this file changes the current build, its safety rails or its gates.

## The promise (owner's sentence, word for word)

"Tell Next Plate what's already cooked. It shows you how to serve your meal in a way that fits the goal you're working on with Pushkal."

## Why the product exists (owner's reasoning, condensed)

- Clients often control what goes on their plate even when they have little control over what gets cooked. The family meal is
  already decided; the client still has a decision to make, several times a week, at the moment it matters.
- Niche: existing coaching clients who eat from a shared kitchen and regularly hesitate over portions. Start in Bengaluru,
  with households the owner knows and can learn from directly.
- The toughest comparison is a short WhatsApp message from the owner, or a portion guide the client already knows. A separate
  app earns its place only if it uses the dishes actually cooked, the client's goal and this meal's circumstances to give an
  answer the client can act on without the owner.

## The target experience (owner's example)

The client types "Rice, sambar and beans palya are ready." Next Plate shows one plate made from those three dishes. On the
first screen the client sees what to serve and how much. If the sambar is unusually thin, or the serving instruction is hard
to read, the client corrects that one detail without starting again. Then they put the phone down and eat.

## Fixed decisions (owner, 23 Nov)

| # | Decision | Notes for the build |
|---|---|---|
| SK1 | Show one plate first. If the client says "only these foods", honour it all the way through. Offer an addition only when the client asks how to improve the meal, or confirms another food is there. | No second plate adding curd or eggs by default. "Only these" needs a checker that refuses any dish or ingredient the client did not name. Today the engine checks this on the dormant menu path only (`onlyInBarred`); the plate asks have no such check. |
| SK2 | Make the portion understandable at the table. Keep grams available. | Watch how clients serve before choosing the cue: grams for clients who weigh food, a measured cue based on their own ladle or katori for clients who serve the same way every evening. This is design effort before any new score or nutrient detail. It touches the standing rule "grams and calories, not katori and fulka". A household-measure cue needs an owner ruling on that rule before it is built. |
| SK3 | "Under 30 seconds" is a test, not a model latency figure. | The clock starts when the client opens the app and stops when they can point to the food and say how much they will serve: typing, waiting, reading and interpreting are all inside. |
| SK4 | Build the smallest version that can settle the question. | In order: fix the known profile error that can invent measurements; make "use only what's cooked" reliable; put the dishes and serving amounts first on the phone. |
| SK5 | Field test: the two-week comparison with existing clients. | Judge three things per occasion when the decision arose: did they serve it, did they need the owner to translate or correct it, did they choose to use it again the next time. Count occasions, not daily opens. |

## Evidence bar

The strongest evidence would be a client saying, unprompted: "Everyone ate the same dinner. I knew how much to take, and I
didn't have to ask you." If that repeats across households, Next Plate has a clear place in the coaching practice.

## Open before this work starts

- O1. "The known profile error that can invent measurements": the source is the owner's Gemini review, which is not in this
  repository. The exact case is needed before it can be fixed and tested. The standing rule "never invent a clinical figure"
  already applies.
- O2. "Only these foods" defect: an old response tested against "only dal, rice and curd" was accepted with extra dishes.
  To be reproduced on the current build as the first failing test of SK1.
- O3. SK2 against the rule "grams and calories, not katori and fulka": a ladle cue is a household measure. Owner ruling needed.
