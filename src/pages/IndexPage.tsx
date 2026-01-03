import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { SideMenu, type MenuItem } from '../components/Layout'

interface IndexPageProps {
  category: 'guide' | 'about' | 'item'
  title: string
  description: string
}

interface ContentItem {
  slug: string
  title: string
}

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

// サイドメニューの項目定義
const menuItems: MenuItem[] = [
  { path: '/', label: 'アプリ' },
  { path: '/info', label: 'お知らせ' },
  { path: '/guide', label: '使い方' },
  { path: '/about', label: '墨道について' },
  { path: '/item', label: 'おすすめの道具' },
]

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
)

export function IndexPage({ category, title, description }: IndexPageProps) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)

      try {
        // content-index.json からファイル一覧を取得
        const response = await fetch(`${BASE_PATH}/content-index.json`)
        if (response.ok) {
          const index = await response.json()
          setItems(index[category] || [])
        }
      } catch {
        setItems([])
      }

      setLoading(false)
    }

    loadItems()
  }, [category])

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

          {/* 目次コンテンツ */}
          <article className="flex-1 min-w-0 bg-white/80 rounded-xl shadow-lg shadow-stone-200/50 border border-stone-200/60 p-8">
            <div className="prose prose-stone max-w-none">
              <h1 className="text-3xl font-bold border-b border-stone-200 pb-4 mb-8">{title}</h1>
              <p className="text-stone-600 mb-8">{description}</p>

              {loading ? (
                <div className="text-center py-12 text-stone-400">読み込み中...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-stone-400">コンテンツがありません</div>
              ) : (
                <ul className="space-y-3 list-none pl-0">
                  {items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/${category}/${item.slug}`}
                        className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-colors no-underline"
                      >
                        <span className="text-amber-600">▸</span>
                        <span className="text-stone-700 font-medium">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </div>

        {/* フッター */}
        <Footer />
      </div>
    </div>
  )
}
