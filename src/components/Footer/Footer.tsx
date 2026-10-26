import { Link } from 'react-router-dom'
import { KofiBanner } from '../Kofi'

export function Footer() {
  return (
    <footer className="mt-10 flex flex-col items-center gap-6">
      {/* ページリンク */}
      <nav className="flex flex-wrap justify-center gap-3 text-sm">
        <Link
          to="/info"
          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg border border-stone-300 hover:bg-stone-200 hover:border-stone-400 transition-colors"
        >
          お知らせ
        </Link>
        <Link
          to="/guide"
          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg border border-stone-300 hover:bg-stone-200 hover:border-stone-400 transition-colors"
        >
          使い方
        </Link>
        <Link
          to="/about"
          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg border border-stone-300 hover:bg-stone-200 hover:border-stone-400 transition-colors"
        >
          墨道について
        </Link>
        <Link
          to="/item"
          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg border border-stone-300 hover:bg-stone-200 hover:border-stone-400 transition-colors"
        >
          おすすめの道具
        </Link>
      </nav>

      {/* Ko-fi 支援バナー */}
      <div className="w-full max-w-xl">
        <KofiBanner />
      </div>

      {/* 著作権表示 */}
      <div className="text-xs text-stone-700 pb-4">
        &copy; neuve project All rights reserved.
      </div>
    </footer>
  )
}
