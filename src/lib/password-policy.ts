export const PASSWORD_MIN_LENGTH = 8

export function isStrongEnoughPassword(password: string) {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  )
}
