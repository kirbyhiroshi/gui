// script.js

/**
 * 住宅ローンの月々の返済額と総支払額を計算する関数 (元利均等返済)
 */
function calculateLoan() {
    // 1. HTMLから入力値を取得し、数値型に変換
    // 借入額 (万円 -> 円)
    const L_yen = parseFloat(document.getElementById('loanAmount').value) * 10000; 
    const annualRate = parseFloat(document.getElementById('annualRate').value);
    const years = parseInt(document.getElementById('years').value);

    // 表示要素の取得
    const monthlyElement = document.getElementById('monthlyPayment');
    const totalElement = document.getElementById('totalPayment');

    // 2. 入力値のバリデーション
    if (isNaN(L_yen) || isNaN(annualRate) || isNaN(years) || L_yen <= 0 || annualRate < 0 || years <= 0) {
        monthlyElement.textContent = 'エラー';
        totalElement.textContent = 'エラー';
        alert('借入額、年利、返済期間に適切な値を入力してください。');
        return;
    }

    // 3. 計算に必要な要素を算出
    const i = annualRate / 12 / 100; // 月利 (年利を12で割り、%を小数に変換)
    const n = years * 12;            // 総返済回数 (期間(年) * 12)

    let P; // 月々の返済額

    // 4. 計算ロジックの実装（元利均等返済）
    if (annualRate === 0) {
        // 金利が0%の場合
        P = L_yen / n;
    } else {
        // 元利均等返済の計算式: P = L * { i * (1 + i)^n / ((1 + i)^n - 1) }
        // P = L \times \frac{i \times (1 + i)^n}{(1 + i)^n - 1}
        const power_term = Math.pow(1 + i, n); // (1 + i)^n
        P = L_yen * (i * power_term) / (power_term - 1);
    }
    
    // 5. 結果の算出と表示
    // 月々の返済額は切り上げて整数にする
    const monthlyPayment = Math.ceil(P); 
    const totalPayment = monthlyPayment * n; // 総支払額

    // toLocaleString() で3桁区切りのカンマを追加して表示
    monthlyElement.textContent = monthlyPayment.toLocaleString();
    totalElement.textContent = totalPayment.toLocaleString();
}
