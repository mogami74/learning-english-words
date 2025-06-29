// レッスンのワードリスト型定義
interface Word {
    id: number;
    japanese: string;
    english: string;
    category: string;
    difficulty: number;
    wordCount: number; // 英語回答の語数
}

interface WordList {
    metadata: {
        title: string;
        description: string;
        shortDescription?: string;
        category?: string;
        level: string;
        lessonId: string;
        totalWords: number;
        created: string;
        version: string;
        displayInfo?: {
            cardTitle?: string;
            cardDescription?: string;
            cardSubtitle?: string;
        };
    };
    words: Word[];
}

// ワードリスト管理クラス
class LessonManager {
    private async loadLessonWordList(lessonId: string): Promise<WordList | null> {
        try {
            // 現在はlesson1のwordlist.jsonのみ対応
            let wordlistPath = './wordlist.json';
            
            console.log(`Loading wordlist from: ${wordlistPath}`);
            const response = await fetch(wordlistPath);
            console.log(`Response status: ${response.status}, ok: ${response.ok}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const wordList: WordList = await response.json();
            console.log(`Loaded wordlist:`, wordList.metadata);
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
                
                // 表示情報の優先順位: displayInfo.cardDescription > description > shortDescription
                let displayText = wordList.metadata.displayInfo?.cardDescription 
                                || wordList.metadata.description 
                                || wordList.metadata.shortDescription 
                                || 'レッスン内容';
                
                descriptionElement.textContent = `${displayText}（${wordCount}語）`;
                
                console.log(`Updated lesson description: ${displayText}（${wordCount}語）`);
            } else {
                descriptionElement.textContent = 'レッスン内容（読み込みエラー）';
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
