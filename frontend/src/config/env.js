// Use relative paths on web for monolithic deployment, and absolute URLs otherwise.
const isWeb = typeof window !== "undefined" && !window.ReactNativeWebView;
const API_BASE_URL = isWeb ? "" : "http://localhost:5001";

export { API_BASE_URL };
