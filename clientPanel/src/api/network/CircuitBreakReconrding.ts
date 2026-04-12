import type {AxiosError} from "axios";
import {gatewayCircuit} from "../../monitoring/gatewayResilience.ts";

const recordCircuitOnFinalError = (error: AxiosError) => {
    const s = error.response?.status;
    if (s === 401) {
        gatewayCircuit.recordSuccess();
        return;
    }
    if (
        !error.response ||
        (s !== undefined && (s >= 500 || s === 408 || s === 429))
    ) {
        gatewayCircuit.recordInfrastructureFailure();
    } else {
        gatewayCircuit.recordSuccess();
    }
}

export { recordCircuitOnFinalError }
