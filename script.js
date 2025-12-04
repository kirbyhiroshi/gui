// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');

// ジャンル（地域）チェックボックス - name="area"
const areaCheckboxes = document.querySelectorAll('input[name="area"]');
// 食材（カテゴリー）チェックボックス - name="category"
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

// TheMealDBのエンドポイント
const LIST_API_URL_AREA = 'https://www.themealdb.com/api/json/v1/1/filter.php?a=';
const LIST_API_URL_CATEGORY = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=';
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

    // 1. 選択されたジャンルとカテゴリーを取得し、検索クエリを準備
    const selectedAreas = Array.from(areaCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value.split(','))
        .flat(); 
    
    const allSearchQueries = [];
    
    selectedAreas.forEach(area => {
        allSearchQueries.push({ type: 'area', value: area, url: `${LIST_API_URL_AREA}${area}` });
    });

    selectedCategories.forEach(category => {
        allSearchQueries.push({ type: 'category', value: category, url: `${LIST_API_URL_CATEGORY}${category}` });
    });

    // 2. 検索条件のチェック
    if (allSearchQueries.length === 0) {
        mealDisplay.innerHTML = '<p>献立のジャンルまたは食材を1つ以上選択してください！</p>';
        return;
    }

    try {
        // 3. 全ての検索クエリを並列実行
        // Promise.allSettled を使用し、一つが失敗しても他の結果を続行
        const fetchPromises = allSearchQueries.map(query => 
            fetch(query.url).then(r => r.json()).catch(() => null)
        );

        const results = await Promise.all(fetchPromises);
        
        // 4. 全てのリストを結合し、重複を排除（OR検索）
        let allMealIds = new Set();
        
        results.forEach(data => {
            if (data && data.meals && Array.isArray(data.meals)) {
                data.meals.forEach(meal => allMealIds.add(meal.idMeal));
            }
        });
        
        const finalMealIds = Array.from(allMealIds);

        // 5. 料理が見つからなかった場合の処理
        if (finalMealIds.length === 0) {
            mealDisplay.innerHTML = '<p>選択された条件に一致する料理が見つかりませんでした😔</p>';
            return;
        }

        // 6. ランダムにIDを選択し、詳細情報を取得
        const randomIndex = Math.floor(Math.random() * finalMealIds.length);
        const randomMealId = finalMealIds[randomIndex];
        
        const detailResponse = await fetch(`${DETAIL_API_URL}${randomMealId}`);
        const detailData = await detailResponse.json();
        const meal = detailData.meals[0];

        // 7. 画面に表示
        if (meal) {
            displayMeal(meal);
        } else {
             mealDisplay.innerHTML = '<p>料理データの読み込み中にエラーが発生しました。</p>';
        }

    } catch (error) {
        console.error('献立の取得中に致命的なエラーが発生しました:', error);
        mealDisplay.innerHTML = `<p>エラーが発生しました: ${error.message}</p><p>インターネット接続やAPIの状況を確認してください。</p>`;
    }
}


// ボタンとイベントリスナーの設定
if (getMealBtn && mealDisplay) {
    getMealBtn.addEventListener('click', getRandomMeal);
    mealDisplay.innerHTML = '<p>ジャンルと食材を選択して、ボタンを押してください。</p>';
} else {
    // コンソールにエラーメッセージを表示
    console.error("致命的エラー: HTMLのID ('get-meal-btn' または 'meal-display') がJavaScriptと一致していません。");
}
