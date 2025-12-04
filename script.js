// script.js

// === 共通ヘルパー関数 ===

/**
 * 元利均等返済後の残高を算出する関数 (元金残高計算式)
 * @param {number} L - 借入元金
 * @param {number} i - 月利
 * @param {number} n - 総返済回数
 * @param {number} k - 返済後の残高を求めたい回数 (k回)
 * @param {number} P - 毎月の返済額
 * @returns {number} 残高
 */
function calculateRemainingBalance(L, i, n, k, P) {
    if (i === 0) {
        return L - L * (k / n); // 金利0%の場合
    }
    
    // k回返済後の残高 = L * (1+i)^k - P * (((1+i)^k) - 1) / i
    const power_term_k = Math.pow(1 + i, k);
    const remaining = L * power_term_k - P * (power_term_k - 1) / i;
    return remaining > 0 ? remaining : 0; // 残高が負にならないようにする
}

/**
 * 毎月の返済額 (P) を求める関数 (元利均等返済の基本公式)
 */
function calculateMonthlyPayment(L, i, n) {
    if (i === 0) {
        return L / n;
    }
    const power_term = Math.pow(1 + i, n); 
    const numerator = i * power_term;
    const denominator = power_term - 1;
    return L * (numerator / denominator);
}

// === 元利均等返済ロジック ===

function calculateGenriKinto(L_yen, i, n, prepaymentAmount, prepaymentYear) {
    
    // 繰り上げ返済前の月々の返済額を計算
    const P_monthly_original = calculateMonthlyPayment(L_yen, i, n);
    const monthlyPaymentOriginal = Math.ceil(P_monthly_original);
    const totalPaymentOriginal = monthlyPaymentOriginal * n;

    let totalPayment = totalPaymentOriginal;
    let savings = 0;
    let newN = n;
    let note = '';

    // 繰り上げ返済が設定されている場合
    if (prepaymentAmount > 0 && prepaymentYear > 0 && prepaymentYear * 12 < n) {
        const k = prepaymentYear * 12; // 繰り上げ返済時点での支払回数

        // 1. 繰り上げ返済時点の残高を計算
        let remainingBalance = calculateRemainingBalance(L_yen, i, n, k, P_monthly_original);

        // 2. 繰り上げ返済を適用
        remainingBalance -= prepaymentAmount;

        // 3. 繰り上げ返済後の新しい返済回数 (n') を算出
        // 元利均等返済では、月々の返済額(P)と月利(i)は変わらず、残高(L')からn'を求める
        // L' = P/i * (1 - 1/(1+i)^n')
        // (1+i)^n' = P / (P - L' * i)
        
        if (remainingBalance > 0) {
            const base = P_monthly_original / (P_monthly_original - remainingBalance * i);
            newN = Math.ceil(Math.log(base) / Math.log(1 + i)); // 新しい総返済回数
            
            // 4. 新しい総支払額を計算 (k回分の支払い + 新しい期間の支払い)
            const paymentsAfterPrepay = newN - k; // 繰り上げ返済後に残っている支払い回数
            const totalPaymentAfterPrepay = remainingBalance + (paymentsAfterPrepay * monthlyPaymentOriginal) - remainingBalance; // 元金と利息の再計算
            
            totalPayment = (monthlyPaymentOriginal * k) + (monthlyPaymentOriginal * (newN - k));
            
            // 5. 利息削減額を算出
            savings = totalPaymentOriginal - totalPayment;
            
            note = `繰り上げ返済により、返済期間が${(n / 12).toFixed(1)}年から${(newN / 12).toFixed(1)}年へ短縮されます。`;

        } else {
            // 繰り上げ返済で完済した場合
            newN = k;
            totalPayment = monthlyPaymentOriginal * k + remainingBalance; // 完済までの支払い総額
            savings = totalPaymentOriginal - totalPayment;
            note = `繰り上げ返済により、完済しました。`;
        }
    }

    return {
        P_first: monthlyPaymentOriginal, 
        P_final: monthlyPaymentOriginal,
        Total: Math.ceil(totalPayment),
        Savings: Math.ceil(savings),
        NewYears: (newN / 12).toFixed(1),
        OriginalYears: (n / 12).toFixed(1),
        Note: note
    };
}

// === 元金均等返済ロジック ===
// 元金均等型は複雑になるため、繰り上げ返済機能は元利均等型のみに適用し、元金均等型は単純計算を維持します。
// （※元金均等型の繰り上げ返済は、繰り上げ後の月々の元金返済額を再計算する必要があり、複雑度が大幅に増すため）

