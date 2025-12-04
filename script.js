document.getElementById('decide-button').addEventListener('click', async () => {
    const categoryChecks = document.querySelectorAll('input[name="category"]:checked');
    const ingredientChecks = document.querySelectorAll('input[name="ingredient"]:checked');
    const resultDisplay = document.getElementById('meal-display');

    // 選択された値を配列に格納
    const selectedCategories = Array.from(categoryChecks).map(cb => cb.value);
    const selectedIngredients = Array.from(ingredientChecks).map(cb => cb.value);

    // 選択肢がない場合の処理
    if (selectedCategories.length === 0 && selectedIngredients.length === 0) {
        resultDisplay.innerHTML = '<p>⚠️ **ジャンル**または**食材**を一つ以上選択してください。</p>';
        return;
    }

    // 表示をクリアし、ロード中メッセージを表示
    resultDisplay.innerHTML = '<p>献立を探しています...</p>';

    // --- 献立を検索するロジック ---

    let meal = null;
    let url = '';

    // 1. 食材(Ingredient)が選択されている場合、食材で検索を試みる (APIが対応しているため優先)
    if (selectedIngredients.length > 0) {
        // ランダムに一つの食材を選択
        const randomIngredient = selectedIngredients[Math.floor(Math.random() * selectedIngredients.length)];
        
        // 食材で検索 (Filter by main ingredient)
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${randomIngredient}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.meals && data.meals.length > 0) {
                // 食材に該当する料理が複数ある場合、ランダムに一つ選ぶ
                const randomMealId = data.meals[Math.floor(Math.random() * data.meals.length)].idMeal;
                
                // 選ばれた料理の詳細を取得
                meal = await fetchMealDetails(randomMealId, selectedCategories);
            }
        } catch (error) {
            console.error('Ingredient search failed:', error);
        }
    }
    
    // 2. 食材検索で見つからなかった、または食材が選択されておらず、ジャンル(Category)が選択されている場合
    if (!meal && selectedCategories.length > 0) {
        // ランダムに一つのジャンルを選択
        const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
        
        // ジャンルで検索 (Filter by Category)
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${randomCategory}`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.meals && data.meals.length > 0) {
                // ジャンルに該当する料理が複数ある場合、ランダムに一つ選ぶ
                const randomMealId = data.meals[Math.floor(Math.random() * data.meals.length)].idMeal;
                
                // 選ばれた料理の詳細を取得
                meal = await fetchMealDetails(randomMealId);
            }
        } catch (error) {
            console.error('Category search failed:', error);
        }
    }
    
    // 3. どちらも選択されていないか、検索で見つからなかった場合、完全にランダムな料理を取得
    if (!meal) {
        // 選択肢が一つもなければ完全にランダムを取得
        if(selectedCategories.length === 0 && selectedIngredients.length === 0) {
            url = 'https://www.themealdb.com/api/json/v1/1/random.php';
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.meals && data.meals.length > 0) {
                    meal = data.meals[0];
                }
            } catch (error) {
                console.error('Random search failed:', error);
            }
        } else {
            // 選択肢はあったがAPIで見つからなかった
            resultDisplay.innerHTML = '<p>😭 申し訳ありません。お選びの条件に合う献立は見つかりませんでした。</p>';
            return;
        }
    }

    // --- 結果の表示 ---
    if (meal) {
        displayMeal(meal);
    } else {
        resultDisplay.innerHTML = '<p>😭 献立の取得に失敗しました。もう一度お試しください。</p>';
    }
});

/**
 * 料理IDから詳細情報を取得する関数
 * @param {string} id - 料理のID (idMeal)
 * @returns {Object|null} 料理の詳細オブジェクト
 */
async function fetchMealDetails(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    try {
        const response = await fetch(url);
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

    resultDisplay.innerHTML = `
        <div class="meal-card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
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
