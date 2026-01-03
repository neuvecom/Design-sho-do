import { BrushSettings } from './BrushSettings'
import { ColorPicker } from './ColorPicker'
import { ActionButtons } from './ActionButtons'
import type { CanvasHandle } from '../Canvas'

interface ToolbarProps {
  canvasRef?: React.RefObject<CanvasHandle | null>
}

export function Toolbar({ canvasRef }: ToolbarProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">ツール</h2>
        <ActionButtons canvasRef={canvasRef} />
      </div>
      <div className="h-px bg-gray-200" />
      <BrushSettings />
      <div className="h-px bg-gray-200" />
      <ColorPicker />
    </div>
  )
}
