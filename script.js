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
    return remaining > 0 ? remaining : 0;
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
        // (1+i)^n' = P / (P - L' * i)
        
        if (remainingBalance > 0) {
            // 繰り上げ返済後の新しい総返済回数を計算
            const base = P_monthly_original / (P_monthly_original - remainingBalance * i);
            newN = Math.ceil(Math.log(base) / Math.log(1 + i)) + k; // k回返済済み + 新しい残りの回数
            
            // 4. 新しい総支払額を計算 (★この部分を修正しました★)
            // 支払総額 = (k回分の支払い総額) + (繰り上げ返済額) + (残りの回数分の支払い総額)
            
            // 繰り上げ返済後の残りの支払い回数
            const remainingPayments = newN - k; 
            
            // 繰り上げ返済後の総支払額
            totalPayment = 
                (monthlyPaymentOriginal * k) + // 繰り上げ返済前の支払い総額
                prepaymentAmount +             // 繰り上げ返済額
                (monthlyPaymentOriginal * remainingPayments); // 繰り上げ返済後の残りの支払い総額
            
            //
