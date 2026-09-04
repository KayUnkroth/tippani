function bytes(value) {
  if (value === undefined || value === null) return 0;
  if (typeof value === "string" || Buffer.isBuffer(value)) return Buffer.byteLength(value);
  return Buffer.byteLength(JSON.stringify(value));
}

export class ProviderTelemetry {
  constructor({ safetyBudget = null } = {}) {
    this.safetyBudget = safetyBudget;
    this.requests = 0;
    this.requestBytes = 0;
    this.responseBytes = 0;
    this.throttleResponses = 0;
    this.retries = 0;
    this.retryAfterSeconds = [];
    this.backoffMs = 0;
    this.failures = {};
  }

  async recordRequest(body) {
    await this.safetyBudget?.recordRequest(body);
    this.requests++;
    this.requestBytes += bytes(body);
  }

  recordRetry() {
    this.retries++;
  }

  recordRetryAfter(value) {
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) this.retryAfterSeconds.push(seconds);
  }

  recordBackoff(milliseconds) {
    const value = Number(milliseconds);
    if (Number.isFinite(value) && value >= 0) this.backoffMs += value;
  }

  recordFailure(kind) {
    this.failures[kind] = (this.failures[kind] || 0) + 1;
  }

  wrapResponse(response) {
    if (!response || typeof response !== "object") return response;
    if (response.status === 429) {
      this.throttleResponses++;
      this.recordRetryAfter(response.headers?.get?.("retry-after"));
    }
    let bodyCounted = false;
    const countBody = async (value) => {
      if (!bodyCounted) {
        await this.safetyBudget?.recordResponse(value);
        this.responseBytes += bytes(value);
        bodyCounted = true;
      }
      return value;
    };
    return new Proxy(response, {
      get: (target, property) => {
        if (property === "json" && typeof target.json === "function") {
          return async (...args) => await countBody(await target.json(...args));
        }
        if (property === "text" && typeof target.text === "function") {
          return async (...args) => await countBody(await target.text(...args));
        }
        return Reflect.get(target, property, target);
      },
    });
  }

  snapshot() {
    return {
      requests: this.requests,
      requestBytes: this.requestBytes,
      responseBytes: this.responseBytes,
      transferredBytes: this.requestBytes + this.responseBytes,
      throttleResponses: this.throttleResponses,
      retries: this.retries,
      retryAfterSeconds: [...this.retryAfterSeconds],
      backoffMs: this.backoffMs,
      failures: { ...this.failures },
      byteMethod: "UTF-8 application payload bytes submitted or consumed",
    };
  }
}

export function telemetryDelta(before, after) {
  return {
    requests: after.requests - before.requests,
    requestBytes: after.requestBytes - before.requestBytes,
    responseBytes: after.responseBytes - before.responseBytes,
    transferredBytes: after.transferredBytes - before.transferredBytes,
    throttleResponses: after.throttleResponses - before.throttleResponses,
    retries: after.retries - before.retries,
    retryAfterSeconds: after.retryAfterSeconds.slice(before.retryAfterSeconds.length),
    backoffMs: after.backoffMs - before.backoffMs,
  };
}