import type { BrushPoint } from '../../types'

// ブラシ描画の設定
export interface BrushConfig {
  baseSize: number
  color: string
  minWidth: number   // 最小線幅（baseSize比率）
  maxWidth: number   // 最大線幅（baseSize比率）
  smoothing: number  // 補間の滑らかさ（0-1）
}

// 描画済みのポイント（計算後）
export interface RenderedPoint extends BrushPoint {
  width: number
  opacity: number
}

// デフォルトのブラシ設定
export const DEFAULT_BRUSH_CONFIG: Omit<BrushConfig, 'baseSize' | 'color'> = {
  minWidth: 0.2,
  maxWidth: 1.0,
  smoothing: 0.5,
}
