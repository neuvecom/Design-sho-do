import type { BrushPoint } from '../../types'
import type { BrushConfig, RenderedPoint } from './types'
import { DEFAULT_BRUSH_CONFIG } from './types'
import {
  pressureCurve,
  velocity,
  calculateOpacity,
  velocityToPressure,
  calculateTaperFactor,
  lerp,
} from '../../utils/math'

export class CalligraphyBrush {
  private config: BrushConfig

  constructor(baseSize: number, color: string) {
    this.config = {
      ...DEFAULT_BRUSH_CONFIG,
      baseSize,
      color,
    }
  }

  // ブラシ設定を更新
  updateConfig(updates: Partial<BrushConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // 筆圧から線幅を計算
  calculateWidth(pressure: number): number {
    const { baseSize, minWidth, maxWidth } = this.config
    const curve = pressureCurve(pressure)
    const widthRatio = lerp(minWidth, maxWidth, curve)
    return baseSize * widthRatio
  }

  // 単一ポイントの筆圧を計算（リアルタイム描画用）
  private calculatePressureForPoint(
    point: BrushPoint,
    prevPoint: BrushPoint | undefined,
    prevPressure: number
  ): number {
    let simulatedPressure = point.pressure

    // マウスの場合（筆圧が常に0.5）は速度から疑似筆圧を計算
    if (point.pressure === 0.5 && prevPoint) {
      const vel = velocity(prevPoint, point)
      simulatedPressure = velocityToPressure(vel)

      // 急激な変化を防ぐためにスムージング（前の値との補間）
      simulatedPressure = prevPressure + (simulatedPressure - prevPressure) * 0.4
    }

    return simulatedPressure
  }

  // ストローク全体を処理（リアルタイム描画用 - 入り抜きなし）
  processStroke(points: BrushPoint[]): RenderedPoint[] {
    if (points.length === 0) return []

    const rendered: RenderedPoint[] = []
    let lastPressure = 0.5

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const prevPoint = i > 0 ? points[i - 1] : undefined

      // 速度ベースの疑似筆圧を計算
      const simulatedPressure = this.calculatePressureForPoint(point, prevPoint, lastPressure)
      lastPressure = simulatedPressure

      // 入りの補正のみ適用（描画中は抜きの位置が不明なため）
      let finalPressure = simulatedPressure
      if (i < 5 && i > 0) {
        // 最初の5ポイントで入りを表現（i=0は除外して最低限の線幅を確保）
        const taperIn = i / 5
        finalPressure *= 0.3 + taperIn * 0.7 * (2 - taperIn) // 最低30%を確保
      } else if (i === 0) {
        finalPressure *= 0.3 // 最初のポイントは30%の太さ
      }

      // 線幅を計算
      const width = this.calculateWidth(finalPressure)

      // 透明度（かすれ）を計算
      let opacity = 1
      if (prevPoint) {
        const vel = velocity(prevPoint, point)
        opacity = calculateOpacity(vel)
      }

      rendered.push({
        ...point,
        pressure: finalPressure,
        width,
        opacity,
      })
    }

    return this.smoothPoints(rendered)
  }

  // 確定済みストロークを処理（入り抜き補正あり）
  processFinishedStroke(points: BrushPoint[]): RenderedPoint[] {
    if (points.length === 0) return []

    const rendered: RenderedPoint[] = []
    let lastPressure = 0.5

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const prevPoint = i > 0 ? points[i - 1] : undefined

      // 速度ベースの疑似筆圧を計算
      const simulatedPressure = this.calculatePressureForPoint(point, prevPoint, lastPressure)
      lastPressure = simulatedPressure

      // 入り抜き補正を適用（確定時のみ）
      const taperFactor = calculateTaperFactor(i, points.length)
      const finalPressure = simulatedPressure * taperFactor

      // 線幅を計算
      const width = this.calculateWidth(finalPressure)

      // 透明度（かすれ）を計算
      let opacity = 1
      if (prevPoint) {
        const vel = velocity(prevPoint, point)
        opacity = calculateOpacity(vel)
      }

      rendered.push({
        ...point,
        pressure: finalPressure,
        width,
        opacity,
      })
    }

    return this.smoothPoints(rendered)
  }

  // ポイント間を滑らかに補間
  private smoothPoints(points: RenderedPoint[]): RenderedPoint[] {
    if (points.length < 3) return points

    const smoothed: RenderedPoint[] = [points[0]]
    const { smoothing } = this.config

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]

      // 前後のポイントで平均化
      smoothed.push({
        ...curr,
        x: lerp(curr.x, (prev.x + next.x) / 2, smoothing),
        y: lerp(curr.y, (prev.y + next.y) / 2, smoothing),
        width: lerp(curr.width, (prev.width + next.width) / 2, smoothing),
      })
    }

    smoothed.push(points[points.length - 1])
    return smoothed
  }

  get color(): string {
    return this.config.color
  }

  get baseSize(): number {
    return this.config.baseSize
  }
}
