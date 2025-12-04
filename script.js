/**
 * POSTリクエストを受け取り、テキストを翻訳して返すWebアプリのエントリーポイント
 * @param {Object} e - HTTPリクエストのイベントオブジェクト
 * @returns {Object} - JSON形式のレスポンス
 */
function doPost(e) {
  try {
    // リクエストのJSONデータを解析
    const data = JSON.parse(e.postData.contents);
    const texts = data.texts; // 複数のテキストを配列として受け取る
    const targetLang = data.targetLang || 'ja';

    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("翻訳するテキストの配列 ('texts') が不正です。");
    }

    // 翻訳を実行
    const translatedTexts = texts.map(text => {
      // 空またはundefinedの場合は翻訳をスキップ
      if (!text || text.trim() === '') {
        return '';
      }
      // Google翻訳サービスを利用して翻訳を実行
      // ソース言語を自動検出（null）し、ターゲット言語に翻訳します
      return LanguageApp.translate(text, null, targetLang);
    });
    
    // 翻訳結果の配列をJSON形式で返す
    return ContentService.createTextOutput(JSON.stringify({ translatedTexts: translatedTexts }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラー処理
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
