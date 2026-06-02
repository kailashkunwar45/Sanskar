// Use relative paths on web for monolithic deployment, but for local development/independent clients we need the backend URL.
const isWeb = typeof window !== "undefined" && !window.ReactNativeWebView;
let API_BASE_URL = "http://localhost:5001";

if (isWeb) {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    API_BASE_URL = "http://localhost:5001";
  } else if (host.includes("onrender.com")) {
    // Monolithic deployment on Render
    API_BASE_URL = "";
  } else {
    // Hosted elsewhere (like portfolio, GitHub Pages, Vercel), point to production Render backend
    API_BASE_URL = "https://sanskar-bu44.onrender.com";
  }
}

export { API_BASE_URL };
