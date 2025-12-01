// =======================================================
// イベントリスナー：ボタンのクリックを監視
// =======================================================

buttons.addEventListener('click', (event) => {
    if (!event.target.matches('.btn')) {
        return;
    }

    const target = event.target;
    const action = target.dataset.action; 
    
    // 現在の表示値
    const currentValue = getDisplayValue();

    // --- 数字・小数点の処理 ---
    if (target.classList.contains('number') || target.classList.contains('decimal')) {
        if (target.textContent === '.') {
            inputDecimal();
        } else {
            inputDigit(target.textContent);
        }

    // --- 演算子の処理 ---
    } else if (target.classList.contains('operator')) {
        // 演算子（+,-,*,/）が押された場合
        handleOperator(action);

    // --- イコールボタンの処理 (修正箇所) ---
    } else if (action === 'calculate') {
        // イコールが押されたら、現在の表示値と保存されているオペランドを使って計算
        if (firstOperand !== null && operator !== null) {
            const inputValue = parseFloat(currentValue);
            const result = calculate(firstOperand, inputValue, operator);
            
            // 結果を表示
            display.value = String(result);
            
            // 状態をリセットし、結果を次の最初のオペランドとして保持
            firstOperand = result;
            operator = null; // 演算子をクリア
            waitingForSecondOperand = true; // 計算後なので次の数字は新規入力と見なす

            // Errorの場合は完全にリセット
            if (display.value === 'Error') {
                resetCalculator();
            }
        }
        
    // --- クリアボタンの処理 ---
    } else if (action === 'clear') {
        resetCalculator();
    }
});
