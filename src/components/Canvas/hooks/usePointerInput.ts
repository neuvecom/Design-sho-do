import { useCallback, useRef } from 'react'
import type { BrushPoint } from '../../../types'

interface UsePointerInputProps {
  onStart: (point: BrushPoint) => void
  onMove: (point: BrushPoint) => void
  onEnd: () => void
}

export function usePointerInput({ onStart, onMove, onEnd }: UsePointerInputProps) {
  const isDrawingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ポインタイベントからBrushPointを生成
  const createBrushPoint = useCallback((e: PointerEvent): BrushPoint | null => {
    const container = containerRef.current
    if (!container) return null

    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 筆圧: マウスの場合は0.5固定、タッチ/ペンの場合は実際の筆圧
    const pressure = e.pointerType === 'mouse' ? 0.5 : e.pressure || 0.5

    return {
      x,
      y,
      pressure,
      timestamp: e.timeStamp,
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault()
      isDrawingRef.current = true

      // ポインタキャプチャでコンテナ外での移動も追跡
      const target = e.target as HTMLElement
      target.setPointerCapture(e.pointerId)

      const point = createBrushPoint(e)
      if (point) onStart(point)
    },
    [createBrushPoint, onStart]
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()

      const point = createBrushPoint(e)
      if (point) onMove(point)
    },
    [createBrushPoint, onMove]
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()

      isDrawingRef.current = false

      // ポインタキャプチャを解放
      const target = e.target as HTMLElement
      target.releasePointerCapture(e.pointerId)

      onEnd()
    },
    [onEnd]
  )

  const handlePointerCancel = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false

      const target = e.target as HTMLElement
      target.releasePointerCapture(e.pointerId)

      onEnd()
    },
    [onEnd]
  )

  // イベントリスナーをコンテナに登録
  const attachListeners = useCallback(
    (container: HTMLDivElement | null) => {
      containerRef.current = container
      if (!container) return

      container.addEventListener('pointerdown', handlePointerDown)
      container.addEventListener('pointermove', handlePointerMove)
      container.addEventListener('pointerup', handlePointerUp)
      container.addEventListener('pointercancel', handlePointerCancel)

      // タッチデバイスでのスクロール防止
      container.style.touchAction = 'none'

      return () => {
        container.removeEventListener('pointerdown', handlePointerDown)
        container.removeEventListener('pointermove', handlePointerMove)
        container.removeEventListener('pointerup', handlePointerUp)
        container.removeEventListener('pointercancel', handlePointerCancel)
      }
    },
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel]
  )

  return { attachListeners, containerRef }
}
