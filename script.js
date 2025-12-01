// HTML要素を取得する
const button = document.getElementById('myButton');
const messageElement = document.getElementById('message');

// ボタンがクリックされたときの処理を定義する
button.addEventListener('click', function() {
    // メッセージ要素にテキストを設定する
    messageElement.textContent = 'ボタンがクリックされました！JavaScriptが正常に動作しています。';
    
    // オプション: ボタンの見た目を変更してみる
    button.style.backgroundColor = '#008CBA';
});

// ページが読み込まれたとき（初期状態）のメッセージをコンソールに表示する
console.log('JavaScriptファイルが読み込まれました。');
