import fs from "node:fs/promises";
import express from "express";
import ora from "ora";
import chalk from "chalk";
import os from "node:os";

// Constants
const isProduction = process.env.NODE_ENV === "production";

const port = process.env.PORT || isProduction ? 4320 : 5320;
const base = process.env.BASE || "/";

// Spinner
console.log("");
const spinner = ora({
  text: `Starting server in ${chalk.blue(
    isProduction ? "production" : "development"
  )} mode...`,
  color: "blue",
  spinner: "dots",
}).start();

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";
const ssrManifest = isProduction
  ? await fs.readFile("./dist/client/ssr-manifest.json", "utf-8")
  : undefined;

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
  app.use(base, sirv("./dist/client", { extensions: [] }));

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
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    } else {
      template = templateHtml;
      render = (await import("./dist/server/entry-server.js")).render;
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

// Start http server
app.listen(port, () => {
  setTimeout(() => {
    spinner.succeed(`${chalk.bold.blue("Rasengan App")} is running 🚀`);

    console.log("");

    console.log(
      `${chalk.bold("Local:")} ${chalk.blue(`http://localhost:${port}`)}`
    );

    const ipAddress = getIP();

    if (ipAddress) {
      console.log(
        `${chalk.bold("Network:")} ${chalk.blue(`http://${getIP()}:${port}`)}`
      );
    }
  }, 1000);
});

export const rasenganApp = app;
