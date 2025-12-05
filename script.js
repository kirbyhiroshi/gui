// TheMealDBのベースURL
const API_URL = 'https://www.themealdb.com/api/json/v1/1/';
const resultDisplay = document.getElementById('meal-display'); // 頻繁に使う要素をグローバルに定義（またはメイン関数外で定義）

/**
 * 結果表示エリアにメッセージを出力する関数
 * @param {string} message - 出力するHTML文字列
 */
function updateDisplay(message) {
    resultDisplay.innerHTML = message;
}

/**
 * 料理IDから詳細情報を取得する関数
 * @param {string} id - 料理のID (idMeal)
 * @returns {Object|null} 料理の詳細オブジェクト
 */
async function fetchMealDetails(id) {
    try {
        const response = await fetch(`${API_URL}lookup.php?i=${id}`);
        if (!response.ok) {
            console.error(`HTTP Error for Meal Details: Status ${response.status}`);
            return null;
        }
        const data = await response.json();
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
    // 値の中に半角スペースが含まれる場合（例: 'French'）はURLエンコードが必要なため、
    // TheMealDBのAPIリファレンスに合わせて、今回はそのまま使用しますが、
    // 将来的にURLエンコード(`encodeURIComponent(value)`)を検討してください。
    
    // API URLをログに出力し、デバッグを助けます
    const filterUrl = `${API_URL}filter.php?${type}=${value}`;
    console.log(`🔍 フィルター検索URL: ${filterUrl}`); 
    
    try {
        const response = await fetch(filterUrl);
        if (!response.ok) {
            console.error(`HTTP Error for Filter Search: Status ${response.status} for value ${value}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // TheMealDBは結果がない場合 { meals: null } を返す
        if (data.meals && data.meals.length > 0) {
            const meals = data.meals;
            const randomIndex = Math.floor(Math.random() * meals.length);
            console.log(`✅ フィルター検索成功。${meals.length}件から1件を選択。`);
            return meals[randomIndex].idMeal;
        }
        console.warn(`⚠️ フィルター検索結果なし: ${value}`);
        return null; // 料理が見つからない場合
    } catch (error) {
        console.error('フィルター検索に失敗:', error);
        return null;
    }
}


/**
 * 取得した献立情報をHTMLに表示する関数 (変更なし)
 * @param {Object} meal - 献立の詳細オブジェクト
 */
function displayMeal(meal) {
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
                <p><a href="${meal.strSource || meal.strYoutube || '#'}" target="_blank">詳しいレシピを見る (外部サイト)</a></p>
            </div>
        </div>
    `;
}


// --- メイン処理 ---
document.getElementById('decide-button').addEventListener('click', async () => {
    const categoryChecks = document.querySelectorAll('input[name="category"]:checked');
    const filterChecks = document.querySelectorAll('input[name="filter"]:checked'); // 食材/タイプ選択

    const selectedCategories = Array.from(categoryChecks).map(cb => cb.value);
    const selectedFilters = Array.from(filterChecks).map(cb => cb.value);
    
    console.log('--- クリックイベント開始 ---');
    console.log('選択されたジャンル:', selectedCategories);
    console.log('選択された食材/タイプ:', selectedFilters);

    // ロード中メッセージを表示
    updateDisplay('<p>献立を探しています...</p>');

    let mealId = null;
    let meal = null;
    
    // 1. 食材/タイプ (Filter: i) が選択されている場合
    if (selectedFilters.length > 0) {
        // ランダムに一つのフィルターを選択し、IDを取得
        const randomFilter = selectedFilters[Math.floor(Math.random() * selectedFilters.length)];
        // TheMealDBのAPIは、'Noodles', 'Dessert'など一部の食材/タイプにデータがないか、
        // フィルターとして認識されない場合があります。
        mealId = await fetchRandomMealIdFromFilter('i', randomFilter);
    }
    
    // 2. 食材検索で見つからなかった、または食材が選択されておらず、ジャンル(Category: c)が選択されている場合
    if (!mealId && selectedCategories.length > 0) {
        // ランダムに一つのジャンルを選択し、IDを取得
        const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
        
        // TheMealDBは「Japanese」など一部のカテゴリを認識しない場合があります。
        // （例: TheMealDBのカテゴリは 'Beef', 'Chicken' など食材名が多い）
        mealId = await fetchRandomMealIdFromFilter('c', randomCategory);
    }
    
    // 3. どちらの条件も選択されていない、または条件検索でIDが見つからなかった場合
    if (!mealId) {
        // 完全にランダムな献立を取得
        console.log('🔄 条件が見つからないため、完全ランダム検索を実行します。');
        try {
            const response = await fetch(`${API_URL}random.php`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.meals && data.meals.length > 0) {
                meal = data.meals[0]; // random.phpは詳細情報を含むため、fetchMealDetailsは不要
                console.log('✅ 完全ランダム検索成功。');
            }
        } catch (error) {
            console.error('完全ランダム検索に失敗:', error);
        }
    } else if (mealId) {
        // IDが取得できていれば、詳細情報を取得
        console.log(`ID ${mealId} の詳細情報を取得します...`);
        meal = await fetchMealDetails(mealId);
    }

    // --- 結果の表示 ---
    if (meal) {
        displayMeal(meal);
    } else {
        updateDisplay('<p style="color:red;">😭 申し訳ありません。**お選びの条件（特にジャンル/食材）**に合う献立を見つけることができませんでした。または、API接続に失敗しました。コンソールを確認してください。</p>');
    }
});
