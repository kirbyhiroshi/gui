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
 * @param {string} input - クリックされた数字または小数点
 */
function inputDigit(input) {
    if (waitingForSecondOperand === true) {
        // 演算子が押された後なら、表示をリセットして2番目のオペランド入力を開始
        display.value = input;
        waitingForSecondOperand = false;
    } else {
        // 現在の値に追加
        if (getDisplayValue() === '0' || getDisplayValue() === 'Error') {
            display.value = input; // '0'を新しい数字に置き換える
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

    // 最初のオペランドがまだ
