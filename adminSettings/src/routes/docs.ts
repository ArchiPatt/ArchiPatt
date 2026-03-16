import { FastifyInstance } from "fastify";
import path from "path";
import { readFile } from "fs/promises";

export function registerDocsRoutes(app: FastifyInstance) {
  app.get("/swagger.yml", async (_req, reply) => {
    const filePath = path.join(
      process.cwd(),
      "openapi",
      "admin-settings.openapi.yml",
    );
    const yml = await readFile(filePath, "utf-8");
    reply.type("useCases/yaml; charset=utf-8");
    return yml;
  });

  app.get("/swagger", async (_req, reply) => {
    reply.type("text/html; charset=utf-8");
    return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Admin Settings Swagger</title>
    <link rel="stylesheet" href="/swagger-static/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f0f4ff; }
      #swagger-ui { max-width: 1280px; margin: 0 auto; }
      .swagger-ui .topbar { display: none; }
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
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset]
      });
    </script>
  </body>
</html>`;
  });
}
