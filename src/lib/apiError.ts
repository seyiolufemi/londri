type FastApiDetail = string | { msg: string }[] | { errors: string[] }

interface FastApiErrorBody {
  detail?: FastApiDetail
}

export function getApiErrorMessage(body: unknown, fallback = "Something went wrong. Please try again."): string {
  const detail = (body as FastApiErrorBody | null)?.detail

  if (typeof detail === "string") return detail

  if (Array.isArray(detail)) {
    const messages = detail.map((d) => d.msg).filter(Boolean)
    if (messages.length) return messages.join(", ")
  }

  if (detail && typeof detail === "object" && "errors" in detail && Array.isArray(detail.errors)) {
    return detail.errors.join(", ")
  }

  return fallback
}

export function apiError(error: unknown, fallback: string): string {
  return getApiErrorMessage((error as { data?: unknown })?.data, fallback)
}