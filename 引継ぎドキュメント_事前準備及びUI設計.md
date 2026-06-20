# 引継ぎドキュメント — 中国語学習クイズアプリ開発

## 開発フロー

UI設計 → **概要設計（次のステップ）** → 実装 → テスト

各工程の前に必ず確認を行うこと。

---

## プロジェクト概要

中国語（簡体字）を学ぶモバイルクイズアプリ。iOS / Android 両対応。
ゲームジャンルは **クイズ形式**。

---

## 技術スタック（確定済み）

| 項目 | 採用技術 |
|---|---|
| フレームワーク | React Native + Expo (SDK 51+) |
| 言語 | TypeScript（strict mode） |
| ナビゲーション | Expo Router (file-based routing) |
| 状態管理 | Zustand |
| 多言語対応 | i18next + react-i18next |
| データ永続化 | AsyncStorage（端末内のみ・MVP） |
| データ永続化（将来） | Supabase（MVP外・後から追加） |
| 音声TTS | expo-speech（無料・APIキー不要） |
| 単語データ | ローカル JSON（CC-CEDICT から抽出） |
| スタイリング | StyleSheet（NativeWind は使わない） |

---

## 環境構築（完了済み）

- OS: Windows
- Node.js: インストール済み
- Claude Code: インストール済み（Pro プラン）
- プロジェクトパス: `C:\Users\ladia\Documents\claude works\chinese-Learning-game\chinese-learning-game`
- TypeScript 設定: 完了
- CLAUDE.md: プロジェクトルートに配置済み
- .env ファイル: MVP では不要のため削除済み

---

## 機能一覧（確定済み）

### 画面構成

| 画面 | パス | 概要 |
|---|---|---|
| オンボーディング① | `/onboarding` | 言語選択（日本語 / English） |
| オンボーディング② | `/onboarding` | HSKレベル選択（複数選択可・1〜6級） |
| ホーム | `/` | モード選択・進捗サマリー・復習待ち数バッジ |
| 学習モード | `/learn` | フラッシュカード（表面: 漢字 / 裏面: ピンイン+意味+例文） |
| テストモード | `/test` | 4択クイズ・正誤フィードバック付き |
| 復習モード | `/review` | 誤答一覧・絞り込み・再テスト起動 |
| 単語詳細 | `/review/[id]` | 1単語の詳細・履歴 |
| 再テストモード | `/retest` | 誤答のみ出題 |
| 結果画面 | `/result` | スコア・間違い一覧・次のアクション |
| 設定画面 | `/settings` | 言語・HSKレベル・出題数の変更 |

---

## UI設計（確定済み）

### デザイン仕様

- メインカラー: パープル（#534AB7）
- 正解カラー: グリーン（#1D9E75）
- 不正解カラー: レッド（#E24B4A）
- 金バッジカラー: アンバー（#EF9F27 / #BA7517）
- 角丸: カード 16px、ボタン 12px、バッジ 20px

### 確定済み UI 要素

**オンボーディング①（言語選択）**
- 2択トグル（🇯🇵 日本語 / 🇺🇸 English）
- 選択後すぐに i18next 切り替え（プレビュー）

**オンボーディング②（HSKレベル選択）**
- 2×3グリッド（HSK1〜6）
- 複数選択可・最低1つ必須

**ホーム画面**
- 学習済み語数 / 復習待ち数のサマリー
- 3つのモードカード（学習・テスト・復習）
- 復習モードカードに未習得誤答数バッジ（赤）

**学習モード**
- カード表面: 漢字大表示 + 発音ボタン + タップで裏面へ
- カード裏面: 漢字 + ピンイン（赤）+ 意味 + 例文
- 「知ってる / 知らない」ボタン
- 「知らない」→ 誤答記録 + 後で再出題

**テストモード**
- 漢字 + ピンイン表示（常時）
- 4択ボタン（2×2グリッド）
- 正解時: 緑帯「正解！すばらしい！／その調子！どんどん上手になってます！」★NEW
- 不正解時: 緑帯「💪 惜しかった！大丈夫です／正解は〇〇 — 復習モードで練習しよう！」★NEW
- 0.8秒後に次の問題へ自動遷移

**結果画面（通常）**
- スコアリング（丸グラフ）
- 評価メッセージ（スコアに応じて変化）
- 間違い一覧
- 「間違いだけ再テスト」「ホームへ戻る」ボタン

**結果画面（満点 10/10）** ★NEW
- 金バッジ（★ アニメーション付き・ぷるぷる動く）
- 「金バッジ獲得！」ラベル
- 「満点達成！！／完璧です！あなたは天才！」
- 「全問正解 10/10 — 正解率100%」
- 「次のチャレンジ: HSK 2 に挑戦しよう！」

**復習モード**
- 誤答カード一覧（スクロール）
- 絞り込みバー（単語 / 慣用句）
- 間違い回数バッジ（赤: 3回以上 / 橙: 2回 / 緑: 1回）
- 「すべての誤答で再テスト」ボタン

**設定画面**
- 表示言語（日本語 / English）
- HSKレベル（複数選択）
- 1回の出題数（5 / 10 / 20問）
- 進捗をリセット（確認ダイアログあり）

---

## データ仕様（確定済み）

### words.json

```json
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
```

### idioms.json

```json
{
  "id": "idiom_001",
  "type": "idiom",
  "hanzi": "一石二鸟",
  "pinyin": "yī shí èr niǎo",
  "meaning_ja": "一石二鳥",
  "meaning_en": "Kill two birds with one stone",
  "explanation": "一つの行動で二つの利益を得ること",
  "level": 3,
  "category": "慣用句"
}
```

### 誤答レコード（MistakeRecord）

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
  isMastered: boolean        // 3回連続正解で true
  lastMistakeAt: string      // ISO 8601
  history: MistakeHistory[]  // 直近20件
}
```

---

## 優先実装順序（確定済み）

1. `locales/ja.json` と `locales/en.json` の作成（全キー定義）
2. `useSettingsStore.ts` の実装（言語・HSKレベル・出題数）
3. `services/storage.ts` の実装（AsyncStorage ラッパー）
4. i18next のセットアップ（`_layout.tsx` で初期化）
5. オンボーディング画面（2ステップ: 言語・HSKレベル）
6. `data/words.json` 作成（HSK1: 50語、meaning_ja / meaning_en 両方）
7. `useMistakeStore.ts` の実装
8. `useWordStore.ts` の実装
9. ホーム画面
10. 学習モード（フラッシュカード）
11. テストモード（4択クイズ・正誤フィードバック）
12. 結果画面（通常 + 満点金バッジ）
13. 復習モード・単語詳細・再テストモード
14. 設定画面
15. expo-speech TTS 音声機能
16. 動作確認・バグ修正
--- MVP外（後から追加） ---
17. Supabase 連携（クラウド保存・認証）

---

## MVP外（将来対応）

- Supabase クラウド保存・認証
- HSK2級以上の単語追加
- Push通知
- 手書き練習
- アプリ内課金

---

## 次のステップ

**概要設計** を行う。
UI設計は確定済みのため、以下を設計する:

1. 画面遷移フロー（詳細）
2. 各 Store の詳細設計（state / actions）
3. コンポーネント設計（props / 責務）
4. データフロー設計（誤答記録の流れ）
5. AsyncStorage キー設計

概要設計の確認後、実装フェーズへ進む。
