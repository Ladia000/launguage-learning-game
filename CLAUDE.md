# 中国語学習クイズアプリ — CLAUDE.md

## プロジェクト概要

中国語（簡体字）を学ぶモバイルクイズアプリ。iOS / Android 両対応。
ゲームジャンルは **クイズ形式**。HSK レベル・保存先・UI 言語をユーザーが選択できる。

---

## 技術スタック

| 項目 | 採用技術 |
|---|---|
| フレームワーク | React Native + Expo (SDK 51+) |
| 言語 | TypeScript（strict mode） |
| ナビゲーション | Expo Router (file-based routing) |
| 状態管理 | Zustand |
| 多言語対応 | i18next + react-i18next |
| データ永続化（端末） | AsyncStorage |
| データ永続化（クラウド） | Supabase（MVP外・後から追加） |
| 認証（クラウド時） | Supabase Auth（MVP外・後から追加） |
| 音声再生 | expo-av |
| TTS（発音） | expo-speech（端末ネイティブ TTS・無料・APIキー不要） |
| 単語データ | ローカル JSON（CC-CEDICT から抽出済み） |
| スタイリング | StyleSheet（NativeWind は使わない） |

---

## ディレクトリ構成

```
app/
  _layout.tsx                # ルートレイアウト（i18n 初期化・設定ロード）
  onboarding.tsx             # 初回起動のみ表示する設定ウィザード
  index.tsx                  # ホーム画面
  learn/index.tsx            # 学習モード（フラッシュカード）
  test/index.tsx             # テストモード（4択クイズ）
  review/index.tsx           # 復習モード（誤答一覧）
  review/[id].tsx            # 単語詳細
  retest/index.tsx           # 再テストモード
  result.tsx                 # 結果画面
  settings.tsx               # 設定画面（いつでも変更可）

components/
  FlashCard.tsx
  ChoiceButton.tsx
  AudioButton.tsx
  ProgressBar.tsx
  WrongWordCard.tsx
  MistakeCountBadge.tsx
  FilterBar.tsx
  HskLevelPicker.tsx         # HSK レベル複数選択 UI
  LanguagePicker.tsx         # UI 言語選択 UI

store/
  useSettingsStore.ts        # 言語・保存先・HSK レベル設定
  useWordStore.ts            # 単語データ・既習管理
  useTestStore.ts            # テスト状態管理
  useMistakeStore.ts         # 誤答記録管理

services/
  speech.ts                  # expo-speech ラッパー（言語設定・読み上げ制御）
  storage.ts                 # AsyncStorage ラッパー（MVP）/ 後から Supabase に拡張予定

locales/
  ja.json                    # 日本語 UI テキスト
  en.json                    # 英語 UI テキスト

data/
  words.json                 # 単語データ（HSK 1〜6 級）
  idioms.json                # 慣用句データ
```

---

## 設定仕様（`useSettingsStore`）

### 型定義

```typescript
interface Settings {
  language: 'ja' | 'en'
  selectedLevels: number[]      // 例: [1, 2] = HSK1・HSK2 を対象
  quizCount: 5 | 10 | 20       // 1回のテストの出題数
  isOnboardingDone: boolean
}
```

### 永続化

- キー: `@settings_v1`（AsyncStorage）
- アプリ起動時にロード → i18next の言語・Zustand の全 store に反映

---

## オンボーディング（`app/onboarding.tsx`）

初回起動時のみ表示する2ステップのウィザード。
`isOnboardingDone: true` になったら以降は表示しない。

### ステップ 1: UI 言語を選ぶ

```
タイトル（i18n 適用前なので日英両方表示）:
  "表示言語を選んでください / Choose your language"

選択肢:
  [🇯🇵 日本語]  [🇺🇸 English]

選択後すぐに i18next の言語を切り替える（プレビュー）
```

### ステップ 2: HSK レベルを選ぶ

```
タイトル: t('onboarding.level.title')
  ja: "学習する HSK レベルを選んでください"
  en: "Choose your HSK level(s)"

選択肢（複数選択可、トグルボタン）:
  [HSK 1]  [HSK 2]  [HSK 3]  [HSK 4]  [HSK 5]  [HSK 6]

各レベルの説明（小テキスト）:
  HSK 1: 基礎150語 / Basic 150 words
  HSK 2: 日常300語 / Daily 300 words
  HSK 3: 初中級600語 / Elementary 600 words
  ...（以下略）

最低1つ選択必須。「はじめる / Get Started」ボタンで完了。
```

