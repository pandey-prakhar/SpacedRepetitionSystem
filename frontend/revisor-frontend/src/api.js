const BASE = "http://localhost:8080/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listAll: () => request("/problems"),
  listDue: () => request("/problems/due"),
  get: (id) => request(`/problems/${id}`),
  create: (body) =>
    request("/problems", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/problems/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  review: (id, rating) =>
    request(`/problems/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
  remove: (id) => request(`/problems/${id}`, { method: "DELETE" }),
};
