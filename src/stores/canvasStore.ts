import { create } from 'zustand'
import type { Stroke, ToolType, CanvasSize } from '../types'
import { DEFAULT_BRUSH_SIZE, DEFAULT_CANVAS_SIZE, DEFAULT_INK_COLOR } from '../types'

interface CanvasState {
  // ブラシ設定
  brushSize: number
  brushColor: string
  currentTool: ToolType

  // キャンバス設定
  canvasSize: CanvasSize

  // ストローク管理
  strokes: Stroke[]

  // 履歴管理
  history: Stroke[][]
  historyIndex: number

  // アクション
  setBrushSize: (size: number) => void
  setBrushColor: (color: string) => void
  setCurrentTool: (tool: ToolType) => void
  setCanvasSize: (size: CanvasSize) => void
  addStroke: (stroke: Stroke) => void
  undo: () => void
  redo: () => void
  clearCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // 初期状態
  brushSize: DEFAULT_BRUSH_SIZE,
  brushColor: DEFAULT_INK_COLOR,
  currentTool: 'brush',
  canvasSize: { width: DEFAULT_CANVAS_SIZE, height: DEFAULT_CANVAS_SIZE },
  strokes: [],
  history: [[]],
  historyIndex: 0,

  // ブラシサイズ設定
  setBrushSize: (size) => set({ brushSize: size }),

  // ブラシ色設定
  setBrushColor: (color) => set({ brushColor: color }),

  // ツール切り替え
  setCurrentTool: (tool) => set({ currentTool: tool }),

  // キャンバスサイズ設定
  setCanvasSize: (size) => set({ canvasSize: size }),

  // ストローク追加
  addStroke: (stroke) => {
    const { strokes, history, historyIndex } = get()
    const newStrokes = [...strokes, stroke]
    // 新しいストロークを追加する際、現在位置以降の履歴を削除
    const newHistory = [...history.slice(0, historyIndex + 1), newStrokes]
    set({
      strokes: newStrokes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  // Undo
  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        historyIndex: newIndex,
        strokes: history[newIndex],
      })
    }
  },

  // Redo
  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({
        historyIndex: newIndex,
        strokes: history[newIndex],
      })
    }
  },

  // キャンバスクリア
  clearCanvas: () => {
    const { history, historyIndex } = get()
    const newHistory = [...history.slice(0, historyIndex + 1), []]
    set({
      strokes: [],
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },
}))
