// wordlist-main.ts - WordListViewer用のエントリーポイント
import { WordListViewer } from './wordlist-viewer';

// グローバルに公開
(window as any).WordListViewer = WordListViewer;

console.log('WordListViewer loaded successfully');
