<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>献立ランダムメーカー</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <header>
        <h1>🍽️ 献立ランダムメーカー</h1>
        <p>和洋中と食材/タイプを選択して、今日の献立を決めましょう！</p>
    </header>

    <main>
        <section class="selection-box">
            <h2>🌍 ジャンル選択</h2>
            <div class="checkbox-group" id="category-group">
                <label><input type="checkbox" name="category" value="Japanese"> 和食</label>
                <label><input type="checkbox" name="category" value="Chinese"> 中華</label>
                <label><input type="checkbox" name="category" value="Italian"> イタリアン (洋)</label>
                <label><input type="checkbox" name="category" value="French"> フレンチ (洋)</label>
            </div>
        </section>

        <section class="selection-box">
            <h2>🥩 食材/タイプ選択</h2>
            <div class="checkbox-group" id="ingredient-group">
                <label><input type="checkbox" name="filter" value="Beef"> 肉 (牛)</label>
                <label><input type="checkbox" name="filter" value="Chicken"> 肉 (鶏)</label>
                <label><input type="checkbox" name="filter" value="Salmon"> 魚 (鮭)</label>
                <label><input type="checkbox" name="filter" value="Noodles"> 麺類</label>
                <label><input type="checkbox" name="filter" value="Dessert"> デザート</label>
            </div>
        </section>

        <button id="decide-button">献立をきめる！</button>

        <section id="result-area">
            <h2>💡 今日の献立</h2>
            <div id="meal-display">
                <p>選択肢を選んでボタンを押すか、何も選ばずにボタンを押して完全にランダムな献立を表示します。</p>
            </div>
        </section>
    </main>

    <footer>
        <p>Powered by TheMealDB</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
