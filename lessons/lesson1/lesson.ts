// レッスン用の型定義
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

// レッスンのワードリストクラス
class LessonWordList {
    private wordList: WordList | null = null;
    private currentWordIndex: number = 0;
    private lessonId: string;

    constructor(lessonId: string = 'lesson1') {
        this.lessonId = lessonId;
        this.loadWordList();
    }

    async loadWordList(): Promise<void> {
        try {
            const response = await fetch('./wordlist.json');
            this.wordList = await response.json();
            
            // localStorageから保存されたdifficultyデータを読み込み
            this.loadDifficultyFromStorage();
            
            if (this.wordList) {
                console.log(`${this.lessonId} wordlist loaded:`, this.wordList.metadata.title);
            }
        } catch (error) {
            console.error('Failed to load wordlist:', error);
        }
    }

    getWords(): Word[] {
        return this.wordList?.words || [];
    }

    getCurrentWord(): Word | null {
        const words = this.getWords();
        return words[this.currentWordIndex] || null;
    }

    nextWord(): Word | null {
        const words = this.getWords();
        this.currentWordIndex = (this.currentWordIndex + 1) % words.length;
        return this.getCurrentWord();
    }

    previousWord(): Word | null {
        const words = this.getWords();
        this.currentWordIndex = this.currentWordIndex === 0 
            ? words.length - 1 
            : this.currentWordIndex - 1;
        return this.getCurrentWord();
    }

    getRandomWord(): Word | null {
        const availableWords = this.getAvailableWords();
        if (availableWords.length === 0) return null;
        
        // difficultyに基づく重み付きランダム選択
        const weightedWords: Word[] = [];
        availableWords.forEach(word => {
            const weight = Math.max(1, word.difficulty); // 最低1回は含める
            for (let i = 0; i < weight; i++) {
                weightedWords.push(word);
            }
        });
        
        const randomIndex = Math.floor(Math.random() * weightedWords.length);
        const selectedWord = weightedWords[randomIndex];
        
        // currentWordIndexを更新
        const originalWords = this.getWords();
        this.currentWordIndex = originalWords.findIndex(w => w.id === selectedWord.id);
        
        return selectedWord;
    }

    // difficulty=-1以外の単語を取得
    getAvailableWords(): Word[] {
        return this.getWords().filter(word => word.difficulty !== -1);
    }

    // difficultyを1減らす（覚えた処理）
    async markWordAsLearned(wordId: number): Promise<void> {
        const words = this.getWords();
        const word = words.find(w => w.id === wordId);
        if (word) {
            word.difficulty = Math.max(-1, word.difficulty - 1);
            await this.saveWordListToFile();
        }
    }

    // 単語のdifficultyを変更
    async updateWordDifficulty(wordId: number, newDifficulty: number): Promise<void> {
        const words = this.getWords();
        const word = words.find(w => w.id === wordId);
        if (word) {
            word.difficulty = newDifficulty;
            await this.saveWordListToFile();
        }
    }

    // wordlist.jsonファイルに保存
    private async saveWordListToFile(): Promise<void> {
        if (!this.wordList) return;

        try {
            // localStorageにバックアップを保存
            this.saveDifficultyToStorage();
            
            // サーバーAPIを使用してJSONファイルを更新
            const response = await fetch(`http://localhost:3001/api/update-wordlist/${this.lessonId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordList: this.wordList
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Wordlist saved to file:', result.message);
            } else {
                console.error('Failed to save wordlist to file');
                // サーバーエラーの場合はlocalStorageのみ使用
            }
        } catch (error) {
            console.error('Error saving wordlist to file:', error);
            // ネットワークエラーの場合はlocalStorageのみ使用
        }
    }

    // localStorageにdifficultyデータを保存（バックアップ用）
    private saveDifficultyToStorage(): void {
        if (!this.wordList) return;
        
        const difficultyData: {[key: number]: number} = {};
        this.wordList.words.forEach(word => {
            difficultyData[word.id] = word.difficulty;
        });
        
        localStorage.setItem(`${this.lessonId}_difficulty`, JSON.stringify(difficultyData));
        localStorage.setItem(`${this.lessonId}_wordlist_backup`, JSON.stringify(this.wordList));
    }

    // localStorageからdifficultyデータを読み込み
    private loadDifficultyFromStorage(): void {
        if (!this.wordList) return;
        
        const savedData = localStorage.getItem(`${this.lessonId}_difficulty`);
        if (savedData) {
            try {
                const difficultyData: {[key: number]: number} = JSON.parse(savedData);
                this.wordList.words.forEach(word => {
                    if (difficultyData[word.id] !== undefined) {
                        word.difficulty = difficultyData[word.id];
                    }
                });
                console.log('Difficulty data loaded from localStorage');
            } catch (error) {
                console.error('Failed to load difficulty data from storage:', error);
            }
        }
    }

    getTotalWords(): number {
        return this.wordList?.metadata.totalWords || 0;
    }

    getCurrentIndex(): number {
        return this.currentWordIndex + 1;
    }

    resetToFirst(): void {
        this.currentWordIndex = 0;
    }
}

// グローバルインスタンス
const lessonWordListInstance = new LessonWordList('lesson1');
(window as any).lessonWordList = lessonWordListInstance;

// wordlist.htmlページでの自動初期化
if (typeof window !== 'undefined' && window.location.pathname.includes('wordlist.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // WordListViewerが利用可能になるまで待つ
        function initializeWordListViewer() {
            if (typeof (window as any).WordListViewer !== 'undefined') {
                const WordListViewer = (window as any).WordListViewer;
                
                // lessonWordListの読み込み完了を待つ
                function checkWordListReady() {
                    if (lessonWordListInstance.getWords().length > 0) {
                        console.log('Initializing WordListViewer...');
                        const wordListViewer = new WordListViewer('lesson1', lessonWordListInstance);
                        wordListViewer.init();
                    } else {
                        setTimeout(checkWordListReady, 200);
                    }
                }
                
                checkWordListReady();
            } else {
                setTimeout(initializeWordListViewer, 100);
            }
        }
        
        initializeWordListViewer();
    });
}
