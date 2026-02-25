"use client"

import { useState, useCallback } from "react"
import { NotebookHeader } from "@/components/notebook/notebook-header"
import { CodeCell, type CellData } from "@/components/notebook/code-cell"
import { MarkdownCell } from "@/components/notebook/markdown-cell"
import { AlgorithmVisualizer, type VernamStep } from "@/components/notebook/algorithm-visualizer"
import { TableOutput } from "@/components/notebook/table-output"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// --- Vernam Cipher Step Generation ---
function charToBinary(c: string): string {
  return c.charCodeAt(0).toString(2).padStart(8, "0")
}

function xorBinary(a: string, b: string): string {
  return a
    .split("")
    .map((bit, i) => (bit === b[i] ? "0" : "1"))
    .join("")
}

function generateVernamSteps(plaintext: string, key: string): VernamStep[] {
  const steps: VernamStep[] = []
  let cipherSoFar = ""

  for (let i = 0; i < plaintext.length; i++) {
    const pChar = plaintext[i]
    const kChar = key[i % key.length]
    const pBin = charToBinary(pChar)
    const kBin = charToBinary(kChar)
    const xBin = xorBinary(pBin, kBin)
    const cipherCharCode = parseInt(xBin, 2)
    // Show printable or hex
    const cipherChar =
      cipherCharCode >= 33 && cipherCharCode <= 126
        ? String.fromCharCode(cipherCharCode)
        : `\\x${cipherCharCode.toString(16).padStart(2, "0")}`
    cipherSoFar += cipherChar.length === 1 ? cipherChar : "?"

    steps.push({
      charIndex: i,
      plainChar: pChar,
      keyChar: kChar,
      plainBinary: pBin,
      keyBinary: kBin,
      xorBinary: xBin,
      cipherChar,
      cipherSoFar,
      phase: "result",
      description: `Paso ${i + 1}: '${pChar}' (${pBin}) XOR '${kChar}' (${kBin}) = ${xBin} -> '${cipherChar}'`,
    })
  }

  return steps
}

const PLAIN = "HOLA"
const KEY = "CLAVE"
const vernamSteps = generateVernamSteps(PLAIN, KEY)

// Precompute full XOR table for display
function buildXorTable(plain: string, key: string) {
  const rows: (string | number)[][] = []
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i]
    const k = key[i % key.length]
    const pBin = charToBinary(p)
    const kBin = charToBinary(k)
    const xBin = xorBinary(pBin, kBin)
    const dec = parseInt(xBin, 2)
    const ch =
      dec >= 33 && dec <= 126
        ? String.fromCharCode(dec)
        : `0x${dec.toString(16).padStart(2, "0")}`
    rows.push([i, p, pBin, k, kBin, xBin, dec, ch])
  }
  return rows
}

const xorTableRows = buildXorTable(PLAIN, KEY)

// Precompute decrypt table
function buildDecryptTable(plain: string, key: string) {
  const rows: (string | number)[][] = []
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i]
    const k = key[i % key.length]
    const pBin = charToBinary(p)
    const kBin = charToBinary(k)
    const cBin = xorBinary(pBin, kBin)
    // decrypt: cipher XOR key = plain
    const dBin = xorBinary(cBin, kBin)
    const dChar = String.fromCharCode(parseInt(dBin, 2))
    rows.push([i, cBin, k, kBin, dBin, dChar])
  }
  return rows
}

const decryptTableRows = buildDecryptTable(PLAIN, KEY)

type NotebookEntry =
  | { type: "markdown"; content: string; isTitle?: boolean }
  | { type: "code"; cell: CellData }

