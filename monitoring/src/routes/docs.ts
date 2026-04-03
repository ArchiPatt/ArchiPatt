import path from "node:path";
import { readFile } from "node:fs/promises";
import type { FastifyInstance } from "fastify";

export function registerDocsRoutes(app: FastifyInstance) {
  app.get("/swagger.yml", async (_req, reply) => {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "openapi",
      "monitoring.openapi.yml",
    );
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
    <title>Monitoring API – Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #0f1419; }
      #swagger-ui { max-width: 1280px; margin: 0 auto; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
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
