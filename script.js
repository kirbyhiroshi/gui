// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');
// チェックボックスのNodeListを取得
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
        .filter(cb => cb.checked) // チェックされているもののみを抽出
        .map(cb => cb.value);     // value（例: Japanese, Chinese）を取得

    if (selectedAreas.length === 0) {
        mealDisplay.innerHTML = '<p>献立のジャンルを1つ以上選択してください！</p>';
        return;
    }

    try {
        // 2. 選択された地域ごとのデータ取得処理をまとめて実行
        // Promise.allを使って全てのAPI呼び出しを並列で開始
        const fetchPromises = selectedAreas.map(area => 
            fetch(`${LIST_API_URL}${area}`)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`地域: ${area} のデータ取得に失敗しました。`);
                        return null; // 失敗時はnullを返す
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(`Fetchエラー（${area}）:`, error);
                    return null; // 通信エラー時もnullを返す
                })
        );

        // 全てのレスポンスを待つ
        const results = await Promise.all(fetchPromises);
        
        // 3. 取得した全料理リストからIDを抽出して一つの配列にまとめる
        let mealIds = [];
        
        results.forEach(data => {
            // データが正常に取得され、かつ料理リストが存在する場合のみ処理
            if (data && data.meals && Array.isArray(data.meals)) {
                const ids = data.meals.map(meal => meal.idMeal);
                mealIds = mealIds.concat(ids);
            }
        });
        
        // 4. 料理が見つからなかった場合の処理
        if (mealIds.length === 0) {
            mealDisplay.innerHTML = '<p>選択されたジャンルに一致する料理が見つかりませんでした😔<br>別のジャンルを選択するか、すべてのチェックを外してランダムにしてください。</p>';
            return;
        }

        // 5. 取得した全料理IDリストからランダムで一つ選択
        const randomIndex = Math.floor(Math.random() * mealIds.length);
        const randomMealId = mealIds[randomIndex];
        
        // 6. 選択した料理IDの詳細情報を取得
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
        console.error('献立の取得中に致命的なエラーが発生しました:', error);
        mealDisplay.innerHTML = `<p>エラーが発生しました: ${error.message}</p><p>インターネット接続やAPIの状況を確認してください。</p>`;
    }
}


/**
 * 取得した料理の詳細を画面に描画する関数
 * (表示ロジックは変更なし)
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


// ボタンが押されたらgetRandomMeal関数を実行するように設定
getMealBtn.addEventListener('click', getRandomMeal);
