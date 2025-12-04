// 金額をカンマ区切りと単位付きの文字列に変換するヘルパー関数
function formatMoney(amount, unit = '円') {
    return amount.toLocaleString() + ' ' + unit;
}

function calculateDeduction() {
    // 1. 入力値の取得と単位の調整
    // ローン残高は「万円」入力なので「円」に変換
    const loanBalanceMan = parseFloat(document.getElementById('loan-balance').value);
    const loanBalanceYen = loanBalanceMan * 10000; 
    
    const incomeTaxYen = parseFloat(document.getElementById('income-tax').value);
    const residentTaxableIncomeYen = parseFloat(document.getElementById('resident-taxable-income').value);
    
    // 控除限度額は「万円」の値を取得
    const limitMan = parseFloat(document.getElementById('residence-type').value);
    const limitYen = limitMan * 10000;

    // 入力チェック
    if (isNaN(loanBalanceMan) || isNaN(incomeTaxYen) || isNaN(residentTaxableIncomeYen)) {
        alert("すべての項目に数値を入力してください。");
        return;
    }

    // --- ステップ 1: 控除対象残高の決定 ---
    // 年末ローン残高と最大借入限度額（住宅種別）の小さい方
    const deductionTargetBalanceYen = Math.min(loanBalanceYen, limitYen);
    
    // --- ステップ 2: 基本控除額の算出 (0.7%) ---
    // 控除額は小数点以下切り捨てで計算するのが一般的だが、ここでは簡略化のためそのまま計算
    const basicDeductionYen = Math.floor(deductionTargetBalanceYen * 0.007);

    // --- ステップ 3: 所得税からの控除額決定 ---
    // 基本控除額と源泉徴収税額（所得税）の小さい方
    const incomeTaxDeductionYen = Math.min(basicDeductionYen, incomeTaxYen);

    // --- ステップ 4: 住民税からの控除額決定 ---
    const deductionRemainder = basicDeductionYen - incomeTaxDeductionYen;
    let residentTaxDeductionYen = 0;

    if (deductionRemainder > 0) {
        // 住民税からの控除上限 (課税所得の5% または 97,500円の小さい方)
        const residentTaxLimitA = residentTaxableIncomeYen * 0.05;
        const residentTaxLimitB = 97500;
        const residentTaxCeiling = Math.min(residentTaxLimitA, residentTaxLimitB);

        // 控除残額と住民税控除上限の小さい方が、住民税から控除される額
        residentTaxDeductionYen = Math.min(deductionRemainder, residentTaxCeiling);
        
        // マイナスにならないようにMath.floorを適用
        residentTaxDeductionYen = Math.floor(residentTaxDeductionYen);
    }
    
    // --- ステップ 5: 年間の総控除額算出 ---
    const totalDeductionYen = incomeTaxDeductionYen + residentTaxDeductionYen;

    // 4. 結果の表示（HTMLの更新）
    document.getElementById('limit-display').textContent = formatMoney(limitMan, '万円');
    document.getElementById('basic-deduction').textContent = formatMoney(basicDeductionYen);
    document.getElementById('income-tax-deduction').textContent = formatMoney(incomeTaxDeductionYen);
    document.getElementById('resident-tax-deduction').textContent = formatMoney(residentTaxDeductionYen);
    document.getElementById('total-deduction').textContent = formatMoney(totalDeductionYen);
}

// 初期表示のために一度実行
window.onload = calculateDeduction;
