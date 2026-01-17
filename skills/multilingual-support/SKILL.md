---
name: multilingual-support
description: "多言語対応の実装"
globs: "**/*.swift"
---

# 多言語対応

Apple公式ドキュメントに基づくFoundation Modelsの多言語サポートガイド

## 概要

Foundation Modelsは23のロケールをサポートしており、日本語を含む多言語でのコンテンツ生成が可能です。Instructionsは英語で記述し、プロンプトは希望する出力言語で記述するのが最も効果的です。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## サポート言語

Foundation Modelsは以下の23ロケールをサポートしています：

- 英語（米国、英国、オーストラリア、カナダ、インド、アイルランド、ニュージーランド、シンガポール、南アフリカ）
- 日本語
- 中国語（簡体字、繁体字）
- 韓国語
- フランス語（フランス、カナダ）
- ドイツ語
- イタリア語
- ポルトガル語（ブラジル）
- スペイン語（スペイン、メキシコ、米国）

## 言語検出と設定

### ユーザー言語の検出

```swift
import Foundation

// Get user's preferred language
let preferredLanguage = Locale.preferredLanguages.first ?? "en"
let locale = Locale(identifier: preferredLanguage)
```

### サポート言語の確認

`supportedLanguages`は`[Locale.Language]`型を返します。

```swift
import FoundationModels

let model = SystemLanguageModel.default

// Check if a specific language is supported
// supportedLanguages is [Locale.Language] type
if model.supportedLanguages.contains(where: {
    $0.languageCode?.identifier == "ja"
}) {
    print("Japanese is supported")
}

// List all supported languages
for language in model.supportedLanguages {
    if let code = language.languageCode?.identifier {
        print("Supported: \(code)")
    }
}
```

**注意**: Apple Intelligenceは今後言語を追加する可能性があります。サポート言語をハードコードせず、ランタイムで確認することを推奨します。

## プロンプト設計のベストプラクティス

### 英語Instructions + ローカル言語プロンプト

最も効果的なパターンは、Instructionsを英語で記述し、プロンプトを希望する出力言語で記述することです。

```swift
let session = LanguageModelSession(instructions: """
    You are a helpful assistant.
    Respond in the same language as the user's prompt.
    Keep responses concise and accurate.
    """)

// Japanese prompt → Japanese response
let response = try await session.respond(to: "SwiftUIについて教えてください")
```

### 明示的な言語指定

出力言語を明示的に指定することもできます。

```swift
let session = LanguageModelSession(instructions: """
    You are a helpful assistant.
    Always respond in Japanese.
    """)

let response = try await session.respond(to: "Tell me about Swift")
// Response will be in Japanese
```

## トークン効率

CJK言語（中国語、日本語、韓国語）は英語の約3-4倍のトークンを消費します。コンテキストウィンドウ（4,096トークン）を考慮して設計してください。

詳細なトークン消費量と最適化については、**performance-optimization** スキルを参照してください。

## エラーハンドリング

```swift
do {
    let response = try await session.respond(to: prompt)
} catch let error as LanguageModelSession.GenerationError {
    switch error {
    case .unsupportedLanguage:
        // Language not supported
        print("This language is not supported")
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

- Instructionsは英語で記述するのが最も効果的
- ユーザープロンプトは希望する出力言語で記述
- CJK言語のトークン消費量を考慮
- サポート言語を事前に確認
- 非サポート言語のフォールバックを実装

## 公式リファレンス

- [Supporting languages and locales](https://developer.apple.com/documentation/foundationmodels/supporting-languages-and-locales-with-foundation-models)
- [SystemLanguageModel.supportedLanguages](https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel/supportedlanguages)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
