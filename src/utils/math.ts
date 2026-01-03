import type { BrushPoint } from '../types'

// 2点間の距離を計算
export function distance(p1: BrushPoint, p2: BrushPoint): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

// 2点間の速度を計算（px/ms）
export function velocity(p1: BrushPoint, p2: BrushPoint): number {
  const dist = distance(p1, p2)
  const dt = p2.timestamp - p1.timestamp
  return dt > 0 ? dist / dt : 0
}

// 2点間の角度を計算（ラジアン）
export function angle(p1: BrushPoint, p2: BrushPoint): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

// 線形補間
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// 筆圧カーブ（より自然な筆圧反応のためのイージング）
export function pressureCurve(pressure: number): number {
  // 二次関数でより自然な筆圧反応
  return pressure * pressure * (3 - 2 * pressure)
}

// 速度から疑似筆圧を計算（速いと細く、遅いと太く）
export function velocityToPressure(vel: number): number {
  // 速度の閾値（px/ms）
  const minVelocity = 0.1  // これより遅いと最大筆圧
  const maxVelocity = 1.5  // これより速いと最小筆圧

  if (vel <= minVelocity) return 1.0
  if (vel >= maxVelocity) return 0.2

  // 速度に応じて筆圧を反転（遅い=太い、速い=細い）
  const normalized = (vel - minVelocity) / (maxVelocity - minVelocity)
  return 1.0 - normalized * 0.8
}

// 入り抜き補正の係数を計算
export function calculateTaperFactor(
  index: number,
  totalPoints: number,
  taperStart: number = 0.15,  // 入りの範囲（全体の15%）
  taperEnd: number = 0.2      // 抜きの範囲（全体の20%）
): number {
  if (totalPoints < 3) return 1.0

  const progress = index / (totalPoints - 1)

  // 入り（ストローク開始時）
  if (progress < taperStart) {
    // 0から始まって徐々に1へ（ease-out）
    const t = progress / taperStart
    return t * (2 - t)  // ease-out quad
  }

  // 抜き（ストローク終了時）
  if (progress > 1 - taperEnd) {
    // 1から始まって徐々に0.1へ（ease-in）
    const t = (progress - (1 - taperEnd)) / taperEnd
    return 1.0 - t * t * 0.9  // ease-in quad, 最小0.1
  }

  return 1.0
}

// 速度から透明度（かすれ）を計算
export function calculateOpacity(velocity: number): number {
  // 速度が速いほど透明に（かすれ表現）
  const maxVelocity = 2 // px/ms
  const normalized = Math.min(velocity / maxVelocity, 1)
  return Math.max(0.3, 1 - normalized * 0.7)
}

// スムーズな値の変化（急激な変化を防ぐ）
export function smoothValue(current: number, target: number, factor: number = 0.3): number {
  return current + (target - current) * factor
}

// ユニークIDを生成
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
