/* Snow Man Fan Channel request helper - shared config
   Station追加時は、基本的に stations の配列だけを編集してください。
   このファイルには利用者個人のID・メールアドレスは入りません。 */
window.SMFC_CONFIG = {
  version: '2026-11-01-auto-v1',

  fandom: 'Snow Man Fans',
  artist: 'Snow Man',
  color: '#d6f4ff',
  spotify: 'https://open.spotify.com/playlist/4VjiB9FNBsKyd5PP6ybea6',
  requestUrl: 'https://www.stationhead.com/p/request-channel',

  // ▼ 対象Stationが増えたら、ここにIDを1行追加するだけです（@は不要）。
  stations: [
    'snowmanfan9sima',
    'snowmandream',
    'chochan6969',
    'whatsolike',
    'sn9support',
    'snowman9flash',
    'snowind'
  ],

  reasons: [
    {
      label: '日本のファンが参加しやすくするため',
      text: 'Snow Man has a large and highly engaged fanbase in Japan, with an active presence across music, television, films, and other entertainment. We believe there is strong demand for a dedicated fan channel where fans can come together to support their music on Stationhead.'
    },
    {
      label: 'Stationheadを新しく知るファンを増やすため',
      text: 'A dedicated Snow Man fan channel could help introduce Stationhead to many Japanese fans who are not yet familiar with the platform. It would provide an easy and welcoming way for them to discover Stationhead and participate in streaming activities together.'
    },
    {
      label: '日本と海外のファンが交流できる場を作るため',
      text: 'Snow Man has fans not only in Japan but also around the world. A dedicated fan channel would create a welcoming space where Japanese and international fans can connect, enjoy Snow Man’s music together, and support the group through Stationhead.'
    }
  ],

  // 以前の本番用申請数カウント先。ID・メール・申請理由は送信しません。
  aggregateUrl: 'https://script.google.com/macros/s/AKfycbw_JVS1QPuwgaUueW-B7-zr6gW95AJYUSqxDB_h9Gpv9YKmnpZ8HEyo-FHI0DZjSSnSDg/exec',

  shareText: 'Snow Manファンチャンネルの申請をしました❄️ みんなでStationheadでSnow Manを応援しよう！'
};
