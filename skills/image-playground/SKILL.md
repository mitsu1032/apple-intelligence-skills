---
name: image-playground
description: "Image Playground画像生成機能の統合"
globs: "**/*.swift"
---

# Image Playground

Apple公式ドキュメントに基づくImage Playground統合ガイド

## 概要

Image Playgroundは、Apple Intelligenceの画像生成機能をアプリに統合するためのフレームワークです。システムUIを表示する方法と、プログラマティックに生成する方法の2つのアプローチがあります。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 18.2+ |
| macOS | 15.2+ |
| Swift | 5.9+ |

## ImagePlaygroundViewController（システムUI）

システム標準のImage Playground UIを表示します。

### SwiftUI

```swift
import SwiftUI
import ImagePlayground

struct ContentView: View {
    @State private var showPlayground = false
    @State private var generatedImage: URL?

    var body: some View {
        Button("Create Image") {
            showPlayground = true
        }
        .imagePlaygroundSheet(isPresented: $showPlayground) { url in
            generatedImage = url
        }
    }
}
```

### UIKit

```swift
import UIKit
import ImagePlayground

class ViewController: UIViewController, ImagePlaygroundViewControllerDelegate {

    func presentImagePlayground() {
        let controller = ImagePlaygroundViewController()
        controller.delegate = self
        present(controller, animated: true)
    }

    // MARK: - Delegate Methods

    func imagePlaygroundViewController(
        _ controller: ImagePlaygroundViewController,
        didCreateImageAt url: URL
    ) {
        // Handle generated image
        controller.dismiss(animated: true)
    }

    func imagePlaygroundViewControllerDidCancel(
        _ controller: ImagePlaygroundViewController
    ) {
        controller.dismiss(animated: true)
    }
}
```

## 初期コンテキストの設定

### concepts

テキストでコンセプトを指定できます。

```swift
let controller = ImagePlaygroundViewController()
controller.concepts = [
    .text("A cat wearing a hat"),
    .text("Sunset beach")
]
```

### sourceImage

ソース画像を指定して、それを基に生成できます。

```swift
let controller = ImagePlaygroundViewController()
if let image = UIImage(named: "reference") {
    controller.sourceImage = image
}
```

## ImageCreator（プログラマティック生成）

iOS 18.4以降では、UIなしでプログラマティックに画像を生成できます。

### 可用性の確認

`availableStyles`はインスタンスプロパティです。

```swift
import ImagePlayground

let creator = ImageCreator()

// Check available styles (instance property)
let availableStyles = creator.availableStyles

if availableStyles.isEmpty {
    print("Image creation not available")
    return
}
```

### 画像生成

`images()`メソッドは`AsyncSequence`を返し、最大4枚の画像を生成できます。

```swift
import ImagePlayground

let creator = ImageCreator()

do {
    // images() returns AsyncSequence
    let images = try creator.images(
        from: "A mountain landscape at sunset",
        style: .animation,
        limit: 1  // Maximum 4 images
    )

    for try await url in images {
        // Handle each generated image
        print("Generated: \(url)")
    }
} catch {
    print("Failed to create image: \(error)")
}
```

### 利用可能なスタイル

| スタイル | 説明 |
|---------|------|
| `.animation` | アニメーション風 |
| `.illustration` | イラスト風 |
| `.sketch` | スケッチ風 |
| `.emoji` | 絵文字風 |
| `.messagesBackground` | メッセージ背景 |
| `.externalProvider` | 外部プロバイダー（UIのみ） |

**注意**:
- `.externalProvider`スタイルはUIベースAPI（ImagePlaygroundViewController）でのみ利用可能です
- 利用可能なスタイルはデバイスや設定により異なります

## 画像の保存場所

生成された画像は、アプリのサンドボックス内の一時ディレクトリに保存されます。永続化が必要な場合は、別の場所にコピーしてください。

```swift
func saveGeneratedImage(from temporaryURL: URL) throws {
    let documentsDirectory = FileManager.default.urls(
        for: .documentDirectory,
        in: .userDomainMask
    ).first!

    let destinationURL = documentsDirectory.appendingPathComponent(
        temporaryURL.lastPathComponent
    )

    try FileManager.default.copyItem(
        at: temporaryURL,
        to: destinationURL
    )
}
```

## ベストプラクティス

- `ImageCreator`インスタンスを作成後、`.availableStyles`で利用可能なスタイルを確認
- 生成画像は一時ディレクトリにあるため、必要に応じて永続化
- システムUIは一貫したユーザー体験を提供
- プログラマティック生成は特定のユースケースに限定
- `limit`パラメータで生成枚数を制御（最大4枚）

## 公式リファレンス

- [Image Playground Framework](https://developer.apple.com/documentation/imageplayground)
- [ImagePlaygroundViewController](https://developer.apple.com/documentation/imageplayground/imageplaygroundviewcontroller)
- [ImageCreator](https://developer.apple.com/documentation/ImagePlayground/ImageCreator)
- [WWDC24-10124: What's new in AppKit](https://developer.apple.com/videos/play/wwdc2024/10124/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
