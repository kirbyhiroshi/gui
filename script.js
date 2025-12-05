// --- 設定 ---
const BUTTON_ID = 'fetchDataButton'; // HTMLのボタンに設定するID
const OUTPUT_AREA_ID = 'output';    // 結果を表示するHTML要素のID
// TheMealDBのAPIエンドポイント (例: 「Arrabiata」のレシピを検索)
const API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata';

// --- 関数定義 ---

/**
 * 結果メッセージをHTMLに出力する関数
 * @param {string} message - 出力するメッセージ
 * @param {string} type - 'success' または 'error'
 */
function displayMessage(message, type) {
    const outputElement = document.getElementById(OUTPUT_AREA_ID);
    if (outputElement) {
        outputElement.innerHTML = `<p class="${type}">${message}</p>`;
        outputElement.style.color = (type === 'error') ? 'red' : 'green';
        outputElement.style.fontWeight = 'bold';
    } else {
        console.warn(`HTML要素（ID: ${OUTPUT_AREA_ID}）が見つかりません。`);
    }
}

/**
 * TheMealDBからデータを取得する非同期関数
 */
async function fetchData() {
    console.log('✅ ボタンがクリックされました。API呼び出しを開始します...');
    displayMessage('接続中...', 'info');

    try {
        // 1. APIを呼び出す
        const response = await fetch(API_URL);

        // 2. 応答ステータスをチェックする (HTTPエラーハンドリング)
        if (!response.ok) {
            // 例: 404 Not Found, 500 Internal Server Error など
            const errorStatus = response.status;
            const errorText = response.statusText;
            throw new Error(`HTTPエラー! ステータス: ${errorStatus} (${errorText})`);
        }

        // 3. 応答をJSONとしてパースする
        const data = await response.json();
        
        // 4. 成功時の処理
        console.log('🎉 接続成功! 取得データ:', data);
        
        // 取得したデータの内容に基づいてメッセージを決定
        if (data.meals && data.meals.length > 0) {
            displayMessage(`✅ レシピを ${data.meals.length} 件取得しました: ${data.meals[0].strMeal} 他`, 'success');
        } else {
             displayMessage('⚠️ API接続は成功しましたが、レシピが見つかりませんでした。', 'warning');
        }
        
    } catch (error) {
        // 5. ネットワークエラー (CORS, 接続断、タイムアウトなど) または上記でthrowしたエラーをキャッチ
        console.error('❌ API接続で致命的なエラーが発生しました:', error);
        
        // ユーザーに分かりやすいエラーメッセージを表示
        if (error.message.includes('HTTPエラー')) {
             displayMessage(`❌ API接続エラー: ${error.message}`, 'error');
        } else if (error.message.includes('fetch')) {
             displayMessage('❌ ネットワーク接続またはCORSエラーの可能性があります。コンソールを確認してください。', 'error');
        } else {
             displayMessage(`❌ 予期せぬエラー: ${error.message}`, 'error');
        }
    }
}

// --- イベントリスナーの設定 ---
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById(BUTTON_ID);

    if (button) {
        button.addEventListener('click', fetchData);
        console.log(`🚀 '${BUTTON_ID}'のボタンにイベントリスナーを設定しました。`);
    } else {
        console.error(`🚨 致命的: HTML内にIDが '${BUTTON_ID}' のボタンが見つかりません。`);
    }
});
