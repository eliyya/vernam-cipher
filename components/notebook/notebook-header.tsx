"use client"

import { BookOpen, Play, RotateCcw, ChevronDown, Save, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NotebookHeaderProps {
  title: string
  onRunAll: () => void
  onReset: () => void
  isRunning: boolean
  kernelStatus: "idle" | "busy" | "disconnected"
}

export function NotebookHeader({
  title,
  onRunAll,
  onReset,
  isRunning,
  kernelStatus,
}: NotebookHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold text-foreground font-mono">{title}</h1>
        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-mono text-muted-foreground">
          .ts
        </span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              File
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Save className="mr-2 h-4 w-4" />
              Guardar Notebook
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Exportar como .ts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-2 h-4 w-px bg-border" />

        <Button
          variant="default"
          size="sm"
          onClick={onRunAll}
          disabled={isRunning}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Play className="h-3.5 w-3.5" />
          Run All
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 border-border text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>

        <div className="mx-2 h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              kernelStatus === "idle"
                ? "bg-primary"
                : kernelStatus === "busy"
                  ? "bg-[var(--syntax-number)] animate-pulse"
                  : "bg-destructive"
            }`}
          />
          <span className="text-xs font-mono text-muted-foreground">
            TypeScript 5.6 | {kernelStatus}
          </span>
        </div>
      </div>
    </header>
  )
}
