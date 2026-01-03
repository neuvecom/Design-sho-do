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
  brushType?: string  // 筆の種類（後方互換性のためoptional）
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
  { name: '墨（黒）', value: '#1a1a1a', category: 'sumi' },
  { name: '薄墨 75%', value: '#4a4a4a', category: 'sumi' },
  { name: '薄墨 50%', value: '#808080', category: 'sumi' },
  { name: '薄墨 25%', value: '#b3b3b3', category: 'sumi' },
  { name: '朱色', value: '#ff7547', category: 'special' },
] as const

// カスタム色のキー
export const CUSTOM_COLOR_KEY = 'design-shodo-custom-color'

// デフォルト設定
export const DEFAULT_BRUSH_SIZE = 20
export const DEFAULT_CANVAS_SIZE = 800
export const DEFAULT_INK_COLOR = INK_COLORS[0].value
