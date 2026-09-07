"use client"

import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string) {
  let score = 0
  const suggestions: string[] = []

  if (password.length >= 8) score++
  else suggestions.push('Use at least 8 characters')

  if (password.length >= 12) score++

  if (/[A-Z]/.test(password)) score++
  else suggestions.push('Add uppercase letters')

  if (/[0-9]/.test(password)) score++
  else suggestions.push('Add numbers')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else suggestions.push('Add special characters')

  if (/^(password|123456|qwerty|admin)/i.test(password)) {
    score = Math.max(0, score - 2)
    suggestions.push('Avoid common passwords')
  }

  const clampedScore = Math.min(4, Math.max(0, score))
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  return { score: clampedScore, label: labels[clampedScore], color: colors[clampedScore], suggestions }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const { score, label, color, suggestions } = getStrength(password)

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= score ? color : "bg-gray-200")}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", score >= 3 ? "text-green-600" : score >= 2 ? "text-yellow-600" : "text-red-600")}>
          {label}
        </span>
      </div>
      {suggestions.length > 0 && score < 3 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {suggestions.slice(0, 3).map((s, i) => (
            <li key={i}>- {s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
