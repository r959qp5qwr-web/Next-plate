# Next Plate: one Bun file that serves the page and answers /api/ask.
FROM oven/bun:1
WORKDIR /app
COPY hosted/v4/server.ts ./server.ts
CMD ["bun", "server.ts"]
