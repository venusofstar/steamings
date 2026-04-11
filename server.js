import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

function decodeBase64(str) {
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return null;
  }
}

function encodeBase64(str) {
  return Buffer.from(str).toString("base64");
}

function absoluteUrl(base, relative) {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function isPlaylist(line) {
  return line.includes(".m3u8");
}

function isSegment(line) {
  return (
    line.includes(".ts") ||
    line.includes(".m4s") ||
    line.includes(".mp4") ||
    line.includes(".aac")
  );
}

app.get("/", async (req, res) => {
  try {
    const encodedUrl = req.query.url;
    const encodedHeaders = req.query.headers;

    if (!encodedUrl) {
      return res.status(400).send("Missing url");
    }

    const targetUrl = decodeBase64(encodedUrl);
    if (!targetUrl) {
      return res.status(400).send("Invalid URL encoding");
    }

    let customHeaders = {};

    if (encodedHeaders) {
      try {
        customHeaders = JSON.parse(decodeBase64(encodedHeaders));
      } catch {
        customHeaders = {};
      }
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...customHeaders,
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch stream");
    }

    const contentType = response.headers.get("content-type") || "";

    // Playlist
    if (
      contentType.includes("application/vnd.apple.mpegurl") ||
      contentType.includes("application/x-mpegURL") ||
      targetUrl.includes(".m3u8")
    ) {
      const text = await response.text();

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();

          if (
            !trimmed ||
            trimmed.startsWith("#") &&
            !trimmed.includes("URI=")
          ) {
            return line;
          }

          // Rewrite key URI
          if (line.includes('URI="')) {
            return line.replace(/URI="([^"]+)"/, (_, uri) => {
              const abs = absoluteUrl(targetUrl, uri);
              return `URI="/?url=${encodeBase64(abs)}${
                encodedHeaders ? `&headers=${encodedHeaders}` : ""
              }"`;
            });
          }

          if (isPlaylist(trimmed) || isSegment(trimmed)) {
            const abs = absoluteUrl(targetUrl, trimmed);
            return `/?url=${encodeBase64(abs)}${
              encodedHeaders ? `&headers=${encodedHeaders}` : ""
            }`;
          }

          return line;
        })
        .join("\n");

      res.setHeader(
        "Content-Type",
        "application/vnd.apple.mpegurl"
      );
      return res.send(rewritten);
    }

    // Segments / keys
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
