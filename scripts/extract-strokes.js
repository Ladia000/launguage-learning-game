const https = require('https');
const fs = require('fs');

// data/words.json から必要な漢字を取得
const words = require('../data/words.json');
const targetChars = new Set(
  words.map(w => w.hanzi).join('').split('')
);
console.log('対象文字数:', targetChars.size);

// graphics.txt をストリームで読み込み、必要な行だけ抽出
const url = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt';
let buffer = '';
const results = [];

https.get(url, (res) => {
  res.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line);
        if (targetChars.has(data.character)) {
          results.push({
            character: data.character,
            strokes: data.strokes || [],
            medians: data.medians || [],
            strokeCount: (data.strokes || []).length
          });
          console.log('取得:', data.character, '(' + results.length + '/' + targetChars.size + ')');
        }
      } catch (e) {}
    }
  });
  res.on('end', () => {
    const outputPath = './data/strokes/stroke_data.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log('完了:', results.length + '文字のデータを保存しました');
  });
}).on('error', (e) => console.error('エラー:', e.message));
