"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// wordlist-main.ts - WordListViewer用のエントリーポイント
const wordlist_viewer_1 = require("./wordlist-viewer");
// グローバルに公開
window.WordListViewer = wordlist_viewer_1.WordListViewer;
console.log('WordListViewer loaded successfully');
