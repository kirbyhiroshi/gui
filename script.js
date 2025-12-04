const CURRENT_YEAR = 2025;
const MAX_YEARS = 35; // 初期表示は35年

document.addEventListener('DOMContentLoaded', () => {
    generateTableStructure(MAX_YEARS);
});

// 表示年数変更時の処理
document.querySelectorAll('input[name="display_years"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const years = parseInt(e.target.value);
        generateTableStructure(years);
    });
});

/**
 * テーブルのヘッダーとデータセル（初期値）を動的に生成する
 */
function generateTableStructure(years) {
    const head1 = document.querySelector('.head1');
    const head2 = document.querySelector('.head2');
    const dataRows = document.querySelectorAll('#cashFlowTable .data-row');
    
    // 既存の動的セルをクリア
    head1.querySelectorAll('td:not(.fixed-column)').forEach(td => td.remove());
    head2.querySelectorAll('td:not(.fixed-column)').forEach(td => td.remove());
    dataRows.forEach(row => {
        row.querySelectorAll('td').forEach(td => td.remove());
    });
    
    // 年表セルを生成
    for (let i = 1; i <= years; i++) {
        // 経過年数ヘッダー
        const thYear = document.createElement('td');
        thYear.textContent = i;
        head1.appendChild(thYear);

        // 西暦ヘッダー
        const thCalendar = document.createElement('td');
        thCalendar.textContent = CURRENT_YEAR + i - 1;
        head2.appendChild(thCalendar);

        // データ行に初期セルを挿入 (例として全て 0 を挿入)
        dataRows.forEach(row => {
            const tdData = document.createElement('td');
            tdData.textContent = 0; // ここに計算結果が入ります
            row.appendChild(tdData);
        });
    }

    // --- シミュレーションデータの計算処理（簡易版） ---
    // ここで generateSimulationData(years) のような関数を呼び出し、
    // 実際に年収や支出、資産残高のセルを計算結果で上書きします。
}

function openInputModal() {
    alert('家族構成の入力モーダルを開く処理をここに実装します。');
}
