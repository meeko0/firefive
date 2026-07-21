const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
function token() { try { return JSON.parse(localStorage.getItem("pantherden-session"))?.token; } catch { return null; } }
async function request(path, options = {}) { const response = await fetch(`${API_BASE_URL}/api/admin${path}`, { ...options, headers: { Authorization: `Bearer ${token()}`, ...(options.body ? { "Content-Type": "application/json" } : {}) } }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Request failed."); return data; }
export const fetchDashboard = () => request("/dashboard");
export const moderateReview = (id, status, reason) => request(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status, reason }) });
export const addProperty = (values) => request("/properties", { method: "POST", body: JSON.stringify(values) });
