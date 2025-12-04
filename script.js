// script.js

/**
 * 元利均等返済の計算ロジック
 * @returns {object} P_first, P_final, Total, Note
 */
function calculateGenriKinto(L_yen, i, n) {
    let P;
    if (i === 0) {
        P = L_yen / n;
    } else {
        // 元利均等返済の計算式: L × i × (1 + i)^n / ((1 + i)^n - 1)
        const power_term = Math.pow(1 + i, n); 
        const numerator = i * power_term;
        const denominator = power_term - 1;
        P = L_yen * (numerator / denominator);
    }
    
    // 結果を整数に切り上げ
    const monthlyPayment = Math.ceil(P);
    const totalPayment = monthlyPayment * n;

    return {
        P_first: monthlyPayment, 
        P_final: monthlyPayment, // 元利均等なので、初回と最終回は同じ
        Total: totalPayment,
        Note: ''
    };
}

/**
 * 元金均等返済の計算ロジック
 * @returns {object} P_first, P_final, Total, Note
 */
function calculateGankinKinto(L_yen, i, n) {
    // 毎月固定の元金返済額
    const monthlyPrincipal = L_yen / n; 

    // 初回支払額 = 元金 + 初回利息 (初回利息は借入全額にかかる)
    const firstInterest = L_yen * i; 
    const P_first = monthlyPrincipal + firstInterest;

    // 最終回支払額 = 元金 + 最終回利息 (最終回の利息は最後の元金返済額にかかる利息)
    const remainingBeforeLast = monthlyPrincipal; 
    const finalInterest = remainingBeforeLast * i; 
    const P_final = monthlyPrincipal + finalInterest;

    // 総支払額 (元金 + 総利息)
    // 元金均等返済の総利息簡易計算式: L × i × (n + 1) / 2
    const totalInterest = L_yen * i * (n + 1) / 2;
    const totalPayment = L_yen + totalInterest;

    // 結果を整数に切り上げ
    return {
        P_first: Math.ceil(P_first),
        P_final: Math.ceil(P_final),
        Total: Math.ceil(totalPayment),
        Note: `※元金均等返済は、初回（最も高い）から最終回（最も低い）にかけて返済額が徐々に減少します。`
    };
}

/**
 * メイン計算関数：返済方式に応じて計算を振り分け
 */
function calculateLoan() {
    // 1. HTMLから入力値を取得
    const L_yen = parseFloat(document.getElementById('loanAmount').value) * 10000; 
    const annualRate = parseFloat(document.getElementById('annualRate').value);
    const years = parseInt(document.getElementById('years').value);
    const type = document.getElementById('repaymentType').value; 

    // 表示要素の取得
    const monthlyElement = document.getElementById('monthlyPayment');
    const totalElement = document.getElementById('totalPayment');
    const monthlyLabel = document.getElementById('monthlyPaymentLabel');
    const noteElement = document.getElementById('variablePaymentNote');

    // 2. 入力値のバリデーション
    if (isNaN(L_yen) || isNaN(annualRate) || isNaN(years) || L_yen <= 0 || annualRate < 0 || years <= 0) {
        monthlyElement.textContent = 'エラー';
        totalElement.textContent = 'エラー';
        noteElement.style.display = 'none';
        alert('借入額、年利、返済期間に適切な値を入力してください。');
        return;
    }

    // 3. 計算に必要な月利と総返済回数を算出
    const i = annualRate / 12 / 100; // 月利 (i)
    const n = years * 12;            // 総返済回数 (n)

    let result;

    // 4. 返済方式に応じた計算の実行
    if (type === 'genri') {
        result = calculateGenriKinto(L_yen, i, n);
        
        monthlyLabel.textContent = '月々の返済額:';
        noteElement.style.display = 'none';
        monthlyElement.textContent = result.P_first.toLocaleString();

    } else if (type === 'gankin') {
        result = calculateGankinKinto(L_yen, i, n);
        
        monthlyLabel.textContent = '初回返済額:'; 
        noteElement.style.display = 'block';
        
        // 元金均等なので、初回と最終回を併記
        monthlyElement.innerHTML = `${result.P_first.toLocaleString()}円 <span style="font-size: 16px;">（最終回: ${result.P_final.toLocaleString()}円）</span>`;
        noteElement.textContent = result.Note;
    }
    
    // 5. 総支払額の表示
    totalElement.textContent = result.Total.toLocaleString();
}
