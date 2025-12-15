import express from "express";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// parse JSON and form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Preloaded streams
 */
const streams = {
  kapamilya:
    "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1765826181/ei/JQpAaYenG67H0-kP37Ct-Ag/ip/126.209.53.186/id/rc4KfaBrGIc.1/source/yt_live_broadcast/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/file/index.m3u8",
  gma:
    "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1765809651/ei/k8k_abjZJYaq2roPkpPvuQ0/ip/180.190.223.161/id/n0q7qAEljA8.1/source/yt_live_broadcast/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/file/index.m3u8"
};

/**
 * Serve M3U8 redirect
 */
app.get("/:id/index.m3u8", (req, res) => {
  const id = req.params.id;
  if (!streams[id]) return res.status(404).send("Stream not found");
  res.redirect(streams[id]);
});

/**
 * Dashboard
 */
app.get("/dashboard", (req, res) => {
  let html = `
    <h1>M3U8 Short URL Dashboard</h1>
    <h2>Streams</h2>
    <ul>`;
  for (let key in streams) {
    html += `<li><a href="/${key}/index.m3u8" target="_blank">${key}</a></li>`;
  }
  html += `</ul>
    <h2>Add New Stream</h2>
    <form method="POST" action="/dashboard/add">
      <label>ID: <input type="text" name="id" required></label><br>
      <label>URL (.m3u8): <input type="text" name="url" required></label><br>
      <button type="submit">Add Stream</button>
    </form>
  `;
  res.send(html);
});

/**
 * Handle adding new stream
 */
app.post("/dashboard/add", (req, res) => {
  const { id, url } = req.body;
  if (!id || !url || !url.endsWith(".m3u8")) {
    return res.send("Invalid ID or URL. <a href='/dashboard'>Go back</a>");
  }
  streams[id] = url;
  res.redirect("/dashboard");
});

/**
 * Root
 */
app.get("/", (req, res) => {
  res.send(`
    <h2>M3U8 Router Running</h2>
    <p>Go to <a href="/dashboard">Dashboard</a></p>
  `);
});

app.listen(PORT, () => console.log("Server running on port", PORT));
