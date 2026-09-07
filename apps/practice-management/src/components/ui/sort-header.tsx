"use client"

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'

interface SortHeaderProps {
  label: string
  field: string
  currentSort: string
  currentOrder: 'asc' | 'desc'
  onSort: (field: string) => void
  className?: string
}

export function SortHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
  className
}: SortHeaderProps) {
  const isActive = currentSort === field

  return (
    <TableHead
      className={`cursor-pointer select-none hover:bg-gray-50 ${className || ''}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentOrder === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-gray-300" />
        )}
      </div>
    </TableHead>
  )
}
