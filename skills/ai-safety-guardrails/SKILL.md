---
name: ai-safety-guardrails
description: "安全性とエラーハンドリング"
globs: "**/*.swift"
---

# AI安全性とGuardrails

Apple公式ドキュメントに基づく安全性ガイド

## 概要

Foundation Modelsには、有害なコンテンツをブロックするGuardrailsが組み込まれています。入力と出力の両方に適用され、開発者が無効にすることはできません。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## Guardrailsの仕組み

### 入力ガードレール

Instructions、プロンプト、ツール呼び出しすべてが検査されます。

### 出力ガードレール

モデルの出力も検査され、有害なコンテンツはブロックされます。

## Instructions優先の設計

モデルはInstructionsをプロンプトより優先します。これはセキュリティ強化のための設計です。

```swift
let session = LanguageModelSession(instructions: """
    You are a helpful assistant.
    Never provide harmful information.
    Always maintain a respectful tone.
    """)

// Model will follow instructions even if prompt tries to override
```

## エラーハンドリング

```swift
do {
    let response = try await session.respond(to: prompt)
} catch let error as LanguageModelSession.GenerationError {
    switch error {
    case .guardrailViolation(let details):
        // Content was blocked by safety guardrails
        print("Content blocked: \(details)")
    case .exceededContextWindowSize:
        // Context limit exceeded
        print("Context limit exceeded")
    case .unsupportedLanguage:
        // Language not supported
        print("Language not supported")
    case .rateLimited:
        // Too many requests - wait and retry
        print("Rate limited - please wait")
    @unknown default:
        print("Generation error: \(error)")
    }
} catch {
    print("Unexpected error: \(error)")
}
```

## LanguageModelFeedbackAttachment

問題のあるプロンプトや誤ったガードレール発動を報告できます。Feedback Assistantに添付するためのデータを生成します。

```swift
// Create feedback attachment for Feedback Assistant
let attachment = LanguageModelFeedbackAttachment(
    session: session,
    feedbackType: .falsePositive
)

// Export data for submission
let data = try attachment.jsonData()
```

## 適切なユースケース

### 推奨される用途

- テキスト要約
- コンテンツ生成
- 質問応答
- 構造化データ抽出

### 非推奨の用途

- コード生成（精度の問題）
- 数学計算（精度の問題）
- 医療・法律アドバイス
- 個人を特定する情報の処理

## iOS 26ベータに関する注意

Foundation Modelsフレームワークは iOS 26 で導入された新しいAPIです。ベータ版では一部の動作が変更される可能性があります。本番環境での使用前に、最新のリリースノートを確認してください。

## ベストプラクティス

- Instructionsで明確なルールを設定
- エラーハンドリングを必ず実装
- ユーザーに適切なフィードバックを提供
- 誤検知はAppleに報告

## 公式リファレンス

- [Improving safety of generative model output](https://developer.apple.com/documentation/FoundationModels/improving-the-safety-of-generative-model-output)
- [WWDC25-248: Explore prompt design & safety](https://developer.apple.com/videos/play/wwdc2025/248/)
- [Acceptable use requirements](https://developer.apple.com/apple-intelligence/acceptable-use-requirements-for-the-foundation-models-framework/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
