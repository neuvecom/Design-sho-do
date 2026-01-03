import type { BrushPoint, Stroke } from '../../types'
import { CalligraphyBrush } from './CalligraphyBrush'
import type { BrushType } from './types'
import { generateId } from '../../utils/math'

export class BrushEngine {
  private brush: CalligraphyBrush
  private currentPoints: BrushPoint[] = []
  private isDrawing = false
  private currentBrushType: BrushType = 'standard'

  constructor(size: number, color: string, brushType: BrushType = 'standard') {
    this.brush = new CalligraphyBrush(size, color, brushType)
    this.currentBrushType = brushType
  }

  // ブラシサイズを更新
  setSize(size: number): void {
    this.brush.updateConfig({ baseSize: size })
  }

  // ブラシ色を更新
  setColor(color: string): void {
    this.brush.updateConfig({ color })
  }

  // 筆の種類を更新
  setBrushType(type: BrushType): void {
    this.brush.setBrushType(type)
    this.currentBrushType = type
  }

  // ストローク開始
  startStroke(point: BrushPoint): void {
    this.isDrawing = true
    this.currentPoints = [point]
  }

  // ストローク継続
  continueStroke(point: BrushPoint): BrushPoint[] {
    if (!this.isDrawing) return []

    this.currentPoints.push(point)
    return this.currentPoints
  }

  // ストローク終了
  endStroke(): Stroke | null {
    if (!this.isDrawing || this.currentPoints.length === 0) {
      this.isDrawing = false
      return null
    }

    const stroke: Stroke = {
      id: generateId(),
      points: [...this.currentPoints],
      color: this.brush.color,
      size: this.brush.baseSize,
      brushType: this.currentBrushType,
    }

    this.currentPoints = []
    this.isDrawing = false
    return stroke
  }

  // 現在のポイントを取得
  getCurrentPoints(): BrushPoint[] {
    return this.currentPoints
  }

  // 描画用に処理されたポイントを取得
  getRenderedPoints() {
    return this.brush.processStroke(this.currentPoints)
  }

  // 描画中かどうか
  get drawing(): boolean {
    return this.isDrawing
  }

  // ブラシインスタンスを取得
  getBrush(): CalligraphyBrush {
    return this.brush
  }
}
