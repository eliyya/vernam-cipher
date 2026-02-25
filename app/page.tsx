"use client"

import { useState, useCallback } from "react"
import { NotebookHeader } from "@/components/notebook/notebook-header"
import { CodeCell, type CellData } from "@/components/notebook/code-cell"
import { MarkdownCell } from "@/components/notebook/markdown-cell"
import { AlgorithmVisualizer } from "@/components/notebook/algorithm-visualizer"
import { TableOutput } from "@/components/notebook/table-output"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// Generate Bubble Sort steps for the visualizer
function generateBubbleSortSteps(arr: number[]) {
  const steps = []
  const a = [...arr]
  const sorted: number[] = []

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [],
    description: "Initial array - beginning Bubble Sort",
  })

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        description: `Comparing arr[${j}]=${a[j]} with arr[${j + 1}]=${a[j + 1]}`,
      })

      if (a[j] > a[j + 1]) {
        const temp = a[j]
        a[j] = a[j + 1]
        a[j + 1] = temp
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          description: `Swapped! arr[${j}]=${a[j]} <-> arr[${j + 1}]=${a[j + 1]}`,
        })
      }
    }
    sorted.push(a.length - 1 - i)
  }
  sorted.push(0)

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
    description: "Array is sorted!",
  })

  return steps
}

const bubbleSortSteps = generateBubbleSortSteps([38, 27, 43, 3, 9, 82, 10])

type NotebookEntry =
  | { type: "markdown"; content: string; isTitle?: boolean }
  | { type: "code"; cell: CellData }

