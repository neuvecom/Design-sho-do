import { Link, useLocation } from 'react-router-dom'

export interface MenuItem {
  path: string
  label: string
  icon?: React.ReactNode
}

interface SideMenuProps {
  items: MenuItem[]
}

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

// パスに応じたデフォルトアイコンを返す
const getDefaultIcon = (path: string) => {
  if (path === '/') return <HomeIcon />
  if (path.includes('guide')) return <BookIcon />
  if (path.includes('about')) return <InfoIcon />
  return <BookIcon />
}

export function SideMenu({ items }: SideMenuProps) {
  const location = useLocation()

  return (
    <nav className="w-56 shrink-0">
      <div className="sticky top-10">
        <div className="bg-white/80 rounded-xl shadow-lg shadow-stone-200/50 border border-stone-200/60 p-4">
          <h2 className="text-sm font-bold text-stone-600 mb-3 px-2">メニュー</h2>
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-stone-400'}>
                      {item.icon || getDefaultIcon(item.path)}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}
