document.getElementById('run-simulation').addEventListener('click', runSimulation);

function runSimulation() {
    // 1. 入力値の取得
    const startAge = parseInt(document.getElementById('current-age').value);
    const initialAsset = parseFloat(document.getElementById('initial-asset').value) * 10000; // 万円を円に
    const annualIncome = parseFloat(document.getElementById('annual-income').value) * 10000; // 万円を円に

    // 簡略化された固定パラメータ
    const endAge = 80; // シミュレーション終了年齢
    const retirementAge = 65; // 退職年齢
    const averageExpense = 400 * 10000; // 簡略化のため年間平均支出を固定（400万円）
    const pension = 250 * 10000; // 簡略化のため年金収入を固定（250万円）

    let currentAsset = initialAsset;
    const tableBody = document.querySelector('#cashflow-table tbody');
    tableBody.innerHTML = ''; // 既存のデータをクリア

    // 2. シミュレーションループ（1年ごとに計算）
    for (let year = 1; ; year++) {
        const currentAge = startAge + year - 1;
        if (currentAge > endAge) break;

        // 収入の計算
        let income = (currentAge < retirementAge) ? annualIncome : pension;

        // 支出の計算 (簡略化のため、年間支出を固定)
        let expense = averageExpense;
        
        // 収支の計算
        const netFlow = income - expense;
        
        // 資産残高の更新 (年間の収支を資産に加える)
        currentAsset += netFlow; 

        // 3. テーブル行の生成
        const row = tableBody.insertRow();

        row.insertCell().textContent = year;
        row.insertCell().textContent = currentAge;
        row.insertCell().textContent = formatMoney(income);
        row.insertCell().textContent = formatMoney(expense);
        
        // 収支のセルに色を付ける
        const netFlowCell = row.insertCell();
        netFlowCell.textContent = formatMoney(netFlow);
        netFlowCell.classList.add(netFlow >= 0 ? 'positive' : 'negative');

        row.insertCell().textContent = formatMoney(currentAsset);
    }
}

// 金額を見やすくするための関数
function formatMoney(amount) {
    // 億、万の単位に変換（元のコードの「万円」表示に近づける）
    const万円 = Math.round(amount / 10000);
    return 万円.toLocaleString() + ' 万円';
}

// ページ読み込み時に一度実行して初期表示
runSimulation();
