export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Мониторинг – шлюз и сервисы</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --bg: #0f1419;
      --panel: #1a2332;
      --text: #e7ecf3;
      --muted: #8b9aad;
      --accent: #3d9eff;
      --error: #f87171;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #2a3545;
      background: var(--panel);
    }
    header h1 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    header p { margin: 0.35rem 0 0; color: var(--muted); font-size: 0.9rem; }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 1.25rem 1.5rem; }
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .tile {
      background: var(--panel);
      border-radius: 10px;
      padding: 1rem 1.15rem;
      border: 1px solid #2a3545;
    }
    .tile .label { color: var(--muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .tile .value { font-size: 1.55rem; font-weight: 700; margin-top: 0.35rem; }
    .tile.error .value { color: var(--error); }
    .charts { display: grid; gap: 1.25rem; }
    @media (min-width: 900px) {
      .charts { grid-template-columns: 1fr 1fr; }
    }
    .chart-box {
      background: var(--panel);
      border-radius: 10px;
      padding: 1rem;
      border: 1px solid #2a3545;
    }
    .chart-box h2 { margin: 0 0 0.75rem; font-size: 0.95rem; color: var(--muted); font-weight: 600; }
    .chart-wrap { position: relative; height: 220px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      margin-top: 1.5rem;
    }
    th, td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid #2a3545; }
    th { color: var(--muted); font-weight: 600; }
    tr.err td { color: var(--error); }
    .mono { font-family: ui-monospace, monospace; font-size: 0.75rem; }
  </style>
</head>
<body>
  <header>
    <h1>Мониторинг</h1>
    <p>Шлюз (сервер), клиенты (SPA/WebView через /public/ingest) – окно: последний час</p>
  </header>
  <div class="wrap">
    <div class="tiles">
      <div class="tile"><div class="label">Запросов</div><div class="value" id="t-total">–</div></div>
      <div class="tile error"><div class="label">Ошибки (5xx / клиент)</div><div class="value" id="t-err">–</div></div>
      <div class="tile error"><div class="label">% ошибок</div><div class="value" id="t-rate">–</div></div>
      <div class="tile"><div class="label">Ср. время ответа, мс</div><div class="value" id="t-lat">–</div></div>
    </div>
    <div class="charts">
      <div class="chart-box">
        <h2>Запросы и ошибки по минутам</h2>
        <div class="chart-wrap"><canvas id="ch-req"></canvas></div>
      </div>
      <div class="chart-box">
        <h2>Средняя задержка по минутам</h2>
        <div class="chart-wrap"><canvas id="ch-lat"></canvas></div>
      </div>
    </div>
    <h2 style="margin-top:1.5rem;font-size:0.95rem;color:var(--muted)">Последние события</h2>
    <p style="color:var(--muted);font-size:0.8rem;margin:0 0 0.5rem"><a href="/swagger" style="color:var(--accent)">OpenAPI (Swagger)</a></p>
    <table><thead><tr>
      <th>Время</th><th>Источник</th><th>Трасса</th><th>Метод</th><th>Путь</th><th>Статус</th><th>мс</th>
    </tr></thead><tbody id="tb"></tbody></table>
  </div>
  <script>
    const lbl = (t) => {
      const d = new Date(t);
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };
    let chartReq, chartLat;
    function initCharts() {
      const ro = { responsive: true, maintainAspectRatio: false };
      chartReq = new Chart(document.getElementById('ch-req'), {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            { label: 'Успешные', data: [], backgroundColor: 'rgba(61,158,255,0.7)' },
            { label: 'Ошибки', data: [], backgroundColor: 'rgba(248,113,113,0.75)' }
          ]
        },
        options: {
          ...ro,
          scales: {
            x: { stacked: true, ticks: { color: '#8b9aad' }, grid: { color: '#2a3545' } },
            y: { stacked: true, beginAtZero: true, ticks: { color: '#8b9aad' }, grid: { color: '#2a3545' } }
          },
          plugins: { legend: { labels: { color: '#e7ecf3' } } }
        }
      });
      chartLat = new Chart(document.getElementById('ch-lat'), {
        type: 'line',
        data: {
          labels: [],
          datasets: [{ label: 'мс', data: [], borderColor: '#3d9eff', tension: 0.2, fill: false }]
        },
        options: {
          ...ro,
          scales: {
            x: { ticks: { color: '#8b9aad' }, grid: { color: '#2a3545' } },
            y: { beginAtZero: true, ticks: { color: '#8b9aad' }, grid: { color: '#2a3545' } }
          },
          plugins: { legend: { labels: { color: '#e7ecf3' } } }
        }
      });
    }
    async function refresh() {
      const r = await fetch('/api/metrics/summary?windowMinutes=60');
      const d = await r.json();
      document.getElementById('t-total').textContent = d.totalRequests;
      document.getElementById('t-err').textContent = d.errorRequests;
      document.getElementById('t-rate').textContent = d.errorRatePercent + '%';
      document.getElementById('t-lat').textContent = d.avgDurationMs;
      const s = d.series || [];
      const labels = s.map(x => lbl(x.t));
      const ok = s.map(x => x.count - x.errors);
      const bad = s.map(x => x.errors);
      const avgMs = s.map(x => x.count ? Math.round(x.totalDurationMs / x.count) : 0);
      if (!chartReq) initCharts();
      chartReq.data.labels = labels;
      chartReq.data.datasets[0].data = ok;
      chartReq.data.datasets[1].data = bad;
      chartReq.update();
      chartLat.data.labels = labels;
      chartLat.data.datasets[0].data = avgMs;
      chartLat.update();
      const tb = document.getElementById('tb');
      tb.innerHTML = (d.recent || []).map(ev => '<tr class="' + (ev.error ? 'err' : '') + '">' +
        '<td class="mono">' + ev.at.slice(11, 19) + '</td>' +
        '<td class="mono">' + (ev.source || '–') + '</td>' +
        '<td class="mono" title="' + ev.traceId + '">' + ev.traceId.slice(0, 8) + '…</td>' +
        '<td>' + ev.method + '</td>' +
        '<td class="mono">' + (ev.path.length > 48 ? ev.path.slice(0, 46) + '…' : ev.path) + '</td>' +
        '<td>' + ev.statusCode + '</td>' +
        '<td>' + ev.durationMs + '</td></tr>').join('');
    }
    initCharts();
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`;
}
