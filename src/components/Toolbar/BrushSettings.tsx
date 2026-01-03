import { Slider } from '../UI'
import { useCanvasStore } from '../../stores/canvasStore'

export function BrushSettings() {
  const { brushSize, setBrushSize } = useCanvasStore()

  return (
    <div className="flex flex-col gap-2">
      <Slider
        label="筆の太さ"
        showValue
        min={5}
        max={50}
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
      />
      {/* プレビュー */}
      <div className="flex items-center justify-center h-12 bg-gray-50 rounded-lg">
        <div
          className="rounded-full bg-gray-800"
          style={{
            width: brushSize,
            height: brushSize,
          }}
        />
      </div>
    </div>
  )
}
