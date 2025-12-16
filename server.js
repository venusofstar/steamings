import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

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
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>M3U8 Dashboard</title>
<style>
body { font-family: Arial; background:#f4f4f4; padding:20px }
li { background:#fff; padding:10px; margin:10px 0; border-radius:6px }
input { padding:6px; width:60% }
button { padding:6px 12px; margin-left:5px; cursor:pointer }
.add { background:#28a745; color:#fff; border:none }
.edit { background:#ffc107; border:none }
.del { background:#dc3545; color:#fff; border:none }
</style>
</head>
<body>

<h1>HONOR TV Dashboard</h1>
<ul>
`;

  for (let key in streams) {
    html += `
<li>
<b>${key}</b><br>
<a href="/${key}/index.m3u8" target="_blank">Open Stream</a>

<form method="POST" action="/dashboard/edit" style="margin-top:5px">
  <input type="hidden" name="id" value="${key}">
  <input type="text" name="url" value="${streams[key]}" required>
  <button class="edit">Edit</button>
</form>

<form method="POST" action="/dashboard/delete" style="margin-top:5px">
  <input type="hidden" name="id" value="${key}">
  <button class="del">Delete</button>
</form>
</li>
`;
  }

  html += `
</ul>

<h2>Add New Stream</h2>
<form method="POST" action="/dashboard/add">
<input name="id" placeholder="stream id" required>
<input name="url" placeholder="m3u8 url" required>
<button class="add">Add</button>
</form>

</body>
</html>
`;
  res.send(html);
});

/**
 * ADD
 */
app.post("/dashboard/add", (req, res) => {
  const { id, url } = req.body;
  if (!id || !url || !url.endsWith(".m3u8")) {
    return res.send("Invalid input <a href='/dashboard'>Back</a>");
  }
  streams[id] = url;
  res.redirect("/dashboard");
});

/**
 * EDIT
 */
app.post("/dashboard/edit", (req, res) => {
  const { id, url } = req.body;
  if (!streams[id] || !url.endsWith(".m3u8")) {
    return res.send("Invalid edit <a href='/dashboard'>Back</a>");
  }
  streams[id] = url;
  res.redirect("/dashboard");
});

/**
 * DELETE
 */
app.post("/dashboard/delete", (req, res) => {
  const { id } = req.body;
  delete streams[id];
  res.redirect("/dashboard");
});

/**
 * Home
 */
app.get("/", (req, res) => {
  res.send("<h2>HONOR TV</h2>");
});

app.listen(PORT, () => console.log("Server running on port", PORT));
