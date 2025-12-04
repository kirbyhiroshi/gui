// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');

// TheMealDBのランダム取得エンドポイント
const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

// ★★★ 1. GASで再デプロイして取得した【最新の】URLをここに貼り付け直してください ★★★
const TRANSLATION_ENDPOINT = '【ここに最新のGASのURLを貼り付け】'; 
// ★★★ 例：'https://script.google.com/macros/s/AKfyc.../exec' ★★★


/**
 * 複数のテキストをまとめて翻訳する関数
 * @param {string[]} textsToTranslate - 翻訳したい英語のテキストの配列
 * @returns {Promise<string[]>} 翻訳された日本語のテキストの配列
 */
async function translateTexts(textsToTranslate) {
    // 全て空のテキストだった場合やURLが設定されていない場合のガード
    if (textsToTranslate.every(text => !text) || !TRANSLATION_ENDPOINT.startsWith('http')) {
        console.warn("翻訳URLが不正、または翻訳対象テキストがありません。");
        return textsToTranslate;
    }
    
    try {
        const response = await fetch(TRANSLATION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                texts: textsToTranslate, // 配列で送信
                targetLang: 'ja' 
            })
        });

        if (!response.ok) {
            throw new Error(`翻訳APIエラー！HTTPステータス: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.translatedTexts) {
            // 翻訳結果の配列を返す
            return result.translatedTexts;
        } else {
            // GAS側でエラーが起きた場合（例: result.errorが存在する場合）
            throw new Error(result.error || '翻訳結果が取得できませんでした。');
        }

    } catch (error) {
        console.error('翻訳中にエラーが発生しました:', error);
        // エラー時は元のテキストの配列をそのまま返す
        // (これにより、画面には英語原文が表示される)
        return textsToTranslate.map(text => `[翻訳失敗: ${text}]`);
    }
}


/**
 * 献立をランダムで取得し、画面に表示する関数
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
            
            mealDisplay.innerHTML = '<p>献立を見つけました！日本語に翻訳中です...🇯🇵</p>';

            // 翻訳が必要なテキストを配列にまとめる（順番が重要！）
            const textsToTranslate = [
                meal.strMeal,         // 0: 料理名
                meal.strCategory,     // 1: カテゴリー
                meal.strArea,         // 2: 地域
                meal.strInstructions, // 3: 説明文 (長いですが、ついでに翻訳)
            ];
            
            // GASのAPIを一度だけ呼び出し、全ての翻訳をまとめて取得
            const [
                mealName_ja, 
                category_ja, 
                area_ja, 
                instructions_ja
            ] = await translateTexts(textsToTranslate);
            
            // 翻訳結果を反映したオブジェクトを作成
            const meal_ja = {
                ...meal, 
                strMeal: mealName_ja,
                strCategory: category_ja,
                strArea: area_ja,
                strInstructions: instructions_ja 
            };
            
            displayMeal(meal_ja);

        } else {
            mealDisplay.innerHTML = '<p>ごめんなさい、料理を見つけられませんでした😔</p>';
        }

    } catch (error) {
        console.error('献立の取得中にエラーが発生しました:', error);
        mealDisplay.innerHTML = `<p>エラーが発生しました: ${error.message}</p><p>インターネット接続やAPIの状況を確認してください。</p>`;
    }
}

/**
 * 取得した料理の詳細を画面に描画する関数
 * @param {Object} meal - 取得した料理オブジェクト（日本語化されていることを期待）
 */
function displayMeal(meal) {
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


// イベントリスナー
getMealBtn.addEventListener('click', getRandomMeal);
document.addEventListener('DOMContentLoaded', () => {
    mealDisplay.innerHTML = '<p>ボタンを押して、今日の献立を決めましょう！</p>';
});
