import { useRef, useState } from 'react'
import { Slider } from '../UI'
import { useTemplateStore, PRESET_TEMPLATES } from '../../stores/templateStore'
import type { PresetTemplateId } from '../../stores/templateStore'

// アイコン
const TemplateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
)

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export function TemplateSettings() {
  const {
    isTemplateMode,
    templateImage,
    templateChar,
    templateOpacity,
    selectedPreset,
    setTemplateMode,
    setTemplateImage,
    setTemplateChar,
    setTemplateOpacity,
    setSelectedPreset,
    clearTemplate,
  } = useTemplateStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [customCharInput, setCustomCharInput] = useState('')
  const isComposingRef = useRef(false)

  // カスタム文字かどうか判定
  const isCustomChar = templateChar && !PRESET_TEMPLATES.some((t) => t.char === templateChar)

  // プリセットを選択
  const handlePresetSelect = (id: PresetTemplateId) => {
    const template = PRESET_TEMPLATES.find((t) => t.id === id)
    if (!template) return

    setSelectedPreset(id)
    setTemplateChar(template.char)
    setCustomCharInput('')
    setTemplateMode(true)
  }

  // カスタム文字を適用
  const handleCustomCharApply = () => {
    // 最初の1文字のみ使用
    const char = [...customCharInput][0]
    if (!char) return

    setTemplateChar(char)
    setSelectedPreset(null)
    setTemplateMode(true)
  }

  // 入力変更時
  const handleCustomCharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // IME変換中は制限なし、確定後は最初の1文字のみ
    if (isComposingRef.current) {
      setCustomCharInput(value)
    } else {
      const firstChar = [...value][0] || ''
      setCustomCharInput(firstChar)
    }
  }

  // IME変換確定時
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    // 確定した文字列の最初の1文字のみ保持
    const value = e.currentTarget.value
    const firstChar = [...value][0] || ''
    setCustomCharInput(firstChar)
  }

  // 画像をアップロード
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setTemplateImage(dataUrl)
      setSelectedPreset(null)
      setTemplateMode(true)
    }
    reader.readAsDataURL(file)

    // input をリセット（同じファイルを再選択可能に）
    e.target.value = ''
  }

  // お手本をクリア
  const handleClear = () => {
    clearTemplate()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-500 tracking-wide flex items-center gap-1.5">
          <TemplateIcon />
          お手本
        </span>
        {isTemplateMode && (
          <button
            onClick={handleClear}
            className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <CloseIcon />
            解除
          </button>
        )}
      </div>

      {/* プリセット選択 */}
      <div className="flex flex-wrap gap-2">
        {PRESET_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handlePresetSelect(template.id)}
            className={`px-3 py-2 text-lg rounded-lg border transition-all duration-200 ${
              selectedPreset === template.id
                ? 'bg-stone-800 text-white border-stone-800 shadow-md shadow-stone-300/50'
                : 'bg-white/80 text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-white'
            }`}
            title={template.description}
          >
            {template.name}
          </button>
        ))}
      </div>

      {/* カスタム文字入力 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2 items-center" onPointerDown={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={customCharInput}
            onChange={handleCustomCharChange}
            onCompositionStart={() => {
              isComposingRef.current = true
            }}
            onCompositionEnd={(e) => {
              handleCompositionEnd(e)
              // IME確定後に自動適用
              const value = e.currentTarget.value
              const firstChar = [...value][0]
              if (firstChar) {
                setTemplateChar(firstChar)
                setSelectedPreset(null)
                setTemplateMode(true)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customCharInput && !isComposingRef.current) {
                e.preventDefault()
                handleCustomCharApply()
              }
            }}
            placeholder="文"
            className={`w-14 px-2 py-2 text-lg text-center rounded-lg border transition-all duration-200 ${
              isCustomChar
                ? 'border-stone-600 bg-stone-50'
                : 'border-stone-200 hover:border-stone-400 focus:border-stone-500 focus:outline-none'
            }`}
            maxLength={1}
          />
          <button
            onClick={handleCustomCharApply}
            disabled={!customCharInput}
            className="px-3 py-2 text-sm rounded-lg border border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
          >
            適用
          </button>
          <span className="text-xs text-stone-400 flex-1">1文字入力</span>
        </div>
      </div>

      {/* 現在のカスタム文字表示 */}
      {isCustomChar && (
        <div className="text-xs text-stone-400 text-center py-1">
          現在のお手本: <span style={{ fontFamily: '"Kouzan Mouhitu", serif' }} className="text-lg text-stone-600">{templateChar}</span>
        </div>
      )}

      {/* 画像アップロード */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-2.5 text-sm text-stone-500 border border-dashed border-stone-300 rounded-lg hover:border-stone-400 hover:bg-stone-50 hover:text-stone-600 flex items-center justify-center gap-2 transition-all duration-200"
        >
          <UploadIcon />
          画像をアップロード
        </button>
      </div>

      {/* 透明度調整（お手本モード時のみ） */}
      {isTemplateMode && (templateImage || templateChar) && (
        <div className="flex flex-col gap-2 pt-1">
          <Slider
            label="お手本の濃さ"
            showValue
            min={10}
            max={80}
            value={templateOpacity}
            onChange={(e) => setTemplateOpacity(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  )
}
