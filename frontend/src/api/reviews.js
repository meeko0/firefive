const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchReviews(sort = "relevant", signal) {
  const response = await fetch(`${API_BASE_URL}/api/reviews?sort=${sort}`, { signal });
  if (!response.ok) throw new Error("Unable to load reviews.");
  return response.json();
}
