const fs = require('fs');
const path = require('path');

// wordlist.jsonファイルのパス
const filePath = path.join(__dirname, 'units/unit1/wordlist.json');

// ファイルを読み込み
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 各単語からcategoryプロパティを削除し、difficultyを1に設定
data.words.forEach(word => {
  delete word.category;
  word.difficulty = 1;
});

// ファイルに書き戻し（インデント付きで整形）
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log('wordlist.jsonの修正が完了しました');
console.log('- categoryプロパティを削除');
console.log('- すべてのdifficultyを1に設定');
