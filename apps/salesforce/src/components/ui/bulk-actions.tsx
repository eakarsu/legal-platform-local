"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Download, X } from "lucide-react"

interface BulkActionsProps {
  selectedCount: number
  onDelete?: () => void
  onUpdate?: () => void
  onExport?: () => void
  onClear: () => void
}

export function BulkActions({ selectedCount, onDelete, onUpdate, onExport, onClear }: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        {selectedCount} selected
      </Badge>
      <div className="flex items-center gap-2">
        {onDelete && (
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
        {onUpdate && (
          <Button variant="outline" size="sm" onClick={onUpdate}>
            <Edit className="h-4 w-4 mr-1" />
            Update
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-1" />
            Export Selected
          </Button>
        )}
      </div>
      <Button variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
  )
}
