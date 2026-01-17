---
name: natural-language
description: "Natural Languageフレームワークによる自然言語処理"
globs: "**/*.swift"
---

# Natural Language

Apple公式ドキュメントに基づく自然言語処理ガイド

## 概要

Natural Languageフレームワークは、テキストの分析、トークン化、言語検出、感情分析などの機能を提供します。完全オンデバイス処理でプライバシーを保護しながら高度な言語機能を実現します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 12.0+ |
| macOS | 10.14+ |
| Swift | 5.0+ |

## NLTagger

テキスト分析の中心的なクラスです。

### 基本的な使い方

```swift
import NaturalLanguage

let text = "Apple announced new products in San Francisco."
let tagger = NLTagger(tagSchemes: [.nameType])
tagger.string = text

tagger.enumerateTags(in: text.startIndex..<text.endIndex,
                     unit: .word,
                     scheme: .nameType) { tag, range in
    if let tag = tag {
        print("\(text[range]): \(tag.rawValue)")
    }
    return true
}
```

## Sentiment Analysis

テキストの感情分析（-1〜+1スコア）を行います。

```swift
import NaturalLanguage

let tagger = NLTagger(tagSchemes: [.sentimentScore])
tagger.string = "I love this product! It's amazing."

let sentiment = tagger.tag(at: tagger.string!.startIndex,
                           unit: .paragraph,
                           scheme: .sentimentScore)

if let sentimentScore = sentiment.0?.rawValue,
   let score = Double(sentimentScore) {
    print("Sentiment: \(score)") // Positive value
}
```

### サポート言語

感情分析は以下の7言語に対応しています：

| 言語 | コード |
|------|--------|
| English | en |
| French | fr |
| Italian | it |
| German | de |
| Spanish | es |
| Portuguese | pt |
| Simplified Chinese | zh-Hans |

## Tokenization

テキストをトークン（単語、文、段落）に分割します。

```swift
import NaturalLanguage

let tokenizer = NLTokenizer(unit: .word)
let text = "Swift is a powerful programming language."
tokenizer.string = text

tokenizer.enumerateTokens(in: text.startIndex..<text.endIndex) { range, _ in
    print(text[range])
    return true
}
```

### NLTokenizerのユニット

| ユニット | 説明 |
|---------|------|
| `.word` | 単語単位 |
| `.sentence` | 文単位 |
| `.paragraph` | 段落単位 |
| `.document` | ドキュメント全体 |

## Language Identification

テキストの言語を検出します。

```swift
import NaturalLanguage

let recognizer = NLLanguageRecognizer()
recognizer.processString("Bonjour, comment allez-vous?")

if let language = recognizer.dominantLanguage {
    print("Detected language: \(language.rawValue)") // fr
}

// Get language probabilities
let hypotheses = recognizer.languageHypotheses(withMaximum: 3)
for (language, probability) in hypotheses {
    print("\(language.rawValue): \(probability)")
}
```

## Named Entity Recognition

固有表現（人名、地名、組織名など）を抽出します。

```swift
import NaturalLanguage

let text = "Tim Cook visited Apple Park in Cupertino yesterday."
let tagger = NLTagger(tagSchemes: [.nameType])
tagger.string = text

let options: NLTagger.Options = [.omitPunctuation, .omitWhitespace]

tagger.enumerateTags(in: text.startIndex..<text.endIndex,
                     unit: .word,
                     scheme: .nameType,
                     options: options) { tag, range in
    if let tag = tag {
        switch tag {
        case .personalName:
            print("Person: \(text[range])")
        case .placeName:
            print("Place: \(text[range])")
        case .organizationName:
            print("Organization: \(text[range])")
        default:
            break
        }
    }
    return true
}
```

### NLTagの種類

| タグ | 説明 |
|-----|------|
| `.personalName` | 人名 |
| `.placeName` | 地名 |
| `.organizationName` | 組織名 |

## Word Embedding

単語の意味的類似性を計算します。

```swift
import NaturalLanguage

if let embedding = NLEmbedding.wordEmbedding(for: .english) {
    // Get vector for a word
    if let vector = embedding.vector(for: "king") {
        print("Vector dimensions: \(vector.count)")
    }

    // Find similar words
    embedding.enumerateNeighbors(for: "dog", maximumCount: 5) { word, distance in
        print("\(word): \(distance)")
        return true
    }

    // Calculate distance between words
    let distance = embedding.distance(between: "cat", and: "dog")
    print("Distance: \(distance)")
}
```

## カスタムモデル（Create ML連携）

Create MLで作成したカスタムモデルを使用できます。

```swift
import NaturalLanguage
import CoreML

// Load custom text classifier
let config = MLModelConfiguration()
let customModel = try MLModel(contentsOf: modelURL, configuration: config)
let nlModel = try NLModel(mlModel: customModel)

// Use for classification
let label = nlModel.predictedLabel(for: "Customer feedback text")
print("Predicted: \(label ?? "unknown")")
```

## NLGazetteer

カスタム語彙リストを定義して認識精度を向上させます。

```swift
import NaturalLanguage

// Create a gazetteer for custom entity recognition
var data: [String: [String]] = [:]
data["company"] = ["Apple", "Microsoft", "Google"]
data["product"] = ["iPhone", "Mac", "iPad"]

let gazetteer = try NLGazetteer(dictionary: data, language: .english)

// Use with tagger
let tagger = NLTagger(tagSchemes: [.nameType])
tagger.setGazetteers([gazetteer], for: .nameType)
```

## パフォーマンス考慮事項

- 短いテキストでは感情分析の精度が低下する可能性
- バッチ処理でパフォーマンスを最適化
- 言語検出は複数言語が混在するテキストで不正確になることがある

## ベストプラクティス

- 完全オンデバイス処理でプライバシーを保護
- 適切なNLTagSchemeを選択して効率的に処理
- 短いテキストの感情分析には注意（精度低下の可能性）
- カスタムモデルでドメイン固有の精度を向上
- Word Embeddingで意味的検索を実現

## 公式リファレンス

- [NLTagger](https://developer.apple.com/documentation/naturallanguage/nltagger)
- [NLTagScheme](https://developer.apple.com/documentation/naturallanguage/nltagscheme)
- [WWDC19-232: Advances in Natural Language Framework](https://developer.apple.com/videos/play/wwdc2019/232/)
- [WWDC23-10042: Explore Natural Language multilingual models](https://developer.apple.com/videos/play/wwdc2023/10042/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
