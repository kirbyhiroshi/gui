// --- グローバル変数と定数 ---
let lastClickTime = 0;   // 前回のクリック時刻（ミリ秒）
// 直近5回分の間隔を保持する配列 (スライディングウィンドウ)
let intervals = [];      
const MAX_INTERVALS = 5; // BPM計算に使用する間隔の数
const RECORDS_KEY = 'bpmRecords'; // localStorageに保存する際のキー

// --- DOM要素の取得 ---
const displayBPM = document.getElementById('displayBPM');
const messageElement = document.getElementById('message');
const songTitleInput = document.getElementById('songTitle');
const saveButton = document.getElementById('saveButton');
const recordList = document.getElementById('recordList');


// =================================================================
// 測定モード (BPM計算ロジック)
// =================================================================

/**
 * タップ（クリックまたはスペースキー）イベントを処理するメイン関数
 */
function tapTempo() {
    const currentTime = Date.now(); 

    if (lastClickTime !== 0) {
        const interval = currentTime - lastClickTime;

        // 💡 高精度化: スライディングウィンドウを維持
        if (intervals.length >= MAX_INTERVALS) {
            // 5個の間隔が揃ったら、一番古い間隔を削除 (FIFO: First-In, First-Out)
            intervals.shift(); 
        }
        // 新しい間隔を追加
        intervals.push(interval); 
        
        // 間隔が2個以上になったら (3回目以降のクリック)、BPMを計算して表示
        if (intervals.length >= 2) {
            calculateBPM();
        } else {
            messageElement.textContent = `あと ${MAX_INTERVALS + 1 - (intervals.length + 1)} 回タップで精度向上...`;
        }
    }

    lastClickTime = currentTime; 

    // BPMが計算されたら保存ボタンを有効化
    if (intervals.length >= 2) {
        saveButton.disabled = false;
    }
}

/**
 * 直近のintervals配列からBPMを計算し、画面に表示する
 */
function calculateBPM() {
    // 配列の合計値計算
    const sumOfIntervals = intervals.reduce((sum, current) => sum + current, 0);

    // 平均値計算 
    const averageIntervalMs = sumOfIntervals / intervals.length;

    // BPM変換 (60,000ms / 平均間隔)
    const calculatedBPM = 60000 / averageIntervalMs;

    const bpmValue = calculatedBPM.toFixed(2);

    // 💡 測定モード: BPMをリアルタイムで表示
    displayBPM.textContent = bpmValue;
    messageElement.textContent = `直近 ${intervals.length} 回の平均BPMを表示中`;
}


// =================================================================
// 記録モード (永続化ロジック)
// =================================================================

/**
 * localStorageからレコードを読み込む
 * @returns {Array} 保存されたレコードの配列
 */
function loadRecords() {
    const json = localStorage.getItem(RECORDS_KEY);
    return json ? JSON.parse(json) : [];
}

/**
 * 測定結果を保存し、リストを更新する
 */
function saveRecord() {
    const title = songTitleInput.value.trim();
    const bpm = displayBPM.textContent;
    
    if (bpm === '--' || intervals.length < 2) {
        alert("BPMを測定してから保存してください。");
        return;
    }

    if (!title) {
        alert("曲名を入力してください。");
        return;
    }

    const newRecord = {
        title: title,
        bpm: parseFloat(bpm),
        timestamp: new Date().toLocaleString()
    };

    const records = loadRecords();
    records.push(newRecord);
    
    // localStorageに保存 (永続化)
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));

    // リストを再描画
    renderRecords(records);
    
    // UIをリセット
    songTitleInput.value = '';
    saveButton.disabled = true;
    messageElement.textContent = `${title} (BPM ${bpm}) をリストに保存しました！`;
}

/**
 * 保存されたレコードを画面に表示する
 * @param {Array} records - 表示するレコードの配列
 */
function renderRecords(records) {
    recordList.innerHTML = ''; // リストをクリア
    
    if (records.length === 0) {
        recordList.innerHTML = '<li>まだ保存されたレコードはありません。</li>';
        return;
    }

    records.forEach(record => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${record.title}</strong>
                <br>
                <small>${record.timestamp}</small>
            </div>
            <span class="bpm-tag">${record.bpm.toFixed(2)} BPM</span>
        `;
        recordList.appendChild(li);
    });
}


// =================================================================
// 初期設定とイベントリスナー
// =================================================================

// 🚀 ページロード時に実行
document.addEventListener('DOMContentLoaded', () => {
    // 記録モード: localStorageからデータを読み込み、リストを初期表示
    renderRecords(loadRecords());
    
    // 測定モード: ボタンクリックのイベントリスナー
    document.getElementById('tapButton').addEventListener('click', tapTempo);

    // 測定モード: スペースキーのキーダウンイベントリスナー
    document.addEventListener('keydown', (e) => {
        // スペースキーが押されたとき、かつ入力フォーム外で押されたときのみ実行
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault(); // 画面のスクロールなどを防ぐ
            tapTempo();
        }
    });

    // 記録モード: 保存ボタンのイベントリスナー
    saveButton.addEventListener('click', saveRecord);
});
