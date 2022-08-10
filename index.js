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
  let user_name ="";
  let user_gender = "";
  var stage_status = 0;
  var stage_status_in_function = 0;


  // イベントオブジェクトを順次処理。
  req.body.events.forEach((event) => {
      //fuction
      function user_age_data_get(){
        if(isNaN(event.message.text) == true){
          events_processed.push(bot.replyMessage(event.replyToken, {
            type: "text",
            text: "あなたは" + event.message.text + "歳です。次は名前を入力してください。"
          }));
          user_old = event.message.text;
          stage ++;
        }else{
          events_processed.push(bot.replyMessage(event.replyToken, {
            type: "text",
            text: "数字を入力してください"
          }));
        }
      }
    
      function user_name_data_get(){
          user_name = event.message.text;
          events_processed.push(bot.replyMessage(event.replyToken, {
            type: "text",
            text: "あなたの名前は" + user_name + "です"
          }));
          user_old = event.message.text;
          stage ++;
      }
      // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
      if (event.type == "message" && event.message.type == "text"){
            if (stage_status ==0){
              user_age_data_get();
            }else if (stage_status == 1){
              user_name_data_get();
            }else{
              events_processed.push(bot.replyMessage(event.replyToken, {
                type: "text",
                text: user_name + "(" + user_old + ")「" + event.message.text + "」"
              }));
            }
          }
        }
  );

  // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
  Promise.all(events_processed).then(
      (response) => {
          console.log(`${response.length} event(s) processed.`);
      }
  );
});
