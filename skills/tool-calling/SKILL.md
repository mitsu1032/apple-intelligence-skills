---
name: tool-calling
description: "Tool protocolを使った外部機能の統合"
globs: "**/*.swift"
---

# Tool Calling

Apple公式ドキュメントに基づくTool統合ガイド

## 概要

Tool Callingは、モデルが外部機能（カレンダー、連絡先、APIなど）を呼び出せるようにする機能です。モデルは自律的にツール呼び出しのタイミングを判断します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## Tool Protocol

ツールはToolプロトコルに準拠して定義します。

```swift
import FoundationModels

struct WeatherTool: Tool {
    let name = "getWeather"
    let description = "Get current weather for a city"

    @Generable
    struct Arguments {
        @Guide(description: "City name")
        let city: String
    }

    func call(arguments: Arguments) async throws -> ToolOutput {
        // Call weather API
        let weather = await fetchWeather(for: arguments.city)
        return ToolOutput(weather)
    }
}
```

## セッションへのツール登録

```swift
let weatherTool = WeatherTool()

let session = LanguageModelSession(
    instructions: "You can check weather using the available tool.",
    tools: [weatherTool]
)

let response = try await session.respond(to: "What's the weather in Tokyo?")
```

## 複数ツールの使用

フレームワークが並列・直列の呼び出しを自動最適化します。

```swift
struct CalendarTool: Tool {
    let name = "getEvents"
    let description = "Get calendar events for a date"

    @Generable
    struct Arguments {
        let date: String
    }

    func call(arguments: Arguments) async throws -> ToolOutput {
        let events = await fetchEvents(for: arguments.date)
        return ToolOutput(events)
    }
}

let session = LanguageModelSession(
    tools: [WeatherTool(), CalendarTool()]
)
```

## ToolOutput

ツールの戻り値を定義します。

```swift
func call(arguments: Arguments) async throws -> ToolOutput {
    // Return string
    return ToolOutput("Sunny, 25°C")

    // Or return structured data
    return ToolOutput(["temperature": 25, "condition": "sunny"])
}
```

## 決定的なツール呼び出し

確実にツールを呼び出したい場合は`.greedy`サンプリングを使用します。

```swift
let options = GenerationOptions(sampling: .greedy)
let response = try await session.respond(
    to: "Check the weather in Tokyo",
    options: options
)
```

## エラーハンドリング

ツール呼び出しを含むセッションでも、標準のエラーハンドリングパターンを使用します。

```swift
do {
    let response = try await session.respond(to: "What's the weather in Tokyo?")
    print(response.content)
} catch let error as LanguageModelSession.GenerationError {
    switch error {
    case .guardrailViolation(let details):
        print("Content blocked: \(details)")
    case .exceededContextWindowSize:
        print("Context limit exceeded")
    case .rateLimited:
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

- ツールの説明を明確に記述（モデルが判断に使用）
- Arguments構造体に@Guideで説明を追加
- エラーハンドリングを適切に実装
- 複雑なツールチェーンは避ける

## 公式リファレンス

- [Expanding generation with tool calling](https://developer.apple.com/documentation/foundationmodels/expanding-generation-with-tool-calling)
- [Tool Protocol](https://developer.apple.com/documentation/foundationmodels/tool)
- [WWDC25-301: Deep dive into Foundation Models](https://developer.apple.com/videos/play/wwdc2025/301/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
