---
name: genmoji
description: "カスタム絵文字（Genmoji）の統合"
globs: "**/*.swift"
---

# Genmoji

Apple公式ドキュメントに基づくGenmoji統合ガイド

## 概要

Genmojiは、Apple Intelligenceで生成されるカスタム絵文字です。標準の絵文字とは異なり、画像として表現され、`NSAdaptiveImageGlyph`として扱われます。リッチテキストビューで表示・編集が可能です。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 18.0+ |
| macOS | 15.0+ |
| Swift | 5.9+ |

## NSAdaptiveImageGlyph

Genmojiのデータ表現です。

```swift
import UIKit

// NSAdaptiveImageGlyph represents a Genmoji
let glyph: NSAdaptiveImageGlyph = // ... from user input

// Access the image content
let imageContent = glyph.imageContent

// Access content description for accessibility
let description = glyph.contentDescription
```

## リッチテキストビューでの有効化

### UITextView

```swift
import UIKit

class GenmojiTextViewController: UIViewController {
    let textView = UITextView()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Enable Genmoji support
        textView.supportsAdaptiveImageGlyph = true

        view.addSubview(textView)
    }
}
```

### WKWebView

WKWebViewでもGenmojiを表示できます。

```swift
import WebKit

let webView = WKWebView()
// Genmoji in web content will be displayed automatically
```

## シリアライズ

### RTFDでの保存

Genmojiを含むテキストはRTFD形式で保存します。

```swift
import UIKit

func saveAttributedString(_ attributedString: NSAttributedString) throws -> Data {
    // Use RTFD format to preserve Genmoji
    let data = try attributedString.data(
        from: NSRange(location: 0, length: attributedString.length),
        documentAttributes: [.documentType: NSAttributedString.DocumentType.rtfd]
    )
    return data
}

func loadAttributedString(from data: Data) throws -> NSAttributedString {
    let attributedString = try NSAttributedString(
        data: data,
        options: [.documentType: NSAttributedString.DocumentType.rtfd],
        documentAttributes: nil
    )
    return attributedString
}
```

### HTML出力

WebKit互換形式でHTML出力できます。

```swift
import UIKit

func exportToHTML(_ attributedString: NSAttributedString) throws -> Data {
    let data = try attributedString.data(
        from: NSRange(location: 0, length: attributedString.length),
        documentAttributes: [.documentType: NSAttributedString.DocumentType.html]
    )
    return data
}
```

## TextKit2対応

### 推奨: TextKit2を使用

TextKit2ではGenmojiがネイティブサポートされています。

```swift
import UIKit

class ModernTextViewController: UIViewController {
    // UITextView uses TextKit2 by default in iOS 16+
    let textView = UITextView()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Ensure TextKit2 is used
        if textView.textLayoutManager != nil {
            print("Using TextKit2")
        }

        textView.supportsAdaptiveImageGlyph = true
    }
}
```

### TextKit1での使用

TextKit1を使用する場合、GenmojiはNSTextAttachmentに変換されます。

```swift
import UIKit

// In TextKit1, Genmoji becomes NSTextAttachment
// This may lose some adaptive behavior
```

## 適切な使用場所

### 推奨

- メッセージング
- ノートアプリ
- ソーシャルメディア投稿
- リッチテキストエディタ

### 非推奨

Genmojiは画像であり、Unicodeではありません。以下の場所では使用を避けてください：

- 電話番号フィールド
- メールアドレスフィールド
- URLフィールド
- プレーンテキストのみを期待する場所

## アクセシビリティ

```swift
// Genmoji includes content description for VoiceOver
let glyph: NSAdaptiveImageGlyph = // ...

// This description is read by VoiceOver
let accessibilityDescription = glyph.contentDescription
```

## エラーハンドリング

Genmojiのシリアライズ・デシリアライズ時にエラーが発生する可能性があります。

```swift
func handleGenmojiSerialization(_ attributedString: NSAttributedString) {
    do {
        // Save with RTFD format
        let data = try attributedString.data(
            from: NSRange(location: 0, length: attributedString.length),
            documentAttributes: [.documentType: NSAttributedString.DocumentType.rtfd]
        )
        // Save data...
    } catch {
        // Handle serialization error
        // Fallback to plain text if needed
        let plainText = attributedString.string
        print("Serialization failed, using plain text: \(error)")
    }
}

func loadGenmojiContent(from data: Data) -> NSAttributedString? {
    do {
        return try NSAttributedString(
            data: data,
            options: [.documentType: NSAttributedString.DocumentType.rtfd],
            documentAttributes: nil
        )
    } catch {
        // Handle deserialization error
        print("Failed to load Genmoji content: \(error)")
        return nil
    }
}
```

## ベストプラクティス

- `supportsAdaptiveImageGlyph = true`でGenmoji入力を有効化
- RTFD形式で永続化してGenmojiを保持
- TextKit2を使用して最適な表示を実現
- テキストのみのフィールドでは使用しない
- アクセシビリティのためcontentDescriptionを活用
- シリアライズエラー時のフォールバックを実装

## 公式リファレンス

- [NSAdaptiveImageGlyph](https://developer.apple.com/documentation/uikit/nsadaptiveimageglyph)
- [WWDC24-10220: Bring expression to your app with Genmoji](https://developer.apple.com/videos/play/wwdc2024/10220/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
