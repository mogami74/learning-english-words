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
class LessonManager {
    loadLessonWordList(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 現在はlesson1のwordlist.jsonのみ対応
                let wordlistPath = './wordlist.json';
                console.log(`Loading wordlist from: ${wordlistPath}`);
                const response = yield fetch(wordlistPath);
                console.log(`Response status: ${response.status}, ok: ${response.ok}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const wordList = yield response.json();
                console.log(`Loaded wordlist:`, wordList.metadata);
                return wordList;
            }
            catch (error) {
                console.error(`Failed to load ${lessonId} wordlist:`, error);
                return null;
            }
        });
    }
    updateLessonDescription(lessonId, elementId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const wordList = yield this.loadLessonWordList(lessonId);
            const descriptionElement = document.getElementById(elementId);
            if (descriptionElement) {
                if (wordList) {
                    const wordCount = wordList.metadata.totalWords;
                    // 表示情報の優先順位: displayInfo.cardDescription > description > shortDescription
                    let displayText = ((_a = wordList.metadata.displayInfo) === null || _a === void 0 ? void 0 : _a.cardDescription)
                        || wordList.metadata.description
                        || wordList.metadata.shortDescription
                        || 'レッスン内容';
                    descriptionElement.textContent = `${displayText}（${wordCount}語）`;
                    console.log(`Updated lesson description: ${displayText}（${wordCount}語）`);
                }
                else {
                    descriptionElement.textContent = 'レッスン内容（読み込みエラー）';
                }
            }
        });
    }
}
// DOM読み込み完了後の処理
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    const lessonManager = new LessonManager();
    // レッスン1の語数を動的に更新
    yield lessonManager.updateLessonDescription('lesson1', 'lesson1-description');
    console.log('ワードリストの語数表示を更新しました');
}));
