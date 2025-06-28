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
// ワードリスト管理クラス
class UnitManager {
    loadUnit1WordList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('./wordlist.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const wordList = yield response.json();
                return wordList;
            }
            catch (error) {
                console.error('Failed to load Unit1 wordlist:', error);
                return null;
            }
        });
    }
    updateUnit1Description() {
        return __awaiter(this, void 0, void 0, function* () {
            const wordList = yield this.loadUnit1WordList();
            const descriptionElement = document.getElementById('unit1-description');
            if (descriptionElement) {
                if (wordList) {
                    const wordCount = wordList.metadata.totalWords;
                    const title = wordList.metadata.description;
                    descriptionElement.textContent = `${title}（${wordCount}語）`;
                }
                else {
                    descriptionElement.textContent = '基本動詞と表現（読み込みエラー）';
                }
            }
        });
    }
}
// DOM読み込み完了後の処理
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    const unitManager = new UnitManager();
    // Unit1の語数を動的に更新
    yield unitManager.updateUnit1Description();
    console.log('ワードリストの語数表示を更新しました');
}));
