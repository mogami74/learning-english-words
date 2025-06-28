const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS設定とJSONパーサーを有効化
app.use(cors());
app.use(express.json());

// 静的ファイルの提供
app.use(express.static('.'));

// wordlist.jsonを更新するAPIエンドポイント
app.post('/api/update-wordlist/:lesson', async (req, res) => {
    try {
        const { lesson } = req.params;
        const { wordList } = req.body;
        
        if (!wordList) {
            return res.status(400).json({ error: 'wordList is required' });
        }
        
        const filePath = path.join(__dirname, 'lessons', lesson, 'wordlist.json');
        
        // JSONファイルに書き込み
        await fs.writeFile(filePath, JSON.stringify(wordList, null, 2), 'utf8');
        
        console.log(`Updated wordlist for lesson ${lesson}`);
        res.json({ success: true, message: `Lesson ${lesson} wordlist updated successfully` });
        
    } catch (error) {
        console.error('Error updating wordlist:', error);
        res.status(500).json({ error: 'Failed to update wordlist' });
    }
});

// 現在のwordlist.jsonを取得するAPIエンドポイント
app.get('/api/wordlist/:lesson', async (req, res) => {
    try {
        const { lesson } = req.params;
        const filePath = path.join(__dirname, 'lessons', lesson, 'wordlist.json');
        
        const data = await fs.readFile(filePath, 'utf8');
        const wordList = JSON.parse(data);
        
        res.json(wordList);
        
    } catch (error) {
        console.error('Error reading wordlist:', error);
        res.status(500).json({ error: 'Failed to read wordlist' });
    }
});

app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました`);
    console.log(`http://localhost:${PORT} でアクセスできます`);
});
