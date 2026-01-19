# Changelog

このファイルは、プロジェクトの重要な変更を記録します。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
バージョニングは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [Unreleased]

### 予定されている機能
- トークン自動更新（Vercel Cron Jobs）
- アカウント削除機能
- トークン期限アラート
- 管理者認証
- Bot用のメディア取得APIエンドポイント

## [0.1.0] - 2026-01-19

### 追加
- Instagram OAuth 2.0 認証フロー
- アクセストークンの AES-256-GCM 暗号化保存
- CSRF対策（state パラメータ検証）
- 長期トークンへの自動交換
- 接続済みアカウント一覧表示
- トークンリフレッシュAPI
- Vercel KV (Upstash Redis) によるデータ保存
- 環境変数チェックスクリプト
- 暗号化キー生成スクリプト
- 詳細なREADME、QUICKSTART、DEPLOYMENT ガイド

### セキュリティ
- トークンの暗号化保存（平文保存の禁止）
- HttpOnly、Secure、SameSite Cookie の使用
- OAuth state パラメータによるCSRF対策
- ログへのトークン出力の防止

---

## リリースの種類

- **追加 (Added)**: 新機能
- **変更 (Changed)**: 既存機能の変更
- **非推奨 (Deprecated)**: 将来削除される機能
- **削除 (Removed)**: 削除された機能
- **修正 (Fixed)**: バグ修正
- **セキュリティ (Security)**: セキュリティに関する変更
