const idempotencyKey = () => {

}


// function attachIdempotencyKey(config: AxiosRequestConfig): void {
//     const m = config.method?.toUpperCase();
//     if (!m || !["POST", "PUT", "PATCH", "DELETE"].includes(m)) return;
//     config.headers = config.headers ?? {};
//     const h = config.headers as Record<string, string | undefined>;
//     if (h["Idempotency-Key"] ?? h["idempotency-key"]) return;
//     const sym = Symbol.for("archipatt.idempotencyKey");
//     type WithKey = AxiosRequestConfig & { [k: symbol]: string | undefined };
//     const w = config as WithKey;
//     if (!w[sym]) {
//         w[sym] =
//             typeof crypto !== "undefined" && "randomUUID" in crypto
//                 ? crypto.randomUUID()
//                 : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
//     }
//     h["Idempotency-Key"] = w[sym];
// }
