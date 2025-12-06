// ★★★★ 必須：デプロイで取得したウェブアプリのURLに置き換えてください ★★★★
const GAS_URL = 'https://script.google.com/a/macros/toho-next.com/s/AKfycbyKpw8OmyCVimgD4msNdhNxzhOfNWYZBDNyoQ1rDgGOdcqzdYU92iuy6Tir3zFKfeAorQ/exec';

document.addEventListener('DOMContentLoaded', () => {
    // 1. ページ読み込み時に日報一覧を取得・表示
    fetchReports();

    // 2. フォーム送信イベントを設定
    document.getElementById('report-form').addEventListener('submit', handleFormSubmit);
});

// ------------------------------------------------------------------
// ★ 日報一覧を取得して表示する
// ------------------------------------------------------------------
async function fetchReports() {
    const listElement = document.getElementById('report-list');
    listElement.innerHTML = '読み込み中...'; // ローディング表示

    try {
        const response = await fetch(GAS_URL, { method: 'GET' });
        const reports = await response.json(); // GASからJSONデータを受け取る
        
        listElement.innerHTML = ''; // ローディングをクリア

        if (reports.length === 0) {
            listElement.innerHTML = '<p>まだ日報がありません。</p>';
            return;
        }

        reports.forEach(report => {
            const item = document.createElement('div');
            item.className = 'report-item';
            
            // 日報項目のHTMLを構築
            item.innerHTML = `
                <div class="report-header">
                    <h3>${report.名前} <span>${report.コンディション}</span></h3>
                    <div class="report-meta">
                        ${new Date(report.日付).toLocaleDateString()}
                    </div>
                </div>
                <p><strong>今日やったこと:</strong> ${report['今日やったこと']}</p>
                <p><strong>翌営業日やること:</strong> ${report['翌営業日やること']}</p>
                <p><strong>所感・学び:</strong> ${report['所感_学び']}</p>
                <button class="like-button" data-id="${report.ID}">
                    いいね👍 (${report.いいね数})
                </button>
            `;
            listElement.appendChild(item);
        });

        // 3. いいねボタンにイベントリスナーを設定
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', handleLike);
        });

    } catch (error) {
        console.error('日報取得エラー:', error);
        listElement.innerHTML = '<p style="color:red;">日報の読み込みに失敗しました。</p>';
    }
}

// ------------------------------------------------------------------
// ★ フォーム送信処理（日報投稿）
// ------------------------------------------------------------------
async function handleFormSubmit(event) {
    event.preventDefault(); // フォームのデフォルト送信を防ぐ

    const form = event.target;
    const formData = new FormData(form);
    
    // GASに送るためのデータオブジェクトを作成
    const data = { action: 'post' }; // GASに投稿処理だと伝える
    for (const [key, value] of formData.entries()) {
        // スプレッドシートのヘッダー名と合わせる
        data[key] = value; 
    }
    
    document.getElementById('submit-btn').disabled = true;

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: new URLSearchParams(data) // POSTデータとして送信
        });

        const result = await response.json();
        const messageElement = document.getElementById('message');

        if (result.status === 'success') {
            alert('日報を送信しました！');
            form.reset(); // フォームをクリア
            fetchReports(); // 一覧を再取得して更新
        } else {
            alert('送信失敗: ' + result.message);
        }

    } catch (error) {
        alert('ネットワークエラーにより送信できませんでした。');
        console.error('投稿エラー:', error);
    } finally {
        document.getElementById('submit-btn').disabled = false;
    }
}

// ------------------------------------------------------------------
// ★ いいねボタンクリック処理
// ------------------------------------------------------------------
async function handleLike(event) {
    const button = event.target;
    const reportId = button.getAttribute('data-id');

    button.disabled = true; // 連打防止

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: new URLSearchParams({ 
                action: 'like', // GASにいいね処理だと伝える
                id: reportId
            }) 
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // 成功したら一覧を再読み込みしてカウントを更新
            fetchReports();
        } else {
            console.error('いいね失敗:', result.message);
        }

    } catch (error) {
        console.error('いいね処理エラー:', error);
    } finally {
        button.disabled = false;
    }
}
