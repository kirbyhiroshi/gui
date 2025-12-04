// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');
const checkboxes = document.querySelectorAll('input[name="cuisine"]');

// TheMealDBのエンドポイント
// 料理一覧を地域で絞り込むAPI
const LIST_API_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?a=';
// 料理の詳細情報をIDで取得するAPI
const DETAIL_API_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';


/**
 * 献立をランダムで取得し、画面に表示する関数
 */
async function getRandomMeal() {
    mealDisplay.innerHTML = '<p>献立を選んでいます...少々お待ちください⏳</p>';

    // 1. 選択されたジャンル（地域）を取得
    const selectedAreas = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    if (selectedAreas.length === 0) {
        mealDisplay.innerHTML = '<p>献立のジャンルを1つ以上選択してください！</p>';
        return;
    }

    try {
        // 2. 選択された地域ごとに料理リストを取得し、一つの配列にまとめる
        let mealIds = [];
        
        for (const area of selectedAreas) {
            const response = await fetch(`${LIST_API_URL}${area}`);
            if (!response.ok) {
                console.warn(`地域: ${area} のデータ取得に失敗しました。`);
                continue; // 失敗しても他の地域に進む
            }
            const data = await response.json();
            
            // 料理IDのみを抽出してリストに追加
            if (data.meals) {
                const ids = data.meals.map(meal => meal.idMeal);
                mealIds = mealIds.concat(ids);
            }
        }
        
        // 3. 取得した全料理リストからランダムで一つ選択
        if (mealIds.length === 0) {
            mealDisplay.innerHTML = '<p>選択されたジャンルに一致する料理が見つかりませんでした😔</p>';
            return;
        }

        const randomIndex = Math.floor(Math.random() * mealIds.length);
        const randomMealId = mealIds[randomIndex];
        
        // 4. 選択した料理IDの詳細情報を取得
        const detailResponse = await fetch(`${DETAIL_API_URL}${randomMealId}`);
        if (!detailResponse.ok) {
            throw new Error(`料理の詳細情報取得に失敗しました。`);
        }
        const detailData = await detailResponse.json();
        const meal = detailData.meals[0];

        // 5. 画面に表示
        if (meal) {
            displayMeal(meal);
        } else {
             mealDisplay.innerHTML = '<p>料理データの読み込み中にエラーが発生しました。</p>';
        }

    } catch (error) {
        console.error('献立の取得中にエラーが発生しました:', error);
        mealDisplay.innerHTML = `<p>エラーが発生しました: ${error.message}</p><p>インターネット接続やAPIの状況を確認してください。</p>`;
    }
}


/**
 * 取得した料理の詳細を画面に描画する関数
 * このバージョンでは、翻訳は行わず、英語のまま表示します。
 * 翻訳機能を再度追加する場合は、この関数をさらに拡張する必要があります。
 */
function displayMeal(meal) {
    // 取得したデータから必要な情報を取得
    const mealName = meal.strMeal || '料理名不明';
    const category = meal.strCategory || '不明';
    const area = meal.strArea || '不明';
    const thumbnail = meal.strMealThumb;
    const instructions = meal.strInstructions || '作り方情報なし';
    const sourceLink = meal.strSource;

    const mealHtml = `
        <h2>${mealName}</h2>
        <p>カテゴリー: <strong>${category}</strong></p>
        <p>地域: <strong>${area}</strong></p>
        ${thumbnail ? `<img src="${thumbnail}" alt="${mealName}の画像">` : ''}
        <p>作り方の簡単なヒント: ${instructions.substring(0, 150) + '...'}</p>
        ${sourceLink ? `<p><a href="${sourceLink}" target="_blank">レシピの詳細を見る 🔗</a></p>` : ''}
    `;
    
    mealDisplay.innerHTML = mealHtml;
}


// ボタンが押されたらgetRandomMeal関数を実行するように設定
getMealBtn.addEventListener('click', getRandomMeal);
