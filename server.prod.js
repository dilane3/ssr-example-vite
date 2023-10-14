import fs from "node:fs/promises";

// Create server for production only
const handler = async (req, res) => {
  // Add Vite or respective production middlewares
  let vite;

  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base: "/",
  });

  try {
    const url = req.originalUrl.replace("/", "/");

    let template;
    let render;
    // Always read fresh template in development
    template = await fs.readFile("./index.html", "utf-8");
    template = await vite.transformIndexHtml(url, template);
    render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(rendered.statusCode).set(rendered.headers).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
};

export default handler;