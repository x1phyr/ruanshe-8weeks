#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, "../out");

const PORT = parseInt(process.env.PORT || "43180", 10);
const HOST = process.env.HOST || "0.0.0.0";
const BASE_PATH = "/ruanshe-8weeks";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

function resolveFilePath(reqUrl) {
  let pathname = decodeURIComponent(new URL(reqUrl, `http://localhost:${PORT}`).pathname);

  // Strip basePath if present
  if (pathname.startsWith(BASE_PATH)) {
    pathname = pathname.slice(BASE_PATH.length);
  }

  if (pathname === "" || pathname === "/") {
    pathname = "/index.html";
  }

  let fullPath = path.join(OUT_DIR, pathname);

  // If path is a directory, look for index.html inside it
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const candidate = path.join(fullPath, "index.html");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // If file exists directly
  if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
    return fullPath;
  }

  // If file + .html exists (e.g. /cases -> /cases.html)
  if (fs.existsSync(`${fullPath}.html`)) {
    return `${fullPath}.html`;
  }

  // If path with /index.html exists
  const idxPath = path.join(fullPath, "index.html");
  if (fs.existsSync(idxPath)) {
    return idxPath;
  }

  // Fallback 404
  const notFound = path.join(OUT_DIR, "404.html");
  if (fs.existsSync(notFound)) {
    return notFound;
  }

  return null;
}

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Redirect root / to /ruanshe-8weeks/ for seamless browser navigation
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  if (urlObj.pathname === "/") {
    res.writeHead(302, { Location: `${BASE_PATH}/` });
    res.end();
    return;
  }

  const filePath = resolveFilePath(req.url);

  if (!filePath || !fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404 Not Found</h1><p>Requested asset was not found.</p>");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Internal Server Error: ${err.message}`);
  }
});

server.listen(PORT, HOST, () => {
  console.log("\n=======================================================");
  console.log("  🚀 软考软件设计师 8周通关与极限冲刺系统 已启动");
  console.log("=======================================================");
  console.log(`  本地访问地址 (Local):    http://localhost:${PORT}${BASE_PATH}/`);
  console.log(`  根路径重定向 (Root):     http://localhost:${PORT}/`);
  console.log(`  网络访问地址 (Network):  http://127.0.0.1:${PORT}${BASE_PATH}/`);
  console.log("=======================================================\n");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\x1b[31m[ERROR]\x1b[0m 端口 ${PORT} 已被占用，请设置 PORT 环境变量重试，例如: PORT=43181 ./start.sh`);
  } else {
    console.error(`\x1b[31m[ERROR]\x1b[0m 服务启动失败: ${err.message}`);
  }
  process.exit(1);
});
