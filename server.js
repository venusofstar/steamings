import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Preloaded streams
const streams = {
  kapamilya: "",
  gma: "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1765895786/ei/ChpBadzXLOHN2roP64iw-A4/ip/180.190.172.13/id/SKtm0Unev4Q.1/source/yt_live_broadcast/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/tx/51666465/txs/51666463%2C51666464%2C51666465%2C51666466%2C51666467/hfr/1/playlist_duration/30/manifest_duration/30/maudio/1/gcr/ph/bui/AYUSA3CSRdIalpJWgLPwT6Wv7-G9c9s1SvKwMl2SaDwDf_vbP7D-02EOfO8GylQOEuGYufcL1aeZDrmv/spc/wH4Qq0sDFMtWfDcFH4JDAmyEMChWP46EfQQ0HuzGXwlzqBugxFUkstQ_EMn3ITHXENSy6hcb/vprv/1/go/1/ns/nJ856A8d-bZ7kIE9OVbmzOYR/rqh/5/pacing/0/nvgoi/1/ncsapi/1/keepalive/yes/fexp/51331020%2C51552689%2C51565116%2C51565681%2C51580968%2C51626155/dover/11/n/Tx9wIVVEKglHh3gARCP/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cplaylist_duration%2Cmanifest_duration%2Cmaudio%2Cgcr%2Cbui%2Cspc%2Cvprv%2Cgo%2Cns%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgDwbl3emwsHIg97NzFkQw3LaHPlIaEcCwDvidv2Z-IvwCIQCXR3nvYYhUAoCLIKoEJ1QRr8u11HtYYOGS442n4utV_A%3D%3D/file/index.m3u8",
};

// Redirect to M3U8 URL
app.get("/:id/index.m3u8", (req, res) => {
  const id = req.params.id;
  if (!streams[id]) return res.status(404).send("Stream not found");
  res.redirect(streams[id]);
});

// Dashboard
app.get("/dashboard", (req, res) => {
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>HONOR TV Dashboard</title>
    <style>
      body { font-family: Arial; background:#f4f4f4; padding:20px; }
      li { background:#fff; padding:10px; margin:10px 0; border-radius:6px; }
      input { padding:6px; width:60%; }
      button { padding:6px 12px; margin-left:5px; cursor:pointer; }
      .add { background:#28a745; color:#fff; border:none; }
      .edit { background:#ffc107; border:none; }
      .del { background:#dc3545; color:#fff; border:none; }
    </style>
  </head>
  <body>
    <h1>HONOR TV Dashboard</h1>
    <ul>`;
  
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
    </li>`;
  }

  html += `
    </ul>
    <h2>Add New Stream</h2>
    <form method="POST" action="/dashboard/add">
      <input name="id" placeholder="Stream ID" required>
      <input name="url" placeholder="M3U8 URL" required>
      <button class="add">Add</button>
    </form>
  </body>
  </html>`;
  
  res.send(html);
});

// Add stream
app.post("/dashboard/add", (req, res) => {
  const { id, url } = req.body;
  if (!id || !url || !url.endsWith(".m3u8")) {
    return res.send("Invalid input. <a href='/dashboard'>Go back</a>");
  }
  streams[id] = url;
  res.redirect("/dashboard");
});

// Edit stream
app.post("/dashboard/edit", (req, res) => {
  const { id, url } = req.body;
  if (!streams[id] || !url.endsWith(".m3u8")) {
    return res.send("Invalid edit. <a href='/dashboard'>Go back</a>");
  }
  streams[id] = url;
  res.redirect("/dashboard");
});

// Delete stream
app.post("/dashboard/delete", (req, res) => {
  const { id } = req.body;
  delete streams[id];
  res.redirect("/dashboard");
});

// Home page (hidden links)
app.get("/", (req, res) => {
  res.send(`
    <h2>Welcome to HONOR TV</h2>
    <p>Streams are hidden. Access the dashboard to manage streams.</p>
  `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