const initialCells: CellData[] = [
  {
    id: "cell-1",
    type: "code",
    code: `# Bubble Sort - Algorithm Implementation
def bubble_sort(arr):
    """
    Bubble Sort algorithm.
    Time Complexity: O(n^2)
    Space Complexity: O(1)
    """
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break  # Array is already sorted
    return arr`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-2",
    type: "code",
    code: `# Test the algorithm with sample data
data = [38, 27, 43, 3, 9, 82, 10]
print(f"Original array: {data}")
sorted_data = bubble_sort(data.copy())
print(f"Sorted array:   {sorted_data}")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-3",
    type: "code",
    code: `# Step-by-step visualization
# Run this cell to see the algorithm in action
visualize_bubble_sort([38, 27, 43, 3, 9, 82, 10])`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-4",
    type: "code",
    code: `# Complexity analysis
import time

sizes = [100, 500, 1000, 5000, 10000]
results = []

for n in sizes:
    arr = list(range(n, 0, -1))  # Worst case: reversed
    start = time.time()
    bubble_sort(arr)
    elapsed = time.time() - start
    results.append([n, f"{elapsed:.4f}s", f"{n**2:,}"])

print("Performance Analysis (Worst Case)")
print("-" * 40)
for r in results:
    print(f"n={r[0]:>6} | Time: {r[1]:>8} | O(n^2): {r[2]:>12}")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-5",
    type: "code",
    code: `# Optimized version comparison
def bubble_sort_optimized(arr):
    """Optimized Bubble Sort with early exit."""
    n = len(arr)
    comparisons = 0
    swaps = 0
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            comparisons += 1
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swaps += 1
                swapped = True
        if not swapped:
            break
    return arr, comparisons, swaps

# Test with nearly sorted array
nearly_sorted = [1, 2, 3, 5, 4, 6, 7, 8, 9, 10]
result, comps, swps = bubble_sort_optimized(nearly_sorted.copy())
print(f"Nearly sorted: {nearly_sorted}")
print(f"Result:        {result}")
print(f"Comparisons:   {comps}")
print(f"Swaps:         {swps}")
print(f"\\nOptimization saved {(10*9//2) - comps} comparisons vs unoptimized!")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
]

// Simulated outputs for each cell
function getSimulatedOutput(cellId: string): string | React.ReactNode {
  switch (cellId) {
    case "cell-1":
      return ""
    case "cell-2":
      return "Original array: [38, 27, 43, 3, 9, 82, 10]\nSorted array:   [3, 9, 10, 27, 38, 43, 82]"
    case "cell-3":
      return <AlgorithmVisualizer steps={bubbleSortSteps} />
    case "cell-4":
      return (
        <TableOutput
          caption="Performance Analysis (Worst Case)"
          headers={["n", "Time", "O(n\u00B2)"]}
          rows={[
            [100, "0.0003s", "10,000"],
            [500, "0.0089s", "250,000"],
            ["1,000", "0.0341s", "1,000,000"],
            ["5,000", "0.8523s", "25,000,000"],
            ["10,000", "3.4127s", "100,000,000"],
          ]}
        />
      )
    case "cell-5":
      return "Nearly sorted: [1, 2, 3, 5, 4, 6, 7, 8, 9, 10]\nResult:        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nComparisons:   13\nSwaps:         1\n\nOptimization saved 32 comparisons vs unoptimized!"
    default:
      return ""
  }
}

export default function NotebookPage() {
  const [cells, setCells] = useState<CellData[]>(initialCells)
  const [activeCellId, setActiveCellId] = useState<string | null>(null)
  const [executionCounter, setExecutionCounter] = useState(0)
  const [kernelStatus, setKernelStatus] = useState<"idle" | "busy" | "disconnected">("idle")

  const runCell = useCallback(
    (id: string) => {
      setCells((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isRunning: true } : c))
      )
      setKernelStatus("busy")

      setTimeout(() => {
        setExecutionCounter((prev) => {
          const next = prev + 1
          setCells((prevCells) =>
            prevCells.map((c) =>
              c.id === id
                ? {
                    ...c,
                    isRunning: false,
                    executionCount: next,
                    output: getSimulatedOutput(id),
                  }
                : c
            )
          )
          return next
        })
        setKernelStatus("idle")
      }, 800 + Math.random() * 700)
    },
    []
  )

  const runAll = useCallback(() => {
    cells.forEach((cell, index) => {
      setTimeout(() => {
        runCell(cell.id)
      }, index * 1200)
    })
  }, [cells, runCell])

  const resetAll = useCallback(() => {
    setCells(initialCells)
    setExecutionCounter(0)
    setKernelStatus("idle")
    setActiveCellId(null)
  }, [])

  const deleteCell = useCallback((id: string) => {
    setCells((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const focusCell = useCallback((id: string) => {
    setActiveCellId(id)
    setCells((prev) =>
      prev.map((c) => ({ ...c, isActive: c.id === id }))
    )
  }, [])

  // Build the notebook entries interleaving markdown and code
  const notebookEntries: NotebookEntry[] = [
    { type: "markdown", content: "Bubble Sort - Algorithm Visualization", isTitle: true },
    {
      type: "markdown",
      content:
        "This notebook demonstrates the **Bubble Sort** algorithm with interactive step-by-step visualization. Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.\n\n### Key Characteristics\n- **Time Complexity:** `O(n\u00B2)` in the worst and average case\n- **Space Complexity:** `O(1)` - sorts in-place\n- **Stable:** Yes - preserves relative order of equal elements\n- **Adaptive:** With early exit optimization, `O(n)` for nearly sorted arrays",
    },
    { type: "markdown", content: "## Implementation" },
    { type: "code", cell: cells[0] },
    { type: "markdown", content: "### Testing the Algorithm" },
    { type: "code", cell: cells[1] },
    { type: "markdown", content: "## Interactive Visualization\nRun the cell below to see Bubble Sort animate through each step. Use the playback controls to go forward, backward, or autoplay the animation." },
    { type: "code", cell: cells[2] },
    { type: "markdown", content: "## Performance Analysis\nLet's benchmark the algorithm with different input sizes to verify the `O(n\u00B2)` time complexity." },
    { type: "code", cell: cells[3] },
    { type: "markdown", content: "## Optimized Version\nBy adding an early exit when no swaps occur in a pass, we can significantly improve performance on nearly sorted arrays." },
    { type: "code", cell: cells[4] },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NotebookHeader
        title="bubble_sort_visualization"
        onRunAll={runAll}
        onReset={resetAll}
        isRunning={kernelStatus === "busy"}
        kernelStatus={kernelStatus}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="flex flex-col gap-2">
          {notebookEntries.map((entry, index) => {
            if (entry.type === "markdown") {
              return (
                <MarkdownCell
                  key={`md-${index}`}
                  content={entry.content}
                  isTitle={entry.isTitle}
                />
              )
            }
            return (
              <CodeCell
                key={entry.cell.id}
                cell={entry.cell}
                onRun={runCell}
                onDelete={deleteCell}
                onFocus={focusCell}
              />
            )
          })}

          {/* Add cell button */}
          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
              Add Cell
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs font-mono text-muted-foreground">
          <span>
            {cells.filter((c) => c.executionCount !== null).length} / {cells.length} cells executed
          </span>
          <span>Python 3.11.4 | NumPy 1.24.3</span>
        </div>
      </footer>
    </div>
  )
}
