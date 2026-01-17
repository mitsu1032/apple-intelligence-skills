# Apple Intelligence Skills 設計ドキュメント

**作成日**: 2026-01-17
**バージョン**: 1.0.0
**対象**: Claude Code プラグイン

---

## 1. 概要

### 目的

Apple Intelligence / Foundation Models を活用したiOSアプリ開発を支援するClaude Codeプラグイン。Apple公式ドキュメントとWWDC動画に基づく正確な情報を提供する。

### 設計原則

1. **公式ソースのみ** - Apple Developer Documentation、WWDC動画、Tech Notes のみを情報源とする
2. **バイリンガル** - 説明は日本語、コード例は英語コメント
3. **将来対応** - バージョン情報を明記し、アップデートに対応可能な構造
4. **汎用性** - LIRAアプリに限らず、あらゆるApple Intelligenceアプリに適用可能

### 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| macOS | 26.0+ |
| Swift | 6.0+ |
| Xcode | 26+ |

---

## 2. プラグイン構造

```
apple-intelligence-skills/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   │
│   │  ═══ Foundation Models（LLMコア）═══
│   ├── foundation-models-basics.md
│   ├── prompt-engineering.md
│   ├── guided-generation.md
│   ├── tool-calling.md
│   ├── performance-optimization.md
│   │
│   │  ═══ Apple Intelligence Features ═══
│   ├── writing-tools.md
│   ├── image-playground.md
│   ├── genmoji.md
│   ├── app-intents-siri.md
│   │
│   │  ═══ Intelligent Frameworks ═══
│   ├── natural-language.md
│   ├── speech-recognition.md
│   │
│   │  ═══ Production（本番運用）═══
│   ├── multilingual-support.md
│   ├── ai-safety-guardrails.md
│   └── ai-ux-guidelines.md
│
├── docs/
│   └── plans/
│       └── 2026-01-17-apple-intelligence-skills-design.md
├── tests/
│   └── validate-skills.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. スキル詳細設計

### 3.1 Foundation Models（LLMコア）

#### foundation-models-basics.md

**目的**: Foundation Modelsフレームワークの基本的な使い方を解説

**カバー内容**:
- SystemLanguageModel - オンデバイスLLMへのアクセス
- LanguageModelSession - セッション管理、状態保持
- Prompt / Instructions - プロンプトとシステム指示の違い
- Transcript - 会話履歴の管理
- 可用性チェック - デバイス対応確認

**公式ソース**:
- [Foundation Models Documentation](https://developer.apple.com/documentation/FoundationModels)
- [Generating content and performing tasks](https://developer.apple.com/documentation/FoundationModels/generating-content-and-performing-tasks-with-foundation-models)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

---

#### prompt-engineering.md

**目的**: 効果的なプロンプト設計とモデル動作の制御

**カバー内容**:
- Instructions vs Prompts - 役割の違いと優先順位
- PromptBuilder - 動的プロンプト構築
- GenerationOptions - sampling, temperature
- 出力長の制御 - 自然言語での指示
- Xcode Playgrounds - プロンプトのテスト方法

**公式ソース**:
- [PromptBuilder Documentation](https://developer.apple.com/documentation/foundationmodels/promptbuilder)
- [GenerationOptions Documentation](https://developer.apple.com/documentation/foundationmodels/generationoptions)
- [WWDC25-248: Explore prompt design & safety](https://developer.apple.com/videos/play/wwdc2025/248/)
- [WWDC25-301: Deep dive into Foundation Models](https://developer.apple.com/videos/play/wwdc2025/301/)

**重要な公式情報**:
- Instructionsはプロンプトより優先される（セキュリティ強化のため）
- temperatureで応答の確信度を調整（例：0.5で少し変化する出力）
- `.greedy` samplingで決定的出力を取得可能

---

#### guided-generation.md

**目的**: @Generable/@Guideマクロを使った構造化出力

**カバー内容**:
- @Generable マクロ - 型安全な出力定義
- @Guide マクロ - フィールド制約（range, anyOf, count）
- プロパティ順序 - 生成順序の重要性
- PartiallyGenerated - ストリーミング対応
- ネスト構造 - 複雑なデータ型の生成

**公式ソース**:
- [Generable Protocol](https://developer.apple.com/documentation/foundationmodels/generable)
- [GenerationGuide](https://developer.apple.com/documentation/foundationmodels/generationguide)
- [Generating Swift data structures](https://developer.apple.com/documentation/foundationmodels/generating-swift-data-structures-with-guided-generation)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

**重要な公式情報**:
- プロパティは宣言順に生成される
- 「どのプロパティを他なしで表示できるか」を考慮して順序を決定
- ストリーミング時はPartiallyGeneratedで段階的に値が埋まる

---

#### tool-calling.md

**目的**: Tool protocolを使った外部機能の統合

**カバー内容**:
- Tool protocol - 基本構造（name, description, call）
- Arguments定義 - @Generableとの連携
- ToolOutput - 戻り値の設計
- 複数ツールの管理 - 並列・直列呼び出し
- ユースケース - カレンダー、連絡先、外部API

**公式ソース**:
- [Expanding generation with tool calling](https://developer.apple.com/documentation/foundationmodels/expanding-generation-with-tool-calling)
- [Tool Protocol](https://developer.apple.com/documentation/foundationmodels/tool)
- [WWDC25-301: Deep dive into Foundation Models](https://developer.apple.com/videos/play/wwdc2025/301/)

**重要な公式情報**:
- フレームワークが並列・直列のツール呼び出しを自動最適化
- モデルがツール呼び出しのタイミングを自律的に判断

---

#### performance-optimization.md

**目的**: パフォーマンス分析と最適化

**カバー内容**:
- コンテキストウィンドウ管理 - 4,096トークン制限
- トークン推定 - 言語別の目安（英語3-4文字、日本語1文字）
- Xcode Instruments - Foundation Modelsプロファイラ
- prewarm() - セッションの事前準備
- エラーハンドリング - exceededContextWindowSize

**公式ソース**:
- [TN3193: Managing the on-device foundation model's context window](https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window)
- [Analyzing runtime performance](https://developer.apple.com/documentation/FoundationModels/analyzing-the-runtime-performance-of-your-foundation-models-app)
- [WWDC25-301: Deep dive into Foundation Models](https://developer.apple.com/videos/play/wwdc2025/301/)

**重要な公式情報**:
- コンテキストウィンドウは4,096トークン（固定）
- 入出力の分割は柔軟（例：入力4,000→出力96）
- prewarm()からrespond()まで最低1秒の猶予が必要

---

### 3.2 Apple Intelligence Features

#### writing-tools.md

**目的**: Writing Tools（作文・校正・要約）の統合

**カバー内容**:
- 自動統合 - TextField, TextEditorでの標準サポート
- WritingToolsBehavior - .complete, .limited, .none
- writingToolsAllowedInputOptions - リッチテキスト、テーブル対応
- WritingToolsCoordinator - カスタムテキストエンジン向け（iOS 26）
- WKWebView対応

**公式ソース**:
- [Writing Tools (UIKit)](https://developer.apple.com/documentation/uikit/writing-tools)
- [WritingToolsBehavior (SwiftUI)](https://developer.apple.com/documentation/swiftui/writingtoolsbehavior)
- [WWDC24-10168: Get started with Writing Tools](https://developer.apple.com/videos/play/wwdc2024/10168/)
- [WWDC25-265: Dive deeper into Writing Tools](https://developer.apple.com/videos/play/wwdc2025/265/)

**重要な公式情報**:
- 標準UIフレームワーク使用時は自動で有効
- WKWebViewのデフォルトは.limited
- iOS 26でカスタムテキストエンジン向けCoordinator APIが追加

---

#### image-playground.md

**目的**: 画像生成機能の統合

**カバー内容**:
- ImagePlaygroundViewController - システムUI表示
- ImageCreator - プログラマティック生成（iOS 18.4+）
- concepts / sourceImage - 初期コンテキスト設定
- availableStyles - 利用可能スタイルの確認
- デリゲートメソッド - 完了・キャンセル処理

**公式ソース**:
- [Image Playground Framework](https://developer.apple.com/documentation/imageplayground)
- [ImagePlaygroundViewController](https://developer.apple.com/documentation/imageplayground/imageplaygroundviewcontroller)
- [ImageCreator](https://developer.apple.com/documentation/ImagePlayground/ImageCreator)
- [WWDC24-10124: What's new in AppKit](https://developer.apple.com/videos/play/wwdc2024/10124/)

**重要な公式情報**:
- 生成された画像はアプリのサンドボックス一時ディレクトリに保存
- ImageCreator使用前に.availableStylesを確認必須
- .externalProviderスタイルはUIベースAPIでのみ利用可能

---

#### genmoji.md

**目的**: カスタム絵文字（Genmoji）の統合

**カバー内容**:
- NSAdaptiveImageGlyph - Genmojiのデータ表現
- supportsAdaptiveImageGlyph - リッチテキストビューでの有効化
- シリアライズ - RTFDでの保存・読み込み
- HTML出力 - WebKit互換形式
- TextKit2対応 - TextKit1との違い

**公式ソース**:
- [NSAdaptiveImageGlyph](https://developer.apple.com/documentation/uikit/nsadaptiveimageglyph)
- [WWDC24-10220: Bring expression to your app with Genmoji](https://developer.apple.com/videos/play/wwdc2024/10220/)

**重要な公式情報**:
- Genmojiは画像であり、Unicodeではない
- 電話番号やメールアドレスなどテキストのみの項目には不適切
- TextKit2での使用を推奨（TextKit1ではNSTextAttachmentへの変換が必要）

---

#### app-intents-siri.md

**目的**: Siri・Apple Intelligence統合

**カバー内容**:
- Assistant Schemas - 100以上の事前定義インテント
- App Intent Domains - 機能カテゴリ別の統合
- On-screen awareness - 画面コンテンツへのアクセス
- Visual Intelligence - 画像検索（iOS 26）
- Transferable protocol - データ共有

**公式ソース**:
- [Integrating actions with Siri and Apple Intelligence](https://developer.apple.com/documentation/appintents/integrating-actions-with-siri-and-apple-intelligence)
- [App intent domains](https://developer.apple.com/documentation/appintents/app-intent-domains)
- [Making onscreen content available to Siri](https://developer.apple.com/documentation/appintents/making-onscreen-content-available-to-siri-and-apple-intelligence)
- [WWDC24-10133: Bring your app to Siri](https://developer.apple.com/videos/play/wwdc2024/10133/)
- [WWDC25-244: Get to know App Intents](https://developer.apple.com/videos/play/wwdc2025/244/)

**重要な公式情報**:
- iOS 18以降「アプリのすべての機能をApp Intentにすべき」（Apple推奨）
- App IntentsはApple Intelligence統合の主要ゲートウェイ
- AssistantSchemaに準拠することでAppleの学習済みモデルを活用可能

---

### 3.3 Intelligent Frameworks

#### natural-language.md

**目的**: 自然言語処理機能の活用

**カバー内容**:
- NLTagger - テキスト分析の基本
- Sentiment Analysis - 感情分析（-1〜+1スコア）
- Tokenization - トークン分割
- Language Identification - 言語検出
- Named Entity Recognition - 固有表現抽出
- カスタムモデル - Create MLとの連携

**公式ソース**:
- [NLTagger](https://developer.apple.com/documentation/naturallanguage/nltagger)
- [NLTagScheme](https://developer.apple.com/documentation/naturallanguage/nltagscheme)
- [WWDC19-232: Advances in Natural Language Framework](https://developer.apple.com/videos/play/wwdc2019/232/)
- [WWDC23-10042: Explore Natural Language multilingual models](https://developer.apple.com/videos/play/wwdc2023/10042/)

**重要な公式情報**:
- 感情分析は7言語対応（英語、フランス語、イタリア語、ドイツ語、スペイン語、ポルトガル語、簡体字中国語）
- 完全オンデバイス処理でプライバシー保護
- 短いテキストでは精度が低下する可能性

---

#### speech-recognition.md

**目的**: 音声認識機能の活用

**カバー内容**:
- SFSpeechRecognizer - 従来API（iOS 10+）
- requiresOnDeviceRecognition - オンデバイス認識
- Language Model Customization - 語彙カスタマイズ（iOS 17+）
- SpeechAnalyzer - 新API（iOS 26）
- SpeechTranscriber / SpeechDetector - モジュラー設計

**公式ソース**:
- [Speech Framework](https://developer.apple.com/documentation/speech)
- [SFSpeechRecognizer](https://developer.apple.com/documentation/speech/sfspeechrecognizer)
- [Bringing advanced speech-to-text](https://developer.apple.com/documentation/Speech/bringing-advanced-speech-to-text-capabilities-to-your-app)
- [WWDC19-256: Advances in Speech Recognition](https://developer.apple.com/videos/play/wwdc2019/256/)
- [WWDC23-10101: Customize on-device speech recognition](https://developer.apple.com/videos/play/wwdc2023/10101/)
- [WWDC25-277: Bring advanced speech-to-text with SpeechAnalyzer](https://developer.apple.com/videos/play/wwdc2025/277/)

**重要な公式情報**:
- SpeechAnalyzer（iOS 26）は長時間・遠距離音声に最適
- オンデバイス認識はA9以降のプロセッサで対応
- 10以上の言語でオンデバイス認識をサポート

---

### 3.4 Production（本番運用）

#### multilingual-support.md

**目的**: 多言語対応の実装

**カバー内容**:
- サポート言語 - 23ロケール（日本語含む）
- Locale API - ユーザー言語の検出
- プロンプト設計 - 英語Instructions + ローカル言語プロンプト
- supportedLanguages - 実行時の言語確認
- トークン効率 - CJK言語での考慮事項

**公式ソース**:
- [Supporting languages and locales](https://developer.apple.com/documentation/foundationmodels/supporting-languages-and-locales-with-foundation-models)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

**重要な公式情報**:
- Instructionsは英語で記述するのが最も効果的
- ユーザープロンプトは希望する出力言語で記述
- 日本語は1文字≒1トークン（英語の3-4倍のトークン消費）

---

#### ai-safety-guardrails.md

**目的**: 安全性とエラーハンドリング

**カバー内容**:
- Guardrails - 入出力両方への適用
- guardrailViolation - エラーハンドリング
- Instructions優先 - セキュリティ設計
- LanguageModelFeedback - フィードバック送信
- 適切なユースケース - 推奨・非推奨の用途

**公式ソース**:
- [Improving safety of generative model output](https://developer.apple.com/documentation/FoundationModels/improving-the-safety-of-generative-model-output)
- [WWDC25-248: Explore prompt design & safety](https://developer.apple.com/videos/play/wwdc2025/248/)
- [Acceptable use requirements](https://developer.apple.com/apple-intelligence/acceptable-use-requirements-for-the-foundation-models-framework/)

**重要な公式情報**:
- Guardrailsは入力・出力の両方に適用
- モデルはInstructionsをプロンプトより優先（セキュリティ強化）
- Apple公式がfalse-refusal改善を継続中

---

#### ai-ux-guidelines.md

**目的**: 生成AIのUX設計ガイドライン

**カバー内容**:
- AI使用の明示 - ユーザーへの通知
- 期待値の設定 - 能力と限界の伝達
- フィードバック機構 - ユーザーからの入力収集
- エラー表示 - 失敗時のUX
- アクセシビリティ - 生成コンテンツへの配慮

**公式ソース**:
- [Human Interface Guidelines - Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai)
- [Human Interface Guidelines - Machine Learning](https://developer.apple.com/design/human-interface-guidelines/machine-learning)

---

## 4. plugin.json 設計

```json
{
  "name": "apple-intelligence-skills",
  "version": "1.0.0",
  "description": "Apple Intelligence / Foundation Models開発スキル集（Apple公式ドキュメント準拠）",
  "author": "mitsu1032",
  "skills": [
    "skills/foundation-models-basics.md",
    "skills/prompt-engineering.md",
    "skills/guided-generation.md",
    "skills/tool-calling.md",
    "skills/performance-optimization.md",
    "skills/writing-tools.md",
    "skills/image-playground.md",
    "skills/genmoji.md",
    "skills/app-intents-siri.md",
    "skills/natural-language.md",
    "skills/speech-recognition.md",
    "skills/multilingual-support.md",
    "skills/ai-safety-guardrails.md",
    "skills/ai-ux-guidelines.md"
  ],
  "compatibility": {
    "ios": "26.0+",
    "macos": "26.0+",
    "swift": "6.0+"
  },
  "sources": {
    "type": "official-only",
    "references": [
      "developer.apple.com/documentation",
      "developer.apple.com/videos/wwdc",
      "developer.apple.com/design/human-interface-guidelines"
    ]
  }
}
```

---

## 5. スキル共通フォーマット

```markdown
---
name: skill-name
description: スキルの説明
version: 1.0.0
last_updated: 2026-01-17
ios_version: "26.0+"
apple_docs:
  - https://developer.apple.com/documentation/...
