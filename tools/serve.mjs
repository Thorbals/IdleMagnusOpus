import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.argv[2] ?? 8771);
const HOST = "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  response.end(body);
}

const server = createServer((request, response) => {
  let pathname = "/";

  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
  } catch {
    send(response, 400, "Bad request");
    return;
  }

  let filePath = normalize(join(ROOT, pathname === "/" ? "index.html" : pathname));

  if (!filePath.startsWith(ROOT)) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    if (statSync(filePath).isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    const stat = statSync(filePath);
    const type = MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": type,
      "Content-Length": stat.size,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    createReadStream(filePath).pipe(response);
  } catch {
    send(response, 404, "Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Idleness dev server: http://${HOST}:${PORT}/`);
});
