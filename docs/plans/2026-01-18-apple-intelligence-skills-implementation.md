# Apple Intelligence Skills 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apple公式ドキュメントに基づく14スキルを含むClaude Codeプラグインを作成する

**Architecture:** ios-dev-skillsと同じ構造を踏襲。skills/<skill-name>/SKILL.md形式でスキルを配置し、TypeScriptテストで検証する。

**Tech Stack:** TypeScript (テスト), Markdown (スキル), JSON (plugin.json)

---

## Phase 1: プロジェクト基盤

### Task 1: プラグイン基盤ファイルの作成

**Files:**
- Create: `apple-intelligence-skills/.claude-plugin/plugin.json`
- Create: `apple-intelligence-skills/package.json`
- Create: `apple-intelligence-skills/tsconfig.json`

**Step 1: plugin.jsonを作成**

```json
{
  "name": "apple-intelligence-skills",
  "description": "Apple Intelligence / Foundation Models開発スキル集（Apple公式ドキュメント準拠）",
  "version": "1.0.0",
  "author": {
    "name": "mitsu1032"
  },
  "homepage": "https://github.com/mitsu1032/apple-intelligence-skills",
  "repository": "https://github.com/mitsu1032/apple-intelligence-skills",
  "license": "MIT",
  "keywords": ["apple-intelligence", "foundation-models", "ios", "swift", "swiftui", "llm", "on-device-ai"]
}
```

**Step 2: package.jsonを作成**

```json
{
  "name": "apple-intelligence-skills-tests",
  "version": "1.0.0",
  "description": "Tests for apple-intelligence-skills Claude Code plugin",
  "scripts": {
    "build": "tsc",
    "test": "tsc && node dist/run-tests.js",
    "test:watch": "tsc --watch"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "private": true
}
```

**Step 3: tsconfig.jsonを作成**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./tests"
  },
  "include": ["tests/**/*"],
  "exclude": ["node_modules"]
}
```

**Step 4: コミット**

```bash
git add .claude-plugin/plugin.json package.json tsconfig.json
git commit -m "feat: add plugin foundation files"
```

---

### Task 2: テストフレームワークの作成

**Files:**
- Create: `apple-intelligence-skills/tests/run-tests.ts`

**Step 1: テストファイルを作成**

```typescript
#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

// Types
interface Frontmatter {
  name?: string;
  description?: string;
  globs?: string;
  [key: string]: string | undefined;
}

interface TestFailure {
  test: string;
  reason: string;
}

interface PluginJson {
  name?: string;
  description?: string;
  version?: string;
  [key: string]: unknown;
}

// Colors for terminal output
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
} as const;

// Test state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: TestFailure[] = [];

function pass(testName: string): void {
  totalTests++;
  passedTests++;
  console.log(`  ${COLORS.green}✓${COLORS.reset} ${testName}`);
}

function fail(testName: string, reason: string): void {
  totalTests++;
  failedTests++;
  console.log(`  ${COLORS.red}✗${COLORS.reset} ${testName}`);
  failures.push({ test: testName, reason });
}

function section(name: string): void {
  console.log(`\n${COLORS.bold}${name}${COLORS.reset}`);
}

// Parse YAML frontmatter from markdown
function parseFrontmatter(content: string): Frontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result: Frontmatter = {};

  for (const line of yaml.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  }

  return result;
}

