// --- グローバル変数と定数 ---
let lastClickTime = 0;   // 前回のクリック時刻（ミリ秒）
let intervals = [];      // クリック間隔（ミリ秒）を格納する配列
const MAX_CLICKS = 5;    // 計測を完了するクリック回数

// --- DOM要素の取得 ---
const clickButton = document.getElementById('clickButton');
const messageElement = document.getElementById('message');
const resultArea = document.getElementById('resultArea');
const displayBPM = document.getElementById('displayBPM');
const displayAvgInterval = document.getElementById('displayAvgInterval');
const downloadButton = document.getElementById('downloadButton');


// --- 1. 時間データの収集（配列への追加） ---
function recordClickTime() {
    console.log(`--- クリック #${intervals.length + 1} ---`); // デバッグ用ログ

    const currentTime = Date.now(); 

    if (lastClickTime !== 0) {
        // 2回目以降のクリックなら、間隔を計算して配列に追加
        const interval = currentTime - lastClickTime;
        intervals.push(interval); 
        console.log(`間隔: ${interval} ms`);
    } else {
        console.log("最初のクリックを記録。");
    }

    lastClickTime = currentTime; 

    // クリック回数の更新と表示
    const currentCount = intervals.length + 1; // クリック回数 = 間隔の数 + 1
    
    if (currentCount <= MAX_CLICKS) {
        clickButton.textContent = `クリック中 (${currentCount}/${MAX_CLICKS})`;
        messageElement.textContent = `計測中...あと ${MAX_CLICKS - currentCount} 回`;
    }
    
    // 💡 修正ポイント: 間隔の数 (intervals.length) が MAX_CLICKS - 1 に達したら計算開始
    if (intervals.length === MAX_CLICKS - 1) { 
        console.log("規定回数に達しました。BPM計算を開始します。");
        clickButton.disabled = true;
        messageElement.textContent = '計算中...しばらくお待ちください。';
        
        // 連続クリックで計算が複数回走るのを防ぐため、ボタンのイベントを一時的に解除
        clickButton.onclick = null;
        
        calculateBPM();
    }
}

// --- 2. BPMの計算と結果の表示 ---
function calculateBPM() {
    try {
        if (intervals.length === 0) {
            console.error("エラー: 間隔データがありません。計算をスキップします。");
            messageElement.textContent = 'エラー：クリック間隔が記録されませんでした。最初からやり直してください。';
            return;
        }

        // 配列の合計値計算
        const sumOfIntervals = intervals.reduce((sum, current) => sum + current, 0);

        // 平均値計算
        const averageIntervalMs = sumOfIntervals / intervals.length;

        // BPM変換
        const calculatedBPM = 60000 / averageIntervalMs;

        const bpmValue = calculatedBPM.toFixed(2);
        const avgValue = averageIntervalMs.toFixed(2);
        
        console.log(`計算完了: BPM=${bpmValue}, 平均間隔=${avgValue}ms`); // デバッグ用ログ

        // 結果を画面に表示 (DOM操作)
        displayBPM.textContent = bpmValue;
        displayAvgInterval.textContent = avgValue;
        resultArea.style.display = 'block'; 
        messageElement.textContent = '計測完了！JSONダウンロードボタンをクリックしてください。';
        
        // ダウンロードボタンにイベントリスナーを設定
        downloadButton.style.display = 'block';
        downloadButton.onclick = () => exportToJSON(bpmValue, avgValue);

    } catch (e) {
        console.error("BPM計算中にエラーが発生しました:", e);
        messageElement.textContent = '計算中に予期せぬエラーが発生しました。';
    }
}

// --- 3. データのエクスポート（JSON保存） ---
function exportToJSON(bpmValue, avgInterval) {
    // ... (exportToJSON のコードは前回と同じで問題ありません) ...
    const resultObject = {
        timestamp: new Date().toISOString(), 
        bpm: parseFloat(bpmValue),           
        average_interval_ms: parseFloat(avgInterval),
        clicks_used: MAX_CLICKS,
        intervals_count: intervals.length      
    };

    const jsonString = JSON.stringify(resultObject, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bpm_data_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    alert('JSONファイルがダウンロードされました！');

    setTimeout(() => {
        window.location.reload(); 
    }, 1000); 
}
