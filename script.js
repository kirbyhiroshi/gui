// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');

// TheMealDBのランダム取得エンドポイント
const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

/**
 * 献立をランダムで取得し、画面に表示する関数
 */
async function getRandomMeal() {
    // 読み込み中であることをユーザーに伝える
    mealDisplay.innerHTML = '<p>献立を選んでいます...少々お待ちください⏳</p>';

    try {
        // 1. APIからデータを取得
        const response = await fetch(API_URL);
        
        // ネットワークエラーなどをチェック
        if (!response.ok) {
            throw new Error(`HTTPエラー！ステータス: ${response.status}`);
        }
        
        const data = await response.json();

        // 2. 取得したデータから料理情報を抽出
        // TheMealDBは 'meals'という配列の中に料理データを持っています。
        const meal = data.meals[0];

        // 3. HTMLに料理情報を表示
        if (meal) {
            displayMeal(meal);
        } else {
            // データが取得できなかった場合の表示
            mealDisplay.innerHTML = '<p>ごめんなさい、料理を見つけられませんでした😔</p>';
        }

    } catch (error) {
        console.error('献立の取得中にエラーが発生しました:', error);
        // エラーメッセージを画面に表示
        mealDisplay.innerHTML = `<p>エラーが発生しました: ${error.message}</p><p>インターネット接続やAPIの状況を確認してください。</p>`;
    }
}

/**
 * 取得した料理の詳細を画面に描画する関数
 * @param {Object} meal - 取得した料理オブジェクト
 */
function displayMeal(meal) {
    // 表示するHTMLコンテンツを作成
    const mealHtml = `
        <h2>${meal.strMeal}</h2>
        <p>カテゴリー: <strong>${meal.strCategory || '不明'}</strong></p>
        <p>地域: <strong>${meal.strArea || '不明'}</strong></p>
        ${meal.strMealThumb ? `<img src="${meal.strMealThumb}" alt="${meal.strMeal}の画像">` : ''}
        <p>作り方の簡単なヒント: ${meal.strInstructions ? meal.strInstructions.substring(0, 150) + '...' : '情報なし'}</p>
        ${meal.strSource ? `<p><a href="${meal.strSource}" target="_blank">レシピの詳細を見る 🔗</a></p>` : ''}
    `;
    
    // 作成したHTMLを画面に反映
    mealDisplay.innerHTML = mealHtml;
}


// 5. ボタンが押されたらgetRandomMeal関数を実行するように設定
getMealBtn.addEventListener('click', getRandomMeal);

// ページ読み込み時に一度だけ実行して初期メッセージを表示
document.addEventListener('DOMContentLoaded', () => {
    mealDisplay.innerHTML = '<p>ボタンを押して、今日の献立を決めましょう！</p>';
});
