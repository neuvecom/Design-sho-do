import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, MarkdownPage, IndexPage } from './pages'

const BASE_PATH = '/Design-sho-do'

function App() {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* お知らせ */}
        <Route path="/info" element={<MarkdownPage contentPath={`${BASE_PATH}/content/info.md`} />} />

        {/* 使い方 */}
        <Route
          path="/guide"
          element={
            <IndexPage
              category="guide"
              title="使い方"
              description="墨彩的墨道の使い方を紹介します。"
            />
          }
        />
        <Route path="/guide/:slug" element={<MarkdownPage contentPath={`${BASE_PATH}/content/guide`} />} />

        {/* 墨道について */}
        <Route
          path="/about"
          element={
            <IndexPage
              category="about"
              title="墨道について"
              description="墨道の魅力や歴史について紹介します。"
            />
          }
        />
        <Route path="/about/:slug" element={<MarkdownPage contentPath={`${BASE_PATH}/content/about`} />} />

        {/* おすすめの道具 */}
        <Route
          path="/item"
          element={
            <IndexPage
              category="item"
              title="おすすめの道具"
              description="書道を楽しむためのおすすめの道具を紹介します。"
            />
          }
        />
        <Route path="/item/:slug" element={<MarkdownPage contentPath={`${BASE_PATH}/content/item`} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