---

## 設定画面（`app/settings.tsx`）

ホームの歯車アイコンからいつでも開ける。変更はリアルタイムに反映。

### 設定項目

| 設定 | コンポーネント | 変更時の処理 |
|---|---|---|
| UI 言語 | LanguagePicker（2択トグル） | `i18next.changeLanguage()` 即時実行 |
| HSK レベル | HskLevelPicker（複数選択） | `useWordStore` の対象単語リストを再計算 |
| 1回の出題数 | Picker（5 / 10 / 20） | 次のテストから適用 |
| 進捗をリセット | ボタン（確認ダイアログ） | AsyncStorage をクリア |

---

## 多言語対応（i18n）

### 実装方針

- `i18next` + `react-i18next` を使用
- 翻訳キーはすべて `locales/ja.json` と `locales/en.json` に定義
- コンポーネント内では直接文字列を書かず、必ず `t('key')` を使う
- 言語切り替えはアプリ再起動不要（リアルタイム）

### 翻訳ファイル構造

```json
// locales/ja.json（抜粋）
{
  "home": {
    "title": "中国語クイズ",
    "learn": "学習モード",
    "test": "テストモード",
    "review": "復習モード",
    "progress": "{{known}} / {{total}} 語学習済み",
    "mistakeBadge": "{{count}} 語復習待ち"
  },
  "test": {
    "question": "{{current}} / {{total}}",
    "correct": "正解！",
    "wrong": "不正解"
  },
  "onboarding": {
    "level": {
      "title": "学習する HSK レベルを選んでください"
    }
  },
  "settings": {
    "title": "設定",
    "language": "表示言語",
    "level": "HSK レベル",
    "quizCount": "出題数",
    "resetProgress": "進捗をリセット",
    "resetConfirm": "すべての進捗・誤答記録を削除します。この操作は元に戻せません。"
  }
}
```

```json
// locales/en.json（抜粋）
{
  "home": {
    "title": "Chinese Quiz",
    "learn": "Study Mode",
    "test": "Quiz Mode",
    "review": "Review Mode",
    "progress": "{{known}} / {{total}} words learned",
    "mistakeBadge": "{{count}} words to review"
  }
  // ... 以下 ja.json と同じキー構造
}
```

---

## ストレージ仕様（`services/storage.ts`）

MVP では AsyncStorage のみ使用。後から Supabase に拡張できるよう抽象レイヤーとして実装する。

```typescript
// storage.ts が公開するインターフェース
export const storage = {
  get: (key: string) => Promise<string | null>,
  set: (key: string, value: string) => Promise<void>,
  remove: (key: string) => Promise<void>,
  clear: () => Promise<void>,
}

// MVP の内部実装: AsyncStorage のみ
// 将来: Supabase を追加する際はこのファイルのみ変更すればよい
```

---

## HSK レベル別データ仕様

### `data/words.json`（level フィールドで絞り込む）

```json
[
  {
    "id": "hsk1_001",
    "type": "word",
    "hanzi": "你好",
    "pinyin": "nǐ hǎo",
    "meaning_ja": "こんにちは",
    "meaning_en": "Hello",
    "level": 1,
    "category_ja": "挨拶",
    "category_en": "Greetings",
    "example": "你好，我是田中。",
    "example_ja": "こんにちは、私は田中です。",
    "example_en": "Hello, I'm Tanaka."
  }
]
```

`meaning` と `category` は言語ごとに `meaning_ja` / `meaning_en` で持つ。
表示時は `useSettingsStore.language` を参照して切り替える。

### 単語数の目安（初期データ）

| レベル | 目標語数 | 初期収録数 |
|---|---|---|
| HSK 1 | 150語 | 50語 |
| HSK 2 | 300語 | 30語 |
| HSK 3 | 600語 | 20語 |
| HSK 4〜6 | 各数百語 | 各10語（後から追加） |

---

## 誤答データ仕様（`useMistakeStore`）

