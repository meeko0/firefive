const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function authRequest(path, values, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    method: options.method || "POST",
    headers: { "Content-Type": "application/json", ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    ...(values ? { body: JSON.stringify(values) } : {}),
  });
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

export function signup(values) {
  return authRequest("signup", values);
}

export function login(values) {
  return authRequest("login", values);
}

export const verifyEmail = (token) => authRequest("verify", { token });
export const forgotPassword = (email) => authRequest("forgot-password", { email });
export const resetPassword = (token, password) => authRequest("reset-password", { token, password });
export const fetchProfile = (token) => authRequest("profile", null, { method: "GET", token });
export const deleteAccount = (token) => authRequest("profile", null, { method: "DELETE", token });
