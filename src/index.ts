// レッスンのワードリスト型定義
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
        lessonId: string;
        totalWords: number;
        created: string;
        version: string;
    };
    words: Word[];
}

// ワードリスト管理クラス
class LessonManager {
    private async loadLessonWordList(lessonId: string): Promise<WordList | null> {
        try {
            // 現在はlesson1のwordlist.jsonのみ対応
            let wordlistPath = './wordlist.json';
            
            const response = await fetch(wordlistPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const wordList: WordList = await response.json();
            return wordList;
        } catch (error) {
            console.error(`Failed to load ${lessonId} wordlist:`, error);
            return null;
        }
    }

    async updateLessonDescription(lessonId: string, elementId: string): Promise<void> {
        const wordList = await this.loadLessonWordList(lessonId);
        const descriptionElement = document.getElementById(elementId);
        
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
    const lessonManager = new LessonManager();
    
    // レッスン1の語数を動的に更新
    await lessonManager.updateLessonDescription('lesson1', 'lesson1-description');
    
    console.log('ワードリストの語数表示を更新しました');
});
