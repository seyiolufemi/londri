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

// Some endpoints (e.g. DELETE) return 204 No Content — calling .json() on an
// empty body throws, which would report a failure even though the backend succeeded.
export async function parseJsonSafe(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}