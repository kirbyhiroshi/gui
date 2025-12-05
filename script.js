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
    const currentTime = Date.now(); // 現在の時刻（ミリ秒）

    if (lastClickTime !== 0) {
        // 2回目以降のクリックなら、間隔を計算して配列に追加
        const interval = currentTime - lastClickTime;
        intervals.push(interval); 
    }

    lastClickTime = currentTime; 

    // クリック回数の更新と表示
    const currentCount = intervals.length + 1;
    
    if (currentCount <= MAX_CLICKS) {
        clickButton.textContent = `クリック中 (${currentCount}/${MAX_CLICKS})`;
        messageElement.textContent = `計測中...あと ${MAX_CLICKS - currentCount} 回`;
    }
    
    // 規定回数クリックが完了したら計算へ
    if (intervals.length === MAX_CLICKS - 1) { 
        clickButton.disabled = true;
        messageElement.textContent = '計算中...しばらくお待ちください。';
        calculateBPM();
    }
}

// --- 2. BPMの計算と結果の表示 ---
function calculateBPM() {
    // 配列の合計値計算 (Array.reduce() を使用)
    const sumOfIntervals = intervals.reduce((sum, current) => sum + current, 0);

    // 平均値計算
    const averageIntervalMs = sumOfIntervals / intervals.length;

    // BPM変換
    const calculatedBPM = 60000 / averageIntervalMs;

    const bpmValue = calculatedBPM.toFixed(2);
    const avgValue = averageIntervalMs.toFixed(2);
    
    // 結果を画面に表示
    displayBPM.textContent = bpmValue;
    displayAvgInterval.textContent = avgValue;
    resultArea.style.display = 'block'; // 結果エリアを表示
    messageElement.textContent = '計測完了！JSONダウンロードボタンをクリックしてください。';
    
    // ダウンロードボタンにイベントリスナーを設定
    downloadButton.style.display = 'block';
    // 以前のリスナーが残らないように除去し、新しいリスナーを追加
    downloadButton.onclick = () => exportToJSON(bpmValue, avgValue);
}

// --- 3. データのエクスポート（JSON保存） ---
function exportToJSON(bpmValue, avgInterval) {
    const resultObject = {
        // データのリスト（オブジェクト）
        timestamp: new Date().toISOString(), 
        bpm: parseFloat(bpmValue),           
        average_interval_ms: parseFloat(avgInterval),
        clicks_used: MAX_CLICKS,
        intervals_count: intervals.length      
    };

    // JSON形式の文字列に変換
    const jsonString = JSON.stringify(resultObject, null, 2);
    
    // JSONファイルを生成し、ダウンロードさせる処理
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bpm_data_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}.json`; // ダウンロードファイル名
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    alert('JSONファイルがダウンロードされました！');

    // 測定終了後、ページをリロードして再測定できるようにする
    setTimeout(() => {
        window.location.reload(); 
    }, 1000); 
}