const initialCells: CellData[] = [
  {
    id: "cell-1",
    type: "code",
    code: `# Cifrado Vernam (One-Time Pad) - Implementacion
def vernam_encrypt(plaintext, key):
    """
    Cifrado Vernam usando operacion XOR.
    
    Cada caracter del texto plano se combina con
    el caracter correspondiente de la clave mediante XOR.
    
    Requisito: len(key) >= len(plaintext) para 
    seguridad perfecta (One-Time Pad).
    """
    ciphertext = []
    for i, char in enumerate(plaintext):
        key_char = key[i % len(key)]
        # XOR entre los valores ASCII
        encrypted = ord(char) ^ ord(key_char)
        ciphertext.append(encrypted)
    return ciphertext

def vernam_decrypt(ciphertext, key):
    """
    Descifrado Vernam: XOR es su propia inversa.
    cipher XOR key = plaintext
    """
    plaintext = []
    for i, code in enumerate(ciphertext):
        key_char = key[i % len(key)]
        decrypted = code ^ ord(key_char)
        plaintext.append(chr(decrypted))
    return ''.join(plaintext)`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-2",
    type: "code",
    code: `# Ejemplo de cifrado y descifrado
plaintext = "HOLA"
key = "CLAVE"

print(f"Texto plano:    '{plaintext}'")
print(f"Clave:          '{key}'")
print()

# Cifrar
cipher = vernam_encrypt(plaintext, key)
cipher_hex = ' '.join(f'0x{c:02x}' for c in cipher)
print(f"Cifrado (dec):  {cipher}")
print(f"Cifrado (hex):  {cipher_hex}")
print()

# Descifrar
recovered = vernam_decrypt(cipher, key)
print(f"Descifrado:     '{recovered}'")
print(f"Verificacion:   {recovered == plaintext}")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-3",
    type: "code",
    code: `# Visualizacion paso a paso del XOR
# Ejecuta esta celda para ver la animacion
visualize_vernam_xor("HOLA", "CLAVE")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-4",
    type: "code",
    code: `# Tabla detallada de la operacion XOR
print("Tabla de cifrado XOR caracter a caracter")
print("=" * 60)
print(f"{'Pos':>3} | {'Plain':>5} | {'P.Bin':>10} | {'Key':>3} | {'K.Bin':>10} | {'XOR':>10} | {'Dec':>4} | Cipher")
print("-" * 60)

for i in range(len(plaintext)):
    p = plaintext[i]
    k = key[i % len(key)]
    p_bin = format(ord(p), '08b')
    k_bin = format(ord(k), '08b')
    xor_bin = format(ord(p) ^ ord(k), '08b')
    xor_dec = ord(p) ^ ord(k)
    c = chr(xor_dec) if 33 <= xor_dec <= 126 else f'0x{xor_dec:02x}'
    print(f"{i:>3} |   {p:>3} | {p_bin:>10} | {k:>3} | {k_bin:>10} | {xor_bin:>10} | {xor_dec:>4} | {c}")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-5",
    type: "code",
    code: `# Demostracion: XOR es su propia inversa
# Esta propiedad fundamental permite usar la misma operacion
# para cifrar y descifrar.

print("Propiedad fundamental: A XOR B XOR B = A")
print("=" * 50)

for i in range(len(plaintext)):
    p = plaintext[i]
    k = key[i % len(key)]
    cipher_val = ord(p) ^ ord(k)
    decrypt_val = cipher_val ^ ord(k)
    
    p_bin = format(ord(p), '08b')
    k_bin = format(ord(k), '08b')
    c_bin = format(cipher_val, '08b')
    d_bin = format(decrypt_val, '08b')
    
    print(f"'{p}' ({p_bin}) XOR '{k}' ({k_bin}) = {c_bin} (cifrado)")
    print(f"    {c_bin}  XOR '{k}' ({k_bin}) = {d_bin} -> '{chr(decrypt_val)}'")
    print()`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-6",
    type: "code",
    code: `# Verificacion de descifrado paso a paso
print("Tabla de descifrado (Cifrado XOR Clave = Texto plano)")
print("=" * 55)

cipher = vernam_encrypt(plaintext, key)
for i, c_val in enumerate(cipher):
    k = key[i % len(key)]
    c_bin = format(c_val, '08b')
    k_bin = format(ord(k), '08b')
    d_bin = format(c_val ^ ord(k), '08b')
    d_char = chr(c_val ^ ord(k))
    print(f"  {c_bin} XOR '{k}' ({k_bin}) = {d_bin} -> '{d_char}'")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
  {
    id: "cell-7",
    type: "code",
    code: `# Importancia de la clave aleatoria y de un solo uso
import os

def generate_otp_key(length):
    """Genera una clave verdaderamente aleatoria."""
    return bytes(os.urandom(length))

message = "SECRETO"
otp_key = generate_otp_key(len(message))

print(f"Mensaje:         '{message}'")
print(f"Clave OTP (hex): {otp_key.hex()}")

# Cifrar con OTP
cipher_otp = bytes(ord(c) ^ k for c, k in zip(message, otp_key))
print(f"Cifrado (hex):   {cipher_otp.hex()}")

# Descifrar con OTP
decrypted = ''.join(chr(c ^ k) for c, k in zip(cipher_otp, otp_key))
print(f"Descifrado:      '{decrypted}'")
print()
print("NOTA: Si la clave es aleatoria y de un solo uso,")
print("el cifrado es TEORICAMENTE IRROMPIBLE (Shannon, 1949)")`,
    output: undefined,
    executionCount: null,
    isRunning: false,
    isActive: false,
  },
]

// Simulated outputs for each cell
function getSimulatedOutput(cellId: string): string | React.ReactNode {
  // Precompute cipher values for HOLA with CLAVE
  const cipherVals = PLAIN.split("").map((ch, i) => ch.charCodeAt(0) ^ KEY.charCodeAt(i % KEY.length))
  const cipherHex = cipherVals.map((v) => `0x${v.toString(16).padStart(2, "0")}`).join(" ")

  switch (cellId) {
    case "cell-1":
      return ""
    case "cell-2":
      return `Texto plano:    'HOLA'\nClave:          'CLAVE'\n\nCifrado (dec):  [${cipherVals.join(", ")}]\nCifrado (hex):  ${cipherHex}\n\nDescifrado:     'HOLA'\nVerificacion:   True`
    case "cell-3":
      return <AlgorithmVisualizer steps={vernamSteps} />
    case "cell-4":
      return (
        <TableOutput
          caption="Tabla de cifrado XOR caracter a caracter"
          headers={["Pos", "Plain", "P.Bin", "Key", "K.Bin", "XOR", "Dec", "Cipher"]}
          rows={xorTableRows}
        />
      )
    case "cell-5": {
      const lines: string[] = []
      lines.push("Propiedad fundamental: A XOR B XOR B = A")
      lines.push("=".repeat(50))
      for (let i = 0; i < PLAIN.length; i++) {
        const p = PLAIN[i]
        const k = KEY[i % KEY.length]
        const cVal = p.charCodeAt(0) ^ k.charCodeAt(0)
        const dVal = cVal ^ k.charCodeAt(0)
        const pBin = p.charCodeAt(0).toString(2).padStart(8, "0")
        const kBin = k.charCodeAt(0).toString(2).padStart(8, "0")
        const cBin = cVal.toString(2).padStart(8, "0")
        const dBin = dVal.toString(2).padStart(8, "0")
        lines.push(`'${p}' (${pBin}) XOR '${k}' (${kBin}) = ${cBin} (cifrado)`)
        lines.push(`    ${cBin}  XOR '${k}' (${kBin}) = ${dBin} -> '${String.fromCharCode(dVal)}'`)
        lines.push("")
      }
      return lines.join("\n")
    }
    case "cell-6":
      return (
        <TableOutput
          caption="Tabla de descifrado (Cifrado XOR Clave = Texto plano)"
          headers={["Pos", "Cifrado", "Key", "K.Bin", "Descifrado", "Char"]}
          rows={decryptTableRows}
        />
      )
    case "cell-7":
      return `Mensaje:         'SECRETO'\nClave OTP (hex): a3f1c7d98b2e05\nCifrado (hex):   f094a5bc e84f70\nDescifrado:      'SECRETO'\n\nNOTA: Si la clave es aleatoria y de un solo uso,\nel cifrado es TEORICAMENTE IRROMPIBLE (Shannon, 1949)`
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

  const notebookEntries: NotebookEntry[] = [
    { type: "markdown", content: "Cifrado Vernam (One-Time Pad) - Visualizacion Interactiva", isTitle: true },
    {
      type: "markdown",
      content:
        "Este notebook demuestra el **Cifrado Vernam** paso a paso con visualizacion interactiva de la operacion XOR a nivel de bits. El cifrado Vernam es el unico sistema criptografico demostrado como **teoricamente irrompible** cuando se usa correctamente (Claude Shannon, 1949).\n\n### Principio Fundamental\n- Cada caracter del texto plano se combina con un caracter de la clave mediante la operacion **XOR** (OR exclusivo)\n- La operacion XOR es **su propia inversa**: `A XOR B XOR B = A`\n- **Requisito de seguridad perfecta:** la clave debe ser aleatoria, de un solo uso y de la misma longitud que el mensaje",
    },
    { type: "markdown", content: "## Implementacion" },
    { type: "code", cell: cells[0] },
    { type: "markdown", content: "### Cifrado y Descifrado\nEjemplo con texto `\"HOLA\"` y clave `\"CLAVE\"`." },
    { type: "code", cell: cells[1] },
    { type: "markdown", content: "## Visualizacion Interactiva del XOR\nEjecuta la celda para ver como cada caracter se cifra bit a bit. Los bits resaltados muestran las posiciones donde los bits de la clave difieren del texto plano." },
    { type: "code", cell: cells[2] },
    { type: "markdown", content: "## Tabla de Cifrado Detallada\nTabla completa mostrando la representacion binaria y la operacion XOR para cada caracter." },
    { type: "code", cell: cells[3] },
    { type: "markdown", content: "## Propiedad Fundamental: XOR como Inversa\nLa operacion XOR tiene la propiedad de que aplicarla dos veces con la misma clave recupera el valor original. Esto es lo que permite usar la **misma operacion** tanto para cifrar como para descifrar." },
    { type: "code", cell: cells[4] },
    { type: "markdown", content: "## Verificacion del Descifrado\nTabla paso a paso del proceso inverso: aplicamos XOR del texto cifrado con la clave para recuperar el texto original." },
    { type: "code", cell: cells[5] },
    { type: "markdown", content: "## Seguridad: One-Time Pad\nPara que el cifrado Vernam sea **teoricamente irrompible**, la clave debe ser:\n- **Aleatoria** - generada con un CSPRNG (generador criptografico)\n- **De un solo uso** - nunca reutilizar la clave\n- **Igual o mayor longitud** que el mensaje" },
    { type: "code", cell: cells[6] },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NotebookHeader
        title="cifrado_vernam_otp"
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

          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
              Agregar Celda
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs font-mono text-muted-foreground">
          <span>
            {cells.filter((c) => c.executionCount !== null).length} / {cells.length} celdas ejecutadas
          </span>
          <span>Python 3.11.4 | Criptografia</span>
        </div>
      </footer>
    </div>
  )
}
