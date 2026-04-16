export function logInfo(message, payload) {
  if (__DEV__) {
    console.log(`[INFO] ${message}`, payload || "");
  }
}

export function logError(message, payload) {
  if (__DEV__) {
    console.error(`[ERROR] ${message}`, payload || "");
  }
}
