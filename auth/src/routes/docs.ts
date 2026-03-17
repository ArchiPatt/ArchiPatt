import { FastifyInstance } from "fastify";
import path from "path";
import { readFile } from "fs/promises";

export function registerDocsRoutes(app: FastifyInstance) {
  app.get("/swagger.yml", async (_req, reply) => {
    const filePath = path.join(__dirname, "..", "..", "openapi", "auth.openapi.yml");
    const yml = await readFile(filePath, "utf-8");
    reply.type("application/yaml; charset=utf-8");
    return yml;
  });

  app.get("/swagger", async (_req, reply) => {
    reply.type("text/html; charset=utf-8");
    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Auth Swagger</title>
    <link rel="stylesheet" href="/swagger-static/swagger-ui.css" />
    <style>
      :root {
        --pink-50: #fff1f8;
        --pink-100: #ffe4f1;
        --pink-200: #fbcfe8;
        --pink-300: #f9a8d4;
        --pink-400: #f472b6;
        --pink-500: #ec4899;
        --pink-600: #db2777;
        --pink-700: #be185d;
        --pink-800: #9d174d;
      }

      body { margin: 0; background: var(--pink-50); }
      #swagger-ui { max-width: 1280px; margin: 0 auto; }
      .swagger-ui { color: var(--pink-800); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 24px 0; }
      .swagger-ui .scheme-container {
        background: #fff;
        border: 1px solid var(--pink-200);
        box-shadow: 0 8px 20px rgba(236, 72, 153, 0.1);
      }
      .swagger-ui .opblock-tag {
        border-bottom: 1px solid var(--pink-200);
        color: var(--pink-800);
      }
      .swagger-ui .opblock.opblock-get {
        border-color: var(--pink-300);
        background: linear-gradient(0deg, rgba(249,168,212,.10), rgba(249,168,212,.10));
      }
      .swagger-ui .opblock.opblock-post {
        border-color: var(--pink-400);
        background: linear-gradient(0deg, rgba(244,114,182,.10), rgba(244,114,182,.10));
      }
      .swagger-ui .opblock .opblock-summary {
        border-color: var(--pink-200);
      }
      .swagger-ui .opblock .opblock-summary-method {
        background: var(--pink-600) !important;
        color: #fff !important;
      }
      .swagger-ui .opblock-summary-method.get,
      .swagger-ui .opblock-summary-method.post,
      .swagger-ui .opblock-summary-method.put,
      .swagger-ui .opblock-summary-method.patch,
      .swagger-ui .opblock-summary-method.delete,
      .swagger-ui .opblock-summary-method.options,
      .swagger-ui .opblock-summary-method.head {
        background: var(--pink-600) !important;
        color: #fff !important;
      }
      .swagger-ui .btn,
      .swagger-ui .btn.execute,
      .swagger-ui .authorize {
        border-color: var(--pink-500) !important;
        color: #fff !important;
        background: var(--pink-500) !important;
      }
      .swagger-ui .btn:hover,
      .swagger-ui .btn.execute:hover,
      .swagger-ui .authorize:hover {
        background: var(--pink-600) !important;
        border-color: var(--pink-600) !important;
      }
      .swagger-ui .auth-wrapper .authorize {
        background: var(--pink-500) !important;
        border-color: var(--pink-500) !important;
        color: #fff !important;
      }
      .swagger-ui .auth-wrapper .authorize svg {
        fill: #fff !important;
      }
      .swagger-ui input,
      .swagger-ui textarea,
      .swagger-ui select {
        border-color: var(--pink-300);
      }
      .swagger-ui input:focus,
      .swagger-ui textarea:focus,
      .swagger-ui select:focus {
        border-color: var(--pink-500);
        box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2);
        outline: none;
      }
      .swagger-ui .model-box,
      .swagger-ui .responses-inner h4,
      .swagger-ui .responses-inner h5,
      .swagger-ui table thead tr td,
      .swagger-ui table thead tr th {
        background: var(--pink-100);
        color: var(--pink-800);
      }
      .swagger-ui .tab li {
        color: var(--pink-700);
      }
      .swagger-ui .tab li.active {
        border-bottom-color: var(--pink-500);
        color: var(--pink-600);
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/swagger-static/swagger-ui-bundle.js"></script>
    <script src="/swagger-static/swagger-ui-standalone-preset.js"></script>
    <script>
      SwaggerUIBundle({
        url: "/swagger.yml",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "BaseLayout"
      });
    </script>
  </body>
</html>`;
  });
}
