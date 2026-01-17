# Apple Intelligence Skills

Apple Intelligence / Foundation Models開発のためのClaude Codeプラグイン

## 概要

iOS 26で導入されたFoundation Modelsフレームワークと、iOS 18以降のApple Intelligence機能を活用したアプリ開発を支援する14のスキルを収録しています。

**すべてのスキルはApple公式ドキュメントのみを情報源としています。**

## インストール

```bash
claude plugins add https://github.com/mitsu1032/apple-intelligence-skills
```

## 収録スキル

### Foundation Models (iOS 26+)

| スキル | 説明 |
|--------|------|
| `foundation-models-basics` | Foundation Modelsフレームワークの基本的な使い方 |
| `prompt-engineering` | 効果的なプロンプト設計とモデル動作の制御 |
| `guided-generation` | @Generable/@Guideマクロによる構造化出力 |
| `tool-calling` | 外部ツール連携とFunction Calling |
| `ai-safety-guardrails` | 安全性とエラーハンドリング |
| `performance-optimization` | パフォーマンス分析と最適化 |
| `multilingual-support` | 多言語対応の実装 |

### Apple Intelligence Features

| スキル | 説明 | 対応バージョン |
|--------|------|----------------|
| `writing-tools` | システム標準のWriting Tools統合 | iOS 18+ |
| `image-playground` | Image Playground APIによる画像生成 | iOS 18.2+ |
| `genmoji` | カスタム絵文字（Genmoji）の実装 | iOS 18+ |
| `app-intents-siri` | App IntentsとSiri統合 | iOS 16+ |
| `natural-language` | Natural Languageフレームワーク | iOS 12+ |
| `speech-recognition` | 音声認識の実装 | iOS 10+ |
| `ai-ux-guidelines` | AI機能のUXデザインガイドライン | - |

## 特徴

- **Apple公式ドキュメント準拠**: WWDC資料、Developer Documentation、Tech Notesのみを情報源として使用
- **バイリンガル形式**: 日本語での解説、英語でのコードコメント
- **実践的なコード例**: コピー&ペーストで使用可能なSwiftコード
- **エラーハンドリング**: 各APIの適切なエラー処理パターンを提供

## 対応環境

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ (Foundation Models) / 18.0+ (その他) |
| macOS | 26.0+ |
| Swift | 6.0+ |
| Xcode | 26+ |

## テスト

```bash
npm install
npm test
```

## ライセンス

MIT

## 公式リファレンス

- [Foundation Models Documentation](https://developer.apple.com/documentation/FoundationModels)
- [Apple Intelligence](https://developer.apple.com/apple-intelligence/)
- [WWDC25 Videos](https://developer.apple.com/videos/wwdc2025/)
