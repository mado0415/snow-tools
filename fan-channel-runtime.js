/* Snow Man Fan Channel request helper - auto update runtime */
(() => {
  'use strict';

  const CONFIG_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbzgYm4QqM2AySZnonB5DX5AgS4EKdR_9X49LjuxxIsWCpblmTrdWzOMnOJk-d7HvoZ6/exec';

  const STATIC = {
    fandom: 'Snow Man Fans',
    artist: 'Snow Man',
    color: '#d6f4ff',
    spotify:
      'https://open.spotify.com/playlist/4VjiB9FNBsKyd5PP6ybea6',
    requestUrl:
      'https://www.stationhead.com/p/request-channel',
    aggregateUrl:
      'https://script.google.com/macros/s/AKfycbw_JVS1QPuwgaUueW-B7-zr6gW95AJYUSqxDB_h9Gpv9YKmnpZ8HEyo-FHI0DZjSSnSDg/exec',
    reportUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSeg0ANIGuYSiSB6jlCBHQ9df9Yj284mFe9Y7lCarVUwkD3Q3w/viewform',
    shareText:
      'Snow Manファンチャンネルの申請をしました❄️ みんなでStationheadでSnow Manを応援しよう！',

    reasons: [
      {
        label:
          '日本のファンが集まりやすい場所を作りたい',
        description:
          'Snow ManファンがStationheadに集まり、一緒に音楽を楽しみながら応援できる専用チャンネルを希望します。',
        text:
          'Snow Man has a large and highly engaged fanbase in Japan, with an active presence across music, television, films, and other entertainment. We believe there is strong demand for a dedicated fan channel where fans can come together to support their music on Stationhead.'
      },
      {
        label:
          'Stationheadを新しいファンにも広めたい',
        description:
          'Fan Channelを入口に、まだStationheadを知らない日本のファンにもサービスを知ってもらい、参加しやすくしたいです。',
        text:
          'A dedicated Snow Man fan channel could help introduce Stationhead to many Japanese fans who are not yet familiar with the platform. It would provide an easy and welcoming way for them to discover Stationhead and participate in streaming activities together.'
      },
      {
        label:
          '日本と海外のファンが一緒に楽しめる場所を作りたい',
        description:
          '日本と海外のSnow Manファンが国を越えてつながり、一緒に音楽を楽しめる場所を希望します。',
        text:
          'Snow Man has fans not only in Japan but also around the world. A dedicated fan channel would create a welcoming space where Japanese and international fans can connect, enjoy Snow Man’s music together, and support the group through Stationhead.'
      }
    ]
  };

  function loadStations() {
    return new Promise((resolve, reject) => {
      if (
        !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?|$)/.test(
          CONFIG_ENDPOINT
        )
      ) {
        reject(new Error('endpoint-not-set'));
        return;
      }

      const callbackName =
        '__smfcCfg' +
        Date.now() +
        Math.random()
          .toString(36)
          .slice(2);

      const script =
        document.createElement('script');

      let timer;

      const cleanup = () => {
        clearTimeout(timer);

        try {
          delete window[callbackName];
        } catch (_) {
          window[callbackName] =
            undefined;
        }

        script.remove();
      };

      window[callbackName] =
        payload => {
          if (
            !payload ||
            !payload.ok ||
            !Array.isArray(
              payload.stations
            ) ||
            !payload.stations.length
          ) {
            cleanup();
            reject(
              new Error(
                'config-invalid'
              )
            );
            return;
          }

          const stations = [
            ...new Set(
              payload.stations
                .map(v =>
                  String(v || '')
                    .trim()
                    .replace(/^@/, '')
                )
                .filter(Boolean)
            )
          ];

          cleanup();

          if (!stations.length) {
            reject(
              new Error(
                'config-empty'
              )
            );
          } else {
            resolve({
              stations,
              revision:
                payload.revision ||
                0,
              updatedAt:
                payload.updatedAt ||
                ''
            });
          }
        };

      script.onerror = () => {
        cleanup();

        reject(
          new Error(
            'config-load'
          )
        );
      };

      const sep =
        CONFIG_ENDPOINT.includes('?')
          ? '&'
          : '?';

      script.src =
        CONFIG_ENDPOINT +
        sep +
        'action=config&callback=' +
        encodeURIComponent(
          callbackName
        ) +
        '&v=' +
        Date.now();

      (
        document.head ||
        document.documentElement
      ).appendChild(script);

      timer = setTimeout(
        () => {
          cleanup();

          reject(
            new Error(
              'config-timeout'
            )
          );
        },
        12000
      );
    });
  }

  window.SMFC_RUN =
    async function SMFC_RUN(user) {
      const D = document;

      const ID = String(
        user?.id || ''
      )
        .trim()
        .replace(/^@/, '');

      const MAIL = String(
        user?.email || ''
      ).trim();

      const CUSTOM = String(
        user?.custom || ''
      ).trim();

      if (!ID || !MAIL) {
        alert(
          '申請ボタンの個人設定を確認できませんでした。設定ページから作り直してください。'
        );

        return;
      }

      let stationConfig;

      try {
        stationConfig =
          await loadStations();
      } catch (e) {
        alert(
          '対象Stationの最新一覧を読み込めませんでした。通信状態を確認して、もう一度お試しください。'
        );

        return;
      }

      const STATIONS =
        stationConfig.stations;

      const REASONS =
        STATIC.reasons;

      const COLOR =
        STATIC.color;

      const REQUEST_URL =
        STATIC.requestUrl;

      const AGG =
        STATIC.aggregateUrl;

      const Q = s =>
        [
          ...D.querySelectorAll(
            'input,textarea'
          )
        ].find(e =>
          (
            e.placeholder || ''
          )
            .toLowerCase()
            .includes(s)
        );

      const V = (e, v) => {
        if (!e) return;

        const proto =
          e.tagName ===
          'TEXTAREA'
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;

        const d =
          Object.getOwnPropertyDescriptor(
            proto,
            'value'
          );

        if (d && d.set) {
          d.set.call(e, v);
        } else {
          e.value = v;
        }

        [
          'input',
          'change',
          'blur'
        ].forEach(x =>
          e.dispatchEvent(
            new Event(x, {
              bubbles: true
            })
          )
        );
      };

      const W = t =>
        new Promise(r =>
          setTimeout(r, t)
        );

      const N = t =>
        D.createElement(t);

      const P = h => {
        const o = N('div');

        o.style =
          'position:fixed;' +
          'inset:0;' +
          'z-index:2147483647;' +
          'background:#0009;' +
          'display:grid;' +
          'place-items:center;' +
          'padding:18px;' +
          'font-family:-apple-system,BlinkMacSystemFont,sans-serif';

        o.innerHTML =
          '<div style="' +
          'width:min(420px,100%);' +
          'background:#fff;' +
          'color:#22313a;' +
          'padding:18px;' +
          'border-radius:16px;' +
          'box-shadow:0 18px 50px rgba(0,0,0,.28)' +
          '">' +
          h +
          '</div>';

        D.body.append(o);

        return o;
      };

      const successPanel =
        () => {
          D
            .getElementById('sd')
            ?.remove();

          const o = P(
            '<b style="font-size:20px">' +
              '❄️ Snow Manファンチャンネル申請完了' +
            '</b>' +
            '<p style="' +
              'margin:10px 0 14px;' +
              'font-size:13px;' +
              'line-height:1.65;' +
              'color:#6f7d86' +
            '">' +
              '申請状況を把握するため、最後に一報フォームへのご協力をお願いします。' +
            '</p>' +
            '<div style="display:grid;gap:8px">' +
              '<button id="sr" style="' +
                'padding:13px;' +
                'border:1px solid #9ccfe5;' +
                'border-radius:10px;' +
                'background:#d6f4ff;' +
                'color:#22313a;' +
                'font-size:15px;' +
                'font-weight:800' +
              '">' +
                '✅ 申請したことを報告する' +
              '</button>' +
              '<button id="sx" style="padding:12px;border:0;border-radius:10px;font-size:15px">' +
                '𝕏 申請したことをシェアする' +
              '</button>' +
              '<button id="sl" style="padding:12px;border:0;border-radius:10px;font-size:15px">' +
                '🔗 申請ページのリンクをコピー' +
              '</button>' +
              '<button id="sc" style="padding:10px;border:0;background:transparent;font-size:14px">' +
                '閉じる' +
              '</button>' +
            '</div>'
          );

          o.id = 'sd';

          D.getElementById(
            'sr'
          ).onclick = () => {
            window.open(
              STATIC.reportUrl,
              '_blank',
              'noopener'
            );
          };

          D.getElementById(
            'sx'
          ).onclick = () => {
            location.href =
              'https://x.com/intent/post?text=' +
              encodeURIComponent(
                STATIC.shareText +
                  ' ' +
                  REQUEST_URL
              );
          };

          D.getElementById(
            'sl'
          ).onclick = () =>
            navigator.clipboard
              .writeText(
                REQUEST_URL
              )
              .then(
                () =>
                  alert(
                    'コピーしました！'
                  ),
                () =>
                  prompt(
                    'コピーしてください',
                    REQUEST_URL
                  )
              );

          D.getElementById(
            'sc'
          ).onclick = () => {
            window._sc = 1;
            o.remove();
          };
        };

      const watchSubmission =
        () => {
          window._so?.disconnect();

          window._sc = 0;

          const COUNT_KEY =
            'smfcCounted';

          const successText =
            () =>
              (
                D.body.innerText ||
                ''
              ).includes(
                'You submitted a request'
              );

          if (!successText()) {
            sessionStorage.removeItem(
              COUNT_KEY
            );
          }

          let done = 0;

          const hit = () => {
            if (
              done ||
              !successText()
            ) {
              return;
            }

            done = 1;

            window._so?.disconnect();

            if (
              AGG &&
              !sessionStorage.getItem(
                COUNT_KEY
              )
            ) {
              sessionStorage.setItem(
                COUNT_KEY,
                '1'
              );

              const ping =
                new Image();

              ping.src =
                AGG +
                (
                  AGG.includes('?')
                    ? '&'
                    : '?'
                ) +
                'action=count&time=' +
                Date.now();

              window.__smfcCountPing =
                ping;
            }

            setTimeout(
              () =>
                !window._sc &&
                successPanel(),
              800
            );

            setTimeout(
              () =>
                !window._sc &&
                !D.getElementById(
                  'sd'
                ) &&
                successPanel(),
              2500
            );
          };

          window._so =
            new MutationObserver(
              hit
            );

          window._so.observe(
            D.body,
            {
              childList: true,
              subtree: true,
              characterData: true
            }
          );

          hit();
        };

      const coHostList =
        () => {
          const label = [
            ...D.querySelectorAll(
              'p'
            )
          ].find(
            p =>
              p.textContent.trim() ===
              'Co-Hosts'
          );

          const ul =
            label?.nextElementSibling;

          if (
            ul?.tagName !==
            'UL'
          ) {
            return [];
          }

          return [
            ...ul.children
          ]
            .map(
              li =>
                li
                  .querySelector(
                    'img[alt]'
                  )
                  ?.alt
                  ?.toLowerCase()
            )
            .filter(Boolean);
        };

      const hasStation = name =>
        coHostList().includes(
          name.toLowerCase()
        );

      const fill =
        async why => {
          watchSubmission();

          V(
            Q('stationhead'),
            ID
          );

          V(
            Q('army'),
            STATIC.fandom
          );

          V(
            Q(
              'you@example.com'
            ),
            MAIL
          );

          V(
            Q('rihanna'),
            STATIC.artist
          );

          V(
            D.querySelector(
              'textarea'
            ),
            why
          );

          V(
            Q('https://') ||
              Q('playlist'),
            STATIC.spotify
          );

          D
            .getElementById(
              'smfc-progress'
            )
            ?.remove();

          const progress =
            P('');

          progress.id =
            'smfc-progress';

          const box =
            progress.firstChild;

          box.style.textAlign =
            'center';

          const title =
            N('div');

          title.style =
            'font-size:20px;' +
            'font-weight:800;' +
            'margin-bottom:8px';

          title.textContent =
            'Stationを追加しています';

          const status =
            N('div');

          status.style =
            'font-size:13px;' +
            'color:#6f7d86;' +
            'line-height:1.6;' +
            'white-space:pre-line';

          box.append(
            title,
            status
          );

          const stationPresent =
            name => {
              const wasHidden =
                progress.hidden;

              progress.hidden =
                true;

              const inBody =
                (
                  D.body.innerText ||
                  ''
                )
                  .toLowerCase()
                  .includes(
                    '@' +
                      name.toLowerCase()
                  );

              const inList =
                hasStation(name);

              progress.hidden =
                wasHidden;

              return (
                inBody ||
                inList
              );
            };

          const stop = () => {
            const missing =
              STATIONS
                .filter(
                  n =>
                    !stationPresent(
                      n
                    )
                )
                .map(
                  n =>
                    '@' + n
                );

            progress.remove();

            alert(
              '追加済み一覧に確認できないStationがあります：' +
                missing.join(
                  '、'
                ) +
                '。自動入力を停止しました。画面で確認して手動で追加してください。'
            );
          };

          for (
            let i = 0;
            i <
            STATIONS.length;
            i += 1
          ) {
            const station =
              STATIONS[i];

            status.textContent =
              '確認中 ' +
              (i + 1) +
              ' / ' +
              STATIONS.length +
              '\n@' +
              station +
              '\n完了まで画面を触らずお待ちください';

            if (
              stationPresent(
                station
              )
            ) {
              continue;
            }

            let added =
              false;

            for (
              let attempt = 0;
              attempt < 3 &&
              !added;
              attempt += 1
            ) {
              let input =
                Q('serena');

              if (!input) {
                await W(800);

                input =
                  Q('serena');
              }

              if (!input) {
                break;
              }

              V(
                input,
                station
              );

              await W(800);

              [
                'keydown',
                'keyup'
              ].forEach(
                k =>
                  input.dispatchEvent(
                    new KeyboardEvent(
                      k,
                      {
                        key: 'Enter',
                        code: 'Enter',
                        bubbles: true
                      }
                    )
                  )
              );

              await W(1400);

              progress.hidden =
                true;

              added =
                stationPresent(
                  station
                );

              progress.hidden =
                false;
            }

            if (!added) {
              stop();
              return;
            }
          }

          if (
            STATIONS.some(
              n =>
                !stationPresent(
                  n
                )
            )
          ) {
            stop();
            return;
          }

          progress.remove();

          alert(
            STATIONS.length +
              '局すべて追加できました。🎨 Fan Channelのカラーを ' +
              COLOR +
              ' に設定し、内容を確認してからSubmitしてください！\n\n' +
              '申請完了後、申請報告フォームへのボタンが表示されます。'
          );
        };

      if (CUSTOM) {
        fill(CUSTOM);
        return;
      }

      D
        .getElementById(
          'smfc-helper'
        )
        ?.remove();

      const overlay = P(
        '<b style="font-size:20px">' +
          '申請理由を選んでください' +
        '</b>' +
        '<p style="font-size:13px;line-height:1.6;margin:8px 0 12px;color:#6f7d86">' +
          '一番近いものを選んでください。選んだ内容に合わせた英文が申請フォームへ入力されます。' +
        '</p>' +
        '<div style="font-size:13px;line-height:1.7;margin:0 0 12px;padding:9px 10px;border-radius:10px;background:#f5fbff">' +
          '🎨 <b>カラー設定も忘れずに</b><br>' +
          'Submit前に Fan Channel のカラーを ' +
          '<span style="display:inline-block;width:14px;height:14px;background:' +
          COLOR +
          ';border:1px solid #9ccfe5;border-radius:2px;vertical-align:-2px"></span> ' +
          '<b>' +
          COLOR +
          '</b> に設定してください。' +
        '</div>'
      );

      overlay.id =
        'smfc-helper';

      const box =
        overlay.firstChild;

      REASONS.forEach(
        (r, i) => {
          const button =
            N('button');

          button.style =
            'display:block;' +
            'width:100%;' +
            'margin:10px 0;' +
            'padding:14px 15px;' +
            'border:1px solid #cfe5ef;' +
            'border-radius:13px;' +
            'background:#f8fcff;' +
            'text-align:left;' +
            'color:#22313a;' +
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif;';

          const choiceTitle =
            N('div');

          choiceTitle.style =
            'font-size:15px;' +
            'font-weight:800;' +
            'line-height:1.45;';

          choiceTitle.textContent =
            (i + 1) +
            '　' +
            r.label;

          const description =
            N('div');

          description.style =
            'margin-top:6px;' +
            'font-size:12px;' +
            'font-weight:400;' +
            'line-height:1.6;' +
            'color:#6f7d86;';

          description.textContent =
            r.description;

          button.append(
            choiceTitle,
            description
          );

          button.onclick =
            () => {
              overlay.remove();

              fill(r.text);
            };

          box.append(
            button
          );
        }
      );

      const cancel =
        N('button');

      cancel.textContent =
        'キャンセル';

      cancel.style =
        'width:100%;' +
        'padding:10px;' +
        'border:0;' +
        'background:transparent;' +
        'font-size:14px;' +
        'color:#6f7d86;';

      cancel.onclick =
        () =>
          overlay.remove();

      box.append(cancel);
    };
})();

