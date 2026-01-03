import { useCanvasStore } from '../../stores/canvasStore'
import { INK_COLORS } from '../../types'

export function ColorPicker() {
  const { brushColor, setBrushColor } = useCanvasStore()

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-gray-600">墨色</span>
      <div className="flex gap-2">
        {INK_COLORS.map((ink) => (
          <button
            key={ink.value}
            onClick={() => setBrushColor(ink.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
              brushColor === ink.value
                ? 'border-gray-400 ring-2 ring-gray-300 ring-offset-2'
                : 'border-gray-200'
            }`}
            style={{ backgroundColor: ink.value }}
            title={ink.name}
          />
        ))}
      </div>
    </div>
  )
}
