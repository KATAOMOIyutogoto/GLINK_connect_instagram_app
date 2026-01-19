# 貢献ガイド

このプロジェクトへの貢献に興味を持っていただき、ありがとうございます！

## 開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/your-org/glink-instagram-oauth.git
cd glink-instagram-oauth
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
# env.example をコピー
Copy-Item env.example .env.local

# 暗号化キーを生成
npm run generate-key

# .env.local を編集して必要な値を設定
```

4. 環境変数をチェック
```bash
npm run check-env
```

5. 開発サーバーを起動
```bash
npm run dev
```

## コーディング規約

### TypeScript

- 型定義は明示的に記述する
- `any` の使用は避ける
- インターフェースは `types/index.ts` に集約

### ファイル構成

- **Pages**: `app/*/page.tsx`
- **API Routes**: `app/api/*/route.ts`
- **ユーティリティ**: `lib/*.ts`
- **型定義**: `types/*.ts`
- **スクリプト**: `scripts/*.js`

### 命名規則

- **コンポーネント**: PascalCase (例: `ConnectedPage`)
- **関数**: camelCase (例: `generateAuthUrl`)
- **定数**: UPPER_SNAKE_CASE (例: `IG_OAUTH_BASE`)
- **ファイル**: kebab-case (例: `check-env.js`)

## Git ワークフロー

### ブランチ戦略

- `main`: 本番環境にデプロイされるブランチ
- `develop`: 開発用の統合ブランチ
- `feature/*`: 新機能開発用
- `fix/*`: バグ修正用

### コミットメッセージ

以下の形式に従ってください:

```
<type>: <subject>

<body>
```

**Type**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル（機能に影響しない）
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: その他の変更

**例**:
```
feat: トークン自動更新機能を追加

- Vercel Cron Jobsを使用した定期実行
- 期限が近いトークンを自動検出
- リフレッシュ失敗時のリトライ機能
```

## プルリクエスト

1. `develop` ブランチから作業用ブランチを作成
```bash
git checkout develop
git checkout -b feature/new-feature
```

2. 変更をコミット
```bash
git add .
git commit -m "feat: 新機能の説明"
```

3. プッシュ
```bash
git push origin feature/new-feature
```

4. GitHub でプルリクエストを作成
   - タイトル: 簡潔な説明
   - 説明: 変更内容、動機、影響範囲
   - レビュワーを指定

### プルリクエストのチェックリスト

- [ ] コードがビルドできる (`npm run build`)
- [ ] Lintエラーがない (`npm run lint`)
- [ ] 環境変数のチェックが通る (`npm run check-env`)
- [ ] 新機能にはドキュメントを追加
- [ ] 破壊的変更がある場合は CHANGELOG に記載

## テスト（今後追加予定）

```bash
npm run test
```

## セキュリティ

セキュリティ上の問題を発見した場合は、公開 Issue ではなく、直接プロジェクトオーナーに連絡してください。

### 報告すべき事項

- 認証・認可の脆弱性
- トークン漏洩の可能性
- インジェクション攻撃の脆弱性
- CSRF/XSS の脆弱性

## ライセンス

このプロジェクトへの貢献は、プロジェクトのライセンスに従います。

## 質問・サポート

- GitHub Issues で質問を投稿
- ディスカッションは GitHub Discussions を使用

---

貢献いただき、ありがとうございます！
