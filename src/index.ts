// Unit1のワードリスト型定義
interface Word {
    id: number;
    japanese: string;
    english: string;
    category: string;
    difficulty: number;
}

interface WordList {
    metadata: {
        title: string;
        description: string;
        level: string;
        unit: number;
        totalWords: number;
        created: string;
        version: string;
    };
    words: Word[];
}

// ワードリスト管理クラス
class UnitManager {
    private async loadUnit1WordList(): Promise<WordList | null> {
        try {
            const response = await fetch('./wordlist.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const wordList: WordList = await response.json();
            return wordList;
        } catch (error) {
            console.error('Failed to load Unit1 wordlist:', error);
            return null;
        }
    }

    async updateUnit1Description(): Promise<void> {
        const wordList = await this.loadUnit1WordList();
        const descriptionElement = document.getElementById('unit1-description');
        
        if (descriptionElement) {
            if (wordList) {
                const wordCount = wordList.metadata.totalWords;
                const title = wordList.metadata.description;
                descriptionElement.textContent = `${title}（${wordCount}語）`;
            } else {
                descriptionElement.textContent = '基本動詞と表現（読み込みエラー）';
            }
        }
    }
}

// DOM読み込み完了後の処理
document.addEventListener('DOMContentLoaded', async () => {
    const unitManager = new UnitManager();
    
    // Unit1の語数を動的に更新
    await unitManager.updateUnit1Description();
    
    console.log('ワードリストの語数表示を更新しました');
});
