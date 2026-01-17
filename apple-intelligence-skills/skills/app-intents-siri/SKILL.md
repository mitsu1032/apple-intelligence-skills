---
name: app-intents-siri
description: "Siri・Apple Intelligence統合"
globs: "**/*.swift"
---

# App Intents & Siri

Apple公式ドキュメントに基づくSiri・Apple Intelligence統合ガイド

## 概要

App Intentsは、アプリの機能をSiriやApple Intelligenceに統合するためのフレームワークです。iOS 18以降、Appleは「アプリのすべての機能をApp Intentにすべき」と推奨しています。Assistant Schemasに準拠することで、Appleの学習済みモデルを活用できます。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 16.0+（Siri統合は18.0+） |
| macOS | 13.0+ |
| Swift | 5.9+ |

## App Intents基礎

### 基本的なIntent定義

```swift
import AppIntents

struct StartWorkoutIntent: AppIntent {
    static var title: LocalizedStringResource = "Start Workout"
    static var description = IntentDescription("Start a new workout session")

    @Parameter(title: "Workout Type")
    var workoutType: WorkoutType

    func perform() async throws -> some IntentResult {
        // Start the workout
        let session = try await WorkoutManager.shared.start(type: workoutType)
        return .result(value: session.id)
    }
}
```

### AppEntityの定義

```swift
import AppIntents

struct WorkoutType: AppEntity {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Workout Type")

    var id: String
    var name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }

    static var defaultQuery = WorkoutTypeQuery()
}

struct WorkoutTypeQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [WorkoutType] {
        // Return workout types matching identifiers
        return WorkoutManager.shared.types(for: identifiers)
    }

    func suggestedEntities() async throws -> [WorkoutType] {
        // Return all available workout types
        return WorkoutManager.shared.allTypes
    }
}
```

## Assistant Schemas

100以上の事前定義されたインテントパターンに準拠することで、Siriが自然言語を正しく解釈できます。

### AssistantSchemaに準拠

`@AssistantIntent`マクロを使用してスキーマに準拠します。

```swift
import AppIntents

@AssistantIntent(schema: .photos.openAsset)
struct OpenPhotoIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Photo"

    @Parameter(title: "Asset")
    var target: AssetEntity

    func perform() async throws -> some IntentResult {
        // Open the photo
        await PhotoManager.shared.open(target)
        return .result()
    }
}
```

### 主要なAssistant Schema カテゴリ

| ドメイン | 用途 |
|---------|------|
| Photos | 写真・ビデオの操作 |
| Journaling | 日記・ログ記録 |
| Mail | メール作成・送信 |
| Files | ファイル管理 |
| Browser | Web操作 |

## App Intent Domains

機能カテゴリ別の統合設定です。

```swift
import AppIntents

struct MyAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: StartWorkoutIntent(),
            phrases: [
                "Start a \(.applicationName) workout",
                "Begin workout in \(.applicationName)"
            ],
            shortTitle: "Start Workout",
            systemImageName: "figure.run"
        )
    }
}
```

## On-screen Awareness

画面コンテンツをSiriに公開できます（iOS 18+）。

```swift
import AppIntents
import SwiftUI

struct ContentView: View {
    @State private var currentRecipe: Recipe?

    var body: some View {
        RecipeDetailView(recipe: currentRecipe)
            .appIntentsContext(currentRecipe)
    }
}

// RecipeをAppEntityとして定義
extension Recipe: AppEntity {
    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}
```

### RelevantContext

```swift
import AppIntents

struct RecipeContext: RelevantContext {
    @Parameter
    var recipe: Recipe

    func matches(_ context: IntentContext) async throws -> Bool {
        // Return true if recipe is on screen
        return true
    }
}
```

## Spotlight統合

App IntentsはSpotlight検索と統合できます。

```swift
import AppIntents
import CoreSpotlight

struct RecipeEntity: AppEntity, IndexedEntity {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Recipe")

    var id: String
    var name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }

    // Spotlight indexing
    var attributeSet: CSSearchableItemAttributeSet {
        let attributes = CSSearchableItemAttributeSet()
        attributes.displayName = name
        return attributes
    }
}
```

## Transferable Protocol

App Intents間でのデータ共有を可能にします。

```swift
import UniformTypeIdentifiers
import CoreTransferable

struct Recipe: Transferable {
    var name: String
    var ingredients: [String]

    static var transferRepresentation: some TransferRepresentation {
        CodableRepresentation(contentType: .recipe)
    }
}

extension UTType {
    static var recipe: UTType {
        UTType(exportedAs: "com.example.recipe")
    }
}
```

## Siri Voice Integration

音声操作の最適化設定です。

```swift
import AppIntents

struct ReadRecipeIntent: AppIntent {
    static var title: LocalizedStringResource = "Read Recipe"

    @Parameter(title: "Recipe")
    var recipe: Recipe

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let dialog = IntentDialog("Here's how to make \(recipe.name)...")
        return .result(dialog: dialog)
    }
}
```

## ベストプラクティス

- アプリのすべての主要機能をApp Intentとして公開
- AssistantSchemaに準拠して学習済みモデルを活用
- 自然な音声フレーズを複数登録
- On-screen awarenessで文脈を考慮したアクションを提供
- エラー時は明確なフィードバックを返す

## 公式リファレンス

- [Integrating actions with Siri and Apple Intelligence](https://developer.apple.com/documentation/appintents/integrating-actions-with-siri-and-apple-intelligence)
- [App intent domains](https://developer.apple.com/documentation/appintents/app-intent-domains)
- [Making onscreen content available to Siri](https://developer.apple.com/documentation/appintents/making-onscreen-content-available-to-siri-and-apple-intelligence)
- [WWDC24-10133: Bring your app to Siri](https://developer.apple.com/videos/play/wwdc2024/10133/)
- [WWDC25-244: Get to know App Intents](https://developer.apple.com/videos/play/wwdc2025/244/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
