---
name: speech-recognition
description: "Speechフレームワークによる音声認識"
globs: "**/*.swift"
---

# Speech Recognition

Apple公式ドキュメントに基づく音声認識ガイド

## 概要

Speechフレームワークは、音声をテキストに変換する機能を提供します。従来のSFSpeechRecognizer（iOS 10+）に加え、iOS 26ではSpeechAnalyzerという新しいモジュラーAPIが追加されました。オンデバイス認識でプライバシーを保護しながら高精度な音声認識を実現します。

## 対応バージョン

| 項目 | バージョン |
|------|-----------|
| iOS | 10.0+（SFSpeechRecognizer） |
| iOS | 26.0+（SpeechAnalyzer） |
| Swift | 5.0+ |

## SFSpeechRecognizer（従来API）

### 権限リクエスト

```swift
import Speech

func requestAuthorization() {
    SFSpeechRecognizer.requestAuthorization { status in
        switch status {
        case .authorized:
            print("Speech recognition authorized")
        case .denied:
            print("User denied speech recognition")
        case .restricted:
            print("Speech recognition restricted")
        case .notDetermined:
            print("Speech recognition not yet authorized")
        @unknown default:
            break
        }
    }
}
```

### Info.plist設定

```xml
<key>NSSpeechRecognitionUsageDescription</key>
<string>音声認識で入力を補助します</string>
<key>NSMicrophoneUsageDescription</key>
<string>音声を録音するためにマイクを使用します</string>
```

### 基本的なリアルタイム認識

```swift
import Speech
import AVFoundation

class SpeechRecognitionManager {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "ja-JP"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    func startRecognition() throws {
        // Cancel previous task
        recognitionTask?.cancel()
        recognitionTask = nil

        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }

        // Enable on-device recognition if available
        if speechRecognizer?.supportsOnDeviceRecognition == true {
            recognitionRequest.requiresOnDeviceRecognition = true
        }

        // Start recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { result, error in
            if let result = result {
                let transcript = result.bestTranscription.formattedString
                print("Recognized: \(transcript)")
            }
            if error != nil || result?.isFinal == true {
                self.stopRecognition()
            }
        }

        // Configure audio input
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            self.recognitionRequest?.append(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()
    }

    func stopRecognition() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask = nil
    }
}
```

## オンデバイス認識

プライバシー保護とオフライン対応のためのオンデバイス認識設定です。

```swift
import Speech

// Check on-device recognition availability
let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
if recognizer?.supportsOnDeviceRecognition == true {
    print("On-device recognition is available")
}

// Force on-device recognition
let request = SFSpeechAudioBufferRecognitionRequest()
request.requiresOnDeviceRecognition = true
```

### オンデバイス認識対応言語（主要）

| 言語 | コード |
|------|--------|
| English | en-US, en-GB |
| Japanese | ja-JP |
| German | de-DE |
| French | fr-FR |
| Spanish | es-ES |
| Chinese | zh-CN |

## Language Model Customization（iOS 17+）

語彙カスタマイズで認識精度を向上させます。

```swift
import Speech

func createCustomLanguageModel() async throws {
    // Define custom vocabulary with context
    let customData = try SFCustomLanguageModelData(
        locale: Locale(identifier: "en-US"),
        identifier: "com.example.custommodel",
        version: "1.0"
    ) {
        // Add custom phrases with context
        SFCustomLanguageModelData.PhraseCount(
            phrase: "SwiftUI",
            count: 100
        )
        SFCustomLanguageModelData.PhraseCount(
            phrase: "Foundation Models",
            count: 100
        )
    }

    // Prepare the model
    let assetPath = FileManager.default.temporaryDirectory
        .appendingPathComponent("CustomLM")
    try await SFSpeechLanguageModel.prepareCustomLanguageModel(
        for: assetPath,
        clientIdentifier: "com.example.app",
        configuration: customData
    )
}

// Use custom model in recognition
func recognizeWithCustomModel() {
    let request = SFSpeechAudioBufferRecognitionRequest()
    request.customizedLanguageModel = .init(contentsOf: customModelURL)
}
```

