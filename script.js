// HTML要素を取得
// DOMContentLoadedイベントを待たずに、グローバルスコープで要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');
const checkboxes = document.querySelectorAll('input[name="cuisine"]');

// TheMealDBのエンドポイント
const LIST_API_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?a=';
const DETAIL_API_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';


/**
 * 取得した料理の詳細を画面に描画する関数
 */
function displayMeal(meal) {
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


/**
 * 献立をランダムで取得し、画面に表示する関数
 */
async function getRandomMeal() {
    // 処理開始時に表示をリセット
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
        // 2. 選択された地域ごとのデータ取得処理をまとめて実行
        const fetchPromises = selectedAreas.map(area => 
            fetch(`${LIST_API_URL}${area}`)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`地域: ${area} のデータ取得に失敗しました。`);
                        return null;
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(`Fetchエラー（${area}）:`, error);
                    return null;
                })
        );

        // 全てのレスポンスを待つ
        const results = await Promise.all(fetchPromises);
        
        // 3. 取得した全料理リストからIDを抽出して一つの配列にまとめる
        let mealIds = [];
        
        results.forEach(data => {
            if (data && data.meals && Array.isArray(data.meals)) {
                const ids = data.meals.map(meal => meal.idMeal);
                mealIds = mealIds.concat(ids);
            }
        });
        
        // 4. 料理が見つからなかった場合の処理
        if (mealIds.length === 0) {
            mealDisplay.innerHTML = '<p>選択されたジャンルに一致する料理が見つかりませんでした😔</p>';
            return;
        }

        //
