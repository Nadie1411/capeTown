/* Production entry point for hosts that run a Node.js "startup file" (cPanel / Passenger, PM2, plain `node server.js`).
   Serves the pre-built Next.js app from ./.next on the port the host provides (PORT) — defaults to 3000. */
const { createServer } = require("node:http");
const path = require("node:path");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Cape Town site ready on port ${port} (base path: ${process.env.NEXT_PUBLIC_BASE_PATH || "/"})`);
  });
}).catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