// Test: Validate SKILL.md files
function testSkillFiles(): void {
  section('Skill Files Validation');

  const skillsDir = path.join(__dirname, '..', 'skills');

  if (!fs.existsSync(skillsDir)) {
    fail('Skills directory exists', 'skills/ directory not found');
    return;
  }
  pass('Skills directory exists');

  const skillDirs = fs.readdirSync(skillsDir).filter((f: string) => {
    const fullPath = path.join(skillsDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  if (skillDirs.length === 0) {
    fail('At least one skill exists', 'No skill directories found');
    return;
  }
  pass(`Found ${skillDirs.length} skill(s)`);

  for (const skillDir of skillDirs) {
    const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      fail(`${skillDir}/SKILL.md exists`, 'File not found');
      continue;
    }
    pass(`${skillDir}/SKILL.md exists`);

    const content = fs.readFileSync(skillPath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter) {
      fail(`${skillDir} has valid frontmatter`, 'No frontmatter found');
      continue;
    }

    if (!frontmatter.name) {
      fail(`${skillDir} has name in frontmatter`, 'name is missing');
    } else {
      pass(`${skillDir} has name: ${frontmatter.name}`);
    }

    if (!frontmatter.description) {
      fail(`${skillDir} has description`, 'description is missing');
    } else {
      pass(`${skillDir} has description`);
    }

    // Check for required sections
    const requiredSections = ['## 概要', '## 公式リファレンス'];
    for (const section of requiredSections) {
      if (content.includes(section)) {
        pass(`${skillDir} has "${section}" section`);
      } else {
        fail(`${skillDir} has "${section}" section`, 'Section not found');
      }
    }

    // Check for Apple official links only
    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
      const url = match[2];
      if (url.includes('developer.apple.com') ||
          url.includes('swift.org') ||
          url.includes('apple.com')) {
        // Valid Apple official link
      } else {
        fail(`${skillDir} uses only Apple official links`, `Found non-Apple link: ${url}`);
      }
    }
  }
}

// Test: Validate plugin.json
function testPluginJson(): void {
  section('Plugin.json Validation');

  const pluginPath = path.join(__dirname, '..', '.claude-plugin', 'plugin.json');

  if (!fs.existsSync(pluginPath)) {
    fail('plugin.json exists', 'File not found');
    return;
  }
  pass('plugin.json exists');

  try {
    const content = fs.readFileSync(pluginPath, 'utf-8');
    const json: PluginJson = JSON.parse(content);

    if (json.name === 'apple-intelligence-skills') {
      pass('plugin.json has correct name');
    } else {
      fail('plugin.json has correct name', `Expected "apple-intelligence-skills", got "${json.name}"`);
    }

    if (json.version) {
      pass(`plugin.json has version: ${json.version}`);
    } else {
      fail('plugin.json has version', 'version is missing');
    }

    if (json.description && json.description.length > 0) {
      pass('plugin.json has description');
    } else {
      fail('plugin.json has description', 'description is missing or empty');
    }
  } catch (e) {
    fail('plugin.json is valid JSON', String(e));
  }
}

// Main
function main(): void {
  console.log(`${COLORS.bold}Apple Intelligence Skills - Test Suite${COLORS.reset}`);
  console.log('='.repeat(50));

  testPluginJson();
  testSkillFiles();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`${COLORS.bold}Summary${COLORS.reset}`);
  console.log(`  Total:  ${totalTests}`);
  console.log(`  ${COLORS.green}Passed: ${passedTests}${COLORS.reset}`);
  if (failedTests > 0) {
    console.log(`  ${COLORS.red}Failed: ${failedTests}${COLORS.reset}`);
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${f.test}`);
      console.log(`    ${COLORS.yellow}→ ${f.reason}${COLORS.reset}`);
    }
    process.exit(1);
  }
  console.log(`\n${COLORS.green}All tests passed!${COLORS.reset}`);
}

main();
```

**Step 2: 依存関係をインストール**

Run: `cd apple-intelligence-skills && npm install`

**Step 3: テストを実行して失敗を確認**

Run: `npm test`
Expected: FAIL (skills directory doesn't exist yet)

**Step 4: コミット**

```bash
git add tests/run-tests.ts
git commit -m "feat: add test framework for skill validation"
```

---

### Task 3: skillsディレクトリ構造の作成

**Files:**
- Create: `apple-intelligence-skills/skills/` (directory structure)

**Step 1: 全スキルディレクトリを作成**

```bash
mkdir -p skills/foundation-models-basics
mkdir -p skills/prompt-engineering
mkdir -p skills/guided-generation
mkdir -p skills/tool-calling
mkdir -p skills/performance-optimization
mkdir -p skills/writing-tools
mkdir -p skills/image-playground
mkdir -p skills/genmoji
mkdir -p skills/app-intents-siri
mkdir -p skills/natural-language
mkdir -p skills/speech-recognition
mkdir -p skills/multilingual-support
mkdir -p skills/ai-safety-guardrails
mkdir -p skills/ai-ux-guidelines
```

**Step 2: コミット**

```bash
git add skills/
git commit -m "feat: create skill directory structure"
```

---

## Phase 2: Foundation Models コアスキル

### Task 4: foundation-models-basics スキル作成

**Files:**
- Create: `apple-intelligence-skills/skills/foundation-models-basics/SKILL.md`

**Step 1: SKILL.mdを作成**

```markdown
---
name: foundation-models-basics
description: "Foundation Modelsフレームワークの基本的な使い方を解説"
globs: "**/*.swift"
---

# Foundation Models 基礎

Apple公式ドキュメントに基づくFoundation Modelsフレームワークの基本ガイド

## 概要

Foundation Modelsフレームワークは、iOS 26で導入されたオンデバイスLLMへのアクセスを提供します。約30億パラメータのモデルがデバイス上で動作し、プライバシーを保護しながら高度な言語機能を実現します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| macOS | 26.0+ |
| Swift | 6.0+ |

## 基本的な使い方

### 可用性チェック

```swift
import FoundationModels

// Check if the model is available on this device
let model = SystemLanguageModel.default
guard model.isAvailable else {
    // Handle unavailability
    return
}
```

### セッションの作成と応答取得

```swift
import FoundationModels

// Create a session
let session = LanguageModelSession()

// Get a response
let response = try await session.respond(to: "What is Swift?")
print(response.content)
```

### Instructionsの設定

```swift
import FoundationModels

// Create session with instructions
let session = LanguageModelSession(instructions: """
    You are a helpful assistant that explains iOS development concepts.
    Keep responses concise and accurate.
    """)

let response = try await session.respond(to: "Explain SwiftUI")
```

## 主要なクラスと構造体

### SystemLanguageModel

オンデバイスLLMへのアクセスポイント。`SystemLanguageModel.default`で取得します。

### LanguageModelSession

会話のコンテキストを管理するセッション。状態を保持し、複数のやり取りで文脈を維持します。

### Transcript

セッション内のすべてのプロンプトと応答の履歴。デバッグやUI表示に使用できます。

```swift
// Access conversation history
for entry in session.transcript.entries {
    print(entry)
}
```

## エラーハンドリング

```swift
do {
    let response = try await session.respond(to: prompt)
} catch let error as LanguageModelSession.GenerationError {
    switch error {
    case .exceededContextWindowSize:
        // Handle context limit exceeded
        break
    case .guardrailViolation:
        // Handle safety guardrail triggered
        break
    default:
        break
    }
}
```

## ベストプラクティス

- 必ず`isAvailable`で可用性を確認してからセッションを使用する
- Instructionsはプロンプトより優先される設計を活用する
- セッションを再利用して会話の文脈を維持する
- エラーハンドリングを適切に実装する

## 公式リファレンス

- [Foundation Models Documentation](https://developer.apple.com/documentation/FoundationModels)
- [Generating content and performing tasks](https://developer.apple.com/documentation/FoundationModels/generating-content-and-performing-tasks-with-foundation-models)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
```

**Step 2: テストを実行**

Run: `npm test`
Expected: PASS for foundation-models-basics

**Step 3: コミット**

```bash
git add skills/foundation-models-basics/SKILL.md
git commit -m "feat: add foundation-models-basics skill"
```

---

### Task 5: prompt-engineering スキル作成

**Files:**
- Create: `apple-intelligence-skills/skills/prompt-engineering/SKILL.md`

**Step 1: SKILL.mdを作成**

```markdown
---
name: prompt-engineering
description: "効果的なプロンプト設計とモデル動作の制御"
globs: "**/*.swift"
---

# プロンプトエンジニアリング

Apple公式ドキュメントに基づくFoundation Modelsのプロンプト設計ガイド

## 概要

Foundation Modelsでは、Instructionsとプロンプトを適切に設計することで、モデルの出力を制御できます。Instructionsはセッション全体の動作を定義し、プロンプトは個々のリクエストを表します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## Instructions vs Prompts

### Instructions（システム指示）

セッション全体の動作を定義。モデルはプロンプトよりInstructionsを優先します（セキュリティ強化のため）。

```swift
let session = LanguageModelSession(instructions: """
    You are a travel copywriter.
    Always respond in a friendly, enthusiastic tone.
    Keep responses under 100 words.
    """)
```

### Prompt（ユーザープロンプト）

個々のリクエストを表します。

```swift
let response = try await session.respond(to: "Describe Tokyo in spring")
```

## PromptBuilder

複雑なプロンプトを動的に構築できます。

```swift
import FoundationModels

let kidFriendly = true

let prompt = Prompt {
    "Generate a 3-day itinerary to the Grand Canyon."
    if kidFriendly {
        "The itinerary must be kid-friendly."
    }
}

let response = try await session.respond(to: prompt)
```

## GenerationOptions

### sampling

出力の決定性を制御します。

```swift
// Deterministic output (same input = same output)
let options = GenerationOptions(sampling: .greedy)
let response = try await session.respond(to: prompt, options: options)
```

### temperature

出力の多様性を制御します。低い値で安定した出力、高い値で創造的な出力になります。

```swift
// Lower temperature for more predictable output
let options = GenerationOptions(temperature: 0.5)
```

## 出力長の制御

自然言語で出力長を指示できます。

```swift
let session = LanguageModelSession(instructions: """
    Respond in three sentences or fewer.
    """)

// Or in the prompt
let response = try await session.respond(to: "Explain quantum computing in a few words")
```

## Xcode Playgroundsでのテスト

`#Playground`を使ってプロンプトをテストできます。

```swift
#Playground

import FoundationModels

let session = LanguageModelSession()
let response = try await session.respond(to: "Hello")
// Response appears in the canvas
```

## ベストプラクティス

- Instructionsは英語で記述するのが最も効果的
- 明確で具体的な指示を与える
- .greedyサンプリングで決定的な出力が必要な場合に使用
- プロンプトのテストにはXcode Playgroundsを活用

## 公式リファレンス

- [PromptBuilder Documentation](https://developer.apple.com/documentation/foundationmodels/promptbuilder)
- [GenerationOptions Documentation](https://developer.apple.com/documentation/foundationmodels/generationoptions)
- [WWDC25-248: Explore prompt design & safety](https://developer.apple.com/videos/play/wwdc2025/248/)
- [WWDC25-301: Deep dive into Foundation Models](https://developer.apple.com/videos/play/wwdc2025/301/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
```

**Step 2: テストを実行**

Run: `npm test`
Expected: PASS

**Step 3: コミット**

```bash
git add skills/prompt-engineering/SKILL.md
git commit -m "feat: add prompt-engineering skill"
```

---

### Task 6: guided-generation スキル作成

**Files:**
- Create: `apple-intelligence-skills/skills/guided-generation/SKILL.md`

**Step 1: SKILL.mdを作成**

```markdown
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

## ベストプラクティス

- プロパティは「先に生成されたものを後で参照できる」順序で宣言
- @Guideで明確な説明を提供
- ストリーミングでUXを向上
- 複雑すぎる構造は避ける（パフォーマンス影響）

## 公式リファレンス

- [Generable Protocol](https://developer.apple.com/documentation/foundationmodels/generable)
- [GenerationGuide](https://developer.apple.com/documentation/foundationmodels/generationguide)
- [Generating Swift data structures](https://developer.apple.com/documentation/foundationmodels/generating-swift-data-structures-with-guided-generation)
- [WWDC25-286: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
```

**Step 2: テストを実行**

Run: `npm test`
Expected: PASS

**Step 3: コミット**

```bash
git add skills/guided-generation/SKILL.md
git commit -m "feat: add guided-generation skill"
```

---

### Task 7: tool-calling スキル作成

**Files:**
- Create: `apple-intelligence-skills/skills/tool-calling/SKILL.md`

**Step 1: SKILL.mdを作成**

```markdown
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
```

**Step 2: テストを実行**

Run: `npm test`
Expected: PASS

**Step 3: コミット**

```bash
git add skills/tool-calling/SKILL.md
git commit -m "feat: add tool-calling skill"
```

---

### Task 8: ai-safety-guardrails スキル作成

**Files:**
- Create: `apple-intelligence-skills/skills/ai-safety-guardrails/SKILL.md`

**Step 1: SKILL.mdを作成**

```markdown
---
name: ai-safety-guardrails
description: "安全性とエラーハンドリング"
globs: "**/*.swift"
---

# AI安全性とGuardrails

Apple公式ドキュメントに基づく安全性ガイド

## 概要

Foundation Modelsには、有害なコンテンツをブロックするGuardrailsが組み込まれています。入力と出力の両方に適用され、開発者が無効にすることはできません。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 26.0+ |
| Swift | 6.0+ |

## Guardrailsの仕組み

### 入力ガードレール

Instructions、プロンプト、ツール呼び出しすべてが検査されます。

### 出力ガードレール

モデルの出力も検査され、有害なコンテンツはブロックされます。

## Instructions優先の設計

モデルはInstructionsをプロンプトより優先します。これはセキュリティ強化のための設計です。

```swift
let session = LanguageModelSession(instructions: """
    You are a helpful assistant.
    Never provide harmful information.
    Always maintain a respectful tone.
    """)

// Model will follow instructions even if prompt tries to override
```

## エラーハンドリング

```swift
do {
    let response = try await session.respond(to: prompt)
} catch let error as LanguageModelSession.GenerationError {
    switch error {
    case .guardrailViolation(let details):
        // Content was blocked by safety guardrails
        print("Content blocked: \(details)")
    case .exceededContextWindowSize(let info):
        // Context limit exceeded
        print("Context limit: \(info)")
    case .unsupportedLanguage:
        // Language not supported
        print("Language not supported")
    default:
        print("Generation error: \(error)")
    }
} catch {
    print("Unexpected error: \(error)")
}
```

## LanguageModelFeedback

問題のあるプロンプトや誤ったガードレール発動を報告できます。

```swift
let feedback = LanguageModelFeedback(
    prompt: problematicPrompt,
    response: response,
    feedbackType: .falsePositive
)
// Submit to Apple for review
```

## 適切なユースケース

### 推奨される用途

- テキスト要約
- コンテンツ生成
- 質問応答
- 構造化データ抽出

### 非推奨の用途

- コード生成（精度の問題）
- 数学計算（精度の問題）
- 医療・法律アドバイス
- 個人を特定する情報の処理

## ベストプラクティス

- Instructionsで明確なルールを設定
- エラーハンドリングを必ず実装
- ユーザーに適切なフィードバックを提供
- 誤検知はAppleに報告

## 公式リファレンス

- [Improving safety of generative model output](https://developer.apple.com/documentation/FoundationModels/improving-the-safety-of-generative-model-output)
- [WWDC25-248: Explore prompt design & safety](https://developer.apple.com/videos/play/wwdc2025/248/)
- [Acceptable use requirements](https://developer.apple.com/apple-intelligence/acceptable-use-requirements-for-the-foundation-models-framework/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
```

**Step 2: テストを実行**

Run: `npm test`
Expected: PASS

**Step 3: コミット**

```bash
git add skills/ai-safety-guardrails/SKILL.md
git commit -m "feat: add ai-safety-guardrails skill"
```

---

## Phase 3-4: 残りのスキル

### Task 9-18: 残り10スキルの作成

以下のスキルを同様の手順で作成します。各スキルは設計ドキュメントの「3. スキル詳細設計」に基づいて作成してください。

| Task | スキル名 | カテゴリ |
|------|---------|---------|
| 9 | performance-optimization | Foundation Models |
| 10 | multilingual-support | Production |
| 11 | writing-tools | Apple Intelligence |
| 12 | image-playground | Apple Intelligence |
| 13 | genmoji | Apple Intelligence |
| 14 | app-intents-siri | Apple Intelligence |
| 15 | natural-language | Intelligent Frameworks |
| 16 | speech-recognition | Intelligent Frameworks |
| 17 | ai-ux-guidelines | Production |
| 18 | README.md作成 | Documentation |

各タスクのステップ：
1. SKILL.mdを作成（設計ドキュメント参照）
2. `npm test`でテスト
3. git commit

---

## Phase 5: 最終検証

### Task 19: 最終テストとREADME作成

**Files:**
- Create: `apple-intelligence-skills/README.md`

**Step 1: README.mdを作成**

```markdown
# Apple Intelligence Skills for Claude Code

Apple公式ドキュメントに基づくApple Intelligence / Foundation Models開発スキル集

## 概要

このプラグインは、Claude CodeでApple Intelligenceを活用したiOSアプリを開発する際に、Apple公式のガイドラインに従った正確なコードを書くためのスキルを提供します。

## 含まれるスキル

### Foundation Models（LLMコア）

| スキル | 説明 |
|--------|------|
| `foundation-models-basics` | Foundation Modelsフレームワークの基本 |
| `prompt-engineering` | プロンプト設計とモデル制御 |
| `guided-generation` | @Generable/@Guideによる構造化出力 |
| `tool-calling` | Tool protocolによる外部機能統合 |
| `performance-optimization` | パフォーマンス分析と最適化 |

### Apple Intelligence Features

| スキル | 説明 |
|--------|------|
| `writing-tools` | Writing Tools統合 |
| `image-playground` | 画像生成機能 |
| `genmoji` | カスタム絵文字 |
| `app-intents-siri` | Siri・Apple Intelligence統合 |

### Intelligent Frameworks

| スキル | 説明 |
|--------|------|
| `natural-language` | 自然言語処理 |
| `speech-recognition` | 音声認識 |

### Production

| スキル | 説明 |
|--------|------|
| `multilingual-support` | 多言語対応 |
| `ai-safety-guardrails` | 安全性とエラーハンドリング |
| `ai-ux-guidelines` | 生成AI UX設計 |

## インストール

### GitHub経由（推奨）

```
/plugin marketplace add mitsu1032/apple-intelligence-skills
```

プラグインを有効化：

```
/plugin enable apple-intelligence-skills
```

## 情報源

すべてのスキルはApple公式ドキュメントに基づいています：

- [Foundation Models Documentation](https://developer.apple.com/documentation/FoundationModels)
- [Apple Intelligence](https://developer.apple.com/apple-intelligence/)
- [Human Interface Guidelines - Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai)

## テスト

```bash
npm install
npm test
```

## ライセンス

MIT
```

**Step 2: 全テストを実行**

Run: `npm test`
Expected: All tests PASS

**Step 3: 最終コミット**

```bash
git add README.md
git commit -m "docs: add README with skill documentation"
```

---

## 完了チェックリスト

- [ ] plugin.json作成
- [ ] package.json作成
- [ ] tsconfig.json作成
- [ ] テストフレームワーク作成
- [ ] 14スキルすべて作成
- [ ] 全テストパス
- [ ] README.md作成
- [ ] 全コミット完了
