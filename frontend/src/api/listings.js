const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function fetchListings(signal) {
  return request("/api/listings", signal);
}

export function fetchListing(id, signal) {
  return request(`/api/listings/${id}`, signal);
}
