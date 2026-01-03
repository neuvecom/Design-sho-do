# 墨彩的墨道 - 開発計画

## 概要
- **目的**: Webで墨道（デザイン書道）を手軽に楽しめるアプリ
- **ターゲット**: 幅広い層（初心者〜経験者）
- **優先事項**: 手軽さ・使いやすさ
- **開発方針**: MVP優先で段階的に拡張
- **デプロイ**: GitHub Pages
- **URL**: https://neuve.com/Design-sho-do/

---

## 技術スタック

| 項目 | 選定 | 理由 |
|------|------|------|
| フレームワーク | React + Vite + TypeScript | 高速ビルド、型安全性、GitHub Pages対応 |
| 描画ライブラリ | PixiJS v8 | WebGPU/WebGL対応、高パフォーマンス |
| スタイリング | Tailwind CSS | ユーティリティファースト、高速開発 |
| 筆圧検出 | Pointer Events API | 標準API、マルチデバイス対応 |
| 状態管理 | Zustand | 軽量、TypeScript相性良好 |
| デプロイ | GitHub Actions | 自動デプロイ |
| 分析 | GA4 + Cloudflare Analytics | アクセス解析 |

---

## 実装フェーズ

### Phase 1: 基盤構築 ✅ 完了

**1.1 プロジェクトセットアップ**
- [x] Vite + React + TypeScript初期化
- [x] Tailwind CSS設定
- [x] ESLint/Prettier設定
- [x] PixiJS v8、Zustandインストール
- [x] ディレクトリ構造作成

**1.2 キャンバス基盤**
- [x] PixiJSアプリケーション初期化（`CanvasRenderer.ts`）
- [x] 正方形キャンバスコンポーネント（`Canvas.tsx`）
- [x] リサイズ対応（`useCanvasSize.ts`）
- [x] ポインタイベント処理（`usePointerInput.ts`）

**1.3 基本筆ブラシ**
- [x] BrushEngineクラス実装
- [x] 筆圧対応の線描画
- [x] CalligraphyBrush実装（線幅変動、かすれ表現）

### Phase 2: コア機能 ✅ 完了

**2.1 操作履歴**
- [x] HistoryManager実装
- [x] Undo/Redo機能
- [x] キーボードショートカット（Ctrl+Z/Y）

**2.2 UI実装**
- [x] Toolbarコンポーネント
- [x] 筆サイズスライダー
- [x] 色選択パレット
- [x] クリア/消しゴムボタン
- [x] 8x8グリッド表示機能

**2.3 画像エクスポート**
- [x] ImageExporter実装
- [x] PNG書き出し・ダウンロード

### Phase 3: デプロイ ✅ 完了

**3.1 GitHub Pages設定**
- [x] vite.config.ts baseパス設定
- [x] GitHub Actions workflow作成
- [x] デプロイ動作確認
- [x] カスタムドメイン設定（neuve.com）

**3.2 品質向上**
- [x] レスポンシブ調整
- [x] パフォーマンスチューニング
- [x] OGP/Twitter Card設定

### Phase 4: 拡張機能 🔄 進行中

**4.1 SNS・共有** ✅ 完了
- [x] X共有ボタン実装
- [x] 画像ダウンロード + 投稿画面連携

**4.2 マネタイズ** ✅ 完了
- [x] バリューコマース広告設定
- [ ] Amazonアソシエイト（道具・書籍紹介）

**4.3 お手本モード** ✅ 完了
- [x] テンプレート文字表示機能
- [x] 透明度調整機能
- [x] 作品保存・呼び出し機能

**4.4 操作性向上** ✅ 完了
- [x] Shift+マウス移動描画モード
- [x] Shiftキーインジケーター表示

**4.5 コンテンツページ** ✅ 完了
- [x] 使い方ページ（/guide）
- [x] 墨道のすすめページ（/about）
- [x] 左サイドメニューレイアウト

---

## Phase 5: 今後の拡張予定

### 5.1 コンテンツ拡充
- [ ] 使い方ページの充実（図解、動画など）
- [ ] 墨道のすすめの追加コンテンツ
- [ ] 練習用お手本集ページ
- [ ] よくある質問（FAQ）ページ

### 5.2 ゲームパッド対応
- [ ] Gamepad API連携
- [ ] アナログスティックによる筆圧制御
- [ ] トリガーによる太さ調整
- [ ] ボタンマッピング設定UI
- [ ] 複数ゲームパッドのサポート

### 5.3 筆の種類追加 ✅ 完了
- [x] 細筆
- [x] 太筆
- [x] かすれ筆
- [x] 筆プリセット保存機能

### 5.4 背景・素材 ✅ 完了
- [x] 和紙テクスチャ背景
- [x] 罫線テンプレート
- [x] 季節のフレーム

### 5.5 ギャラリー機能 ✅ 完了
- [x] 作品一覧表示
- [x] ローカルストレージ保存
- [x] 作品の編集・削除

### 5.6 PWA対応（オプション）
- [ ] manifest.json設定
- [ ] Service Worker実装
- [ ] オフラインキャッシュ戦略

---

## 重要ファイル

| ファイル | 役割 |
|----------|------|
| `src/core/brush/CalligraphyBrush.ts` | 書道筆のコアロジック |
| `src/core/brush/BrushEngine.ts` | ブラシシステム基盤 |
| `src/components/Canvas/CanvasRenderer.ts` | PixiJS連携 |
| `src/components/Canvas/Canvas.tsx` | メインキャンバスコンポーネント |
| `src/stores/canvasStore.ts` | 状態管理 |
| `src/pages/MarkdownPage.tsx` | コンテンツページ |
| `src/components/Layout/SideMenu.tsx` | サイドメニュー |

---

## リポジトリ情報

- **GitHub**: https://github.com/neuvecom/Design-sho-do（プライベート）
- **公開URL**: https://neuve.com/Design-sho-do/
- **GitHub Pages**: https://neuvecom.github.io/Design-sho-do/
