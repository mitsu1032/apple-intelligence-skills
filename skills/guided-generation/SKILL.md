---
name: guided-generation
description: "@Generable/@Guideマクロを使った構造化出力"
globs: "**/*.swift"
---

# Guided Generation

Apple公式ドキュメントに基づく構造化出力ガイド

## 概要

Guided Generationは、モデルの出力を型安全なSwift構造体として取得する機能です。@Generableマクロと@Guideマクロを使用して、出力の形式を定義します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## @Generable マクロ

出力の構造を定義します。

```swift
import FoundationModels

@Generable
struct Recipe {
    let title: String
    let ingredients: [String]
    let steps: [String]
}

let session = LanguageModelSession()
let response = try await session.respond(
    to: "Create a simple pasta recipe",
    generating: Recipe.self
)
print(response.content.title)
```

## @Guide マクロ

フィールドの制約や説明を追加します。

```swift
@Generable
struct BookRecommendation {
    @Guide(description: "The title of the book")
    let title: String

    @Guide(description: "Author's full name")
    let author: String

    @Guide(description: "Rating from 1 to 5", .range(1...5))
    let rating: Int

    @Guide(description: "List of genres", .count(3))
    let genres: [String]
}
```

### Guide制約オプション

| 制約 | 説明 | 例 |
|------|------|-----|
| `.range()` | 数値の範囲 | `.range(1...5)` |
| `.count()` | 配列の要素数 | `.count(3)` |
| `.anyOf()` | 選択肢の制限 | `.anyOf(["A", "B", "C"])` |

## プロパティ順序の重要性

プロパティは宣言順に生成されます。依存関係がある場合は順序を考慮してください。

```swift
@Generable
struct StoryWithSummary {
    // First generate the story
    let story: String

    // Then generate summary based on the story
    @Guide(description: "A brief summary of the story above")
    let summary: String
}
```

## ストリーミング対応

`PartiallyGenerated`を使用して、生成中の途中結果を取得できます。

```swift
let stream = session.streamResponse(to: prompt, generating: Recipe.self)

for try await partial in stream {
    if let title = partial.title {
        print("Title: \(title)")
    }
    // Other properties may still be nil
}
```

## ネスト構造

複雑なデータ構造もサポートしています。

```swift
@Generable
struct Itinerary {
    let title: String
    let days: [DayPlan]
}

@Generable
struct DayPlan {
    let date: String
    let activities: [String]
}
```

## エラーハンドリング

構造化出力でも標準のエラーハンドリングパターンを使用します。

```swift
do {
    let response = try await session.respond(
        to: "Create a simple pasta recipe",
        generating: Recipe.self
    )
    print(response.content.title)
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

- プロパティは「先に生成されたものを後で参照できる」順序で宣言
- @Guideで明確な説明を提供
- ストリーミングでUXを向上
- 複雑すぎる構造は避ける（パフォーマンス影響）
- エラーハンドリングを適切に実装

## 公式リファレンス

- [Generable Protocol](https://developer.apple.com/documentation/foundationmodels/generable)
- [GenerationGuide](https://developer.apple.com/documentation/foundationmodels/generationguide)
- [Generating Swift data structures](https://developer.apple.com/documentation/foundationmodels/generating-swift-data-structures-with-guided-generation)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