```typescript
interface MistakeRecord {
  wordId: string
  wordType: 'word' | 'idiom'
  hanzi: string
  pinyin: string
  meaning_ja: string
  meaning_en: string
  mistakeCount: number
  consecutiveCorrect: number
  isMastered: boolean           // 3回連続正解で true
  lastMistakeAt: string         // ISO 8601
  history: MistakeHistory[]     // 直近20件
}

interface MistakeHistory {
  date: string
  mode: 'learn' | 'test' | 'retest'
  wasCorrect: boolean
}

interface MistakeStore {
  records: Record<string, MistakeRecord>
  recordMistake: (word: Word | Idiom, mode: string) => void
  recordCorrect: (wordId: string, mode: string) => void
  getMistakes: (filter?: MistakeFilter) => MistakeRecord[]
  resetRecord: (wordId: string) => void
  resetAll: () => void
  unmastered: number            // ホーム画面バッジ用
}
```

---

## 発音（TTS）仕様

- `expo-speech` を使用（APIキー不要・完全無料）
- 言語コード: `zh-CN`（中国語簡体字）
- 端末のネイティブ TTS エンジンを使用（iOS: Apple TTS / Android: Google TTS）
- オフライン対応

```typescript
// services/speech.ts
import * as Speech from 'expo-speech';

export const speakChinese = (text: string) => {
  Speech.speak(text, {
    language: 'zh-CN',
    rate: 0.8,      // 学習者向けにやや遅め
    pitch: 1.0,
  });
};

export const stopSpeaking = () => {
  Speech.stop();
};
```

---

## 画面一覧と概要

| 画面 | パス | 概要 |
|---|---|---|
| オンボーディング | `/onboarding` | 初回起動時のみ。言語・保存先・HSK選択 |
| ホーム | `/` | モード選択・進捗サマリー・設定へのリンク |
| 学習モード | `/learn` | フラッシュカード。知ってる/知らない評価 |
| テストモード | `/test` | 4択クイズ。選択レベル・出題数に従う |
| 復習モード | `/review` | 誤答一覧。絞り込み・再テスト起動 |
| 単語詳細 | `/review/[id]` | 1単語の詳細・履歴・再テスト |
| 再テスト | `/retest` | 誤答のみ出題 |
| 結果 | `/result` | スコア・間違い一覧・次のアクション |
| 設定 | `/settings` | 言語・保存先・HSK・出題数の変更 |

---

## 実装しないもの（MVP外）

- ユーザープロフィール画像・ニックネーム
- 友達・ランキング機能
- Push 通知（学習リマインダー）
- 手書き練習
- アプリ内課金
- HSK 公式試験対策コンテンツ

---

## コーディング規約

- コンポーネントは関数型のみ
- props の型定義は必ず書く（`interface Props {...}`）
- `any` 型は使わない
- UI テキストは必ず `t('key')` 経由（直書き禁止）
- API キーは `app.config.ts` の `extra` 経由で注入（ハードコード禁止）
- スタイルは各ファイル末尾の `StyleSheet.create()` にまとめる

---

## 環境変数

MVP では外部APIを使用しないため `.env` ファイルは不要。
Supabase を追加する際に以下を `.env` に記載する（Git 管理外）。

```bash
# Supabase（MVP外・後から追加）
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 優先実装順序

1. `locales/ja.json` と `locales/en.json` の作成（全キー定義）
2. `useSettingsStore.ts` の実装（言語・HSK レベル・出題数）
3. `services/storage.ts` の実装（AsyncStorage ラッパー）
4. i18next のセットアップ（`_layout.tsx` で初期化）
5. オンボーディング画面（2ステップ: 言語・HSK レベル）
6. `data/words.json` 作成（HSK1: 50語、meaning_ja / meaning_en 両方）
7. `useMistakeStore.ts` の実装
8. `useWordStore.ts` の実装（selectedLevels に応じて単語を絞り込む）
9. ホーム画面
10. 学習モード（フラッシュカード）
11. テストモード（4択クイズ）
12. 結果画面
13. 復習モード・単語詳細・再テストモード
14. 設定画面
15. expo-speech TTS 音声機能（`services/speech.ts` + AudioButton への組み込み）
16. 動作確認・バグ修正
--- 以下は MVP 外（後から追加） ---
17. Supabase 連携（クラウド保存・認証）
