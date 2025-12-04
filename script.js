/**
 * POSTリクエストを受け取り、Google翻訳でテキストを翻訳して返す関数
 * @param {Object} e - HTTPリクエストのイベントオブジェクト
 * @returns {Object} - JSON形式のレスポンス
 */
function doPost(e) {
  try {
    // リクエストのJSONデータを解析
    const data = JSON.parse(e.postData.contents);
    const text = data.text;
    const targetLang = data.targetLang;

    if (!text || !targetLang) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Missing 'text' or 'targetLang'." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Google翻訳サービスを利用して翻訳を実行
    // ソース言語を自動検出（null）し、ターゲット言語に翻訳します
    const translatedText = LanguageApp.translate(text, null, targetLang);

    // 翻訳結果をJSON形式で返す
    return ContentService.createTextOutput(JSON.stringify({ translatedText: translatedText }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラー処理
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
