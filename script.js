// ... (グローバル変数、DOM要素の取得はそのまま) ...

// =================================================================
// 測定モード (BPM計算ロジック)
// =================================================================

function tapTempo() {
    const currentTime = Date.now(); 
    
    // 💡 修正ポイント: 最初のクリックで lastClickTime が 0 でないことの確認
    if (lastClickTime !== 0) {
        const interval = currentTime - lastClickTime;
        
        // 連続で2回以上タップされたときのみ処理
        if (interval > 50) { // 誤タップ防止のため、50ms以下の間隔は無視 (例)
            
            // スライディングウィンドウを維持
            if (intervals.length >= MAX_INTERVALS) {
                intervals.shift(); 
            }
            intervals.push(interval); 
            
            // 間隔が2個以上になったら (3回目以降のクリック)、BPMを計算して表示
            if (intervals.length >= 2) {
                calculateBPM();
            } else {
                messageElement.textContent = `あと ${MAX_INTERVALS + 1 - (intervals.length + 1)} 回タップで精度向上...`;
            }
        } else {
            // 間隔が短すぎる場合、ログを出して無視
            console.log("タップ間隔が短すぎます (50ms以下)。無視しました。");
        }
    } else {
        messageElement.textContent = '最初のタップを記録しました。次から計測開始。';
    }

    lastClickTime = currentTime; 

    // BPMが計算されたら保存ボタンを有効化し、保存エリアを表示
    if (intervals.length >= 2) {
        saveButton.disabled = false;
        recordArea.style.display = 'block'; 
    }
}

// ... (calculateBPM 関数は変更なし) ...


// =================================================================
// 初期設定とイベントリスナー
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ... (renderRecords(loadRecords()) はそのまま) ...
    
    // 測定モード: ボタンクリックのイベントリスナー
    document.getElementById('tapButton').addEventListener('click', tapTempo);

    // 測定モード: スペースキーのキーダウンイベントリスナー
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault(); 
            tapTempo(); // 💡 tapTempo()を呼び出す
        }
    });

    // 記録モード: 保存ボタンのイベントリスナー
    saveButton.addEventListener('click', saveRecord);
});
