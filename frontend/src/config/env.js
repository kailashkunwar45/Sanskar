// Use relative paths on web for monolithic deployment, but for local development we need the backend URL.
const isWeb = typeof window !== "undefined" && !window.ReactNativeWebView;
const API_BASE_URL = (isWeb && window.location.hostname !== 'localhost') ? "" : "http://localhost:5001";

export { API_BASE_URL };
