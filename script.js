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
 * 献立をランダムで取得し、画面に表示する関数
 */
async function getRandomMeal() {
    mealDisplay.innerHTML = '<p>献立を選んでいます...少々お待ちください⏳</p>';

    // 1. 選択されたジャンル（地域）とカテゴリーを取得
    const selectedAreas = Array.from(areaCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    
    // カテゴリーはカンマ区切りでまとめられている場合があるため、flat()で平坦化
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value.split(','))
        .flat(); 
    
    // 選択された検索条件を全て格納する配列を作成
    const allSearchQueries = [];
    
    // 地域検索クエリを追加
    selectedAreas.forEach(area => {
        allSearchQueries.push({ type: 'area', value: area, url: `${LIST_API_URL_AREA}${area}` });
    });

    // カテゴリー検索クエリを追加
    selectedCategories.forEach(category => {
        allSearchQueries.push({ type: 'category', value: category, url: `${LIST_API_URL_CATEGORY}${category}` });
    });

    // 2. 検索条件のチェック
    if (allSearchQueries.length === 0) {
        mealDisplay.innerHTML = '<p>献立のジャンルまたは食材を1つ以上選択してください！</p>';
        return;
    }

    try {
        // 3. 全ての検索クエリを並列実行し、結果を待つ
        const fetchPromises = allSearchQueries.map(query => 
            fetch(query.url)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`APIエラー (${query.type}: ${query.value}): ${response.status}`);
                        return null; 
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(`Fetchエラー (${query.type}: ${query.value}):`, error);
                    return null; 
                })
        );

        const results = await Promise.all(fetchPromises);
        
        // 4. 全てのリストを結合し、重複を排除（Setを使用）
        let allMealIds = new Set();
        
        results.forEach(data => {
            if (data && data.meals && Array.isArray(data.meals)) {
                data.meals.forEach(meal => allMealIds.add(meal.idMeal));
            }
        });
        
        // 5. 料理が見つからなかった場合の処理
        const finalMealIds = Array.from(allMealIds);

        if (finalMealIds.length === 0) {
            mealDisplay.innerHTML = '<p>選択された条件に一致する料理が見つかりませんでした😔</p>';
            return;
        }

        // 6. ランダムにIDを選択し、詳細情報を取得
        const randomIndex = Math.floor(Math.random() * finalMealIds.length);
        const randomMealId = finalMealIds[randomIndex];
        
        const detailResponse = await fetch(`${DETAIL_API_URL}${randomMealId}`);
        if (!detailResponse.ok) {
             throw new Error(`料理の詳細情報取得に失敗しました。ステータス: ${detailResponse.status}`);
        }
        const detailData = await detailResponse.json();
        const meal = detailData.meals[0];

        // 7. 画面に表示
        if (meal) {
            displayMeal(meal);
        } else {
             mealDisplay.innerHTML = '<p>料理データの読み込み中にエラーが発生しました。</p>';
        }

    } catch (error) {
        console