function calculateGankinKinto(L_yen, i, n) {
    // 毎月固定の元金返済額
    const monthlyPrincipal = L_yen / n; 

    // 初回支払額
    const firstInterest = L_yen * i; 
    const P_first = monthlyPrincipal + firstInterest;

    // 最終回支払額
    const remainingBeforeLast = monthlyPrincipal; 
    const finalInterest = remainingBeforeLast * i; 
    const P_final = monthlyPrincipal + finalInterest;

    // 総支払額 (元金 + 総利息)
    const totalInterest = L_yen * i * (n + 1) / 2;
    const totalPayment = L_yen + totalInterest;

    return {
        P_first: Math.ceil(P_first),
        P_final: Math.ceil(P_final),
        Total: Math.ceil(totalPayment),
        Savings: 0, // 元金均等では計算しないため0
        NewYears: (n / 12).toFixed(1),
        OriginalYears: (n / 12).toFixed(1),
        Note: `※元金均等返済は、初回（最も高い）から最終回（最も低い）にかけて返済額が徐々に減少します。`
    };
}


// === メイン計算関数 ===

function calculateLoan() {
    // 1. HTMLから入力値を取得
    const L_yen = parseFloat(document.getElementById('loanAmount').value) * 10000; 
    const annualRate = parseFloat(document.getElementById('annualRate').value);
    const years = parseInt(document.getElementById('years').value);
    const type = document.getElementById('repaymentType').value; 
    
    // ❗ 繰り上げ返済の入力値 ❗
    const prepaymentAmount = parseFloat(document.getElementById('prepaymentAmount').value) * 10000; // 万円を円に
    const prepaymentYear = parseInt(document.getElementById('prepaymentYear').value);

    // 表示要素の取得
    const monthlyElement = document.getElementById('monthlyPayment');
    const totalElement = document.getElementById('totalPayment');
    const monthlyLabel = document.getElementById('monthlyPaymentLabel');
    const noteElement = document.getElementById('variablePaymentNote');
    const savingsElement = document.getElementById('prepaymentSavings');

    // 初期表示のリセット
    savingsElement.style.display = 'none';

    // 2. 入力値のバリデーション
    if (isNaN(L_yen) || isNaN(annualRate) || isNaN(years) || L_yen <= 0 || annualRate < 0 || years <= 0 || isNaN(prepaymentAmount) || isNaN(prepaymentYear)) {
        monthlyElement.textContent = 'エラー';
        totalElement.textContent = 'エラー';
        noteElement.style.display = 'none';
        savingsElement.style.display = 'none';
        alert('全ての入力項目に適切な値を入力してください。');
        return;
    }

    // 3. 計算に必要な月利と総返済回数を算出
    const i = annualRate / 12 / 100; 
    const n = years * 12;            

    let result;

    // 4. 返済方式に応じた計算の実行
    if (type === 'genri') {
        result = calculateGenriKinto(L_yen, i, n, prepaymentAmount, prepaymentYear);
        
        monthlyLabel.textContent = '月々の返済額:';
        noteElement.style.display = 'none';
        monthlyElement.textContent = result.P_first.toLocaleString();

        // 繰り上げ返済の結果を表示
        if (result.Savings > 0) {
             savingsElement.style.display = 'block';
             savingsElement.innerHTML = `
                **利息削減額: ${result.Savings.toLocaleString()} 円**<br>
                期間短縮: ${result.OriginalYears} 年 → ${result.NewYears} 年<br>
                ${result.Note}
             `;
        } else if (prepaymentAmount > 0) {
             // 繰り上げ返済額が少なすぎるか、タイミングが不適切だった場合
             savingsElement.style.display = 'block';
             savingsElement.innerHTML = '繰り上げ返済額またはタイミングを見直してください。';
        }

    } else if (type === 'gankin') {
        // 元金均等型は繰り上げ返済を考慮しない
        result = calculateGankinKinto(L_yen, i, n);
        
        monthlyLabel.textContent = '初回返済額:'; 
        noteElement.style.display = 'block';
        
        monthlyElement.innerHTML = `${result.P_first.toLocaleString()}円 <span style="font-size: 16px;">（最終回: ${result.P_final.toLocaleString()}円）</span>`;
        noteElement.textContent = result.Note + ' ※元金均等返済の場合、繰り上げ返済の計算は反映されません。';
    }
    
    // 5. 総支払額の表示
    totalElement.textContent = result.Total.toLocaleString();
}
