import fs from "node:fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create server for production only
const handler = async (event, context) => {
  try {
    // Get the request URL
    const requestUrl =
      event.headers["referer"] ||
      event.headers["origin"] ||
      event.headers["host"];

    // If you want to get the full URL including path and query parameters:
    const url = `${requestUrl}${event.path}`;

    let template;
    let render;
    let manifest;

    // Always read fresh template in development
    const htmlFilePath = join(__dirname, "..", "dist/client", "index.html");
    const serverFilePath = join(
      __dirname,
      "..",
      "dist/server",
      "entry-server.js"
    );
    const ssrManifestFilePath = join(
      __dirname,
      "..",
      "dist/client",
      "ssr-manifest.json"
    );

    template = await fs.readFile(htmlFilePath, "utf-8");
    render = (await import(serverFilePath)).render;
    manifest = await fs.readFile(ssrManifestFilePath, "utf-8");

    const rendered = await render(url, manifest);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: html,
    };
  } catch (e) {
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
};

export default async (event, context) => {
  return await handler(event, context);
};
