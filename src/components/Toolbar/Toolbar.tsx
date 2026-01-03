import { BrushSettings } from './BrushSettings'
import { ColorPicker } from './ColorPicker'
import { TemplateSettings } from './TemplateSettings'

export function Toolbar() {
  return (
    <div className="bg-gradient-to-b from-white to-stone-50/80 rounded-xl shadow-lg shadow-stone-200/50 border border-stone-200/60 py-5 px-6 flex flex-col gap-5">
      {/* 筆の設定 */}
      <section>
        <BrushSettings />
      </section>

      {/* 区切り線 */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

      {/* 墨色選択 */}
      <section>
        <ColorPicker />
      </section>

      {/* 区切り線 */}
      <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

      {/* お手本設定 */}
      <section>
        <TemplateSettings />
      </section>
    </div>
  )
}
