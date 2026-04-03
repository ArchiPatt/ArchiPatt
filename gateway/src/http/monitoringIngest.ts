function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function backoffMs(attemptIndex: number): number {
  return 80 * 2 ** attemptIndex + Math.floor(Math.random() * 50);
}

/**
 * Доставка телеметрии в monitoring без circuit breaker (не блокируем шлюз при падении мониторинга)
 */
export async function postMonitoringIngest(
  url: string,
  bodyJson: string,
): Promise<void> {
  const max = 4;
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 2500);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyJson,
        signal: ac.signal,
      });
      clearTimeout(t);
      if (res.ok) return;
      if (res.status >= 400 && res.status < 500) return;
    } catch {
      /* сеть / abort */
    }
    if (attempt < max - 1) await sleep(backoffMs(attempt));
  }
}
