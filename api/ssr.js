import fs from "node:fs/promises";

// Create server for production only
const handler = async (req, res) => {
  try {
    console.log(req);
    const url = req.url;

    let template;
    let render;

    // Always read fresh template in development
    template = await fs.readFile("../client/index.html", "utf-8");

    render = (await import("../server/entry-server.js")).render;

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
