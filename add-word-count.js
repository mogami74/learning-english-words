const fs = require('fs');
const path = require('path');

// 語数を計算する関数
function countWords(englishText) {
    // 句読点を除去して、空白で分割
    const cleanText = englishText
        .replace(/[.,!?]/g, '') // 句読点を除去
        .trim();
    
    // 空白で分割して語数をカウント
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

// レッスンディレクトリを処理する関数
function processLessonDirectory(lessonPath) {
    const wordlistPath = path.join(lessonPath, 'wordlist.json');
    
    if (!fs.existsSync(wordlistPath)) {
        console.log(`⚠️ ${wordlistPath} が見つかりません`);
        return;
    }

    const wordlist = JSON.parse(fs.readFileSync(wordlistPath, 'utf8'));
    
    if (!wordlist.words || wordlist.words.length === 0) {
        console.log(`⚠️ ${lessonPath} に単語データがありません`);
        return;
    }

    console.log(`\n📚 処理中: ${lessonPath}`);
    
    // 各単語にwordCountプロパティを追加
    wordlist.words.forEach(word => {
        word.wordCount = countWords(word.english);
        console.log(`  ID ${word.id}: "${word.english}" → ${word.wordCount}語`);
    });

    // 更新されたwordlist.jsonを保存
    fs.writeFileSync(wordlistPath, JSON.stringify(wordlist, null, 2), 'utf8');

    console.log(`✅ ${lessonPath}/wordlist.json を更新しました`);
    console.log(`📊 処理した単語数: ${wordlist.words.length}語`);

    // 語数別の統計を表示
    const wordCountStats = {};
    wordlist.words.forEach(word => {
        const count = word.wordCount;
        wordCountStats[count] = (wordCountStats[count] || 0) + 1;
    });

    console.log('📈 語数別統計:');
    Object.keys(wordCountStats).sort((a, b) => parseInt(a) - parseInt(b)).forEach(count => {
        console.log(`  ${count}語: ${wordCountStats[count]}個`);
    });
}

// lessonsディレクトリ内の全レッスンを処理
const lessonsDir = path.join(__dirname, 'lessons');
const lessonDirs = fs.readdirSync(lessonsDir).filter(item => {
    const itemPath = path.join(lessonsDir, item);
    return fs.statSync(itemPath).isDirectory();
});

console.log('🚀 全レッスンのwordlist.jsonにwordCountプロパティを追加します...\n');

lessonDirs.forEach(lessonDir => {
    const lessonPath = path.join(lessonsDir, lessonDir);
    processLessonDirectory(lessonPath);
});

console.log('\n🎉 全レッスンの処理が完了しました！');
