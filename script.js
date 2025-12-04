// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');

// TheMealDBのランダム取得エンドポイント
const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

// ★★★ 1. 【ここが最重要】GASでデプロイした最新のURLを貼り付けてください ★★★
// URLを貼り付けていない場合、翻訳処理はスキップされ、ランダム表示のみが動作します。
const TRANSLATION_ENDPOINT = '【ここに最新のGASのURLを貼り付け】'; 


/**
 * 複数のテキストをまとめて翻訳する関数
 * 翻訳に失敗しても、元の英語テキストを返すことでメイン処理をブロックしない。
 */
async function translateTexts(textsToTranslate) {
    // 翻訳URLが設定されていない、または不正な場合は翻訳をスキップし、元のテキストを返す
    if (!TRANSLATION_ENDPOINT || !TRANSLATION_ENDPOINT.startsWith('http')) {
        console.warn("TRANSLATION_ENDPOINTが設定されていないため、翻訳をスキップします。");
        return textsToTranslate;
    }
    
    try {
        const response = await fetch(TRANSLATION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                texts: textsToTranslate, 
                targetLang: 'ja' 
            })
        });

        if (!response.ok) {
            // 翻訳API側のエラー（400番台、500番台など）が発生した場合
            throw new Error(`翻訳APIエラー！HTTPステータス: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.translatedTexts) {
            return result.translatedTexts;
        } else {
            // GASで処理エラーが発生した場合（result.errorがある場合）
            throw new Error(result.error || '翻訳結果が取得できませんでした。');
        }

    } catch (error) {
        console.error('翻訳中にエラーが発生しました。原文を表示します:', error);
        // 翻訳に失敗した場合、元のテキストを返す
        return textsToTranslate;
    }
}


/**
 * 取得した料理の詳細を画面に描画する関数
 */
function displayMeal(meal, isTranslated = false) {
    const translationStatus = isTranslated ? '' : ' (翻訳中...)';

    const mealHtml = `
        <h2>${meal.strMeal}${translationStatus}</h2>
        <p>カテゴリー: <strong>${meal.strCategory || '不明'}</strong></p>
        <p>地域: <strong>${meal.strArea || '不明'}</strong></p>
        ${meal.strMealThumb ? `<img src="${meal.strMealThumb}" alt="${meal.strMeal}の画像">` : ''}
        <p>作り方の簡単なヒント: ${meal.strInstructions ? meal.strInstructions.substring(0, 150) + '...' : '情報なし'}</p>
        ${meal.strSource ? `<p><a href="${meal.strSource}" target="_blank">レシピの詳細を見る 🔗</a></p>` : ''}
    `;
    
    mealDisplay.innerHTML = mealHtml;
}


/**
 * 翻訳処理を行い、画面表示を日本語に更新する関数（非同期で実行）
 * メインのgetRandomMealをブロックしないよう、awaitを付けずに呼び出す
 */
async function updateMealDisplayWithTranslation(meal) {
    const textsToTranslate = [
        meal.strMeal,         
        meal.strCategory,     
        meal.strArea,         
        meal.strInstructions, 
    ];
    
    const [
        mealName_ja, 
        category_ja, 
        area_ja, 
        instructions_ja
    ] = await translateTexts(textsToTranslate);
    
    // 翻訳失敗時は元の英語が返ってくるため、そのまま表示を更新
    const meal_ja = {
        ...meal, 
        strMeal: mealName_ja,
        strCategory: category_ja,
        strArea: area_ja,
        strInstructions: instructions_ja 
    };
    
    displayMeal(meal_ja, true);
}


/**
 * 献立をランダムで取得し、画面に表示する関数（ランダム機能の安定版）
 */
async function getRandomMeal() {
    mealDisplay.innerHTML = '<p>献立を選んでいます...少々お待ちください⏳</p>';

    try {
        // 1. 献立データの取得（エラー耐性を持たせ、ここで失敗したら即座にエラー表示）
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`TheMealDBからのデータ取得に失敗しました。ステータス: ${response.status}`);
        }
        const data = await response.json();
        const meal = data.meals[0]; // 料理データは必ず配列の最初の要素
        
        if (meal) {
            // 2. まず英語のまま、画面に表示する
            displayMeal(meal, false);

            // 3. 翻訳プロセスを**非同期**で開始する（メイン処理をブロックしない）
            updateMealDisplayWithTranslation(meal);
            
        } else {
            mealDisplay.innerHTML = '<p>ごめんなさい、料理を見つけられませんでした😔</p>';
        }

    } catch (error) {
        // 致命的なエラーが発生した場合（例: TheMealDBへの接続失敗）
        console.error('致命的なエラー:', error);
        mealDisplay.innerHTML = `<p>エラーが発生しました: ${error.message}</p><p>インターネット接続またはTheMealDB APIを確認してください。</p>`;
    }
}


// 4. ボタンが押されたらgetRandomMeal関数を実行
// ページロード時に要素が確実に存在するため、この記述で動作します。
getMealBtn.addEventListener('click', getRandomMeal);

// ページ読み込み時の初期メッセージを明示的に設定
mealDisplay.innerHTML = '<p>ボタンを押して、今日の献立を決めましょう！</p>';
