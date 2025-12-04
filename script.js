// ... (既存のコード: getMealBtn, mealDisplay, API_URL の定義)

/**
 * 【重要】翻訳APIと連携する非同期関数（この部分は実際に使用するAPIに合わせて書き換える必要があります）
 * * 外部の翻訳サービス（Google Apps Script、DeepLなど）を呼び出し、テキストを翻訳します。
 * @param {string} textToTranslate - 翻訳したい英語のテキスト
 * @returns {Promise<string>} 翻訳された日本語のテキスト
 */
async function translateText(textToTranslate) {
    // 💡 注意：この関数は単なる例です。実際に動作させるには、
    // Google Apps ScriptやDeepLなどのサービス側でエンドポイントを準備する必要があります。
    
    // 例として、外部の翻訳APIエンドポイント（仮）を使用
    const TRANSLATION_ENDPOINT = 'YOUR_TRANSLATION_SERVICE_URL'; 

    try {
        const response = await fetch(TRANSLATION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: textToTranslate, 
                targetLang: 'ja' 
            })
        });

        if (!response.ok) {
            throw new Error(`翻訳エラー: ${response.status}`);
        }

        const result = await response.json();
        // 戻り値の形式に応じて、翻訳結果を抽出
        return result.translatedText; 

    } catch (error) {
        console.error('翻訳中にエラー:', error);
        // エラー時は元のテキストを返すか、エラーメッセージを返す
        return `[翻訳エラーのため原文表示: ${textToTranslate}]`;
    }
}


/**
 * 献立をランダムで取得し、画面に表示する関数（修正版）
 */
async function getRandomMeal() {
    mealDisplay.innerHTML = '<p>献立を選んでいます...少々お待ちください⏳</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTPエラー！ステータス: ${response.status}`);
        }
        const data = await response.json();
        const meal = data.meals[0];

        if (meal) {
            // ------------------------------------------------
            // 🌟 翻訳処理の追加 🌟
            // ------------------------------------------------
            mealDisplay.innerHTML = '<p>献立を見つけました！日本語に翻訳中です...🇯🇵</p>';

            // 翻訳が必要なテキストを抽出
            const mealName_en = meal.strMeal;
            const instructions_en = meal.strInstructions;
            
            // 翻訳を実行
            const mealName_ja = await translateText(mealName_en);
            const instructions_ja = await translateText(instructions_en);
            
            // 翻訳結果を反映したオブジェクトを作成
            const meal_ja = {
                ...meal, // 元のデータをコピー
                strMeal: mealName_ja, // 料理名を日本語に上書き
                strInstructions: instructions_ja // 説明文を日本語に上書き
            };
            
            // 翻訳済みオブジェクトを画面表示関数に渡す
            displayMeal(meal_ja);
            // ------------------------------------------------

        } else {
            mealDisplay.innerHTML = '<p>ごめんなさい、料理を見つけられませんでした😔</p>';
        }

    } catch (error) {
        console.error('献立の取得中にエラーが発生しました:', error);
        mealDisplay.innerHTML = `<p>エラーが発生しました: ${error.message}</p><p>インターネット接続やAPIの状況を確認してください。</p>`;
    }
}

/**
 * 取得した料理の詳細を画面に描画する関数（変更なしで利用可能）
 * @param {Object} meal - 取得した料理オブジェクト（日本語化されていることを期待）
 */
function displayMeal(meal) {
    // この関数は、mealオブジェクトのプロパティが既に日本語になっていることを前提に、
    // 前回のコードと全く同じロジックで表示できます。
    const mealHtml = `
        <h2>${meal.strMeal}</h2>
        <p>カテゴリー: <strong>${meal.strCategory || '不明'}</strong></p>
        <p>地域: <strong>${meal.strArea || '不明'}</strong></p>
        ${meal.strMealThumb ? `<img src="${meal.strMealThumb}" alt="${meal.strMeal}の画像">` : ''}
        <p>作り方の簡単なヒント: ${meal.strInstructions ? meal.strInstructions.substring(0, 150) + '...' : '情報なし'}</p>
        ${meal.strSource ? `<p><a href="${meal.strSource}" target="_blank">レシピの詳細を見る 🔗</a></p>` : ''}
    `;
    
    mealDisplay.innerHTML = mealHtml;
}

// ... (既存のコード: イベントリスナーとDOMContentLoaded の処理)
getMealBtn.addEventListener('click', getRandomMeal);

document.addEventListener('DOMContentLoaded', () => {
    mealDisplay.innerHTML = '<p>ボタンを押して、今日の献立を決めましょう！</p>';
});
