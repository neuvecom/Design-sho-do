import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// OGP画像をPNGに変換
const ogpSvg = readFileSync(join(publicDir, 'og-image.svg'), 'utf-8')
const resvg = new Resvg(ogpSvg, {
  fitTo: {
    mode: 'width',
    value: 1200,
  },
  font: {
    loadSystemFonts: true,
  },
})
const pngData = resvg.render()
const pngBuffer = pngData.asPng()
writeFileSync(join(publicDir, 'og-image.png'), pngBuffer)
console.log('Generated og-image.png')

// Faviconもpngに変換 (32x32)
const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'), 'utf-8')
const faviconResvg = new Resvg(faviconSvg, {
  fitTo: {
    mode: 'width',
    value: 32,
  },
  font: {
    loadSystemFonts: true,
  },
})
const faviconPng = faviconResvg.render().asPng()
writeFileSync(join(publicDir, 'favicon-32x32.png'), faviconPng)
console.log('Generated favicon-32x32.png')

// Apple Touch Icon (180x180)
const appleSvg = readFileSync(join(publicDir, 'apple-touch-icon.svg'), 'utf-8')
const appleResvg = new Resvg(appleSvg, {
  fitTo: {
    mode: 'width',
    value: 180,
  },
  font: {
    loadSystemFonts: true,
  },
})
const applePng = appleResvg.render().asPng()
writeFileSync(join(publicDir, 'apple-touch-icon.png'), applePng)
console.log('Generated apple-touch-icon.png')

console.log('All OGP assets generated!')
