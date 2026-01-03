import { useState, useRef } from 'react'
import { useCanvasStore } from '../../stores/canvasStore'
import { INK_COLORS, CUSTOM_COLOR_KEY } from '../../types'

// カスタム色アイコン
const CustomColorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
  </svg>
)

export function ColorPicker() {
  const { brushColor, setBrushColor } = useCanvasStore()
  const [customColor, setCustomColor] = useState(() => {
    return localStorage.getItem(CUSTOM_COLOR_KEY) || '#6b4423'
  })
  const colorInputRef = useRef<HTMLInputElement>(null)

  // プリセット色かどうかをチェック
  const isPresetColor = INK_COLORS.some((ink) => ink.value === brushColor)
  // カスタム色が選択されているかどうか
  const isCustomSelected = !isPresetColor

  // カスタム色を選択
  const handleCustomColorClick = () => {
    setBrushColor(customColor)
  }

  // カスタム色を変更
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    setBrushColor(newColor)
    localStorage.setItem(CUSTOM_COLOR_KEY, newColor)
  }

  // カスタム色ボタンをダブルクリックでカラーピッカーを開く
  const handleCustomColorDoubleClick = () => {
    colorInputRef.current?.click()
  }

  // 墨系と特殊色を分類
  const sumiColors = INK_COLORS.filter((ink) => ink.category === 'sumi')
  const specialColors = INK_COLORS.filter((ink) => ink.category === 'special')

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm text-stone-500 tracking-wide">墨色</span>

      {/* 墨系の色 */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-stone-400">墨</span>
        <div className="flex gap-2.5">
          {sumiColors.map((ink) => (
            <button
              key={ink.value}
              onClick={() => setBrushColor(ink.value)}
              className={`w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 ${
                brushColor === ink.value
                  ? 'ring-2 ring-stone-400 ring-offset-2 shadow-md'
                  : 'hover:shadow-md'
              }`}
              style={{ backgroundColor: ink.value }}
              title={ink.name}
            />
          ))}
        </div>
      </div>

      {/* 特殊色 + カスタム */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-stone-400">その他</span>
        <div className="flex gap-2.5 items-center">
          {specialColors.map((ink) => (
            <button
              key={ink.value}
              onClick={() => setBrushColor(ink.value)}
              className={`w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 ${
                brushColor === ink.value
                  ? 'ring-2 ring-stone-400 ring-offset-2 shadow-md'
                  : 'hover:shadow-md'
              }`}
              style={{ backgroundColor: ink.value }}
              title={ink.name}
            />
          ))}

          {/* カスタム色 */}
          <div className="relative">
            <button
              onClick={handleCustomColorClick}
              onDoubleClick={handleCustomColorDoubleClick}
              className={`w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center border-2 border-dashed ${
                isCustomSelected
                  ? 'ring-2 ring-stone-400 ring-offset-2 shadow-md border-transparent'
                  : 'border-stone-300 hover:border-stone-400'
              }`}
              style={{ backgroundColor: customColor }}
              title="カスタム色（ダブルクリックで変更）"
            >
              <span className="text-white mix-blend-difference opacity-60">
                <CustomColorIcon />
              </span>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
              title="カスタム色を選択"
            />
          </div>
        </div>
      </div>

      {/* 現在の色表示 */}
      <div className="flex items-center gap-2 px-2 py-1.5 bg-stone-50 rounded-md">
        <div
          className="w-5 h-5 rounded-full shadow-inner"
          style={{ backgroundColor: brushColor }}
        />
        <span className="text-xs text-stone-500 font-mono">{brushColor}</span>
      </div>
    </div>
  )
}
