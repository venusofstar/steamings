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
    "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1765832771/ei/4yNAaf7DEvq12roPzv_emQs/ip/112.205.135.106/id/n0q7qAEljA8.1~45720746/source/yt_live_broadcast/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/hfr/1/playlist_duration/30/manifest_duration/30/maudio/1/bui/AYUSA3An7fek690wEZX1up1iMtVIuQdl7FmHkOPUsA43CCsUT9by7WcoLDaBYEwYacHi2caEjNvOmWVS/spc/wH4Qq-O-tZK9iQ6ha_5CUEO9iRPD3mtKndr1KfvOaeWHr2ZRXqOqgE-5pT8/vprv/1/go/1/rqh/5/pacing/0/nvgoi/1/ncsapi/1/keepalive/yes/fexp/51331020%2C51552689%2C51565115%2C51565682%2C51580968/dover/11/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Chfr%2Cplaylist_duration%2Cmanifest_duration%2Cmaudio%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIhAKypzo5sCyC6-a0F5hvOtNFXIWldO8OD1TekIxlXR-YnAiBR0hC-8otWC1-wx9Yi_kQCTrMI42gvc3KrLpK5rGFpXA%3D%3D/file/index.m3u8"
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
