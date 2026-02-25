"use client"

import { Play, MoreHorizontal, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface CellData {
  id: string
  type: "code" | "markdown"
  code: string
  output?: string | React.ReactNode
  executionCount: number | null
  isRunning: boolean
  isActive: boolean
  highlightedLines?: number[]
}

interface CodeCellProps {
  cell: CellData
  onRun: (id: string) => void
  onDelete: (id: string) => void
  onFocus: (id: string) => void
}

function highlightSyntax(code: string): React.ReactNode[] {
  const lines = code.split("\n")
  const totalLines = lines.length
  const gutterWidth = `${String(totalLines).length + 1}ch`
  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = []
    let remaining = line
    let idx = 0

    while (remaining.length > 0) {
      // Single-line comments ( // )
      if (remaining.match(/^\/\/.*/)) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-comment)", fontStyle: "italic" }}>
            {remaining}
          </span>
        )
        remaining = ""
        continue
      }

      // Strings (double, single, backtick)
      const strMatch =
        remaining.match(/^(["'`])(?:(?!\1|\\).|\\.)*\1/) ||
        remaining.match(/^`(?:[^`\\]|\\.)*`/)
      if (strMatch) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-string)" }}>
            {strMatch[0]}
          </span>
        )
        remaining = remaining.slice(strMatch[0].length)
        idx++
        continue
      }

      // TypeScript / JS keywords
      const kwMatch = remaining.match(
        /^(function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|import|export|from|as|default|class|extends|implements|interface|type|enum|namespace|async|await|yield|try|catch|finally|throw|void|delete| in |of|true|false|null|undefined|this|super|static|readonly|public|private|protected|abstract|declare|module|require|keyof|infer|never|unknown|any|number|string|boolean|bigint|symbol|object|Record|Array|Map|Set|Promise|Uint8Array)\b/
      )
      if (kwMatch) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-keyword)" }}>
            {kwMatch[0]}
          </span>
        )
        remaining = remaining.slice(kwMatch[0].length)
        idx++
        continue
      }

      // Type annotations after colon (e.g., : string, : number[])
      const typeAnnotation = remaining.match(/^:\s*(string|number|boolean|void|any|never|unknown|Uint8Array|Array|Record|Map|Set|Promise)(\[\])?/)
      if (typeAnnotation) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-keyword)", fontStyle: "italic" }}>
            {typeAnnotation[0]}
          </span>
        )
        remaining = remaining.slice(typeAnnotation[0].length)
        idx++
        continue
      }

      // Function calls
      const funcMatch = remaining.match(/^([a-zA-Z_]\w*)\s*(?=\()/)
      if (funcMatch) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-function)" }}>
            {funcMatch[1]}
          </span>
        )
        remaining = remaining.slice(funcMatch[1].length)
        idx++
        continue
      }

      // Numbers (hex, binary, decimal)
      const numMatch = remaining.match(/^(0x[0-9a-fA-F]+|0b[01]+|\d+\.?\d*|\.\d+)/)
      if (numMatch) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-number)" }}>
            {numMatch[0]}
          </span>
        )
        remaining = remaining.slice(numMatch[0].length)
        idx++
        continue
      }

      // Operators
      const opMatch = remaining.match(/^(===|!==|==|!=|<=|>=|=>|\?\?|\?\.|&&|\|\||[+\-*/%=<>!&|^~])/)
      if (opMatch) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-operator)" }}>
            {opMatch[0]}
          </span>
        )
        remaining = remaining.slice(opMatch[0].length)
        idx++
        continue
      }

      // Decorators / @
      const decoMatch = remaining.match(/^@\w+/)
      if (decoMatch) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ color: "var(--syntax-keyword)", fontStyle: "italic" }}>
            {decoMatch[0]}
          </span>
        )
        remaining = remaining.slice(decoMatch[0].length)
        idx++
        continue
      }

      // Whitespace: preserve leading and inline spaces/tabs as a single token
      const wsMatch = remaining.match(/^[ \t]+/)
      if (wsMatch) {
        tokens.push(
          <span key={`${lineIndex}-${idx}`} style={{ whiteSpace: "pre" }}>
            {wsMatch[0]}
          </span>
        )
        remaining = remaining.slice(wsMatch[0].length)
        idx++
        continue
      }

      // Default: single character
      tokens.push(
        <span key={`${lineIndex}-${idx}`} style={{ color: "var(--foreground)" }}>
          {remaining[0]}
        </span>
      )
      remaining = remaining.slice(1)
      idx++
    }

    return (
      <div key={lineIndex} className="flex">
        <span
          className="mr-4 inline-block text-right select-none font-mono text-xs shrink-0"
          style={{ color: "var(--syntax-comment)", width: gutterWidth }}
        >
          {lineIndex + 1}
        </span>
        <span className="flex-1" style={{ whiteSpace: "pre" }}>{tokens}</span>
      </div>
    )
  })
}

export function CodeCell({ cell, onRun, onDelete, onFocus }: CodeCellProps) {
  return (
    <div
      className={`group relative rounded-lg border transition-all duration-200 ${
        cell.isActive
          ? "border-primary/40 bg-[var(--cell-active)]"
          : "border-border bg-card hover:border-border/80 hover:bg-[var(--cell-hover)]"
      }`}
      onClick={() => onFocus(cell.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onFocus(cell.id) }}
    >
      {/* Cell indicator */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-lg transition-colors ${
          cell.isActive ? "bg-primary" : "bg-transparent group-hover:bg-primary/30"
        }`}
      />

      {/* Cell header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              onRun(cell.id)
            }}
            disabled={cell.isRunning}
          >
            {cell.isRunning ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>

          <span className="font-mono text-xs" style={{ color: "var(--execution-count)" }}>
            {cell.isRunning ? "[*]" : cell.executionCount !== null ? `[${cell.executionCount}]` : "[ ]"}
          </span>

          <span className="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            TypeScript
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(cell.id)
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Celda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Code block */}
      <div className="mx-4 mb-3 overflow-x-auto rounded-md bg-background/60 p-4 font-mono text-sm leading-relaxed">
        {highlightSyntax(cell.code)}
      </div>

      {/* Output */}
      {cell.output && (
        <div className="border-t border-border/50 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="font-mono text-xs text-muted-foreground mt-1 select-none">Out:</span>
            <div className="flex-1 overflow-x-auto font-mono text-sm text-foreground/90">
              {typeof cell.output === "string" ? (
                <pre className="whitespace-pre-wrap">{cell.output}</pre>
              ) : (
                cell.output
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
