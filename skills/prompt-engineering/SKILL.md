---
name: prompt-engineering
description: "効果的なプロンプト設計とモデル動作の制御"
globs: "**/*.swift"
---

# プロンプトエンジニアリング

Apple公式ドキュメントに基づくFoundation Modelsのプロンプト設計ガイド

## 概要

Foundation Modelsでは、Instructionsとプロンプトを適切に設計することで、モデルの出力を制御できます。Instructionsはセッション全体の動作を定義し、プロンプトは個々のリクエストを表します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## Instructions vs Prompts

### Instructions（システム指示）

セッション全体の動作を定義。モデルはプロンプトよりInstructionsを優先します（セキュリティ強化のため）。

```swift
let session = LanguageModelSession(instructions: """
    You are a travel copywriter.
    Always respond in a friendly, enthusiastic tone.
    Keep responses under 100 words.
    """)
```

### Prompt（ユーザープロンプト）

個々のリクエストを表します。

```swift
let response = try await session.respond(to: "Describe Tokyo in spring")
```

## PromptBuilder

複雑なプロンプトを動的に構築できます。

```swift
import FoundationModels

let kidFriendly = true

let prompt = Prompt {
    "Generate a 3-day itinerary to the Grand Canyon."
    if kidFriendly {
        "The itinerary must be kid-friendly."
    }
}

let response = try await session.respond(to: prompt)
```

## GenerationOptions

### sampling

出力の決定性を制御します。

```swift
// Deterministic output (same input = same output)
let options = GenerationOptions(sampling: .greedy)
let response = try await session.respond(to: prompt, options: options)
```

### temperature

出力の多様性を制御します。低い値で安定した出力、高い値で創造的な出力になります。

```swift
// Lower temperature for more predictable output
let options = GenerationOptions(temperature: 0.5)
```

## 出力長の制御

自然言語で出力長を指示できます。

```swift
let session = LanguageModelSession(instructions: """
    Respond in three sentences or fewer.
    """)

// Or in the prompt
let response = try await session.respond(to: "Explain quantum computing in a few words")
```

## Xcode Playgroundsでのテスト

`#Playground`を使ってプロンプトをテストできます。

```swift
#Playground

import FoundationModels

let session = LanguageModelSession()
let response = try await session.respond(to: "Hello")
// Response appears in the canvas
```

## iOS 26ベータに関する注意

Foundation Modelsフレームワークは iOS 26 で導入された新しいAPIです。ベータ版では一部の動作が変更される可能性があります。本番環境での使用前に、最新のリリースノートを確認してください。

## ベストプラクティス

- Instructionsは英語で記述するのが最も効果的
- 明確で具体的な指示を与える
- .greedyサンプリングで決定的な出力が必要な場合に使用
- プロンプトのテストにはXcode Playgroundsを活用

## 公式リファレンス

- [PromptBuilder Documentation](https://developer.apple.com/documentation/foundationmodels/promptbuilder)
- [GenerationOptions Documentation](https://developer.apple.com/documentation/foundationmodels/generationoptions)
- [WWDC25-248: Explore prompt design & safety](https://developer.apple.com/videos/play/wwdc2025/248/)
- [WWDC25-301: Deep dive into Foundation Models](https://developer.apple.com/videos/play/wwdc2025/301/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
