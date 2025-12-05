// --- グローバル変数と定数 ---
let lastClickTime = 0;   
let intervals = [];      
const MAX_INTERVALS = 5; 
const RECORDS_KEY = 'bpmRecords'; 

// --- DOM要素の取得 ---
// ... (既存の取得要素はそのまま) ...
const displayBPM = document.getElementById('displayBPM');
const messageElement = document.getElementById('message');
const songTitleInput = document.getElementById('songTitle');
const saveButton = document.getElementById('saveButton');
// 💡 変更: ulの代わりにテーブルのtbodyを取得
const recordTableBody = document.querySelector('#recordTable tbody'); 
const recordArea = document.getElementById('recordArea');


// =================================================================
// 測定モード (BPM計算ロジック) - (変更なし)
// =================================================================

function tapTempo() {
    // ... (前回コードと同じ) ...
    const currentTime = Date.now(); 

    if (lastClickTime !== 0) {
        const interval = currentTime - lastClickTime;

        if (intervals.length >= MAX_INTERVALS) {
            intervals.shift(); 
        }
        intervals.push(interval); 
        
        if (intervals.length >= 2) {
            calculateBPM();
        } else {
            messageElement.textContent = `あと ${MAX_INTERVALS + 1 - (intervals.length + 1)} 回タップで精度向上...`;
        }
    }

    lastClickTime = currentTime; 

    // BPMが計算されたら保存ボタンを有効化し、保存エリアを表示
    if (intervals.length >= 2) {
        saveButton.disabled = false;
        recordArea.style.display = 'block'; // 💡 測定完了後に表示
    }
}

function calculateBPM() {
    // ... (前回コードと同じ) ...
    const sumOfIntervals = intervals.reduce((sum, current) => sum + current, 0);
    const averageIntervalMs = sumOfIntervals / intervals.length;
    const calculatedBPM = 60000 / averageIntervalMs;

    const bpmValue = calculatedBPM.toFixed(2);
    displayBPM.textContent = bpmValue;
    messageElement.textContent = `直近 ${intervals.length} 回の平均BPMを表示中`;
}


// =================================================================
// 記録モード (永続化ロジック)
// =================================================================

function loadRecords() {
    const json = localStorage.getItem(RECORDS_KEY);
    return json ? JSON.parse(json) : [];
}

function saveRecord() {
    const title = songTitleInput.value.trim();
    const bpm = displayBPM.textContent;
    
    // ... (エラーチェックは前回と同じ) ...
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
    
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));

    // リストを再描画
    renderRecords(records);
    
    // UIをリセット
    songTitleInput.value = '';
    saveButton.disabled = true;
    messageElement.textContent = `${title} (BPM ${bpm}) をリストに保存しました！`;
}

/**
 * 💡 修正: 保存されたレコードを画面にテーブル形式で表示する
 * @param {Array} records - 表示するレコードの配列
 */
function renderRecords(records) {
    recordTableBody.innerHTML = ''; // tbodyの内容をクリア
    
    if (records.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="3" style="text-align: center;">まだ保存された楽曲はありません。</td>';
        recordTableBody.appendChild(tr);
        return;
    }

    // 最新のレコードが上に来るように配列を反転
    [...records].reverse().forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.title}</td>
            <td class="bpm-cell">${record.bpm.toFixed(2)}</td>
            <td>${record.timestamp}</td>
        `;
        recordTableBody.appendChild(tr);
    });
}


// =================================================================
// 初期設定とイベントリスナー (変更なし)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 記録モード: localStorageからデータを読み込み、リストを初期表示
    renderRecords(loadRecords());
    
    // 測定モード: ボタンクリックのイベントリスナー
    document.getElementById('tapButton').addEventListener('click', tapTempo);

    // 測定モード: スペースキーのキーダウンイベントリスナー
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault(); 
            tapTempo();
        }
    });

    // 記録モード: 保存ボタンのイベントリスナー
    saveButton.addEventListener('click', saveRecord);
});
