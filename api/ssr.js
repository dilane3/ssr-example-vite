import fs from "node:fs/promises";

// Create server for production only
const handler = async (req, res) => {
  try {
    const url = req.url;

    let template;
    let render;

    // get the list of files from the current directory
    const files = await fs.readdir("./dist/server");

    console.log(files);

    // Always read fresh template in development
    template = await fs.readFile("./dist/client/index.html", "utf-8");

    render = (await import("./dist/server/entry-server.js")).render;

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(rendered.statusCode).set(rendered.headers).end(html);
  } catch (e) {
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
};

export default async (req, res) => {
  return await handler(req, res);
};
