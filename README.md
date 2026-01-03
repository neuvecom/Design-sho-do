# デザイン書道

Webでデザイン書道を手軽に楽しめるアプリケーションです。

## 機能

- 筆圧対応のリアルな筆運び（Apple Pencil、Surface Pen、Wacom等対応）
- 5種類の墨色から選択可能
- 筆の太さを自由に調整
- Undo/Redo機能（Ctrl+Z / Ctrl+Y）
- PNG形式での画像保存

## 技術スタック

- React 19 + TypeScript
- PixiJS v8（WebGL/WebGPU描画）
- Tailwind CSS
- Zustand（状態管理）
- Vite（ビルドツール）

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## デプロイ

GitHub Pagesへ自動デプロイされます。mainブランチにプッシュすると自動的にビルド・デプロイが実行されます。

## ライセンス

Private
