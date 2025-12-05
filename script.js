let lastClickTime = 0; // 最後にクリックした時刻 (初期値 0)
let intervals = [];    // クリック間隔 (ミリ秒) を格納する配列
const MAX_CLICKS = 5; // クリック回数の上限

// 🌟 マウスをクリックするたびに呼ばれる関数
function recordClickTime() {
    const currentTime = Date.now(); // 現在の時刻（ミリ秒）を取得

    if (lastClickTime !== 0) {
        // 2回目以降のクリックなら、間隔を計算して配列に追加
        const interval = currentTime - lastClickTime;
        intervals.push(interval); // 配列の末尾に追加

        console.log(`クリック間隔: ${interval} ms`);
    }

    // 現在の時刻を「前回の時刻」として保存 (変数の更新)
    lastClickTime = currentTime; 

    // 5回クリックが完了したら計算へ
    if (intervals.length === MAX_CLICKS - 1) { // 間隔の数はクリック回数 - 1
        calculateBPM();
    }
}
