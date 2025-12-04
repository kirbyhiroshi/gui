// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');
// ジャンル（地域）チェックボックス
const areaCheckboxes = document.querySelectorAll('input[name="area"]');
// 食材（カテゴリー）チェックボックス
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

// TheMealDBのエンドポイント
const LIST_API_URL_AREA = 'https://www.themealdb.com/api/json/v1/1/filter.php?a='; // 地域検索
const LIST_API_URL_CATEGORY = 'https://www.themealdb.com/api/json/v1/1/filter.php?c='; // カテゴリー検索
const DETAIL_API_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i='; // 詳細検索


/**
 * 献立をランダムで取得し、画面に表示する関数
 */
async function getRandomMeal() {
    mealDisplay.innerHTML = '<p>献立を選んでいます...少々お待ちください⏳</p>';

    // 1. 選択されたジャンル（地域）とカテゴリーを取得
    const selectedAreas = Array.from(areaCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value.split(',')) // Beef,Chicken,Pork のようにカンマ区切りで結合された値を配列に戻す
        .flat(); // 1次元の配列に平坦化

    // 選択がない場合の処理（少なくともどちらか一方のグループが選択されている必要がある）
    if (selectedAreas.length === 0 && selectedCategories.length === 0) {
        mealDisplay.innerHTML = '<p>献立のジャンルまたは食材を1つ以上選択してください！</p>';
        return;
    }

    try {
        // 2. 地域検索（ジャンル）
        let areaMealIds = new Set();
        if (selectedAreas.length > 0) {
            const areaPromises = selectedAreas.map(area => fetch(`${LIST_API_URL_AREA}${area}`).then(r => r.json()).catch(() => ({ meals: [] })));
            const areaResults = await Promise.all(areaPromises);
            areaResults.forEach(data => {
                if (data.meals) {
                    data.meals.forEach(meal => areaMealIds.add(meal.idMeal));
                }
            });
        }
        
        // 3. カテゴリー検索（食材）
        let categoryMealIds = new Set();
        if (selectedCategories.length > 0) {
            const categoryPromises = selectedCategories.map(cat => fetch(`${LIST_API_URL_CATEGORY}${cat}`).then(r => r.json()).catch(() => ({ meals: [] })));
            const categoryResults = await Promise.all(categoryPromises);
            categoryResults.forEach(data => {
                if (data.meals) {
                    data.meals.forEach(meal => categoryMealIds.add(meal.idMeal));
                }
            });
        }
        
        // 4. 最終的な絞り込み (AND検索)
        let finalMealIds = [];
        
        // 地域とカテゴリーのどちらも選択されている場合、両方に含まれるIDのみ抽出（AND条件）
        if (selectedAreas.length > 0 && selectedCategories.length > 0) {
            areaMealIds.forEach(id => {
                if (categoryMealIds.has(id)) {
                    finalMealIds.push(id);
                }
            });
        } 
        // どちらか一方のみが選択されている場合、そのリストを使う
        else if (selectedAreas.length > 0) {
            finalMealIds = Array.from(areaMealIds);
        } else if (selectedCategories.length > 0) {
            finalMealIds = Array.from(categoryMealIds);
        }

        // 5. 料理が見つからなかった場合の処理
        if (finalMealIds.length === 0) {
            mealDisplay.innerHTML = '<p>選択されたジャンルと食材の組み合わせに一致する料理が見つかりませんでした😔</p>';
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


/**
 * 取得した料理の詳細を画面に描画する関数 (変更なし)
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


// ボタンとイベントリスナーの設定
if (getMealBtn) {
    getMealBtn.addEventListener('click', getRandomMeal);
    // 初期メッセージを設定
    if (mealDisplay) {
        mealDisplay.innerHTML = '<p>ジャンルと食材を選択して、ボタンを押してください。</p>';
    }
} else {
    console.error("エラー: 'get-meal-btn' ボタン要素が見つかりませんでした。");
}
