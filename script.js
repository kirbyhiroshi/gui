// ★★★★ 必須：デプロイで取得したウェブアプリのURLに置き換えてください ★★★★
const GAS_URL = 'あなたのGASウェブアプリURL'; // ← ここがHTTPSで正しいか確認

document.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み時に日報一覧を取得・表示
    fetchReports(); 
    // ... 他のイベントリスナー設定 ...
});

// ------------------------------------------------------------------
// ★ 日報一覧を取得して表示する関数
// ------------------------------------------------------------------
async function fetchReports() {
    const listElement = document.getElementById('report-list');
    listElement.innerHTML = '読み込み中...'; 

    try {
        // GAS URLへGETリクエストを送信
        const response = await fetch(GAS_URL, { method: 'GET' });
        // レスポンスをJSONとして解析
        const reports = await response.json(); 
        
        listElement.innerHTML = ''; // ローディング表示をクリア

        // 1. エラーメッセージが返ってきた場合 (画像 6c0ec0 のケース)
        if (reports.error) {
            listElement.innerHTML = `<p style="color:red;">エラー発生: ${reports.error}</p>`;
            return;
        }

        if (reports.length === 0) {
            listElement.innerHTML = '<p>まだ日報がありません。</p>';
            return;
        }

        // 2. 正常なデータが返ってきた場合 (画像 6c037f のデータ整形)
        reports.forEach(report => {
            const item = document.createElement('div');
            item.className = 'report-item';
            
            // HTML要素を動的に生成し、日報を表示する
            // ★この処理により、画面にフォームではなく整形されたリストが表示されます★
            item.innerHTML = `
                <div class="report-header">
                    <h3>${report.名前} <span>${report.コンディション}</span></h3>
                    <div class="report-meta">
                        ${new Date(report.日付).toLocaleDateString()}
                    </div>
                </div>
                <p><strong>今日やったこと:</strong> ${report['今日やったこと'] || '---'}</p>
                <p><strong>翌営業日やること:</strong> ${report['翌営業日やること'] || '---'}</p>
                <p><strong>所感・学び:</strong> ${report['所感_学び'] || '---'}</p>
                <button class="like-button" data-id="${report.ID}">
                    いいね👍 (${report.いいね数})
                </button>
            `;
            listElement.appendChild(item);
        });

        // ... (いいねボタンのイベントリスナー設定) ...

    } catch (error) {
        console.error('日報取得エラー:', error);
        // 3. ネットワークエラーの場合 (画像 6bf823 のケース)
        listElement.innerHTML = '<p style="color:red;">通信エラーが発生しました。GASのURLとデプロイ設定を確認してください。</p>';
    }
}

// ... (handleFormSubmit, handleLike 関数は省略) ...
