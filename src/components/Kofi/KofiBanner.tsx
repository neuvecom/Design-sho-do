import { useEffect } from 'react'

// Ko-fi 支援バナー（neuvecom/kofi-banner の Web コンポーネント）
// バナーの文言や見た目を変えたら kofi-banner 側で新しいタグを打ち、ここの @vX.Y.Z を上げる
const KOFI_SCRIPT_SRC = 'https://cdn.jsdelivr.net/gh/neuvecom/kofi-banner@v1.0.0/kofi-banner.js'

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'kofi-banner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        user?: string
      }
    }
  }
}

interface KofiBannerProps {
  user?: string
}

export function KofiBanner({ user = 'otasuke' }: KofiBannerProps) {
  useEffect(() => {
    // スクリプトは 1 回だけ読み込む（ページ遷移で Footer が作り直されても重複させない）
    if (document.querySelector(`script[src="${KOFI_SCRIPT_SRC}"]`)) return
    const script = document.createElement('script')
    script.src = KOFI_SCRIPT_SRC
    script.defer = true
    document.head.appendChild(script)
  }, [])

  return (
    <kofi-banner user={user}>
      <a href={`https://ko-fi.com/${user}`} target="_blank" rel="noopener noreferrer">
        Ko-fi で制作者を支援する
      </a>
    </kofi-banner>
  )
}
