"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export interface VernamStep {
  charIndex: number
  plainChar: string
  keyChar: string
  plainBinary: string
  keyBinary: string
  xorBinary: string
  cipherChar: string
  cipherSoFar: string
  cipherList: string[]
  description: string
  phase: "idle" | "show-plain" | "show-key" | "xor" | "result"
}

interface AlgorithmVisualizerProps {
  steps: VernamStep[]
}

function BinaryDisplay({
  label,
  binary,
  color,
  charLabel,
  highlightXor,
  xorWith,
}: {
  label: string
  binary: string
  color: string
  charLabel: string
  highlightXor?: boolean
  xorWith?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-right text-xs font-mono text-muted-foreground">{label}</span>
      <span
        className="w-10 text-center text-sm font-mono font-bold"
        style={{ color }}
      >
        {`'${charLabel}'`}
      </span>
      <div className="flex gap-0.5">
        {binary.split("").map((bit, i) => {
          const isXorDiff = highlightXor && xorWith && xorWith[i] !== bit
          return (
            <span
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded text-sm font-mono font-bold transition-all duration-300"
              style={{
                backgroundColor: isXorDiff
                  ? "var(--syntax-number)"
                  : "var(--secondary)",
                color: isXorDiff
                  ? "var(--background)"
                  : color,
                boxShadow: isXorDiff ? "0 0 8px var(--syntax-number)" : "none",
              }}
            >
              {bit}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function AlgorithmVisualizer({ steps }: AlgorithmVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)

  const step = steps[currentStep]

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

  // Extract unique chars processed so far
  const plaintext = steps.length > 0 ? steps[steps.length - 1].cipherSoFar : ""

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Character position indicator */}
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">Posicion del caracter:</span>
        </div>
        <div className="flex gap-1">
          {plaintext.split("").map((_, i) => (
            <div
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded text-xs font-mono font-bold transition-all duration-300"
              style={{
                backgroundColor:
                  i === step.charIndex
                    ? "var(--primary)"
                    : i < step.charIndex
                      ? "var(--accent)"
                      : "var(--secondary)",
                color:
                  i === step.charIndex
                    ? "var(--primary-foreground)"
                    : i < step.charIndex
                      ? "var(--accent-foreground)"
                      : "var(--muted-foreground)",
              }}
            >
              {i}
            </div>
          ))}
        </div>
      </div>

      {/* Binary XOR visualization */}
      <div className="mb-5 flex flex-col gap-3 rounded-md bg-background/60 p-4">
        <BinaryDisplay
          label="Texto plano"
          binary={step.plainBinary}
          color="var(--primary)"
          charLabel={step.plainChar}
        />
        <BinaryDisplay
          label="Clave"
          binary={step.keyBinary}
          color="var(--accent)"
          charLabel={step.keyChar}
          highlightXor
          xorWith={step.plainBinary}
        />

        {/* XOR operator line */}
        <div className="flex items-center gap-3">
          <span className="w-20 text-right text-xs font-mono text-muted-foreground">XOR</span>
          <span className="w-10" />
          <div className="flex gap-0.5">
            {step.plainBinary.split("").map((_, i) => (
              <span
                key={i}
                className="flex h-3 w-8 items-center justify-center text-xs font-mono text-muted-foreground"
              >
                {"^"}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border/50 pt-2">
          <BinaryDisplay
            label="Cifrado"
            binary={step.xorBinary}
            color="var(--syntax-number)"
            charLabel={step.cipherChar}
          />
        </div>
      </div>

      {/* Cipher text built so far */}
      <div className="mb-4 rounded-md bg-background/60 px-4 py-3">
        <div className="mb-1 text-xs font-mono text-muted-foreground">Texto cifrado acumulado en hexadecimal:</div>
        <div className="flex gap-0.5 flex-wrap">
          {step.cipherList.map((ch, i) => {
            console.log(step);
            
            return (
            <span
              key={i}
              className="flex h-8 min-w-[2rem] items-center justify-center rounded text-sm font-mono font-bold transition-all duration-300"
              style={{
                backgroundColor:
                  i === step.charIndex ? "var(--syntax-number)" : "var(--secondary)",
                color:
                  i === step.charIndex ? "var(--background)" : "var(--foreground)",
                boxShadow:
                  i === step.charIndex ? "0 0 8px var(--syntax-number)" : "none",
              }}
            >
              {ch.padStart(2, "0")}
              {/* {steps[]} */}
            </span>
          )
          })}
        </div>
      </div>

      {/* Step description */}
      <div className="mb-4 rounded-md bg-background/60 px-4 py-2.5 text-center">
        <p className="text-sm font-mono text-foreground/80">{step.description}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
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
          Paso {currentStep + 1} / {steps.length}
        </span>

        <div className="mx-2 h-4 w-px bg-border" />

        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">Velocidad</span>
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
