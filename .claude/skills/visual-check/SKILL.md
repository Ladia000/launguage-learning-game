---
name: visual-check
description: このプロジェクト(Expo Router / React Native Web)の画面をPlaywrightで実際に開き、スクリーンショットとconsoleエラーで見た目・挙動を検証する。tsc/jestでは検出できないUIの不具合（描画崩れ・イベント未発火・アニメーション未再生など）を修正した後、コミット前に必ず使う。
---

# visual-check: ブラウザ実機確認

tsc/jest は型・ロジックしか見ない。スクロール、タッチ/ポインター操作、アニメーション、フォント読み込み、GitHub Pagesのベースパス配下での表示など「実際に画面を開かないとわからない」不具合は、このSkillの手順で必ず目視確認してからコミットする。

## 0. 前提: Playwrightのセットアップ（scratchpadに用意する。プロジェクトの依存関係には追加しない）

```bash
cd "$SCRATCHPAD_DIR"   # 各セッションのscratchpadディレクトリ
npm init -y >/dev/null 2>&1
npm install playwright
npx playwright install chromium   # 初回のみ。iPhone Safari相当の検証をする場合は webkit も:
npx playwright install webkit
```

- `node_modules/playwright` を毎回グローバルnpxで解決しようとすると `Cannot find module 'playwright'` になることがある。上記のように **scratchpad内で `npm install playwright` を実行してから同じディレクトリで `node xxx.js` を実行する**のが確実。
- ブラウザバイナリ(chromium/webkit)は`~/AppData/Local/ms-playwright`等にキャッシュされるため、同一マシンなら2回目以降の`playwright install`は速い。

## 1. 開発サーバーの起動（dev環境で確認する場合）

```bash
cd <project root>
(npx expo start --web --clear > /tmp/expo-web.log 2>&1 &)
until curl -sf http://localhost:8081 >/dev/null 2>&1; do sleep 1; done
```

- ポートは既定で **8081**。前回のプロセスが残っていると `Port 8081 is being used by another process` で新しいサーバーが起動せず、古いバンドルを見続けてしまう（原因不明の500エラーや「直したはずのバグが直っていない」の典型パターン）。起動前に必ず以下でポートを解放する:
  ```bash
  for pid in $(powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue).OwningProcess" 2>/dev/null); do
    powershell -NoProfile -Command "Stop-Process -Id $pid -Force" 2>/dev/null
  done
  ```
- `@expo-google-fonts/*` 等を新規導入した直後は、Metroのキャッシュが古いままだと存在するはずのファイルが解決できず500エラーになることがある。**`--clear` 付きで起動する**ことでほぼ解消する。

## 2. 本番相当（GitHub Pages）で確認したい場合

デプロイ後の挙動をローカルで正確に再現したいとき（ベースパス `/launguage-learning-game` 配下での動作、静的exportでのみ起きる問題の切り分けなど）:

```bash
cd <project root>
rm -rf dist && npx expo export --platform web
mkdir -p /tmp/pages-root && rm -rf /tmp/pages-root/launguage-learning-game
cp -r dist /tmp/pages-root/launguage-learning-game
(npx --yes serve -l 5050 /tmp/pages-root > /tmp/serve.log 2>&1 &)
# → http://localhost:5050/launguage-learning-game/<route>/ で確認
```

実際にデプロイ済みのURL (`https://ladia000.github.io/launguage-learning-game/...`) に直接Playwrightでアクセスして確認してもよい（デプロイが完了していれば）。

## 3. Playwrightスクリプトの型（毎回これをコピーして書き換える）

```js
const { chromium } = require('playwright');
// iPhone実機相当で確認したい場合:
// const { webkit, devices } = require('playwright');
// const browser = await webkit.launch();
// const context = await browser.newContext({ ...devices['iPhone 13'] });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const msgs = [];
  page.on('console', (m) => msgs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => msgs.push(`[pageerror] ${e.stack || e.message}`));

  await page.goto('http://localhost:8081/<route>', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: __dirname + '/check-01.png' });

  // ここで実際の操作をする: タップ、ドラッグ、ボタン押下など
  // await page.locator('text=ボタン文言').first().click({ timeout: 5000 });
  // await page.waitForTimeout(1000);
  // await page.screenshot({ path: __dirname + '/check-02.png' });

  console.log('--- CONSOLE ---');
  msgs.forEach((m) => console.log(m));
  await browser.close();
})();
```

- `waitForTimeout` は使ってよいが、「読み込みが終わるまで待つ」場合は `waitUntil: 'networkidle'` や `locator(...).waitFor()` を優先する。
- クリックは `text=` セレクタでUI文言に対応させると、日本語UIのままテストできる（i18nキーの値を直接検索する）。
- 完了したら **Readツールでスクリーンショットを確認する**（コンソールログだけで判断しない。「見た目」の検証が目的）。

## 4. 確認すべき最低限の観点

- `page.on('pageerror')` / `console --errors` 相当でJSエラーが出ていないか
- 期待した要素が実際に画面に描画されているか（スクリーンショットで目視）
- ボタン押下・スクロール・ドラッグ等の操作が意図通り反映されるか
- （手書き・描画系の変更の場合）PCのマウス操作相当（chromium）と、iPhone Safari相当（webkit + `devices['iPhone 13']`）の両方で確認する
- 確認が終わったら開発サーバー・ポートを必ず解放する（次回の起動が失敗する原因になる）

## 5. 緊急時の省略

ユーザーが即座のpush/デプロイを急いでいる場合は、tsc/jestのみで確認を打ち切ってよい。ただしその場合は「視覚的な動作確認は未実施」であることをユーザーに明示する（CLAUDE.mdの「実機確認ルール」参照）。
