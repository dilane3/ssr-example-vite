import fs from "node:fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log({
  __filename,
  __dirname,
});

// Create server for production only
const handler = async (req, res) => {
  try {
    const url = req.url;

    let template;
    let render;

    // get the list of files from the current directory
    // console.log(__dirname)
    const files = await fs.readdir("..");

    console.log(files);

    // Always read fresh template in development
    const htmlFilePath = join(__dirname, "..", "dist/client", "index.html");
    const serverFilePath = join(
      __dirname,
      "..",
      "dist/server",
      "entry-server.js"
    );

    console.log({
      htmlFilePath,
      serverFilePath,
    });

    template = await fs.readFile(htmlFilePath, "utf-8");

    render = (await import(serverFilePath)).render;

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    console.log(rendered)

    // Set headers
    res.setHeader("Content-Type", "text/html");

    res.status(200).send(html);
  } catch (e) {
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
};

export default async (req, res) => {
  return await handler(req, res);
};
