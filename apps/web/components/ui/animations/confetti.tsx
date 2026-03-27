'use client'

import React, { useEffect, useState } from 'react'
import { AnimationProps } from './types'

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
}

interface ConfettiProps extends AnimationProps {
  particleCount?: number
  duration?: number
}

const colors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
]

export function Confetti({
  particleCount = 30,
  duration = 2000,
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const newPieces: ConfettiPiece[] = Array.from({ length: particleCount }).map(
      (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 100,
        duration: 1500 + Math.random() * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    )
    setPieces(newPieces)

    if (onComplete) {
      const timer = setTimeout(onComplete, duration)
      return () => clearTimeout(timer)
    }
  }, [particleCount, duration, onComplete])

  if (pieces.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(400px) rotate(720deg);
          }
        }
        .confetti-piece {
          pointer-events: none;
          position: fixed;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: confetti-fall linear forwards;
        }
      `}</style>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.color,
            animation: `confetti-fall ${piece.duration}ms linear ${piece.delay}ms forwards`,
          }}
        />
      ))}
    </>
  )
}
