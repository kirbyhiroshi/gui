// HTML要素を取得
const display = document.getElementById('display');
const buttons = document.querySelector('.buttons');

// 計算の状態を管理するための変数
let firstOperand = null; // 最初のオペランド（被演算子）
let operator = null;     // 選択された演算子
let waitingForSecondOperand = false; // 2番目のオペランド入力待ちかどうか

// 画面に表示されている値を返す関数
const getDisplayValue = () => display.value;

/**
 * 数字（オペランド）を入力処理
 * @param {string} input - クリックされた数字
 */
function inputDigit(input) {
    if (waitingForSecondOperand === true) {
        // 演算子が押された後なら、表示をリセットして2番目のオペランド入力を開始
        display.value = input;
        waitingForSecondOperand = false;
    } else {
        // 現在の値に追加
        if (getDisplayValue() === '0' || getDisplayValue() === 'Error') {
            display.value = input; // '0'や'Error'を新しい数字に置き換える
        } else {
            display.value = getDisplayValue() + input;
        }
    }
}

/**
 * 小数点処理
 */
function inputDecimal() {
    // 2番目のオペランド入力待ちなら、'0.'から開始
    if (waitingForSecondOperand === true) {
        display.value = '0.';
        waitingForSecondOperand = false;
        return;
    }
    
    // 小数点がすでになければ追加
    if (!getDisplayValue().includes('.')) {
        display.value += '.';
    }
}

/**
 * 演算子処理
 * @param {string} nextOperator - クリックされた演算子
 */
function handleOperator(nextOperator) {
    const inputValue = parseFloat(getDisplayValue());

    // 最初のオペランドがまだ設定されていない場合、現在の表示値を設定
    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator && waitingForSecondOperand === false) {
        // 2番目のオペランドが入力済みで、かつ演算子が設定されていれば計算を実行
        const result = calculate(firstOperand, inputValue, operator);
        display.value = String(result);
        firstOperand = result; // 計算結果を次の最初のオペランドにする
    }
    
    // 次のオペランド入力待ち状態に設定し、演算子を更新
    waitingForSecondOperand = true;
    operator = nextOperator;
}

/**
 * 計算を実行するコアロジック
 */
function calculate(operand1, operand2, op) {
    switch (op) {
        case 'add':
            return operand1 + operand2;
        case 'subtract':
            return operand1 - operand2;
        case 'multiply':
            return operand1 * operand2;
        case 'divide':
            if (operand2 === 0) {
                return 'Error'; // ゼロ除算のエラー処理
            }
            return operand1 / operand2;
        default:
            return operand2; 
    }
}

/**
 * 電卓の状態をリセット（ACボタン）
 */
function resetCalculator() {
    display.value = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
}

// =======================================================
// イベントリスナー：ボタンのクリックを監視
// =======================================================

buttons.addEventListener('click', (event) => {
    // クリックされたのがボタンでなければ何もしない
    if (!event.target.matches('.btn')) {
        return;
    }

    const target = event.target;
    const action = target.dataset.action; // data-action属性の値を取得
    
    // --- 数字・小数点の処理 ---
    if (target.classList.contains('number')) {
        if (target.textContent === '.') {
            inputDecimal();
        } else if (target.textContent !== '.') {
            inputDigit(target.textContent);
        }

    // --- 演算子の処理 ---
    } else if (target.classList.contains('operator')) {
        handleOperator(action);

    // --- イコールボタンの処理 ---
    } else if (action === 'calculate') {
        if (firstOperand !== null && operator !== null && waitingForSecondOperand === false) {
            const inputValue = parseFloat(getDisplayValue());
            const result = calculate(firstOperand, inputValue, operator);
            
            display.value = String(result);
            
            firstOperand = result;
            operator = null; 
            waitingForSecondOperand = true;

            if (display.value === 'Error') {
                resetCalculator();
            }
        }
        
    // --- クリアボタンの処理 ---
    } else if (action === 'clear') {
        resetCalculator();
    }
});

// 初期化
resetCalculator();
