const fs = require('fs');
const path = require('path');

// CSVファイルを読み込み、JSONに変換するスクリプト
function convertCsvToJson() {
    const csvPath = path.join(__dirname, '../20250627wordlist.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.trim().split('\n');
    const words = [];
    
    lines.forEach((line, index) => {
        if (line.trim() === '') return; // 空行をスキップ
        const parts = line.split(',');
        if (parts.length >= 2) {
            // CSVの行番号から正しいIDを抽出
            const match = parts[0].match(/^(\d+)\s*/);
            const id = match ? parseInt(match[1]) : words.length + 1;
            const japanese = parts[0].replace(/^\d+\s*/, ''); // 先頭の番号を削除
            const english = parts[1];
            
            // カテゴリを推定
            let category = "その他";
            if (japanese.includes("……") && (japanese.includes("する") || japanese.includes("だ") || japanese.includes("である"))) {
                category = "動詞";
            } else if (japanese.match(/[A-Z][a-z]+/)) {
                category = "国名";
            } else if (japanese.includes("私") || japanese.includes("私たち")) {
                category = "代名詞";
            } else if (japanese.includes("授業") || japanese.includes("学級")) {
                category = "名詞";
            } else if (japanese.includes("だから") || japanese.includes("しかし") || japanese.includes("について")) {
                category = "接続詞・前置詞";
            }
            
            // 難易度を推定（1-3）
            let difficulty = 1;
            if (japanese.includes("★3") || english.includes(" ")) {
                difficulty = 3;
            } else if (japanese.length > 5 || english.length > 6) {
                difficulty = 2;
            }
            
            words.push({
                id,
                japanese: japanese.replace("★3", "").trim(),
                english: english.trim(),
                category,
                difficulty
            });
        }
    });
    
    // メタデータ付きオブジェクトを作成
    const wordListData = {
        metadata: {
            title: "Unit 1: 基礎英単語100語",
            description: "中学校レベルの基礎英単語集",
            level: "beginner",
            unit: 1,
            totalWords: words.length,
            created: "2025-06-28",
            version: "2.0"
        },
        words: words
    };
    
    // JSONファイルを保存
    const outputPath = path.join(__dirname, '../units/unit1/wordlist.json');
    fs.writeFileSync(outputPath, JSON.stringify(wordListData, null, 2), 'utf-8');
    
    console.log(`✅ Created ${outputPath} with ${words.length} words`);
    
    // data/wordlist.jsonも作成（配列形式）
    const dataOutputPath = path.join(__dirname, '../data/wordlist.json');
    fs.writeFileSync(dataOutputPath, JSON.stringify(words, null, 2), 'utf-8');
    
    console.log(`✅ Created ${dataOutputPath} with ${words.length} words`);
}

convertCsvToJson();
