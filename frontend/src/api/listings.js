const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function fetchListings(signal, filters = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== "" && value != null));
  return request(`/api/listings?${query}`, signal);
}

export function fetchListing(id, signal) {
  return request(`/api/listings/${id}`, signal);
}

function getToken() {
  try { return JSON.parse(localStorage.getItem("pantherden-session"))?.token; } catch { return null; }
}

async function authorized(path, method = "GET", body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${getToken()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error((await response.json()).error || "Request failed.");
  return response.status === 204 ? null : response.json();
}

export const fetchFavorites = () => authorized("/api/favorites");
export const addFavorite = (id) => authorized(`/api/favorites/${id}`, "POST");
export const removeFavorite = (id) => authorized(`/api/favorites/${id}`, "DELETE");
export const submitReview = (values) => authorized("/api/reviews", "POST", values);
