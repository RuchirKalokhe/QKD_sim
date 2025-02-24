"use client"

import { useEffect, useRef } from "react"

interface QuantumStateProps {
  state?: "0" | "1" | "+" | "-"
  basis?: "computational" | "hadamard"
  size?: number
}

export function QuantumState({ state, basis, size = 40 }: QuantumStateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !state || !basis) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, size, size)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2

    // Draw circle background
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI)
    ctx.fillStyle = "#333"
    ctx.fill()

    // Draw the polarization line
    ctx.strokeStyle = "#fff"
    ctx.beginPath()

    if (basis === "computational") {
      if (state === "0") {
        // Horizontal line (→)
        ctx.moveTo(size * 0.2, size / 2)
        ctx.lineTo(size * 0.8, size / 2)
        // Arrow head
        ctx.moveTo(size * 0.8, size / 2)
        ctx.lineTo(size * 0.7, size * 0.4)
        ctx.moveTo(size * 0.8, size / 2)
        ctx.lineTo(size * 0.7, size * 0.6)
      } else {
        // Vertical line (↑)
        ctx.moveTo(size / 2, size * 0.8)
        ctx.lineTo(size / 2, size * 0.2)
        // Arrow head
        ctx.moveTo(size / 2, size * 0.2)
        ctx.lineTo(size * 0.4, size * 0.3)
        ctx.moveTo(size / 2, size * 0.2)
        ctx.lineTo(size * 0.6, size * 0.3)
      }
    } else {
      if (state === "+") {
        // 45° line (↗)
        ctx.moveTo(size * 0.3, size * 0.7)
        ctx.lineTo(size * 0.7, size * 0.3)
        // Arrow head
        ctx.moveTo(size * 0.7, size * 0.3)
        ctx.lineTo(size * 0.55, size * 0.3)
        ctx.moveTo(size * 0.7, size * 0.3)
        ctx.lineTo(size * 0.7, size * 0.45)
      } else {
        // 135° line (↖)
        ctx.moveTo(size * 0.3, size * 0.3)
        ctx.lineTo(size * 0.7, size * 0.7)
        // Arrow head
        ctx.moveTo(size * 0.3, size * 0.3)
        ctx.lineTo(size * 0.45, size * 0.3)
        ctx.moveTo(size * 0.3, size * 0.3)
        ctx.lineTo(size * 0.3, size * 0.45)
      }
    }
    ctx.stroke()
  }, [state, basis, size])

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />
}

