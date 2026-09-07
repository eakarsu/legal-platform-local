export function generateCSV(data: Record<string, any>[], columns: { key: string; label: string }[]): string {
  const headers = columns.map(c => `"${c.label}"`).join(',')
  const rows = data.map(row =>
    columns.map(c => {
      const val = getNestedValue(row, c.key)
      const str = val === null || val === undefined ? '' : String(val)
      return `"${str.replace(/"/g, '""')}"`
    }).join(',')
  )
  return [headers, ...rows].join('\n')
}

export function generatePDFHTML(
  title: string,
  data: Record<string, any>[],
  columns: { key: string; label: string }[]
): string {
  const headerRow = columns.map(c => `<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">${c.label}</th>`).join('')
  const bodyRows = data.map(row =>
    '<tr>' + columns.map(c => {
      const val = getNestedValue(row, c.key)
      return `<td style="border:1px solid #ddd;padding:8px;">${val ?? ''}</td>`
    }).join('') + '</tr>'
  ).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #1a1a1a; font-size: 24px; }
    .meta { color: #666; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { font-size: 12px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Total: ${data.length} records</p>
  <table>
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}
