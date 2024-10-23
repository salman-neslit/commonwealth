var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { anySignal, getTimeoutSignal } from './signals';
export const makeRequest = (
  fetchFn,
  url,
  method,
  headers,
  requestBody,
  timeoutMs,
  abortSignal,
  withCredentials,
  duplex,
) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const signals = [];
    // Add timeout signal
    let timeoutAbortId = undefined;
    if (timeoutMs != null) {
      const { signal, abortId } = getTimeoutSignal(timeoutMs);
      timeoutAbortId = abortId;
      signals.push(signal);
    }
    // Add arbitrary signal
    if (abortSignal != null) {
      signals.push(abortSignal);
    }
    let newSignals = anySignal(signals);
    const response = yield fetchFn(url, {
      method: method,
      headers,
      body: requestBody,
      signal: newSignals,
      credentials: withCredentials ? 'include' : undefined,
      // @ts-ignore
      duplex,
    });
    if (timeoutAbortId != null) {
      clearTimeout(timeoutAbortId);
    }
    return response;
  });