interface FastApiValidationError {
  detail?: string | { msg: string }[]
}

export function getApiErrorMessage(body: unknown, fallback = "Something went wrong. Please try again."): string {
  const detail = (body as FastApiValidationError | null)?.detail

  if (typeof detail === "string") return detail
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg

  return fallback
}