// TheMealDBのベースURL
const API_URL = 'https://www.themealdb.com/api/json/v1/1/';

/**
 * 料理IDから詳細情報を取得する関数
 * @param {string} id - 料理のID (idMeal)
 * @returns {Object|null} 料理の詳細オブジェクト
 */
async function fetchMealDetails(id) {
    try {
        const response = await fetch(`${API_URL}lookup.php?i=${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // 詳細情報が取得できたかチェック
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('献立詳細の取得に失敗:', error);
        return null;
    }
}

/**
 * 検索条件（ジャンルまたは食材）からランダムな献立IDを取得する関数
 * @param {string} type - フィルタータイプ ('c' for category, 'i' for ingredient)
 * @param {string} value - フィルターの値 (例: 'Japanese', 'Chicken')
 * @returns {string|null} ランダムに選ばれた献立ID (idMeal)
 */
async function fetchRandomMealIdFromFilter(type, value) {
    try {
        const response = await fetch(`${API_URL}filter.php?${type}=${value}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 料理リストが取得できたかチェック
        if (data.meals && data.meals.length > 0) {
            const meals = data.meals;
            const randomIndex = Math.floor(Math.random() * meals.length);
            return meals[randomIndex].idMeal;
        }
        return null; // 料理が見つからない場合
    } catch (error) {
        console.error('フィルター検索に失敗:', error);
        return null;
    }
}


/**
 * 取得した献立情報をHTMLに表示する関数
 * @param {Object} meal - 献立の詳細オブジェクト
 */
function displayMeal(meal) {
    const resultDisplay = document.getElementById('meal-display');
    const ingredientsList = [];
    
    // 画像URLの有無をチェックし、無ければ代替画像を設定
    const imageUrl = meal.strMealThumb && meal.strMealThumb.trim() !== '' 
        ? meal.strMealThumb 
        : 'https://via.placeholder.com/200x200?text=No+Image'; // 代替画像URL
    
    // 材料を抽出
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        // ingredient の値が空でなく、nullでもないことを確認
        if (ingredient && ingredient.trim() !== '') {
            ingredientsList.push(`<li>${ingredient} (${measure ? measure.trim() : '適量'})</li>`);
        }
    }

    resultDisplay.innerHTML = `
        <div class="meal-card">
            <img src="${imageUrl}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3>${meal.strMeal}</h3>
                <p><strong>カテゴリー:</strong> ${meal.strCategory || 'N/A'}</p>
                <p><strong>地域:</strong> ${meal.strArea || 'N/A'}</p>
                <h4>主な材料:</h4>
                <ul class="ingredient-list">
                    ${ingredientsList.slice(0, 5).join('')}
                    ${ingredientsList.length > 5 ? '<li>...他</li>' : ''}
                </ul>
                <p><a href="${meal.strSource || meal.strYoutube}" target="_blank">詳しいレシピを見る (外部サイト)</a></p>
            </div>
        </div>
    `;
}


// --- メイン処理 ---
document.getElementById('decide-button').addEventListener('click', async () => {
    const categoryChecks = document.querySelectorAll('input[name="category"]:checked');
    const filterChecks = document.querySelectorAll('input[name="filter"]:checked'); // 食材/タイプ選択
    const resultDisplay = document.getElementById('meal-display');

    const selectedCategories = Array.from(categoryChecks).map(cb => cb.value);
    const selectedFilters = Array.from(filterChecks).map(cb => cb.value);

    // ロード中メッセージを表示
    resultDisplay.innerHTML = '<p>献立を探しています...</p>';

    let mealId = null;
    let meal = null;
    
    // 1. 食材/タイプ (Filter) が選択されている場合
    if (selectedFilters.length > 0) {
        // ランダムに一つのフィルターを選択し、IDを取得
        const randomFilter = selectedFilters[Math.floor(Math.random() * selectedFilters.length)];
        mealId = await fetchRandomMealIdFromFilter('i', randomFilter);
    }
    
    // 2. 食材検索で見つからなかった、または食材が選択されておらず、ジャンル(Category)が選択されている場合
    if (!mealId && selectedCategories.length > 0) {
        // ランダムに一つのジャンルを選択し、IDを取得
        const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
        mealId = await fetchRandomMealIdFromFilter('c', randomCategory);
    }
    
    // 3. どちらの条件も選択されていない、または条件検索でIDが見つからなかった場合
    if (!mealId) {
        // 完全にランダムな献立を取得
        try {
            const response = await fetch(`${API_URL}random.php`);
            const data = await response.json();
            if (data.meals && data.meals.length > 0) {
                meal = data.meals[0]; // random.phpは詳細情報を含むため、fetchMealDetailsは不要
            }
        } catch (error) {
            console.error('完全ランダム検索に失敗:', error);
        }
    } else {
        // IDが取得できていれば、詳細情報を取得
        meal = await fetchMealDetails(mealId);
    }

    // --- 結果の表示 ---
    if (meal) {
        displayMeal(meal);
    } else {
        resultDisplay.innerHTML = '<p>😭 申し訳ありません。お選びの条件に合う献立、またはランダムな献立を見つけることができませんでした。</p>';
    }
});
