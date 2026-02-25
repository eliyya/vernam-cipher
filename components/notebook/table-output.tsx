"use client"

interface TableOutputProps {
  headers: string[]
  rows: (string | number)[][]
  caption?: string
}

export function TableOutput({ headers, rows, caption }: TableOutputProps) {
  return (
    <div className="overflow-x-auto">
      {caption && (
        <p className="mb-2 text-xs font-mono text-muted-foreground">{caption}</p>
      )}
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-1.5 text-left text-xs font-semibold text-muted-foreground" />
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-1.5 text-right text-xs font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/30 transition-colors hover:bg-secondary/30"
            >
              <td className="px-3 py-1.5 text-xs font-bold text-muted-foreground">{i}</td>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 text-right text-foreground/90">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
