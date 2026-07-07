export function normalizeNigerianPhone(input: string): string {
  const digitsOnly = input.replace(/\D/g, "")
  if (!digitsOnly) return ""
  if (digitsOnly.startsWith("234")) return "+" + digitsOnly
  if (digitsOnly.startsWith("0")) return "+234" + digitsOnly.slice(1)
  return "+234" + digitsOnly
}
