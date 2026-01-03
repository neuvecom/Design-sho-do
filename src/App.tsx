import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, MarkdownPage } from './pages'

function App() {
  return (
    <BrowserRouter basename="/Design-sho-do">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guide" element={<MarkdownPage contentPath="/Design-sho-do/content/guide.md" />} />
        <Route path="/about" element={<MarkdownPage contentPath="/Design-sho-do/content/about.md" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
