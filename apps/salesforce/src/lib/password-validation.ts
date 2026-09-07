export interface PasswordStrength {
  score: number // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'
  suggestions: string[]
  isValid: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else suggestions.push('Use at least 8 characters')

  if (password.length >= 12) score++

  if (/[A-Z]/.test(password)) score++
  else suggestions.push('Add uppercase letters')

  if (/[a-z]/.test(password)) {
    // has lowercase
  } else suggestions.push('Add lowercase letters')

  if (/[0-9]/.test(password)) score++
  else suggestions.push('Add numbers')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else suggestions.push('Add special characters (!@#$%)')

  // Penalize common patterns
  if (/^(password|123456|qwerty|admin)/i.test(password)) {
    score = Math.max(0, score - 2)
    suggestions.push('Avoid common passwords')
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1)
    suggestions.push('Avoid repeated characters')
  }

  const clampedScore = Math.min(4, Math.max(0, score))
  const labels: PasswordStrength['label'][] = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

  return {
    score: clampedScore,
    label: labels[clampedScore],
    suggestions,
    isValid: clampedScore >= 2 && password.length >= 8,
  }
}
