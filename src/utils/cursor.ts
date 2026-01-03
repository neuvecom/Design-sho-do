// ブラシサイズに応じたカスタムカーソルを生成
export function createBrushCursor(size: number, color: string): string {
  // カーソルサイズは最小8px、最大64pxに制限
  const cursorSize = Math.max(8, Math.min(size, 64))
  const halfSize = cursorSize / 2

  // SVGで円形カーソルを生成
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}">
      <circle
        cx="${halfSize}"
        cy="${halfSize}"
        r="${halfSize - 1}"
        fill="${color}"
        fill-opacity="0.3"
        stroke="${color}"
        stroke-width="1"
      />
      <circle
        cx="${halfSize}"
        cy="${halfSize}"
        r="1"
        fill="${color}"
      />
    </svg>
  `.trim()

  // SVGをData URLに変換
  const encoded = encodeURIComponent(svg)
  return `url("data:image/svg+xml,${encoded}") ${halfSize} ${halfSize}, crosshair`
}
