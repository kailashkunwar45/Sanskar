import { API_BASE_URL } from "../../config/env";
import { REQUEST_TIMEOUT_MS } from "../../config/constants";
import { getAccessToken } from "../storage";

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function httpRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Auto-attach stored token if no Authorization header provided
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (!headers.Authorization) {
      const token = await getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(buildUrl(path), {
      method: options.method || "GET",
      headers,
      body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || "Request failed");
      error.statusCode = response.status;
      throw error;
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