wwdc_sessions:
  - https://developer.apple.com/videos/play/wwdc2025/...
---

# スキル名

## 概要
（200文字以内の説明）

## 対応バージョン
| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## 基本的な使い方

### コード例
```swift
// English comments for code examples
import FoundationModels
// ...
```

## 詳細

### サブトピック1
...

### サブトピック2
...

## エラーハンドリング
...

## ベストプラクティス
（Apple公式推奨事項のみ記載）

## 公式リファレンス
- [Documentation Title](https://developer.apple.com/...)
- [WWDC Session](https://developer.apple.com/videos/...)

## 変更履歴
| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-17 | 初版作成 |
```

---

## 6. 公式ソース一覧

### Foundation Models

| ドキュメント | URL |
|-------------|-----|
| Framework Overview | https://developer.apple.com/documentation/FoundationModels |
| Generating content | https://developer.apple.com/documentation/FoundationModels/generating-content-and-performing-tasks-with-foundation-models |
| Guided generation | https://developer.apple.com/documentation/foundationmodels/generating-swift-data-structures-with-guided-generation |
| Tool calling | https://developer.apple.com/documentation/foundationmodels/expanding-generation-with-tool-calling |
| Safety | https://developer.apple.com/documentation/FoundationModels/improving-the-safety-of-generative-model-output |
| Multilingual | https://developer.apple.com/documentation/foundationmodels/supporting-languages-and-locales-with-foundation-models |
| Context window (TN3193) | https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window |

### WWDC Sessions

| セッション | 内容 |
|-----------|------|
| WWDC25-286 | Meet the Foundation Models framework |
| WWDC25-301 | Deep dive into Foundation Models |
| WWDC25-248 | Explore prompt design & safety |
| WWDC25-259 | Code-along: Foundation Models |
| WWDC25-265 | Dive deeper into Writing Tools |
| WWDC25-277 | SpeechAnalyzer |
| WWDC25-244 | Get to know App Intents |
| WWDC24-10168 | Get started with Writing Tools |
| WWDC24-10220 | Bring expression with Genmoji |
| WWDC24-10133 | Bring your app to Siri |
| WWDC19-232 | Natural Language Framework |

### Human Interface Guidelines

| ガイドライン | URL |
|-------------|-----|
| Generative AI | https://developer.apple.com/design/human-interface-guidelines/generative-ai |
| Machine Learning | https://developer.apple.com/design/human-interface-guidelines/machine-learning |

---

## 7. 実装計画

### Phase 1: コア機能（優先度高）
1. foundation-models-basics.md
2. prompt-engineering.md
3. guided-generation.md
4. tool-calling.md
5. ai-safety-guardrails.md

### Phase 2: パフォーマンス・多言語
6. performance-optimization.md
7. multilingual-support.md

### Phase 3: Apple Intelligence Features
8. writing-tools.md
9. app-intents-siri.md
10. ai-ux-guidelines.md

### Phase 4: 拡張機能
11. image-playground.md
12. genmoji.md
13. natural-language.md
14. speech-recognition.md

---

## 8. 検証項目

各スキル作成時に以下を確認：

- [ ] 情報源がApple公式のみであること
- [ ] バージョン情報が正確であること
- [ ] コード例が公式サンプルに基づくこと
- [ ] WWDC動画の内容と矛盾がないこと
- [ ] 非推奨APIに警告が付いていること

---

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-17 | 初版作成 |
