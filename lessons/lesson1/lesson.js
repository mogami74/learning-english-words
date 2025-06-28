"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// レッスンのワードリストクラス
class LessonWordList {
    constructor(lessonId = 'lesson1') {
        this.wordList = null;
        this.currentWordIndex = 0;
        this.lessonId = lessonId;
        this.loadWordList();
    }
    loadWordList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('./wordlist.json');
                this.wordList = yield response.json();
                // localStorageから保存されたdifficultyデータを読み込み
                this.loadDifficultyFromStorage();
                if (this.wordList) {
                    console.log(`${this.lessonId} wordlist loaded:`, this.wordList.metadata.title);
                }
            }
            catch (error) {
                console.error('Failed to load wordlist:', error);
            }
        });
    }
    getWords() {
        var _a;
        return ((_a = this.wordList) === null || _a === void 0 ? void 0 : _a.words) || [];
    }
    getCurrentWord() {
        const words = this.getWords();
        return words[this.currentWordIndex] || null;
    }
    nextWord() {
        const words = this.getWords();
        this.currentWordIndex = (this.currentWordIndex + 1) % words.length;
        return this.getCurrentWord();
    }
    previousWord() {
        const words = this.getWords();
        this.currentWordIndex = this.currentWordIndex === 0
            ? words.length - 1
            : this.currentWordIndex - 1;
        return this.getCurrentWord();
    }
    getRandomWord() {
        const availableWords = this.getAvailableWords();
        if (availableWords.length === 0)
            return null;
        // difficultyに基づく重み付きランダム選択
        const weightedWords = [];
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
    getAvailableWords() {
        return this.getWords().filter(word => word.difficulty !== -1);
    }
    // difficultyを1減らす（覚えた処理）
    markWordAsLearned(wordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const words = this.getWords();
            const word = words.find(w => w.id === wordId);
            if (word) {
                word.difficulty = Math.max(-1, word.difficulty - 1);
                yield this.saveWordListToFile();
            }
        });
    }
    // 単語のdifficultyを変更
    updateWordDifficulty(wordId, newDifficulty) {
        return __awaiter(this, void 0, void 0, function* () {
            const words = this.getWords();
            const word = words.find(w => w.id === wordId);
            if (word) {
                word.difficulty = newDifficulty;
                yield this.saveWordListToFile();
            }
        });
    }
    // wordlist.jsonファイルに保存
    saveWordListToFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wordList)
                return;
            try {
                // localStorageにバックアップを保存
                this.saveDifficultyToStorage();
                // サーバーAPIを使用してJSONファイルを更新
                const response = yield fetch(`http://localhost:3001/api/update-wordlist/${this.lessonId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wordList: this.wordList
                    })
                });
                if (response.ok) {
                    const result = yield response.json();
                    console.log('Wordlist saved to file:', result.message);
                }
                else {
                    console.error('Failed to save wordlist to file');
                    // サーバーエラーの場合はlocalStorageのみ使用
                }
            }
            catch (error) {
                console.error('Error saving wordlist to file:', error);
                // ネットワークエラーの場合はlocalStorageのみ使用
            }
        });
    }
    // localStorageにdifficultyデータを保存（バックアップ用）
    saveDifficultyToStorage() {
        if (!this.wordList)
            return;
        const difficultyData = {};
        this.wordList.words.forEach(word => {
            difficultyData[word.id] = word.difficulty;
        });
        localStorage.setItem(`${this.lessonId}_difficulty`, JSON.stringify(difficultyData));
        localStorage.setItem(`${this.lessonId}_wordlist_backup`, JSON.stringify(this.wordList));
    }
    // localStorageからdifficultyデータを読み込み
    loadDifficultyFromStorage() {
        if (!this.wordList)
            return;
        const savedData = localStorage.getItem(`${this.lessonId}_difficulty`);
        if (savedData) {
            try {
                const difficultyData = JSON.parse(savedData);
                this.wordList.words.forEach(word => {
                    if (difficultyData[word.id] !== undefined) {
                        word.difficulty = difficultyData[word.id];
                    }
                });
                console.log('Difficulty data loaded from localStorage');
            }
            catch (error) {
                console.error('Failed to load difficulty data from storage:', error);
            }
        }
    }
    getTotalWords() {
        var _a;
        return ((_a = this.wordList) === null || _a === void 0 ? void 0 : _a.metadata.totalWords) || 0;
    }
    getCurrentIndex() {
        return this.currentWordIndex + 1;
    }
    resetToFirst() {
        this.currentWordIndex = 0;
    }
}
// グローバルインスタンス
const lessonWordListInstance = new LessonWordList('lesson1');
window.lessonWordList = lessonWordListInstance;
// wordlist.htmlページでの自動初期化
if (typeof window !== 'undefined' && window.location.pathname.includes('wordlist.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // WordListViewerが利用可能になるまで待つ
        function initializeWordListViewer() {
            if (typeof window.WordListViewer !== 'undefined') {
                const WordListViewer = window.WordListViewer;
                // lessonWordListの読み込み完了を待つ
                function checkWordListReady() {
                    if (lessonWordListInstance.getWords().length > 0) {
                        console.log('Initializing WordListViewer...');
                        const wordListViewer = new WordListViewer('lesson1', lessonWordListInstance);
                        wordListViewer.init();
                    }
                    else {
                        setTimeout(checkWordListReady, 200);
                    }
                }
                checkWordListReady();
            }
            else {
                setTimeout(initializeWordListViewer, 100);
            }
        }
        initializeWordListViewer();
    });
}
