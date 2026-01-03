import type { BrushPoint } from '../../types'

// 筆の種類
export type BrushType = 'standard' | 'fine' | 'bold' | 'dry'

// ブラシ描画の設定
export interface BrushConfig {
  baseSize: number
  color: string
  minWidth: number      // 最小線幅（baseSize比率）
  maxWidth: number      // 最大線幅（baseSize比率）
  smoothing: number     // 補間の滑らかさ（0-1）
  opacityBase: number   // 基本透明度（0-1）
  opacitySpeed: number  // 速度による透明度変化の感度
  pressureSensitivity: number // 筆圧感度（0-1）
}

// 描画済みのポイント（計算後）
export interface RenderedPoint extends BrushPoint {
  width: number
  opacity: number
}

// 筆の種類のプリセット
export interface BrushPreset {
  id: BrushType
  name: string
  description: string
  config: Omit<BrushConfig, 'baseSize' | 'color'>
}

// 筆の種類プリセット定義
export const BRUSH_PRESETS: BrushPreset[] = [
  {
    id: 'standard',
    name: '標準',
    description: 'バランスの取れた標準的な筆',
    config: {
      minWidth: 0.2,
      maxWidth: 1.0,
      smoothing: 0.5,
      opacityBase: 1.0,
      opacitySpeed: 0.01,
      pressureSensitivity: 0.8,
    },
  },
  {
    id: 'fine',
    name: '細筆',
    description: 'シャープで繊細な線',
    config: {
      minWidth: 0.05,      // より細く
      maxWidth: 0.4,       // 最大でも細め
      smoothing: 0.2,      // シャープに
      opacityBase: 1.0,
      opacitySpeed: 0.003, // かすれにくい
      pressureSensitivity: 1.0, // 筆圧変化が大きい
    },
  },
  {
    id: 'bold',
    name: '太筆',
    description: '太く力強い線',
    config: {
      minWidth: 0.5,       // 最小でも太め
      maxWidth: 1.5,       // より太く
      smoothing: 0.7,      // なめらかに
      opacityBase: 1.0,
      opacitySpeed: 0.005, // かすれにくい
      pressureSensitivity: 0.4, // 筆圧変化が少ない（常に太め）
    },
  },
  {
    id: 'dry',
    name: 'かすれ筆',
    description: '渇筆風のかすれた線',
    config: {
      minWidth: 0.3,       // 標準に近い太さ
      maxWidth: 1.0,       // 標準と同じ最大幅
      smoothing: 0.4,
      opacityBase: 0.2,    // 最初からかなり薄い（乾いた筆）
      opacitySpeed: 0.3,   // 速度でさらにかすれる
      pressureSensitivity: 0.7,
    },
  },
]

// デフォルトのブラシ設定
export const DEFAULT_BRUSH_CONFIG: Omit<BrushConfig, 'baseSize' | 'color'> = BRUSH_PRESETS[0].config

// 筆の種類からプリセットを取得
export function getBrushPreset(type: BrushType): BrushPreset {
  return BRUSH_PRESETS.find((p) => p.id === type) || BRUSH_PRESETS[0]
}
