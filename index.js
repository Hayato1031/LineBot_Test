// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);


// -----------------------------------------------------------------------------
// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
  // 先行してLINE側にステータスコード200でレスポンスする。
  res.sendStatus(200);

  // すべてのイベント処理のプロミスを格納する配列。
  let events_processed = [];
  let user_data = [];
  let user_old = "";
  let user_gender = "";


  // イベントオブジェクトを順次処理。
  req.body.events.forEach((event) => {
      // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
      if (event.type == "message" && event.message.type == "text"){
        if (event.message.text=="1"||event.message.text=="2"||event.message.text=="3"||event.message.text=="4"){
          user_old = event.message.text;
          events_processed.push(bot.replyMessage(event.replyToken, {
            type: "text",
            text: "あなたは大学" + user_old + "年生ですか？次は性別。男/女"
          }));
        }else if (user_old != ""){
          if (event.message.text=="男"||event.message.text=="女"){
            user_gender = event.message.text;
            events_processed.push(bot.replyMessage(event.replyToken, {
              type: "text",
              text: "あなたは" + user_gender + "性です。情報を登録します。"
            }));
            user_data.push({Old:user_old, Gender:user_gender});
            console.log(user_data);
            events_processed.push(bot.replyMessage(event.replyToken, {
              type: "text",
              text: "情報を登録しました。あなたは大学"+ user_old + "年生の" + user_gender + "性です"
            }));
            user_gender = "";
            user_old = "";
          }else{
            console.log(event.message.text);
            events_processed.push(bot.replyMessage(event.replyToken, {
              type: "text",
              text: "あなた「" + event.message.text + "」"
            }));
          }
        }
      }
  });

  // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
  Promise.all(events_processed).then(
      (response) => {
          console.log(`${response.length} event(s) processed.`);
      }
  );
});