'use client'

import { Pause, Play, RotateCcw, RotateCw, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatTimestamp } from '@/lib/format'
import { PLAYBACK_RATES, type Playback } from '@/lib/hooks/use-playback'

const rateItems = PLAYBACK_RATES.map((rate) => ({ value: String(rate), label: `${rate}×` }))

const firstValue = (value: number | readonly number[]) => (Array.isArray(value) ? value[0] : (value as number))

export function MediaPlayer({ playback, speaker }: { playback: Playback; speaker?: string }) {
  const { currentTime, duration, isPlaying, rate, volume, muted } = playback
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <section aria-label="Recording playback" className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <Button
          size="icon-lg"
          onClick={playback.togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="rounded-full"
        >
          {isPlaying ? <Pause className="fill-current" /> : <Play className="translate-x-px fill-current" />}
        </Button>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-sm" onClick={() => playback.skip(-15)} aria-label="Back 15 seconds">
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => playback.skip(15)} aria-label="Forward 15 seconds">
            <RotateCw />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs text-muted-foreground">
            {speaker ? (
              <>
                Now speaking: <span className="font-medium text-foreground">{speaker}</span>
              </>
            ) : (
              'Recording'
            )}
          </span>
          <span className="text-xs tabular-nums">
            <span className="font-medium">{formatTimestamp(currentTime)}</span>
            <span className="text-muted-foreground"> / {formatTimestamp(duration)}</span>
          </span>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={playback.toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
          >
            <VolumeIcon />
          </Button>
          <Slider
            aria-label="Volume"
            className="w-20"
            min={0}
            max={1}
            step={0.05}
            value={[muted ? 0 : volume]}
            onValueChange={(value) => playback.setVolume(firstValue(value))}
          />
        </div>

        <Select
          items={rateItems}
          value={String(rate)}
          onValueChange={(value) => value && playback.setRate(Number(value))}
        >
          <SelectTrigger size="sm" aria-label="Playback speed" className="w-[72px] tabular-nums">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rateItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Slider
        aria-label="Seek"
        min={0}
        max={duration}
        step={1}
        value={[currentTime]}
        onValueChange={(value) => playback.seek(firstValue(value))}
      />
    </section>
  )
}
