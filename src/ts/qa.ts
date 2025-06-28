// qa.tsファイル - Q&Aアプリケーション
console.log('qa.ts が正常に読み込まれました！');

interface Question {
    id: number;
    question: string;
    answer: string;
}

class QAManager {
    private questions: Question[] = [];
    private currentId: number = 1;

    addQuestion(question: string, answer: string): void {
        const newQuestion: Question = {
            id: this.currentId++,
            question,
            answer
        };
        this.questions.push(newQuestion);
        this.renderQuestions();
    }

    private renderQuestions(): void {
        const container = document.getElementById('qa-container');
        if (!container) return;

        container.innerHTML = '';
        
        this.questions.forEach(qa => {
            const qaElement = document.createElement('div');
            qaElement.className = 'qa-item';
            qaElement.innerHTML = `
                <h3>Q: ${qa.question}</h3>
                <p>A: ${qa.answer}</p>
                <hr>
            `;
            container.appendChild(qaElement);
        });
    }
}

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    const qaManager = new QAManager();
    
    // サンプルデータを追加
    qaManager.addQuestion('TypeScriptとは何ですか？', 'JavaScriptに型安全性を追加したプログラミング言語です。');
    qaManager.addQuestion('Webpackの役割は？', 'モジュールバンドラーとして、複数のファイルを1つにまとめる役割があります。');
    
    // フォーム送信イベント
    const form = document.getElementById('qa-form') as HTMLFormElement;
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const questionInput = document.getElementById('question-input') as HTMLInputElement;
            const answerInput = document.getElementById('answer-input') as HTMLInputElement;
            
            if (questionInput && answerInput) {
                qaManager.addQuestion(questionInput.value, answerInput.value);
                questionInput.value = '';
                answerInput.value = '';
            }
        });
    }
});