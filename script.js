/**
 * 料理IDから詳細情報を取得する関数 (変更なし)
 * @param {string} id - 料理のID (idMeal)
 * @returns {Object|null} 料理の詳細オブジェクト
 */
async function fetchMealDetails(id) {
    // lookup.php?i= で詳細を取得
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Meal details fetch failed:', error);
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
    
    // 材料を最大20個まで抽出
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient) {
            ingredientsList.push(`<li>${ingredient} (${measure})</li>`);
        }
    }

    // 【ここを修正！】画像URLの有無をチェックし、無ければ代替画像を設定
    const imageUrl = meal.strMealThumb && meal.strMealThumb.trim() !== '' 
        ? meal.strMealThumb 
        : 'https://via.placeholder.com/150x150?text=No+Image'; // 代替画像（プレースホルダー）

    resultDisplay.innerHTML = `
        <div class="meal-card">
            <img src="${imageUrl}" alt="${meal.strMeal}">
            <div class="meal-info">
                <h3>${meal.strMeal}</h3>
                <p><strong>カテゴリー:</strong> ${meal.strCategory}</p>
                <p><strong>地域:</strong> ${meal.strArea}</p>
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

document.getElementById('decide-button').addEventListener('click', async () => {
    const categoryChecks = document.querySelectorAll('input[name="category"]:checked');
    const ingredientChecks = document.querySelectorAll('input[name="ingredient"]:checked');
    const resultDisplay = document.getElementById('meal-display');

    const selectedCategories = Array.from(categoryChecks).map(cb => cb.value);
    const selectedIngredients = Array.from(ingredientChecks).map(cb => cb.value);

    if (selectedCategories.length === 0 && selectedIngredients.length === 0) {
        resultDisplay.innerHTML = '<p>⚠️ **ジャンル**または**食材**を一つ以上選択してください。</p>';
        return;
    }

    resultDisplay.innerHTML = '<p>献立を探しています...</p>';

    let meal = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 5; // 最大試行回数を設定

    // 検索条件に合致する献立が見つかるまで試行
    while (!meal && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // 1. 食材で検索
        if (selectedIngredients.length > 0) {
            const randomIngredient = selectedIngredients[Math.floor(Math.random() * selectedIngredients.length)];
            
            try {
                const response = await fetch(`https://www
