import { Application, Graphics, Container, RenderTexture, Sprite } from 'pixi.js'
import type { Stroke, BrushPoint } from '../../types'
import { CalligraphyBrush } from '../../core/brush'
import type { BrushType } from '../../core/brush/types'
import { lerp } from '../../utils/math'

export class CanvasRenderer {
  private app: Application
  private strokeContainer: Container
  private currentGraphics: Graphics
  private renderTexture: RenderTexture | null = null
  private renderedSprite: Sprite | null = null
  private initialized = false

  constructor() {
    this.app = new Application()
    this.strokeContainer = new Container()
    this.currentGraphics = new Graphics()
  }

  // 初期化
  async init(container: HTMLElement, width: number, height: number): Promise<void> {
    if (this.initialized) return

    await this.app.init({
      width,
      height,
      backgroundColor: 0xfff8f0, // 和紙風の背景色
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      preserveDrawingBuffer: true, // エクスポート時にキャンバス内容を保持
    })

    container.appendChild(this.app.canvas)

    // ポインタイベントを親コンテナで受け取るためにキャンバスでは無効化
    const canvas = this.app.canvas as HTMLCanvasElement
    canvas.style.pointerEvents = 'none'

    // レイヤー構成
    // 1. 背景
    // 2. 確定済みストローク（テクスチャ化）
    // 3. 現在描画中のストローク
    this.renderTexture = RenderTexture.create({ width, height })
    this.renderedSprite = new Sprite(this.renderTexture)
    this.app.stage.addChild(this.renderedSprite)
    this.app.stage.addChild(this.strokeContainer)
    this.strokeContainer.addChild(this.currentGraphics)

    this.initialized = true
  }

  // キャンバスサイズを変更
  resize(width: number, height: number): void {
    if (!this.initialized) return

    this.app.renderer.resize(width, height)

    // レンダーテクスチャも再作成
    if (this.renderTexture) {
      this.renderTexture.destroy()
      this.renderTexture = RenderTexture.create({ width, height })
      if (this.renderedSprite) {
        this.renderedSprite.texture = this.renderTexture
      }
    }
  }

  // 現在描画中のストロークを描画
  drawCurrentStroke(points: BrushPoint[], brush: CalligraphyBrush): void {
    if (points.length < 2) return

    const renderedPoints = brush.processStroke(points)
    const color = parseInt(brush.color.replace('#', ''), 16)

    this.currentGraphics.clear()

    // 円形スタンプ方式で滑らかな線を描画
    for (let i = 1; i < renderedPoints.length; i++) {
      const prev = renderedPoints[i - 1]
      const curr = renderedPoints[i]

      // 2点間を補間して円を配置
      const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y)
      const steps = Math.max(Math.ceil(dist / 2), 1)

      for (let j = 0; j <= steps; j++) {
        const t = j / steps
        const x = lerp(prev.x, curr.x, t)
        const y = lerp(prev.y, curr.y, t)
        const width = lerp(prev.width, curr.width, t)
        const opacity = lerp(prev.opacity, curr.opacity, t)

        this.currentGraphics
          .circle(x, y, width / 2)
          .fill({ color, alpha: opacity })
      }
    }
  }

  // ストロークを確定（テクスチャに焼き込み）
  commitStroke(): void {
    if (!this.renderTexture) return

    // 現在の描画をテクスチャに焼き込み
    this.app.renderer.render({
      container: this.currentGraphics,
      target: this.renderTexture,
      clear: false,
    })

    this.currentGraphics.clear()
  }

  // 全ストロークを再描画
  renderAllStrokes(strokes: Stroke[]): void {
    if (!this.renderTexture) return

    // テクスチャをクリア
    this.app.renderer.render({
      container: new Container(),
      target: this.renderTexture,
      clear: true,
    })

    const tempGraphics = new Graphics()

    for (const stroke of strokes) {
      const brushType = (stroke.brushType || 'standard') as BrushType
      const brush = new CalligraphyBrush(stroke.size, stroke.color, brushType)
      // 確定済みストロークには入り抜き補正を適用
      const renderedPoints = brush.processFinishedStroke(stroke.points)
      const color = parseInt(stroke.color.replace('#', ''), 16)

      for (let i = 1; i < renderedPoints.length; i++) {
        const prev = renderedPoints[i - 1]
        const curr = renderedPoints[i]
        const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y)
        const steps = Math.max(Math.ceil(dist / 2), 1)

        for (let j = 0; j <= steps; j++) {
          const t = j / steps
          const x = lerp(prev.x, curr.x, t)
          const y = lerp(prev.y, curr.y, t)
          const width = lerp(prev.width, curr.width, t)
          const opacity = lerp(prev.opacity, curr.opacity, t)

          tempGraphics.circle(x, y, width / 2).fill({ color, alpha: opacity })
        }
      }
    }

    this.app.renderer.render({
      container: tempGraphics,
      target: this.renderTexture,
      clear: false,
    })

    tempGraphics.destroy()
  }

  // キャンバスをクリア
  clear(): void {
    if (!this.renderTexture) return

    this.currentGraphics.clear()
    this.app.renderer.render({
      container: new Container(),
      target: this.renderTexture,
      clear: true,
    })
  }

  // PNG形式でエクスポート
  async exportImage(): Promise<Blob> {
    // 論理サイズ（表示サイズ）を取得
    const { width, height } = this.app.screen
    const pixiCanvas = this.app.canvas as HTMLCanvasElement

    // エクスポート用キャンバスを作成（論理サイズで）
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = width
    exportCanvas.height = height
    const ctx = exportCanvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // 背景色を描画
    ctx.fillStyle = '#fff8f0'
    ctx.fillRect(0, 0, width, height)

    // PixiJSのキャンバスを描画（実際のピクセルサイズから論理サイズにスケール）
    ctx.drawImage(
      pixiCanvas,
      0, 0, pixiCanvas.width, pixiCanvas.height,  // ソース（実際のキャンバスサイズ）
      0, 0, width, height                          // デスティネーション（論理サイズ）
    )

    return new Promise((resolve, reject) => {
      exportCanvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to export image'))
      }, 'image/png')
    })
  }

  // クリーンアップ
  destroy(): void {
    if (!this.initialized) return

    this.renderTexture?.destroy()
    this.currentGraphics.destroy()
    this.strokeContainer.destroy()
    this.app.destroy(true, { children: true })
    this.initialized = false
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement
  }

  get isInitialized(): boolean {
    return this.initialized
  }
}
