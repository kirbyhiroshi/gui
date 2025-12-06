// ★★★★ 必須：デプロイで取得したウェブアプリのURLに置き換えてください ★★★★
const GAS_URL = 'あなたのGASウェブアプリURL'; 

document.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み時に日報一覧を取得・表示
    fetchReports(); 

    // フォーム送信イベントを設定 (機能要件①)
    const formElement = document.getElementById('report-form');
    if (formElement) {
        formElement.addEventListener('submit', handleFormSubmit);
    }
});

// ------------------------------------------------------------------
// ★ 日報一覧を取得して表示する関数 (機能要件②)
// ------------------------------------------------------------------
async function fetchReports() {
    const listElement = document.getElementById('report-list');
    listElement.innerHTML = '読み込み中...'; 

    try {
        const response = await fetch(GAS_URL, { method: 'GET' });
        const reports = await response.json(); 
        
        listElement.innerHTML = ''; 

        // データベース接続エラーが返ってきた場合 (画像 6c0ec0 のエラー対応)
        if (reports.error) {
            listElement.innerHTML = `<p style="color:red;">エラー発生: ${reports.error}</p>`;
            return;
        }

        if (reports.length === 0) {
            listElement.innerHTML = '<p>まだ日報がありません。</p>';
            return;
        }

        reports.forEach(report => {
            const item = document.createElement('div');
            item.className = 'report-item';
            
            const date = new Date(report.日付).toLocaleDateString();

            // HTML要素を動的に生成し、日報を表示する
            item.innerHTML = `
                <div class="report-header">
                    <h3>${report.名前} <span>${report.コンディション}</span></h3>
                    <div class="report-meta">${date}</div>
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

        // いいねボタンにイベントリスナーを設定
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', handleLike);
        });

    } catch (error) {
        console.error('日報取得エラー:', error);
        // ネットワークエラーの場合 (画像 6bf823, 620452 のエラー対応)
        listElement.innerHTML = '<p style="color:red;">通信エラーが発生しました。GASのURLとデプロイ設定を確認してください。</p>';
    }
}


// ------------------------------------------------------------------
// ★ フォーム送信処理（日報投稿）(機能要件①)
// ------------------------------------------------------------------
async function handleFormSubmit(event) {
    event.preventDefault(); 

    const form = event.target;
    const formData = new FormData(form);
    const data = { action: 'post' }; 
    
    for (const [key, value] of formData.entries()) {
        data[key] = value; 
    }
    
    document.getElementById('submit-btn').disabled = true;

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: new URLSearchParams(data) 
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('日報を送信しました！');
            form.reset(); 
            fetchReports(); // 一覧を再取得して更新
        } else {
            alert('送信失敗: ' + (result.message || '不明なエラー'));
        }

    } catch (error) {
        alert('ネットワークエラーにより送信できませんでした。');
        console.error('投稿エラー:', error);
    } finally {
        document.getElementById('submit-btn').disabled = false;
    }
}

// ------------------------------------------------------------------
// ★ いいねボタンクリック処理 (機能要件③)
// ------------------------------------------------------------------
async function handleLike(event) {
    const button = event.target;
    const reportId = button.getAttribute('data-id');

    button.disabled = true; 

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: new URLSearchParams({ 
                action: 'like', 
                id: reportId
            }) 
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            fetchReports(); // 成功したら一覧を再読み込みしてカウントを更新
        } else {
            alert('いいね失敗: ' + result.message);
        }

    } catch (error) {
        console.error('いいね処理エラー:', error);
    } finally {
        button.disabled = false;
    }
}
