// WordListViewer.ts - 汎用的な単語リスト表示クラス

interface WordListInstance {
    getWords(): any[];
}

export class WordListViewer {
    private unitNumber: number;
    private wordListInstance: WordListInstance;
    private allWords: any[] = [];
    private filteredWords: any[] = [];
    
    // DOM要素
    private loadingMessage: HTMLElement | null = null;
    private wordTable: HTMLElement | null = null;
    private wordTableBody: HTMLElement | null = null;
    private noResultsMessage: HTMLElement | null = null;
    private difficultyFilter: HTMLSelectElement | null = null;
    private searchInput: HTMLInputElement | null = null;
    private backButton: HTMLElement | null = null;
    private resetAllButton: HTMLElement | null = null;
    
    // 統計要素
    private totalWordsEl: HTMLElement | null = null;
    private learnedWordsEl: HTMLElement | null = null;
    private hiddenWordsEl: HTMLElement | null = null;
    private activeWordsEl: HTMLElement | null = null;

    constructor(unitNumber: number, wordListInstance: WordListInstance) {
        this.unitNumber = unitNumber;
        this.wordListInstance = wordListInstance;
        this.initElements();
    }

    // DOM要素を初期化
    private initElements(): void {
        this.loadingMessage = document.getElementById('loadingMessage');
        this.wordTable = document.getElementById('wordTable');
        this.wordTableBody = document.getElementById('wordTableBody');
        this.noResultsMessage = document.getElementById('noResultsMessage');
        this.difficultyFilter = document.getElementById('difficultyFilter') as HTMLSelectElement;
        this.searchInput = document.getElementById('searchInput') as HTMLInputElement;
        this.backButton = document.getElementById('backButton');
        this.resetAllButton = document.getElementById('resetAllButton');
        
        // 統計要素
        this.totalWordsEl = document.getElementById('totalWords');
        this.learnedWordsEl = document.getElementById('learnedWords');
        this.hiddenWordsEl = document.getElementById('hiddenWords');
        this.activeWordsEl = document.getElementById('activeWords');
    }

    // 初期化
    async init(): Promise<void> {
        // wordlistが読み込まれるまで待つ
        const checkWordList = () => {
            if (this.wordListInstance && this.wordListInstance.getWords().length > 0) {
                this.loadWordList();
                this.setupEventListeners();
            } else {
                setTimeout(checkWordList, 100);
            }
        };
        checkWordList();
    }

    // イベントリスナーを設定
    private setupEventListeners(): void {
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
        
        if (this.resetAllButton) {
            this.resetAllButton.addEventListener('click', () => {
                this.showResetAllConfirmation();
            });
        }
    }

    // 単語リストを読み込み
    private loadWordList(): void {
        try {
            this.allWords = this.wordListInstance.getWords();
            this.updateStats();
            this.applyFilters();
            if (this.loadingMessage) this.loadingMessage.style.display = 'none';
            if (this.wordTable) this.wordTable.style.display = 'table';
        } catch (error) {
            console.error('Failed to load word list:', error);
            if (this.loadingMessage) {
                this.loadingMessage.textContent = '単語リストの読み込みに失敗しました。';
            }
        }
    }

    // 統計情報を更新
    private updateStats(): void {
        const total = this.allWords.length;
        const hidden = this.allWords.filter(word => word.difficulty === -1).length;
        const learned = this.allWords.filter(word => word.difficulty === 0).length;
        const active = total - hidden - learned;

        if (this.totalWordsEl) this.totalWordsEl.textContent = total.toString();
        if (this.learnedWordsEl) this.learnedWordsEl.textContent = learned.toString();
        if (this.hiddenWordsEl) this.hiddenWordsEl.textContent = hidden.toString();
        if (this.activeWordsEl) this.activeWordsEl.textContent = active.toString();
    }

