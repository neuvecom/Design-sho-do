import type { BrushPoint } from '../../types'
import type { BrushConfig, RenderedPoint, BrushType } from './types'
import { getBrushPreset } from './types'
import {
  pressureCurve,
  velocity,
  velocityToPressure,
  calculateTaperFactor,
  lerp,
} from '../../utils/math'

export class CalligraphyBrush {
  private config: BrushConfig

  constructor(baseSize: number, color: string, brushType: BrushType = 'standard') {
    const preset = getBrushPreset(brushType)
    this.config = {
      ...preset.config,
      baseSize,
      color,
    }
  }

  // ブラシ設定を更新
  updateConfig(updates: Partial<BrushConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // 筆の種類を変更
  setBrushType(type: BrushType): void {
    const preset = getBrushPreset(type)
    this.config = {
      ...this.config,
      ...preset.config,
    }
  }

  // 筆圧から線幅を計算
  calculateWidth(pressure: number): number {
    const { baseSize, minWidth, maxWidth, pressureSensitivity } = this.config
    // 筆圧感度を適用
    const adjustedPressure = lerp(0.5, pressure, pressureSensitivity)
    const curve = pressureCurve(adjustedPressure)
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

  // ストローク全体を処理（リアルタイム描画用）
  processStroke(points: BrushPoint[]): RenderedPoint[] {
    return this.processPoints(points, false)
  }

  // 確定済みストロークを処理
  processFinishedStroke(points: BrushPoint[]): RenderedPoint[] {
    return this.processPoints(points, true)
  }

  // 共通のポイント処理
  private processPoints(points: BrushPoint[], isFinished: boolean): RenderedPoint[] {
    if (points.length === 0) return []

    const rendered: RenderedPoint[] = []
    let lastPressure = 0.5

    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const prevPoint = i > 0 ? points[i - 1] : undefined

      // 速度ベースの疑似筆圧を計算
      const simulatedPressure = this.calculatePressureForPoint(point, prevPoint, lastPressure)
      lastPressure = simulatedPressure

      // 入り抜き補正を適用
      const taperFactor = calculateTaperFactor(i, points.length)
      // 描画中は抜きを控えめに（まだストロークが続く可能性があるため）
      // 差を小さくするため、描画中も0.85以上に制限（以前は0.7）
      const adjustedTaper = isFinished ? taperFactor : Math.max(taperFactor, 0.85)
      const finalPressure = simulatedPressure * adjustedTaper

      // 線幅を計算
      const width = this.calculateWidth(finalPressure)

      // 透明度（かすれ）を計算 - ブラシ設定を反映
      let opacity = this.config.opacityBase
      if (prevPoint) {
        const vel = velocity(prevPoint, point)
        // opacitySpeedを使って速度に応じた透明度変化を計算
        const velocityEffect = vel * this.config.opacitySpeed * 10 // 効果を強める
        opacity = Math.max(0.15, this.config.opacityBase - velocityEffect)
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
