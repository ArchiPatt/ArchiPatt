type Status = "close" | "open" | "halfOpen";

type CircuitBreakerOptions = {
    failureThreshold: number;
    successThreshold: number;
    resetTimeoutMs: number;
};

const failedStatus = [500, 502, 503, 504, 408, 429];

export function createCircuitBreaker(opts: CircuitBreakerOptions) {
    let Status: Status = "close";

    let failures = 0;
    let successes = 0;
    let lastFailureTime = 0;

    const isFailureStatus = (status?: number) => {
        return status !== undefined && failedStatus.includes(status);
    }

    const canRequest = () => {
        if (Status === "OPEN") {
            if (Date.now() - lastFailureTime > opts.resetTimeoutMs) {
                Status = "halfOpen";
                successes = 0;
                return true;
            }
            return false;
        }
        return true;
    }

    const recordSuccess = () => {
        if (Status === "halfOpen") {
            successes++;

            if (successes >= opts.successThreshold) {
                Status = "close";
                failures = 0;
                successes = 0;
            }
        } else {
            failures = Math.max(0, failures - 1);
        }
    }

    const recordFailure = (status?: number) => {
        if (!isFailureStatus(status)) return;

        failures++;
        lastFailureTime = Date.now();

        if (Status === "halfOpen") {
            Status = "open";
            return;
        }

        if (failures >= opts.failureThreshold) {
            Status = "open";
        }
    }

    const getStatus = () => {
        return Status;
    }

    return {
        canRequest,
        recordSuccess,
        recordFailure,
        getStatus,
    };
}

export { createCircuitBreaker as circuitBreaker }
