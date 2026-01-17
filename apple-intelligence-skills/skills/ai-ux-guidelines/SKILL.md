---
name: ai-ux-guidelines
description: "生成AIのUX設計ガイドライン"
globs: "**/*.swift"
---

# AI UX Guidelines

Apple Human Interface Guidelinesに基づく生成AIのUX設計ガイド

## 概要

生成AI機能をアプリに統合する際は、Apple Human Interface Guidelinesに従って、透明性、ユーザーコントロール、アクセシビリティを確保することが重要です。AIの能力と限界を明確に伝え、ユーザーが安心して機能を使えるようにします。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 18.0+ |
| macOS | 15.0+ |

## AI使用の明示

ユーザーにAI生成コンテンツであることを明確に伝えます。

### 視覚的インジケーター

```swift
import SwiftUI

struct AIGeneratedView: View {
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundStyle(.purple)
                Text("AI生成")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(generatedContent)
                .padding()
                .background(Color.purple.opacity(0.1))
                .cornerRadius(8)
        }
    }
}
```

### 生成中のフィードバック

```swift
import SwiftUI

struct GeneratingView: View {
    @State private var isGenerating = false

    var body: some View {
        VStack {
            if isGenerating {
                ProgressView {
                    Text("生成中...")
                }
                .progressViewStyle(.circular)
            }
        }
    }
}
```

## 期待値の設定

AIの能力と限界を事前に伝えます。

### 機能説明

```swift
import SwiftUI

struct AIFeatureOnboardingView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("AIアシスタントについて")
                .font(.headline)

            VStack(alignment: .leading, spacing: 8) {
                FeatureRow(
                    icon: "checkmark.circle.fill",
                    color: .green,
                    text: "テキストの要約と校正"
                )
                FeatureRow(
                    icon: "checkmark.circle.fill",
                    color: .green,
                    text: "アイデアの提案"
                )
                FeatureRow(
                    icon: "xmark.circle.fill",
                    color: .red,
                    text: "正確な事実情報の保証"
                )
                FeatureRow(
                    icon: "xmark.circle.fill",
                    color: .red,
                    text: "医療・法律アドバイス"
                )
            }

            Text("生成された内容は確認してからご使用ください")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
```

## フィードバック機構

ユーザーからのフィードバックを収集します。

### 評価UI

```swift
import SwiftUI

struct AIResponseFeedbackView: View {
    @State private var rating: Int?

    var body: some View {
        HStack {
            Text("この回答は役に立ちましたか？")
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()

            Button {
                rating = 1
                submitFeedback(positive: true)
            } label: {
                Image(systemName: rating == 1 ? "hand.thumbsup.fill" : "hand.thumbsup")
            }

            Button {
                rating = 0
                submitFeedback(positive: false)
            } label: {
                Image(systemName: rating == 0 ? "hand.thumbsdown.fill" : "hand.thumbsdown")
            }
        }
        .buttonStyle(.plain)
    }

    private func submitFeedback(positive: Bool) {
        // Send feedback to improve the model
    }
}
```

### 詳細フィードバック

```swift
import SwiftUI

struct DetailedFeedbackView: View {
    @State private var feedbackType: FeedbackType?
    @State private var additionalComments = ""

    enum FeedbackType: String, CaseIterable {
        case inaccurate = "不正確な情報"
        case unhelpful = "役に立たなかった"
        case inappropriate = "不適切な内容"
        case other = "その他"
    }

    var body: some View {
        Form {
            Section("問題の種類") {
                ForEach(FeedbackType.allCases, id: \.self) { type in
                    Button {
                        feedbackType = type
                    } label: {
                        HStack {
                            Text(type.rawValue)
                            Spacer()
                            if feedbackType == type {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            }

            Section("詳細（任意）") {
                TextField("コメントを入力", text: $additionalComments, axis: .vertical)
                    .lineLimit(3...6)
            }
        }
    }
}
```

## エラー表示

失敗時の適切なUXを提供します。

### エラーメッセージ

```swift
import SwiftUI

struct AIErrorView: View {
    let error: AIError

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: errorIcon)
                .font(.largeTitle)
                .foregroundStyle(.secondary)

            Text(errorTitle)
                .font(.headline)

            Text(errorDescription)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            if canRetry {
                Button("もう一度試す") {
                    retry()
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }

    private var errorIcon: String {
        switch error {
        case .networkError:
            return "wifi.slash"
        case .guardrailViolation:
            return "exclamationmark.shield"
        case .contextLimitExceeded:
            return "text.badge.xmark"
        default:
            return "exclamationmark.triangle"
        }
    }

    private var errorTitle: String {
        switch error {
        case .guardrailViolation:
            return "この内容は生成できません"
        case .contextLimitExceeded:
            return "テキストが長すぎます"
        default:
            return "エラーが発生しました"
        }
    }
}
```

## アクセシビリティ

生成コンテンツへのアクセシビリティ配慮を行います。

### VoiceOver対応

```swift
import SwiftUI

struct AccessibleAIContentView: View {
    let generatedText: String

    var body: some View {
        VStack {
            Text(generatedText)
                .accessibilityLabel("AI生成テキスト: \(generatedText)")
                .accessibilityHint("AIによって生成された内容です")
        }
    }
}
```

### 動的テキストサイズ

```swift
import SwiftUI

struct DynamicTypeAIView: View {
    @Environment(\.dynamicTypeSize) var dynamicTypeSize

    var body: some View {
        VStack {
            Text(generatedContent)
                .font(.body)  // Supports Dynamic Type automatically

            // Adjust layout for larger text sizes
            if dynamicTypeSize >= .accessibility1 {
                VStack {
                    actionButtons
                }
            } else {
                HStack {
                    actionButtons
                }
            }
        }
    }
}
```

## ユーザーコントロール

ユーザーに制御権を与えます。

### 編集可能なAI出力

```swift
import SwiftUI

struct EditableAIOutputView: View {
    @State private var generatedText: String
    @State private var isEditing = false

    var body: some View {
        VStack {
            if isEditing {
                TextEditor(text: $generatedText)
                    .frame(height: 200)
            } else {
                Text(generatedText)
            }

            HStack {
                Button(isEditing ? "完了" : "編集") {
                    isEditing.toggle()
                }

                Button("再生成") {
                    regenerate()
                }

                Button("コピー") {
                    UIPasteboard.general.string = generatedText
                }
            }
        }
    }
}
```

### オプトアウト設定

```swift
import SwiftUI

struct AISettingsView: View {
    @AppStorage("aiSuggestionsEnabled") private var suggestionsEnabled = true
    @AppStorage("aiAutoCorrectEnabled") private var autoCorrectEnabled = true

    var body: some View {
        Form {
            Section("AI機能") {
                Toggle("AI提案を表示", isOn: $suggestionsEnabled)

                Toggle("AI自動修正", isOn: $autoCorrectEnabled)
            }

            Section {
                Text("AI機能はデバイス上で処理され、データは外部に送信されません。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
```

## ベストプラクティス

- AI生成コンテンツであることを明確に表示
- 生成中は適切なローディング表示を提供
- AIの能力と限界を事前に説明
- ユーザーフィードバックを収集して改善
- エラー時は具体的な対処方法を提示
- アクセシビリティを確保（VoiceOver、Dynamic Type）
- ユーザーがAI機能を制御できる設定を提供

## 公式リファレンス

- [Human Interface Guidelines - Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai)
- [Human Interface Guidelines - Machine Learning](https://developer.apple.com/design/human-interface-guidelines/machine-learning)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
