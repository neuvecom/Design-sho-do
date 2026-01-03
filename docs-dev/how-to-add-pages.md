# コンテンツ追加・編集手順

このドキュメントでは、墨彩的墨道のコンテンツページを追加・編集する方法を説明します。

---

## フォルダ構造

```
public/content/
├── info.md              # お知らせ（単一ページ）
├── content-index.json   # 目次用のインデックス（自動生成）
├── guide/               # 使い方（目次ページ + 複数記事）
│   └── basic.md         # 使い方ガイド
├── about/               # 墨道について（目次ページ + 複数記事）
│   └── introduction.md  # 墨道のすすめ
└── item/                # おすすめの道具（目次ページ + 複数記事）
    └── brushes.md       # おすすめの筆
```

---

## URL構成

| URL | 内容 | ファイル |
|-----|------|----------|
| `/info` | お知らせ | `content/info.md` |
| `/guide` | 使い方（目次） | 自動生成 |
| `/guide/basic` | 使い方ガイド | `content/guide/basic.md` |
| `/about` | 墨道について（目次） | 自動生成 |
| `/about/introduction` | 墨道のすすめ | `content/about/introduction.md` |
| `/item` | おすすめの道具（目次） | 自動生成 |
| `/item/brushes` | おすすめの筆 | `content/item/brushes.md` |

---

## 既存コンテンツの編集

`public/content/` 内のMarkdownファイルを直接編集します。

```bash
# 例：使い方ガイドを編集
code public/content/guide/basic.md
```

編集後、開発サーバーで確認：
```bash
npm run dev
```

---

## 新規ページの追加

### カテゴリ内に記事を追加する場合

**Step 1**: 該当フォルダにMarkdownファイルを作成

```bash
# 例：使い方カテゴリに「tips.md」を追加
touch public/content/guide/tips.md
```

**Step 2**: Markdownファイルを編集

```markdown
# コツと裏技

ここでは墨彩的墨道を使いこなすためのコツを紹介します。

## 筆圧のコントロール

...
```

**Step 3**: コンテンツインデックスを更新

```bash
npm run build:index
```

これで目次ページに自動的に追加されます。

### 新しいカテゴリを追加する場合

新しいカテゴリを追加するには、コードの変更が必要です。

**Step 1**: フォルダを作成

```bash
mkdir public/content/新カテゴリ名
```

**Step 2**: `scripts/generate-content-index.js` を編集

```javascript
const CATEGORIES = ['guide', 'about', 'item', '新カテゴリ名']
```

**Step 3**: `src/App.tsx` にルートを追加

```tsx
{/* 新カテゴリ */}
<Route
  path="/新カテゴリ名"
  element={
    <IndexPage
      category="新カテゴリ名"
      title="タイトル"
      description="説明文"
    />
  }
/>
<Route path="/新カテゴリ名/:slug" element={<MarkdownPage contentPath={`${BASE_PATH}/content/新カテゴリ名`} />} />
```

**Step 4**: `src/pages/IndexPage.tsx` の型を更新

```tsx
interface IndexPageProps {
  category: 'guide' | 'about' | 'item' | '新カテゴリ名'
  // ...
}
```

**Step 5**: サイドメニューを更新（`IndexPage.tsx` と `MarkdownPage.tsx`）

```tsx
const menuItems: MenuItem[] = [
  // ...
  { path: '/新カテゴリ名', label: '表示名' },
]
```

---

## Markdownの書き方

通常のMarkdown記法がそのまま使えます。

### 見出し

```markdown
# 大見出し（H1）- ページタイトルとして使用
## 中見出し（H2）
### 小見出し（H3）
```

### リスト

```markdown
- 箇条書き項目1
- 箇条書き項目2

1. 番号付きリスト1
2. 番号付きリスト2
```

### 強調

```markdown
**太字**
*斜体*
```

### リンク

```markdown
[リンクテキスト](https://example.com)
```

### テーブル

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
```

### アフィリエイト用コメント（将来対応用）

```markdown
<!-- AMAZON_AFFILIATE: 書道セット -->
```

---

## ビルドとデプロイ

### 開発時

```bash
npm run dev
```

### 本番ビルド

```bash
npm run build
```

ビルド時に自動で `content-index.json` が生成されます。

### 目次インデックスのみ更新

```bash
npm run build:index
```

---

## 注意事項

1. **ファイル名はスラッグになります**
   - `tips.md` → `/guide/tips`
   - 英数字とハイフンのみ推奨

2. **最初のH1見出しがタイトルになります**
   - 目次ページに表示されるタイトルは、Markdownファイルの最初の `# 見出し` から取得されます

3. **画像の配置**
   - 画像は `public/assets/` に配置
   - Markdownから参照: `![説明](/Design-sho-do/assets/image.png)`

4. **ビルド後の確認**
   ```bash
   npm run preview
   ```
