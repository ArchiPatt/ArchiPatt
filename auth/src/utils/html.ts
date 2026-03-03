export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return c;
    }
  });
}

export function htmlPage(title: string, body: string) {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { background: #fff0f6; color: #831843; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 420px; margin: 40px auto; padding: 0 16px; }
      .card { background: #ffffff; border: 1px solid #f9a8d4; border-radius: 12px; padding: 16px; box-shadow: 0 8px 20px rgba(236, 72, 153, 0.12); }
      label { display:block; margin-top: 12px; font-size: 14px; }
      input { width: 100%; padding: 10px 12px; margin-top: 6px; border-radius: 10px; border: 1px solid #f9a8d4; }
      input:focus { outline: 2px solid #f472b6; border-color: #f472b6; }
      button { margin-top: 16px; width: 100%; padding: 10px 12px; border: 0; border-radius: 10px; background: #ec4899; color: #fff; font-weight: 600; cursor: pointer; }
      button:hover { background: #db2777; }
      .muted { color: #9d174d; font-size: 12px; margin-top: 8px; }
      .error { color: #be123c; font-size: 13px; margin-top: 8px; }
    </style>
  </head>
  <body>
    <div class="card">
      ${body}
    </div>
  </body>
</html>`;
}
