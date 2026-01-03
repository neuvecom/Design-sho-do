/**
 * コンテンツのファイル一覧をJSONとして生成するスクリプト
 * ビルド前に実行して、public/content-index.json を生成します
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.join(__dirname, '../public/content')
const OUTPUT_FILE = path.join(__dirname, '../public/content-index.json')

const CATEGORIES = ['guide', 'about', 'item']

function getMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace('.md', ''))
}

function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1] : path.basename(filePath, '.md')
}

function generateIndex() {
  const index = {}

  for (const category of CATEGORIES) {
    const categoryDir = path.join(CONTENT_DIR, category)
    const files = getMarkdownFiles(categoryDir)

    index[category] = files.map((slug) => {
      const filePath = path.join(categoryDir, `${slug}.md`)
      return {
        slug,
        title: extractTitle(filePath),
      }
    })
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2))
  console.log('Generated content-index.json')
  console.log(JSON.stringify(index, null, 2))
}

generateIndex()
