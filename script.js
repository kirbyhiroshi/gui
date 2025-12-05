// TheMealDBのベースURL
const API_URL = 'https://www.themealdb.com/api/json/v1/1/';

// ★★★ 追加する定数 ★★★
// Google Cloud Translation APIのベースURL
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
// 取得したAPIキーに置き換えてください
const TRANSLATE_API_KEY = 'YOUR_GOOGLE_TRANSLATE_API_KEY'; 

// 既存の関数（fetchMealDetails, fetchRandomMealIdFromFilter）は変更なし...

/**
 * テキストを日本語に翻訳する関数 (Google Cloud Translation APIを使用)
 * @param {string} text - 翻訳したい英語のテキスト
 * @returns {string} 翻訳された日本語のテキスト、または元のテキスト（失敗時）
 */
async function translateText(text) {
    if (!text || text.trim() === '') return '';

    try {
        const response = await fetch(`${TRANSLATE_API_URL}?key=${TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: 'ja', // ターゲット言語を日本語に設定
                source: 'en', // ソース言語を英語に設定 (TheMealDBのデータが英語のため)
                format: 'text'
            }),
        });

        if (!response.ok) {
            throw new Error(`Translation API error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // 翻訳結果を返す
        return data.data.translations[0].translatedText;

    } catch (error) {
        console.error('翻訳に失敗:', error);
        // 失敗した場合は元のテキストをそのまま返す
        return text; 
    }
}


/**
 * 取得した献立情報をHTMLに表示する関数
 * @param {Object} meal - 献立の詳細オブジェクト
 */
async function displayMeal(meal) { // ★★★ asyncを追記 ★★★
    const resultDisplay = document.getElementById('meal-display');
    const ingredientsList = [];
    
    // 画像URLの有無をチェックし、無ければ代替画像を設定
    const imageUrl = meal.strMealThumb && meal.strMealThumb.trim() !== '' 
        ? meal.strMealThumb 
        : 'https://via.placeholder.com/200x200?text=No+Image'; // 代替画像URL
    
    // ★★★ 献立名、カテゴリー、地域を翻訳 ★★★
    const translatedMealName = await translateText(meal.strMeal);
    const translatedCategory = await translateText(meal.strCategory || 'N/A');
    const translatedArea = await translateText(meal.strArea || 'N/A');

    // 材料を抽出と翻訳
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        // ingredient の値が空でなく、nullでもないことを確認
        if (ingredient && ingredient.trim() !== '') {
            // 材料名を翻訳
            const translatedIngredient = await translateText(ingredient); 
            ingredientsList.push(`<li>${translatedIngredient} (${measure ? measure.trim() : '適量'})</li>`);
        }
    }

    resultDisplay.innerHTML = `
        <div class="meal-card">
            <img src="${imageUrl}" alt="${translatedMealName}">
            <div class="meal-info">
                <h3>${translatedMealName}</h3>
                <p><strong>カテゴリー:</strong> ${translatedCategory}</p>
                <p><strong>地域:</strong> ${translatedArea}</p>
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
// ... (メイン処理の他の部分は変更なし)
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
        // mealオブジェクトのデータは英語だが、displayMeal内で翻訳される
        await displayMeal(meal); // ★★★ awaitを追記 ★★★
    } else {
        resultDisplay.innerHTML = '<p>😭 申し訳ありません。お選びの条件に合う献立、またはランダムな献立を見つけることができませんでした。</p>';
    }
});
