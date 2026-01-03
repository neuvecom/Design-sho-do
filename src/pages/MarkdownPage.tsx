import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Footer } from '../components/Footer'
import { SideMenu, type MenuItem } from '../components/Layout'

interface MarkdownPageProps {
  contentPath: string
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
)

// サイドメニューの項目定義
const menuItems: MenuItem[] = [
  { path: '/', label: 'ホーム' },
  { path: '/guide', label: '使い方' },
  { path: '/about', label: 'デザイン書道のすすめ' },
]

export function MarkdownPage({ contentPath }: MarkdownPageProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(contentPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error('コンテンツの読み込みに失敗しました')
        }
        return response.text()
      })
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [contentPath])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-amber-50/30 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* モバイル用: 戻るリンク */}
        <nav className="mb-6 lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors"
          >
            <BackIcon />
            <span>戻る</span>
          </Link>
        </nav>

        {/* メインコンテンツ（サイドメニュー + 記事） */}
        <div className="flex gap-8">
          {/* サイドメニュー（デスクトップのみ） */}
          <div className="hidden lg:block">
            <SideMenu items={menuItems} />
          </div>

          {/* 記事コンテンツ */}
          <article className="flex-1 min-w-0 bg-white/80 rounded-xl shadow-lg shadow-stone-200/50 border border-stone-200/60 p-8">
            {loading && (
              <div className="text-center py-12 text-stone-400">読み込み中...</div>
            )}

            {error && (
              <div className="text-center py-12 text-red-500">{error}</div>
            )}

            {!loading && !error && (
              <div className="prose prose-stone max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:border-b prose-h1:border-stone-200 prose-h1:pb-4 prose-h1:mb-8 prose-h2:text-xl prose-h2:mt-8 prose-h3:text-lg prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-th:bg-stone-100 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-stone-200">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </article>
        </div>

        {/* フッター */}
        <Footer />
      </div>
    </div>
  )
}
