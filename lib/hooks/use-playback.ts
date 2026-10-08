'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

const TICK_MS = 100

/**
 * Simulated media playback. Swap the internals for an <audio>/<video> element
 * once real recordings are served by the backend — the returned API stays the same.
 */
export function usePlayback(duration: number) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const timeRef = useRef(0)

  const seek = useCallback(
    (time: number) => {
      const clamped = Math.min(Math.max(time, 0), duration)
      timeRef.current = clamped
      setCurrentTime(clamped)
    },
    [duration],
  )

  useEffect(() => {
    if (!isPlaying) return
    let last = performance.now()
    const interval = window.setInterval(() => {
      const now = performance.now()
      const next = timeRef.current + ((now - last) / 1000) * rate
      last = now
      if (next >= duration) {
        timeRef.current = duration
        setCurrentTime(duration)
        setIsPlaying(false)
        return
      }
      timeRef.current = next
      setCurrentTime(next)
    }, TICK_MS)
    return () => window.clearInterval(interval)
  }, [isPlaying, rate, duration])

  const togglePlay = useCallback(() => {
    setIsPlaying((playing) => {
      if (!playing && timeRef.current >= duration) {
        timeRef.current = 0
        setCurrentTime(0)
      }
      return !playing
    })
  }, [duration])

  const skip = useCallback((seconds: number) => seek(timeRef.current + seconds), [seek])

  return {
    currentTime,
    duration,
    isPlaying,
    rate,
    volume,
    muted,
    seek,
    skip,
    togglePlay,
    setRate,
    setVolume: (value: number) => {
      setVolume(value)
      if (value > 0) setMuted(false)
    },
    toggleMute: () => setMuted((m) => !m),
  }
}

export type Playback = ReturnType<typeof usePlayback>
