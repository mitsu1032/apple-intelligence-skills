---
name: writing-tools
description: "Writing Tools（作文・校正・要約）の統合"
globs: "**/*.swift"
---

# Writing Tools

Apple公式ドキュメントに基づくWriting Tools統合ガイド

## 概要

Writing Toolsは、テキストの校正、書き直し、要約などの機能を提供するApple Intelligence機能です。標準UIフレームワーク（SwiftUI、UIKit）を使用している場合は自動的に有効になります。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 18.0+ |
| macOS | 15.0+ |
| Swift | 5.9+ |

## 自動統合

### SwiftUI

`TextField`と`TextEditor`では、Writing Toolsが自動的に有効になります。

```swift
import SwiftUI

struct ContentView: View {
    @State private var text = ""

    var body: some View {
        TextEditor(text: $text)
            // Writing Tools automatically available
    }
}
```

### UIKit

`UITextView`と`UITextField`でも自動的に有効になります。

```swift
import UIKit

class ViewController: UIViewController {
    let textView = UITextView()

    override func viewDidLoad() {
        super.viewDidLoad()
        // Writing Tools automatically available
        view.addSubview(textView)
    }
}
```

## WritingToolsBehavior

Writing Toolsの動作をカスタマイズできます。

### SwiftUI

```swift
import SwiftUI

struct ContentView: View {
    @State private var text = ""

    var body: some View {
        TextEditor(text: $text)
            .writingToolsBehavior(.complete)  // Full functionality

        TextEditor(text: $text)
            .writingToolsBehavior(.limited)   // Limited functionality

        TextEditor(text: $text)
            .writingToolsBehavior(.none)      // Disable Writing Tools
    }
}
```

### UIKit

```swift
import UIKit

class ViewController: UIViewController {
    let textView = UITextView()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Set behavior
        textView.writingToolsBehavior = .complete
        // or .limited, .none
    }
}
```

### Behavior オプション

| オプション | 説明 |
|-----------|------|
| `.complete` | すべての機能を有効化（デフォルト） |
| `.limited` | 一部機能のみ有効化 |
| `.none` | Writing Toolsを無効化 |

## リッチテキスト対応（UIKit）

### writingToolsAllowedInputOptions

`writingToolsAllowedInputOptions`は`UITextInputTraits`プロトコルのプロパティで、UIKit専用です。リッチテキストやテーブルの入力を許可できます。

```swift
import UIKit

class RichTextViewController: UIViewController {
    let textView = UITextView()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Allow rich text and table input (UIKit only)
        textView.writingToolsAllowedInputOptions = [.richText, .table]
    }
}
```

**注意**: このプロパティはSwiftUIの`TextEditor`では直接使用できません。

## WKWebView対応

WKWebViewではデフォルトで`.limited`が設定されています。

```swift
import WebKit

class WebViewController: UIViewController {
    let webView = WKWebView()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Change from default .limited to .complete
        webView.configuration.preferences.writingToolsBehavior = .complete
    }
}
```

## WritingToolsCoordinator（iOS 26）

カスタムテキストエンジン向けのCoordinator APIがiOS 26で追加されました。

```swift
import UIKit

class CustomTextView: UIView {
    var writingToolsCoordinator: UIWritingToolsCoordinator?

    func setupWritingTools() {
        writingToolsCoordinator = UIWritingToolsCoordinator(
            delegate: self
        )
    }
}

extension CustomTextView: UIWritingToolsCoordinatorDelegate {
    // Implement delegate methods for custom text handling
}
```

## テスト時の注意

**重要**: Writing Toolsはシミュレーターではテストできません。Apple Intelligence対応デバイスでの実機テストが必要です。

## ベストプラクティス

- 標準UIフレームワークを使用して自動統合を活用
- ユーザーが期待する場所でWriting Toolsを有効に
- パスワードフィールドなどセンシティブな入力では`.none`を使用
- カスタムテキストエンジンではCoordinator APIを使用
- 実機でテストを行う（シミュレーター非対応）

## 公式リファレンス

- [Writing Tools (UIKit)](https://developer.apple.com/documentation/uikit/writing-tools)
- [WritingToolsBehavior (SwiftUI)](https://developer.apple.com/documentation/swiftui/writingtoolsbehavior)
- [writingToolsAllowedInputOptions](https://developer.apple.com/documentation/uikit/uitextinputtraits/4436239-writingtoolsallowedinputoptions)
- [WWDC24-10168: Get started with Writing Tools](https://developer.apple.com/videos/play/wwdc2024/10168/)
- [WWDC25-265: Dive deeper into Writing Tools](https://developer.apple.com/videos/play/wwdc2025/265/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
