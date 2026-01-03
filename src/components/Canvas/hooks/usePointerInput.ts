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
  const isShiftDrawingRef = useRef(false) // Shift+マウス移動描画モード
  const lastPointerEventRef = useRef<PointerEvent | null>(null) // 最後のポインタイベントを保持

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
      // 最後のポインタイベントを保存（Shiftキー処理用）
      lastPointerEventRef.current = e

      // Shift+マウス移動モード: Shiftが押されていて、まだ描画開始していなければ開始
      if (e.shiftKey && !isDrawingRef.current && !isShiftDrawingRef.current) {
        e.preventDefault()
        isShiftDrawingRef.current = true
        isDrawingRef.current = true
        const point = createBrushPoint(e)
        if (point) onStart(point)
        return
      }

      if (!isDrawingRef.current) return
      e.preventDefault()

      const point = createBrushPoint(e)
      if (point) onMove(point)
    },
    [createBrushPoint, onMove, onStart]
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()

      isDrawingRef.current = false
      isShiftDrawingRef.current = false

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
      isShiftDrawingRef.current = false

      const target = e.target as HTMLElement
      target.releasePointerCapture(e.pointerId)

      onEnd()
    },
    [onEnd]
  )

  // Shiftキーを離したときに描画を終了するハンドラ
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Shift' && isShiftDrawingRef.current) {
        isDrawingRef.current = false
        isShiftDrawingRef.current = false
        onEnd()
      }
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

      // Shift+マウス移動描画モード用: keyupはwindowで監視
      window.addEventListener('keyup', handleKeyUp)

      // タッチデバイスでのスクロール防止
      container.style.touchAction = 'none'

      return () => {
        container.removeEventListener('pointerdown', handlePointerDown)
        container.removeEventListener('pointermove', handlePointerMove)
        container.removeEventListener('pointerup', handlePointerUp)
        container.removeEventListener('pointercancel', handlePointerCancel)
        window.removeEventListener('keyup', handleKeyUp)
      }
    },
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, handleKeyUp]
  )

  return { attachListeners, containerRef }
}
