const AUTH_API_URL = process.env.AUTH_API_URL!

export async function backendFetch(path: string, init: RequestInit = {}) {
  return fetch(`${AUTH_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  })
}