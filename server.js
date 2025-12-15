import express from "express";
import bodyParser from "body-parser";

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
 * Dashboard (accessible only via /dashboard)
 */
app.get("/dashboard", (req, res) => {
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>M3U8 Dashboard</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
      h1 { color: #333; }
      ul { list-style: none; padding: 0; }
      li { background: #fff; margin: 10px 0; padding: 10px; border-radius: 5px; }
      a { text-decoration: none; color: #007BFF; font-weight: bold; }
      a:hover { text-decoration: underline; }
      form { background: #fff; padding: 15px; border-radius: 5px; margin-top: 20px; }
      label { display: block; margin: 10px 0 5px; }
      input[type=text] { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
      button { margin-top: 10px; padding: 10px 20px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
      button:hover { background: #218838; }
    </style>
  </head>
  <body>
    <h1>M3U8 Short URL Dashboard</h1>
    <h2>Streams</h2>
    <ul>`;
  for (let key in streams) {
    html += `<li><a href="/${key}/index.m3u8" target="_blank">${key}</a></li>`;
  }
  html += `</ul>
    <h2>Add New Stream</h2>
    <form method="POST" action="/dashboard/add">
      <label>ID:</label>
      <input type="text" name="id" required>
      <label>URL (.m3u8):</label>
      <input type="text" name="url" required>
      <button type="submit">Add Stream</button>
    </form>
  </body>
  </html>
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
 * Home page (hidden dashboard link)
 */
app.get("/", (req, res) => {
  res.send(`
    <h2>Welcome to M3U8 Router</h2>
    <p>Access your streams directly via:</p>
    <ul>
      <li>/kapamilya/index.m3u8</li>
      <li>/gma/index.m3u8</li>
    </ul>
  `);
});

app.listen(PORT, () => console.log("Server running on port", PORT));
