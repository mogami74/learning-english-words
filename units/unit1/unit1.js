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
// Unit1のワードリストクラス
class Unit1WordList {
    constructor() {
        this.wordList = null;
        this.currentWordIndex = 0;
        this.loadWordList();
    }
    loadWordList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('./wordlist.json');
                this.wordList = yield response.json();
                if (this.wordList) {
                    console.log('Unit1 wordlist loaded:', this.wordList.metadata.title);
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
        const words = this.getWords();
        if (words.length === 0)
            return null;
        const randomIndex = Math.floor(Math.random() * words.length);
        this.currentWordIndex = randomIndex;
        return words[randomIndex];
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
window.unit1WordList = new Unit1WordList();
