---
name: foundation-models-basics
description: "Foundation Modelsフレームワークの基本的な使い方を解説"
globs: "**/*.swift"
---

# Foundation Models 基礎

Apple公式ドキュメントに基づくFoundation Modelsフレームワークの基本ガイド

## 概要

Foundation Modelsフレームワークは、iOS 26で導入されたオンデバイスLLMへのアクセスを提供します。約30億パラメータのモデルがデバイス上で動作し、プライバシーを保護しながら高度な言語機能を実現します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| macOS | 26.0+ |
| Swift | 6.0+ |

## 基本的な使い方

### 可用性チェック

```swift
import FoundationModels

// Check if the model is available on this device
let model = SystemLanguageModel.default
guard model.isAvailable else {
    // Handle unavailability
    return
}
```

### 詳細な可用性確認（Availability enum）

`availability`プロパティを使用して、より詳細な状態を確認できます。

```swift
import FoundationModels

let model = SystemLanguageModel.default

switch model.availability {
case .available:
    // Model is ready to use
    let session = LanguageModelSession()
    // ...
case .unavailable(.deviceNotSupported):
    // This device doesn't support on-device models
    print("Device not supported")
case .unavailable(.modelNotReady):
    // Model is being downloaded or prepared
    print("Model not ready - please wait")
case .unavailable(.appleIntelligenceNotEnabled):
    // User hasn't enabled Apple Intelligence
    print("Please enable Apple Intelligence in Settings")
case .unavailable(_):
    // Other unavailability reasons
    print("Model unavailable")
@unknown default:
    break
}
```

### セッションの作成と応答取得

```swift
import FoundationModels

// Create a session
let session = LanguageModelSession()

// Get a response
let response = try await session.respond(to: "What is Swift?")
print(response.content)
```

### Instructionsの設定

```swift
import FoundationModels

// Create session with instructions
let session = LanguageModelSession(instructions: """
    You are a helpful assistant that explains iOS development concepts.
    Keep responses concise and accurate.
    """)

let response = try await session.respond(to: "Explain SwiftUI")
```

## 主要なクラスと構造体

### SystemLanguageModel

オンデバイスLLMへのアクセスポイント。`SystemLanguageModel.default`で取得します。

### LanguageModelSession

会話のコンテキストを管理するセッション。状態を保持し、複数のやり取りで文脈を維持します。

### Transcript

セッション内のすべてのプロンプトと応答の履歴。デバッグやUI表示に使用できます。

```swift
// Access conversation history
for entry in session.transcript.entries {
    print(entry)
}
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

## iOS 26ベータに関する注意

Foundation Modelsフレームワークは iOS 26 で導入された新しいAPIです。ベータ版では一部の動作が変更される可能性があります。本番環境での使用前に、最新のリリースノートを確認してください。

## ベストプラクティス

- 必ず`isAvailable`で可用性を確認してからセッションを使用する
- Instructionsはプロンプトより優先される設計を活用する
- セッションを再利用して会話の文脈を維持する
- エラーハンドリングを適切に実装する

## 公式リファレンス

- [Foundation Models Documentation](https://developer.apple.com/documentation/FoundationModels)
- [Generating content and performing tasks](https://developer.apple.com/documentation/FoundationModels/generating-content-and-performing-tasks-with-foundation-models)
- [SystemLanguageModel.Availability](https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel/availability-swift.enum)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
