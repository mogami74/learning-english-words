// Unit1用の型定義
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

// Unit1のワードリストクラス
class Unit1WordList {
    private wordList: WordList | null = null;
    private currentWordIndex: number = 0;

    constructor() {
        this.loadWordList();
    }

    async loadWordList(): Promise<void> {
        try {
            const response = await fetch('./wordlist.json');
            this.wordList = await response.json();
            if (this.wordList) {
                console.log('Unit1 wordlist loaded:', this.wordList.metadata.title);
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
        const words = this.getWords();
        if (words.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * words.length);
        this.currentWordIndex = randomIndex;
        return words[randomIndex];
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
(window as any).unit1WordList = new Unit1WordList();
