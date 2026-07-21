const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function submit(path, values) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

export function signup(values) {
  return submit("signup", values);
}

export function login(values) {
  return submit("login", values);
}
