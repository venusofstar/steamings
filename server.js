import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * In-memory storage
 * idname => real m3u8 url
 */
const streams = new Map();

/**
 * Create short M3U8 URL
 * POST /create
 * body: { "id": "nba1", "url": "https://real-site/live/index.m3u8" }
 */
app.post("/create", (req, res) => {
  const { id, url } = req.body;

  if (!id || !url || !url.endsWith(".m3u8")) {
    return res.status(400).json({ error: "Invalid id or m3u8 url" });
  }

  streams.set(id, url);

  res.json({
    short_url: `${req.protocol}://${req.get("host")}/${id}/index.m3u8`
  });
});

/**
 * Serve M3U8
 * GET /idname/index.m3u8
 */
app.get("/:id/index.m3u8", async (req, res) => {
  const target = streams.get(req.params.id);

  if (!target) {
    return res.status(404).send("Stream not found");
  }

  // Redirect (best for IPTV players)
  res.redirect(target);
});

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("M3U8 Short URL Service Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
