import { httpRequest } from "./http/client";

// ── Products ──
export function fetchProducts(page = 1, limit = 10, category) {
  let url = `/api/products?page=${page}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  return httpRequest(url);
}
export function fetchProductById(id) {
  return httpRequest(`/api/products/${id}`);
}

// ── Articles ──
export function fetchArticles(page = 1, limit = 10) {
  return httpRequest(`/api/articles?page=${page}&limit=${limit}`);
}
export function fetchArticleById(id) {
  return httpRequest(`/api/articles/${id}`);
}

// ── Rituals ──
export function fetchRituals(page = 1, limit = 10) {
  return httpRequest(`/api/rituals?page=${page}&limit=${limit}`);
}
export function searchRituals({ search, category, religion, page = 1, limit = 10 } = {}) {
  let url = `/api/rituals?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (religion) url += `&religion=${encodeURIComponent(religion)}`;
  return httpRequest(url);
}
export function fetchRitualById(id) {
  return httpRequest(`/api/rituals/${id}`);
}

// ── Cart ──
export function fetchCart() {
  return httpRequest("/api/cart");
}
export function addToCart(productId, quantity = 1) {
  return httpRequest("/api/cart", {
    method: "POST",
    body: { productId, quantity },
  });
}
export function updateCartItem(productId, quantity) {
  return httpRequest(`/api/cart/${productId}`, {
    method: "PUT",
    body: { quantity },
  });
}
export function removeCartItem(productId) {
  return httpRequest(`/api/cart/${productId}`, { method: "DELETE" });
}
export function clearCart() {
  return httpRequest("/api/cart", { method: "DELETE" });
}
export function bulkAddToCart(productIds) {
  return httpRequest("/api/cart/bulk", {
    method: "POST",
    body: { productIds },
  });
}

// ── Orders ──
export function createOrder(orderData) {
  return httpRequest("/api/orders/checkout", { method: "POST", body: orderData });
}
export function fetchOrders(page = 1, limit = 10) {
  return httpRequest(`/api/orders?page=${page}&limit=${limit}`);
}
export function fetchOrderById(id) {
  return httpRequest(`/api/orders/${id}`);
}

// ── Bookings ──
export function fetchBookings() {
  return httpRequest("/api/bookings");
}
export function createBooking(bookingData) {
  return httpRequest("/api/bookings", { method: "POST", body: bookingData });
}

// ── Providers (Pandits / Lamas) ──
export function fetchProviders() {
  return httpRequest("/api/users/providers");
}
export function fetchPendingProviders() {
  return httpRequest("/api/users/pending");
}
export function verifyProvider(providerId) {
  return httpRequest(`/api/users/${providerId}/verify`, { method: "PUT" });
}

// ── Reviews ──
export function fetchReviews(productId) {
  return httpRequest(`/api/reviews?productId=${productId}`);
}
export function createReview(reviewData) {
  return httpRequest("/api/reviews", { method: "POST", body: reviewData });
}

// ── Daily Quotes ──
export function fetchDailyQuote() {
  return httpRequest("/api/daily-quotes/today");
}

// ── Special / Today's Religious ──
export function fetchTodaySpecial() {
  return httpRequest("/api/special/today");
}

// ── Festivals / Calendar ──
export function fetchFestivals(year, month) {
  return httpRequest(`/api/festivals/month?year=${year}&month=${month}`);
}

// ── Chat ──
export function fetchChats() {
  return httpRequest("/api/chat");
}
export function sendMessage(receiverId, message) {
  return httpRequest("/api/chat", {
    method: "POST",
    body: { receiverId, message },
  });
}

// ── Notifications ──
export function fetchNotifications() {
  return httpRequest("/api/notifications");
}

// ── Quick Links ──
export function fetchQuickLinks() {
  return httpRequest("/api/quick");
}

// ── Payment ──
export function initiateEsewaPayment(orderId) {
  return httpRequest("/api/payment/esewa/initiate", {
    method: "POST",
    body: { orderId },
  });
}
export function verifyEsewaPayment(data) {
  return httpRequest("/api/payment/esewa/verify", {
    method: "POST",
    body: data,
  });
}
export function initiateKhaltiPayment(orderId) {
  return httpRequest("/api/payment/khalti/initiate", {
    method: "POST",
    body: { orderId },
  });
}
export function verifyKhaltiPayment(data) {
  return httpRequest("/api/payment/khalti/verify", {
    method: "POST",
    body: data,
  });
}

// ── Media / Admin ──
export function uploadMedia(imageUri) {
  const formData = new FormData();
  
  // React Native fetch implementation needs 'name', 'type', and 'uri' for files
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append('image', { uri: imageUri, name: filename, type });

  return httpRequest("/api/media/upload", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
