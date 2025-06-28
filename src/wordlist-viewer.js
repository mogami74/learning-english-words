"use strict";
// WordListViewer.ts - 汎用的な単語リスト表示クラス
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordListViewer = void 0;
class WordListViewer {
    constructor(unitNumber, wordListInstance) {
        this.allWords = [];
        this.filteredWords = [];
        // DOM要素
        this.loadingMessage = null;
        this.wordTable = null;
        this.wordTableBody = null;
        this.noResultsMessage = null;
        this.difficultyFilter = null;
        this.searchInput = null;
        this.backButton = null;
        // 統計要素
        this.totalWordsEl = null;
        this.learnedWordsEl = null;
        this.hiddenWordsEl = null;
        this.activeWordsEl = null;
        this.unitNumber = unitNumber;
        this.wordListInstance = wordListInstance;
        this.initElements();
    }
    // DOM要素を初期化
    initElements() {
        this.loadingMessage = document.getElementById('loadingMessage');
        this.wordTable = document.getElementById('wordTable');
        this.wordTableBody = document.getElementById('wordTableBody');
        this.noResultsMessage = document.getElementById('noResultsMessage');
        this.difficultyFilter = document.getElementById('difficultyFilter');
        this.searchInput = document.getElementById('searchInput');
        this.backButton = document.getElementById('backButton');
        // 統計要素
        this.totalWordsEl = document.getElementById('totalWords');
        this.learnedWordsEl = document.getElementById('learnedWords');
        this.hiddenWordsEl = document.getElementById('hiddenWords');
        this.activeWordsEl = document.getElementById('activeWords');
    }
    // 初期化
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // wordlistが読み込まれるまで待つ
            const checkWordList = () => {
                if (this.wordListInstance && this.wordListInstance.getWords().length > 0) {
                    this.loadWordList();
                    this.setupEventListeners();
                }
                else {
                    setTimeout(checkWordList, 100);
                }
            };
            checkWordList();
        });
    }
    // イベントリスナーを設定
    setupEventListeners() {
        if (this.difficultyFilter) {
            this.difficultyFilter.addEventListener('change', () => this.applyFilters());
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.applyFilters());
        }
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                window.location.href = '/index.html';
            });
        }
    }
    // 単語リストを読み込み
    loadWordList() {
        try {
            this.allWords = this.wordListInstance.getWords();
            this.updateStats();
            this.applyFilters();
            if (this.loadingMessage)
                this.loadingMessage.style.display = 'none';
            if (this.wordTable)
                this.wordTable.style.display = 'table';
        }
        catch (error) {
            console.error('Failed to load word list:', error);
            if (this.loadingMessage) {
                this.loadingMessage.textContent = '単語リストの読み込みに失敗しました。';
            }
        }
    }
    // 統計情報を更新
    updateStats() {
        const total = this.allWords.length;
        const hidden = this.allWords.filter(word => word.difficulty === -1).length;
        const learned = this.allWords.filter(word => word.difficulty === 0).length;
        const active = total - hidden - learned;
        if (this.totalWordsEl)
            this.totalWordsEl.textContent = total.toString();
        if (this.learnedWordsEl)
            this.learnedWordsEl.textContent = learned.toString();
        if (this.hiddenWordsEl)
            this.hiddenWordsEl.textContent = hidden.toString();
        if (this.activeWordsEl)
            this.activeWordsEl.textContent = active.toString();
    }
    // フィルターと検索を適用
    applyFilters() {
        var _a, _b;
        const difficultyValue = ((_a = this.difficultyFilter) === null || _a === void 0 ? void 0 : _a.value) || 'all';
        const searchValue = ((_b = this.searchInput) === null || _b === void 0 ? void 0 : _b.value.toLowerCase().trim()) || '';
        this.filteredWords = this.allWords.filter(word => {
            // 難易度フィルター
            let difficultyMatch = true;
            switch (difficultyValue) {
                case 'high':
                    difficultyMatch = word.difficulty >= 3;
                    break;
                case 'medium':
                    difficultyMatch = word.difficulty >= 1 && word.difficulty <= 2;
                    break;
                case 'low':
                    difficultyMatch = word.difficulty === 0;
                    break;
                case 'hidden':
                    difficultyMatch = word.difficulty === -1;
                    break;
                default: // 'all'
                    difficultyMatch = true;
            }
            // 検索フィルター
            let searchMatch = true;
            if (searchValue) {
                searchMatch = word.japanese.toLowerCase().includes(searchValue) ||
                    word.english.toLowerCase().includes(searchValue);
            }
            return difficultyMatch && searchMatch;
        });
        this.renderTable();
    }
    // テーブルを描画
    renderTable() {
        if (!this.wordTableBody)
            return;
        this.wordTableBody.innerHTML = '';
        if (this.filteredWords.length === 0) {
            if (this.wordTable)
                this.wordTable.style.display = 'none';
            if (this.noResultsMessage)
                this.noResultsMessage.style.display = 'block';
            return;
        }
        if (this.wordTable)
            this.wordTable.style.display = 'table';
        if (this.noResultsMessage)
            this.noResultsMessage.style.display = 'none';
        this.filteredWords.forEach(word => {
            const row = document.createElement('tr');
            const difficultyBadge = this.getDifficultyBadge(word.difficulty);
            const statusText = this.getStatusText(word.difficulty);
            const difficultyControls = this.getDifficultyControls(word);
            row.innerHTML = `
                <td>${word.id}</td>
                <td>${word.japanese}</td>
                <td>${word.english}</td>
                <td>${difficultyBadge}</td>
                <td>${statusText}</td>
                <td>${difficultyControls}</td>
            `;
            this.wordTableBody.appendChild(row);
            // イベントリスナーを追加
            this.setupDifficultyControls(row, word);
        });
    }
    // difficulty調整コントロールのHTMLを生成
    getDifficultyControls(word) {
        const canDecrease = word.difficulty > -1;
        const canIncrease = word.difficulty < 10; // 最大値を10に設定
        return `
            <div class="difficulty-controls">
                <button class="difficulty-btn decrease" data-word-id="${word.id}" ${!canDecrease ? 'disabled' : ''}>
                    −
                </button>
                <span class="difficulty-value">${word.difficulty}</span>
                <button class="difficulty-btn increase" data-word-id="${word.id}" ${!canIncrease ? 'disabled' : ''}>
                    ＋
                </button>
            </div>
        `;
    }
    // difficulty調整ボタンのイベントリスナーを設定
    setupDifficultyControls(row, word) {
        const decreaseBtn = row.querySelector('.difficulty-btn.decrease');
        const increaseBtn = row.querySelector('.difficulty-btn.increase');
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                yield this.changeDifficulty(word.id, -1);
            }));
        }
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                yield this.changeDifficulty(word.id, 1);
            }));
        }
    }
    // difficultyを変更
    changeDifficulty(wordId, change) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const word = this.allWords.find(w => w.id === wordId);
                if (!word)
                    return;
                const newDifficulty = Math.max(-1, Math.min(10, word.difficulty + change));
                if (newDifficulty === word.difficulty)
                    return; // 変更なしの場合は何もしない
                // wordListInstanceを通じてdifficultyを更新
                if (this.wordListInstance && typeof this.wordListInstance.updateWordDifficulty === 'function') {
                    yield this.wordListInstance.updateWordDifficulty(wordId, newDifficulty);
                    // UIを更新
                    this.refresh();
                    console.log(`Word ${wordId} difficulty changed to ${newDifficulty}`);
                }
            }
            catch (error) {
                console.error('Failed to change difficulty:', error);
            }
        });
    }
    // 難易度バッジを取得
    getDifficultyBadge(difficulty) {
        let className = '';
        if (difficulty === -1) {
            className = 'difficulty-hidden';
        }
        else if (difficulty === 0) {
            className = 'difficulty-low';
        }
        else if (difficulty >= 1 && difficulty <= 2) {
            className = 'difficulty-medium';
        }
        else if (difficulty >= 3) {
            className = 'difficulty-high';
        }
        return `<span class="difficulty-badge ${className}">${difficulty}</span>`;
    }
    // ステータステキストを取得
    getStatusText(difficulty) {
        if (difficulty === -1) {
            return '非表示';
        }
        else if (difficulty === 0) {
            return '学習完了';
        }
        else {
            return '学習中';
        }
    }
    // データの再読み込み（difficulty変更後等）
    refresh() {
        this.allWords = this.wordListInstance.getWords();
        this.updateStats();
        this.applyFilters();
    }
}
exports.WordListViewer = WordListViewer;
