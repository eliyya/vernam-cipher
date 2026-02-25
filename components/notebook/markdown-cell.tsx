"use client"

interface MarkdownCellProps {
  content: string
  isTitle?: boolean
}

export function MarkdownCell({ content, isTitle }: MarkdownCellProps) {
  if (isTitle) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground font-sans text-balance">{content}</h2>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-border/30 hover:bg-card/50">
      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/80 font-sans">
        {content.split("\n").map((line, i) => {
          if (line.startsWith("### ")) {
            return (
              <h3 key={i} className="mb-2 mt-4 text-lg font-semibold text-foreground">
                {line.slice(4)}
              </h3>
            )
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={i} className="mb-3 mt-5 text-xl font-bold text-foreground">
                {line.slice(3)}
              </h2>
            )
          }
          if (line.startsWith("- ")) {
            return (
              <li key={i} className="ml-4 list-disc text-foreground/80">
                {renderInlineCode(line.slice(2))}
              </li>
            )
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <p key={i} className="mb-2 font-semibold text-foreground">
                {line.slice(2, -2)}
              </p>
            )
          }
          if (line.trim() === "") return <br key={i} />
          return (
            <p key={i} className="mb-2">
              {renderInlineCode(line)}
            </p>
          )
        })}
      </div>
    </div>
  )
}

function renderInlineCode(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="mx-0.5 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-primary"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    // Bold
    const boldParts = part.split(/(\*\*[^*]+\*\*)/)
    return boldParts.map((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return (
          <strong key={`${i}-${j}`} className="font-semibold text-foreground">
            {bp.slice(2, -2)}
          </strong>
        )
      }
      return <span key={`${i}-${j}`}>{bp}</span>
    })
  })
}
