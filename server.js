import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

function decodeBase64(str) {
  return Buffer.from(str, "base64").toString("utf8");
}

function encodeBase64(str) {
  return Buffer.from(str).toString("base64");
}

app.get("/", async (req, res) => {
  try {
    const target = decodeBase64(req.query.url || "");
    if (!target) return res.send("Missing URL");

    let headers = {};
    if (req.query.headers) {
      headers = JSON.parse(decodeBase64(req.query.headers));
    }

    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        ...headers
      }
    });

    const text = await response.text();

    const base = new URL(target);

    const rewritten = text.split("\n").map(line => {
      if (
        line &&
        !line.startsWith("#")
      ) {
        const abs = new URL(line, base).href;
        return `/?url=${encodeBase64(abs)}${
          req.query.headers ? `&headers=${req.query.headers}` : ""
        }`;
      }
      return line;
    }).join("\n");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(rewritten);

  } catch (e) {
    res.status(500).send("Proxy error: " + e.message);
  }
});

app.listen(PORT, () => {
  console.log("Server running");
});
