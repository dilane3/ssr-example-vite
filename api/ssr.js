import fs from "node:fs/promises";
import { renderPage } from "vike/server";

// We use JSDoc instead of TypeScript because Vercel seems buggy with /api/**/*.ts files

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Constants
  const isProduction = process.env.NODE_ENV === "production";

  // Cached production assets
  const templateHtml = isProduction
    ? await fs.readFile("/dist/client/index.html", "utf-8")
    : "";
  const ssrManifest = isProduction
    ? await fs.readFile("/dist/client/ssr-manifest.json", "utf-8")
    : undefined;

  try {
    const url = req.originalUrl;

    let template = templateHtml;
    let render = (await import("/dist/server/entry-server.js")).render;

    const rendered = await render(url, ssrManifest);

    console.log("rendered", rendered);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    console.log(e.stack);
    res.status(500).end(e.stack);
  }

  // const { url } = req
  // console.log('Request to url:', url)
  // if (url === undefined) throw new Error('req.url is undefined')

  // const pageContextInit = { urlOriginal: url }
  // const pageContext = await renderPage(pageContextInit)
  // const { httpResponse } = pageContext
  // console.log('httpResponse', !!httpResponse)

  // if (!httpResponse) {
  //   res.statusCode = 200
  //   res.end()
  //   return
  // }

  // const { body, statusCode, contentType } = httpResponse
  // res.statusCode = statusCode
  // res.setHeader('content-type', contentType)
  // res.end(body)
}
