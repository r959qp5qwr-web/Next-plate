# Next Plate: one Bun file that serves the page and answers /api/<kind>.
# Not the live path: live runs as a Bun Function whose start command inlines src/v5/server.ts (handoff-next-plate.md, deploy).
# Kept so a container build runs the same server as live.
FROM oven/bun:1
WORKDIR /app
COPY src/v5/server.ts ./server.ts
CMD ["bun", "server.ts"]
