"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface AlgorithmStep {
  array: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
  description: string
}

interface AlgorithmVisualizerProps {
  steps: AlgorithmStep[]
}

export function AlgorithmVisualizer({ steps }: AlgorithmVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)

  const step = steps[currentStep]
  const maxVal = Math.max(...step.array)

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        setIsPlaying(false)
        return prev
      }
      return prev + 1
    })
  }, [steps.length])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(nextStep, speed)
    return () => clearInterval(interval)
  }, [isPlaying, speed, nextStep])

  function getBarColor(index: number): string {
    if (step.sorted.includes(index)) return "var(--primary)"
    if (step.swapping.includes(index)) return "var(--syntax-number)"
    if (step.comparing.includes(index)) return "var(--accent)"
    return "var(--muted-foreground)"
  }

  function getBarGlow(index: number): string {
    if (step.swapping.includes(index)) return "0 0 12px var(--syntax-number)"
    if (step.comparing.includes(index)) return "0 0 8px var(--accent)"
    return "none"
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Bar chart visualization */}
      <div className="mb-4 flex items-end justify-center gap-1.5 h-48 px-4">
        {step.array.map((value, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-1">
            <span
              className="text-xs font-mono font-medium transition-colors duration-200"
              style={{ color: getBarColor(index) }}
            >
              {value}
            </span>
            <div
              className="w-full min-w-[20px] rounded-t-sm transition-all duration-300 ease-out"
              style={{
                height: `${(value / maxVal) * 140}px`,
                backgroundColor: getBarColor(index),
                boxShadow: getBarGlow(index),
                opacity: step.sorted.includes(index) ? 1 : 0.85,
              }}
            />
          </div>
        ))}
      </div>

      {/* Step description */}
      <div className="mb-4 rounded-md bg-background/60 px-4 py-2.5 text-center">
        <p className="text-sm font-mono text-foreground/80">{step.description}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-4 w-px bg-border" />

        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          Step {currentStep + 1} / {steps.length}
        </span>

        <div className="mx-2 h-4 w-px bg-border" />

        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">Speed</span>
        <Slider
          className="w-24"
          min={100}
          max={1500}
          step={100}
          value={[1600 - speed]}
          onValueChange={([v]) => setSpeed(1600 - v)}
        />

        {/* Progress bar */}
        <div className="ml-auto flex-1 max-w-[200px]">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
