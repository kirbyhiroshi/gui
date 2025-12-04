// HTML要素を取得
const getMealBtn = document.getElementById('get-meal-btn');
const mealDisplay = document.getElementById('meal-display');

// TheMealDBのランダム取得エンドポイント
const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

// ★★★ 1. ここにGASでデプロイした最新のURLを貼り付け直してください ★★★
const TRANSLATION_ENDPOINT = '【ここに最新のGASのURLを貼り付け】'; 


/**
 * 複数のテキストをまとめて翻訳する関数 (変更なし)
 * @param {string[]} textsToTranslate - 翻訳したい英語のテキストの配列
 * @returns {Promise<string[]>} 翻訳された日本語のテキストの配列
 */
async function translateTexts(textsToTranslate) {
    if (textsToTranslate.every(text => !text) || !TRANSLATION_ENDPOINT.startsWith('http')) {
        console.warn("翻訳URLが不正、または翻訳対象テキストがありません。翻訳をスキップします。");
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
            throw new Error(`翻訳APIエラー！HTTPステータス: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.translatedTexts) {
            return result.translatedTexts;
        } else {
            throw new Error(result.error || '翻訳結果が取得できませんでした。');
        }

    } catch (error) {
        console.error('翻訳中にエラーが発生しました:', error);
        // エラー時は元のテキストの配列をそのまま返す
        return textsToTranslate;
    }
}


/**
 * 取得した料理の詳細を画面に描画する関数
 * @param {Object} meal - 取得した料理オブジェクト
 */
function displayMeal(meal, isTranslated = false) {
    const mealHtml = `
        <h2>${meal.strMeal} ${isTranslated ? '' : '(翻訳中...)'}</h2>
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
 * @param {Object} meal - 取得した料理オブジェクト（英語）
 */
async function updateMealDisplayWithTranslation(meal) {
    // 翻訳が必要なテキストを配列にまとめる（順番が重要！）
    const textsToTranslate = [
        meal.strMeal,         // 0: 料理名
        meal.strCategory,     // 1: カテゴリー
        meal.strArea,         // 2: 地域
        meal.strInstructions, // 3: 説明文
    ];
    
    // 翻訳実行
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
    
    // 翻訳後のデータを画面に再表示（isTranslatedをtrueで渡す）
    displayMeal(meal_ja, true);
}


/**
 * 献立をランダムで取得し、画面に表示する関数（ランダム機能の安定性を確保）
 */
async function getRandomMeal() {
    mealDisplay.innerHTML = '<p>献立を選んでいます...少々お待ちください⏳</
