// ブラシポイント（入力データ）
export interface BrushPoint {
  x: number
  y: number
  pressure: number
  timestamp: number
}

// ストロークデータ
export interface Stroke {
  id: string
  points: BrushPoint[]
  color: string
  size: number
}

// ブラシ設定
export interface BrushSettings {
  size: number
  color: string
}

// キャンバス設定
export interface CanvasSize {
  width: number
  height: number
}

// ツールの種類
export type ToolType = 'brush' | 'eraser'

// 墨色のプリセット
export const INK_COLORS = [
  { name: '墨', value: '#1a1a1a' },
  { name: '濃墨', value: '#0d0d0d' },
  { name: '薄墨', value: '#4a4a4a' },
  { name: '青墨', value: '#1a2a3a' },
  { name: '茶墨', value: '#3a2a1a' },
] as const

// デフォルト設定
export const DEFAULT_BRUSH_SIZE = 20
export const DEFAULT_CANVAS_SIZE = 800
export const DEFAULT_INK_COLOR = INK_COLORS[0].value