## SpeechAnalyzer（iOS 26新API）

長時間・遠距離音声に最適化された新しいモジュラーAPIです。SpeechAnalyzerをベースに、モジュール（SpeechTranscriber、SpeechDetector）をアタッチして使用します。

### 基本的な使い方

```swift
import Speech

class ModernSpeechManager {
    private var analyzer: SpeechAnalyzer?

    func startAnalysis() async throws {
        // Create analyzer with audio source
        let audioSource = SpeechAnalyzer.AudioSource.microphone
        analyzer = try await SpeechAnalyzer(audioSource: audioSource)

        // Create and attach transcriber module
        let transcriber = SpeechTranscriber(locale: Locale(identifier: "en-US"))
        analyzer?.attach(transcriber)

        // Start analysis
        try await analyzer?.start()

        // Get transcription results
        for try await result in transcriber.results {
            print("Transcript: \(result.formattedString)")
        }
    }

    func stopAnalysis() async {
        await analyzer?.stop()
    }
}
```

### SpeechDetector（Voice Activity Detection）

音声区間を検出するモジュールです。

```swift
import Speech

func setupSpeechDetection() async throws {
    let audioSource = SpeechAnalyzer.AudioSource.microphone
    let analyzer = try await SpeechAnalyzer(audioSource: audioSource)

    // Attach speech detector
    let detector = SpeechDetector()
    analyzer.attach(detector)

    try await analyzer.start()

    // Monitor speech activity
    for try await activity in detector.activityUpdates {
        if activity.isSpeechDetected {
            print("Speech detected")
        }
    }
}
```

**注意**: SpeechDetectorはiOS 26ベータでは`SpeechModule`プロトコルに準拠していない場合があります。今後のアップデートで修正予定です。

### SpeechAnalyzerの利点

| 機能 | 説明 |
|------|------|
| 長時間録音 | 会議やインタビュー向け |
| 遠距離音声 | 部屋全体の音声をキャプチャ |
| 複数話者 | 話者分離対応 |
| モジュラー設計 | 必要な機能のみ使用可能 |

## ファイルからの認識

録音済みファイルを認識します。

```swift
import Speech

func recognizeAudioFile(url: URL) async throws -> String {
    let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    let request = SFSpeechURLRecognitionRequest(url: url)

    // Enable on-device if available
    if recognizer?.supportsOnDeviceRecognition == true {
        request.requiresOnDeviceRecognition = true
    }

    let result = try await recognizer?.recognitionTask(with: request)
    return result?.bestTranscription.formattedString ?? ""
}
```

## ベストプラクティス

- オンデバイス認識でプライバシーを保護
- Language Model Customizationでドメイン固有の精度を向上
- iOS 26ではSpeechAnalyzerを長時間録音に使用
- 適切なエラーハンドリングを実装
- 音声認識中はUIでフィードバックを提供

## 公式リファレンス

- [Speech Framework](https://developer.apple.com/documentation/speech)
- [SFSpeechRecognizer](https://developer.apple.com/documentation/speech/sfspeechrecognizer)
- [Bringing advanced speech-to-text](https://developer.apple.com/documentation/Speech/bringing-advanced-speech-to-text-capabilities-to-your-app)
- [WWDC19-256: Advances in Speech Recognition](https://developer.apple.com/videos/play/wwdc2019/256/)
- [WWDC23-10101: Customize on-device speech recognition](https://developer.apple.com/videos/play/wwdc2023/10101/)
- [WWDC25-277: Bring advanced speech-to-text with SpeechAnalyzer](https://developer.apple.com/videos/play/wwdc2025/277/)

## 変更履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0.0 | 2026-01-18 | 初版作成 |
