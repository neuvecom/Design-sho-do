import { Slider } from '../UI'
import { useCanvasStore } from '../../stores/canvasStore'
import { BRUSH_PRESETS } from '../../core/brush/types'
import type { BrushType } from '../../core/brush/types'

export function BrushSettings() {
  const { brushSize, brushType, setBrushSize, setBrushType } = useCanvasStore()

  return (
    <div className="flex flex-col gap-4">
      {/* 筆の種類選択 */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-stone-500 tracking-wide">筆の種類</span>
        <div className="grid grid-cols-2 gap-2">
          {BRUSH_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setBrushType(preset.id as BrushType)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                brushType === preset.id
                  ? 'bg-stone-800 text-white border-stone-800 shadow-md shadow-stone-300/50'
                  : 'bg-white/80 text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-white'
              }`}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 筆の太さ */}
      <Slider
        label="筆の太さ"
        showValue
        min={5}
        max={50}
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
      />

      {/* プレビュー */}
      <div className="flex items-center justify-center h-14 bg-gradient-to-b from-stone-50 to-stone-100/50 rounded-lg border border-stone-200/50">
        <div
          className="rounded-full bg-stone-800 shadow-sm transition-all duration-200"
          style={{
            width: brushSize,
            height: brushSize,
          }}
        />
      </div>
    </div>
  )
}
