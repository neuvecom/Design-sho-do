import { create } from 'zustand'

// プリセットお手本
export const PRESET_TEMPLATES = [
  { id: 'ei', name: '永', char: '永', description: '永字八法 - 基本の8つの筆法を含む' },
  { id: 'ai', name: '愛', char: '愛', description: '愛 - 人気の漢字' },
  { id: 'yume', name: '夢', char: '夢', description: '夢 - 人気の漢字' },
  { id: 'wa', name: '和', char: '和', description: '和 - 日本らしい文字' },
  { id: 'kokoro', name: '心', char: '心', description: '心 - シンプルな漢字' },
] as const

export type PresetTemplateId = (typeof PRESET_TEMPLATES)[number]['id']

interface TemplateState {
  // お手本モードの状態
  isTemplateMode: boolean
  templateImage: string | null // Data URL or object URL
  templateChar: string | null // プリセット文字（毛筆フォントで直接描画用）
  templateOpacity: number // 0-100
  selectedPreset: PresetTemplateId | null

  // アクション
  setTemplateMode: (enabled: boolean) => void
  setTemplateImage: (image: string | null) => void
  setTemplateChar: (char: string | null) => void
  setTemplateOpacity: (opacity: number) => void
  setSelectedPreset: (id: PresetTemplateId | null) => void
  clearTemplate: () => void
}

export const useTemplateStore = create<TemplateState>((set) => ({
  isTemplateMode: false,
  templateImage: null,
  templateChar: null,
  templateOpacity: 30,
  selectedPreset: null,

  setTemplateMode: (enabled) => set({ isTemplateMode: enabled }),

  setTemplateImage: (image) => set({ templateImage: image, templateChar: null }),

  setTemplateChar: (char) => set({ templateChar: char, templateImage: null }),

  setTemplateOpacity: (opacity) => set({ templateOpacity: opacity }),

  setSelectedPreset: (id) => set({ selectedPreset: id }),

  clearTemplate: () =>
    set({
      isTemplateMode: false,
      templateImage: null,
      templateChar: null,
      selectedPreset: null,
    }),
}))
