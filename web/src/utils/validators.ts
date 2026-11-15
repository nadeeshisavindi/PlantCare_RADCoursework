
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export const validateName = (value: string): string | undefined => {
  const name = value.trim()
  if (!name) return "Name is required"
  if (name.length < 2 || name.length > 60) return "Name must be 2-60 characters"
  return undefined
}

export const validateEmail = (value: string): string | undefined => {
  const email = value.trim()
  if (!email) return "Email is required"
  if (!EMAIL_PATTERN.test(email)) return "Please enter a valid email address"
  return undefined
}

export const validatePassword = (value: string): string | undefined => {
  if (!value) return "Password is required"
  if (value.length < 8) return "Password must be at least 8 characters"
  if (value.length > 72) return "Password must be at most 72 characters"
  if (!/[A-Za-z]/.test(value)) return "Password must contain a letter"
  if (!/\d/.test(value)) return "Password must contain a number"
  return undefined
}
