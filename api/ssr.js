import fs from "node:fs/promises";
import express from "express";
import os from "node:os";

// Constants
const isProduction = process.env.NODE_ENV === "production";

const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile("/dist/client/index.html", "utf-8")
  : "";
const ssrManifest = isProduction
  ? await fs.readFile("/dist/client/ssr-manifest.json", "utf-8")
  : undefined;

console.log(templateHtml);

// Create http server
const app = express();

// Add Vite or respective production middlewares
let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(base, sirv("/dist/client", { extensions: [] }));

  // serves static
  app.use(express.static("./dist/client"));
}

// Serve HTML
app.use("*", async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, "/");

    let template;
    let render;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile("/index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    } else {
      template = templateHtml;
      render = (await import("/dist/server/entry-server.js")).render;
    }

    const rendered = await render(url, ssrManifest);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// Get local IP
export const getIP = () => {
  // Get network interfaces
  const networkInterfaces = os.networkInterfaces();

  // Find the IPv4 address for the default network interface
  let ipAddress = "";

  for (const interfaceName in networkInterfaces) {
    const iface = networkInterfaces[interfaceName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === "IPv4" && !alias.internal) {
        ipAddress = alias.address;
        break;
      }
    }
    if (ipAddress) {
      break;
    }
  }

  return ipAddress;
};

export default app;
