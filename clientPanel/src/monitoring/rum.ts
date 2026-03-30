import axios from "axios";

const SOURCE =
    (import.meta.env.VITE_RUM_SOURCE as string | undefined)?.trim() ||
    "web-clientPanel";

function monitoringBase(): string | null {
    const u = import.meta.env.VITE_MONITORING_URL as string | undefined;
    if (!u || typeof u !== "string" || !u.trim()) return null;
    return u.replace(/\/$/, "");
}

function postIngest(body: Record<string, unknown>): void {
    const base = monitoringBase();
    if (!base) return;
    void fetch(`${base}/public/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    }).catch(() => undefined);
}

type SendRumOpts = {
    kind: "rum" | "client";
    route?: string;
    path?: string;
    error?: boolean;
    durationMs?: number;
    statusCode?: number;
    message?: string;
};

export function sendRumEvent(opts: SendRumOpts): void {
    const traceId = crypto.randomUUID();
    const pathBase =
        opts.path ??
        opts.route ??
        (typeof window !== "undefined" ? window.location.pathname : "/");
    const path =
        opts.message && opts.kind === "client"
            ? `${pathBase}#${encodeURIComponent(opts.message.slice(0, 240))}`
            : pathBase;

    postIngest({
        traceId,
        source: SOURCE,
        kind: opts.kind,
        path,
        statusCode: opts.statusCode ?? 0,
        durationMs: opts.durationMs ?? 0,
        error: opts.error === true,
        at: Date.now(),
    });
}

export function sendRumNavigation(route: string): void {
    sendRumEvent({
        kind: "rum",
        route,
        error: false,
        durationMs: 0,
        statusCode: 200,
    });
}

export function sendRumReactError(error: Error): void {
    sendRumEvent({
        kind: "client",
        path: `${window.location.pathname}#react-boundary`,
        error: true,
        statusCode: 0,
        message: error.message,
    });
}

export function initRumMonitoring(): void {
    if (typeof window === "undefined") return;
    if (!monitoringBase()) return;

    window.addEventListener("error", (ev) => {
        sendRumEvent({
            kind: "client",
            path: `${window.location.pathname}#window-error`,
            error: true,
            statusCode: 0,
            message: ev.message || "window.error",
        });
    });

    window.addEventListener("unhandledrejection", (ev) => {
        const reason = ev.reason;
        const msg = reason instanceof Error ? reason.message : String(reason);
        sendRumEvent({
            kind: "client",
            path: `${window.location.pathname}#unhandledrejection`,
            error: true,
            statusCode: 0,
            message: msg,
        });
    });
}

export function reportAxiosError(err: unknown): void {
    if (!axios.isAxiosError(err)) return;
    const status = err.response?.status ?? 0;
    if (status === 401) return;

    const cfg = err.config;
    const url = cfg?.url ?? "";
    const base = cfg?.baseURL ?? "";
    const fullPath = `${base}${url}`.replace(/\s/g, "").slice(0, 500);
    const network = !err.response;
    const bad = network || status >= 500 || (status >= 400 && status !== 401);

    sendRumEvent({
        kind: "client",
        path: fullPath || window.location.pathname,
        error: bad,
        statusCode: status,
        durationMs: 0,
        message: err.message,
    });
}
