---
name: performance-optimization
description: "パフォーマンス分析と最適化"
globs: "**/*.swift"
---

# パフォーマンス最適化

Apple公式ドキュメントに基づくFoundation Modelsのパフォーマンスガイド

## 概要

Foundation Modelsのパフォーマンスを最適化するには、コンテキストウィンドウの管理、トークン推定、セッションのプリウォームが重要です。Xcode Instrumentsを使用してパフォーマンスを分析できます。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## コンテキストウィンドウ

### 制限

Foundation Modelsのコンテキストウィンドウは**4,096トークン**（固定）です。

### 入出力の分割

入出力の分割は柔軟です。例：
- 入力4,000トークン → 出力96トークン
- 入力2,000トークン → 出力2,096トークン

```swift
// Handle context window exceeded error
do {
    let response = try await session.respond(to: longPrompt)
} catch LanguageModelSession.GenerationError.exceededContextWindowSize {
    // Truncate input or start new session
}
```

## トークン推定

### 言語別の目安

| 言語 | 1トークンあたりの文字数 |
|------|------------------------|
| 英語 | 3-4文字 |
| 日本語 | 約1文字 |
| 中国語 | 約1文字 |

### 実装例（※開発者実装）

Foundation Modelsフレームワークにはトークン数を取得するAPIは提供されていません。以下は開発者が独自に実装する場合の参考例です。

```swift
// ※開発者実装例 - Rough estimation for Japanese text
func estimateTokens(text: String) -> Int {
    // Japanese: ~1 character per token
    // English: ~3-4 characters per token
    let japaneseCharCount = text.unicodeScalars.filter {
        $0.value > 0x3000
    }.count
    let otherCharCount = text.count - japaneseCharCount

    return japaneseCharCount + (otherCharCount / 4)
}
```

## セッションのプリウォーム

### prewarm()

セッションを事前に準備して、最初の応答を高速化します。

```swift
let session = LanguageModelSession()

// Prewarm the session
try await session.prewarm()

// First response will be faster
let response = try await session.respond(to: prompt)
```

### 重要な注意点

- プリウォームは任意だが、UX向上に効果的
- アプリ起動時やビュー表示時に事前に呼び出すことを推奨

## Xcode Instruments

### Foundation Modelsプロファイラ

Xcode Instrumentsの「Foundation Models」テンプレートを使用してパフォーマンスを分析できます。

確認できる項目：
- トークン生成速度
- メモリ使用量
- セッションのライフサイクル
- ツール呼び出しのタイミング

## ストリーミングの活用

ストリーミングを使用すると、ユーザーに早期にフィードバックを提供できます。

```swift
let stream = session.streamResponse(to: prompt)

for try await partial in stream {
    // Update UI with partial response
    updateUI(with: partial.content)
}
```

## iOS 26ベータに関する注意

Foundation Modelsフレームワークは iOS 26 で導入された新しいAPIです。ベータ版では一部の動作が変更される可能性があります。本番環境での使用前に、最新のリリースノートを確認してください。

## ベストプラクティス

- コンテキストウィンドウの制限を意識した設計
- 長いコンテンツは分割して処理
- prewarm()で初回応答を高速化
- ストリーミングでUXを向上
- Instrumentsで定期的にパフォーマンスを確認

## 公式リファレンス

- [TN3193: Managing the on-device foundation model's context window](https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window)
- [Analyzing runtime performance](https://developer.apple.com/documentation/FoundationModels/analyzing-the-runtime-performance-of-your-foundation-models-app)
- [WWDC25-301: Deep dive into Foundation Models](https://developer.apple.com/videos/play/wwdc2025/301/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