    // フィルターと検索を適用
    private applyFilters(): void {
        const difficultyValue = this.difficultyFilter?.value || 'all';
        const searchValue = this.searchInput?.value.toLowerCase().trim() || '';

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
    private renderTable(): void {
        if (!this.wordTableBody) return;
        
        this.wordTableBody.innerHTML = '';

        if (this.filteredWords.length === 0) {
            if (this.wordTable) this.wordTable.style.display = 'none';
            if (this.noResultsMessage) this.noResultsMessage.style.display = 'block';
            return;
        }

        if (this.wordTable) this.wordTable.style.display = 'table';
        if (this.noResultsMessage) this.noResultsMessage.style.display = 'none';

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
            
            this.wordTableBody!.appendChild(row);
            
            // イベントリスナーを追加
            this.setupDifficultyControls(row, word);
        });
    }

    // difficulty調整コントロールのHTMLを生成
    private getDifficultyControls(word: any): string {
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
    private setupDifficultyControls(row: HTMLElement, word: any): void {
        const decreaseBtn = row.querySelector('.difficulty-btn.decrease') as HTMLButtonElement;
        const increaseBtn = row.querySelector('.difficulty-btn.increase') as HTMLButtonElement;
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', async () => {
                await this.changeDifficulty(word.id, -1);
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', async () => {
                await this.changeDifficulty(word.id, 1);
            });
        }
    }

    // difficultyを変更
    private async changeDifficulty(wordId: number, change: number): Promise<void> {
        try {
            const word = this.allWords.find(w => w.id === wordId);
            if (!word) return;
            
            const newDifficulty = Math.max(-1, Math.min(10, word.difficulty + change));
            
            if (newDifficulty === word.difficulty) return; // 変更なしの場合は何もしない
            
            // wordListInstanceを通じてdifficultyを更新
            if (this.wordListInstance && typeof (this.wordListInstance as any).updateWordDifficulty === 'function') {
                await (this.wordListInstance as any).updateWordDifficulty(wordId, newDifficulty);
                
                // UIを更新
                this.refresh();
                
                console.log(`Word ${wordId} difficulty changed to ${newDifficulty}`);
            }
        } catch (error) {
            console.error('Failed to change difficulty:', error);
        }
    }

    // 全単語のdifficultyリセット確認ダイアログ
    private showResetAllConfirmation(): void {
        const availableWords = this.allWords.filter(word => word.difficulty !== -1);
        const hiddenWords = this.allWords.filter(word => word.difficulty === -1);
        
        let message = `全ての単語のdifficultyを+1しますか？\n\n`;
        message += `対象: ${availableWords.length}語\n`;
        if (hiddenWords.length > 0) {
            message += `非表示: ${hiddenWords.length}語（変更されません）\n`;
        }
        message += `\nこの操作は元に戻せません。`;
        
        if (confirm(message)) {
            this.resetAllDifficulty();
        }
    }

    // 全単語のdifficultyを+1する
    private async resetAllDifficulty(): Promise<void> {
        try {
            // 進行状況表示の準備
            if (this.loadingMessage) {
                this.loadingMessage.textContent = 'difficulty を更新中...';
                this.loadingMessage.style.display = 'block';
            }
            if (this.wordTable) this.wordTable.style.display = 'none';
            
            const availableWords = this.allWords.filter(word => word.difficulty !== -1);
            let successCount = 0;
            let errorCount = 0;
            
            // 各単語のdifficultyを+1
            for (const word of availableWords) {
                try {
                    const newDifficulty = Math.min(10, word.difficulty + 1);
                    
                    if (this.wordListInstance && typeof (this.wordListInstance as any).updateWordDifficulty === 'function') {
                        await (this.wordListInstance as any).updateWordDifficulty(word.id, newDifficulty);
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Failed to update word ${word.id}:`, error);
                    errorCount++;
                }
            }
            
            // 結果表示
            const totalWords = availableWords.length;
            let resultMessage = `difficulty更新完了！\n`;
            resultMessage += `成功: ${successCount}語\n`;
            if (errorCount > 0) {
                resultMessage += `失敗: ${errorCount}語\n`;
            }
            
            alert(resultMessage);
            
            // UIを更新
            this.refresh();
            
            console.log(`Bulk difficulty update completed: ${successCount}/${totalWords} words updated`);
            
        } catch (error) {
            console.error('Failed to reset all difficulties:', error);
            alert('difficulty更新中にエラーが発生しました。');
            
            // エラー時はUI表示を復元
            if (this.loadingMessage) this.loadingMessage.style.display = 'none';
            if (this.wordTable) this.wordTable.style.display = 'table';
        }
    }

    // 難易度バッジを取得
    private getDifficultyBadge(difficulty: number): string {
        let className = '';
        
        if (difficulty === -1) {
            className = 'difficulty-hidden';
        } else if (difficulty === 0) {
            className = 'difficulty-low';
        } else if (difficulty >= 1 && difficulty <= 2) {
            className = 'difficulty-medium';
        } else if (difficulty >= 3) {
            className = 'difficulty-high';
        }
        
        return `<span class="difficulty-badge ${className}">${difficulty}</span>`;
    }

    // ステータステキストを取得
    private getStatusText(difficulty: number): string {
        if (difficulty === -1) {
            return '非表示';
        } else if (difficulty === 0) {
            return '学習完了';
        } else {
            return '学習中';
        }
    }

    // データの再読み込み（difficulty変更後等）
    refresh(): void {
        this.allWords = this.wordListInstance.getWords();
        this.updateStats();
        this.applyFilters();
    }
}
