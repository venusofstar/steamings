import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

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
 * IMPORTANT: exact route
 */
app.get("/:id/index.m3u8", (req, res) => {
  const id = req.params.id;

  console.log("Requested:", id);

  if (!streams[id]) {
    return res.status(404).send("Stream not found");
  }

  return res.redirect(streams[id]);
});

/**
 * Root test
 */
app.get("/", (req, res) => {
  res.send("OK – M3U8 Router Running");
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
