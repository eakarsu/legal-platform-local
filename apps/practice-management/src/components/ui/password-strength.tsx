"use client"

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

interface Requirement {
  label: string
  met: boolean
}

export function getPasswordStrength(password: string): { score: number; requirements: Requirement[] } {
  const requirements: Requirement[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ]

  const score = requirements.filter(r => r.met).length

  return { score, requirements }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, requirements } = useMemo(() => getPasswordStrength(password), [password])

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  if (!password) return null

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < score ? strengthColors[score - 1] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className={`text-xs font-medium ${
          score <= 1 ? 'text-red-600' :
          score <= 2 ? 'text-orange-600' :
          score <= 3 ? 'text-yellow-600' :
          score <= 4 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {strengthLabels[score - 1] || 'Very Weak'}
        </p>
      </div>

      {/* Requirements list */}
      <ul className="space-y-1">
        {requirements.map((req, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-gray-300" />
            )}
            <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
