/* Snow Man Fan Channel request helper - auto update runtime */
(() => {
  'use strict';

  const runtimeSrc = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : '';
  const configUrl = runtimeSrc
    ? new URL('fan-channel-config.js', runtimeSrc).href
    : '';

  function loadLatestConfig() {
    return new Promise((resolve, reject) => {
      if (!configUrl) {
        reject(new Error('config-url'));
        return;
      }
      try { delete window.SMFC_CONFIG; } catch (_) { window.SMFC_CONFIG = undefined; }
      document.getElementById('smfc-config-loader')?.remove();
      const s = document.createElement('script');
      s.id = 'smfc-config-loader';
      s.src = configUrl + (configUrl.includes('?') ? '&' : '?') + 'v=' + Date.now();
      s.onload = () => {
        const cfg = window.SMFC_CONFIG;
        s.remove();
        if (!cfg || !Array.isArray(cfg.stations) || !cfg.stations.length) {
          reject(new Error('config-invalid'));
          return;
        }
        resolve(cfg);
      };
      s.onerror = () => {
        s.remove();
        reject(new Error('config-load'));
      };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  window.SMFC_RUN = async function SMFC_RUN(user) {
    const D = document;
    const ID = String(user?.id || '').trim().replace(/^@/, '');
    const MAIL = String(user?.email || '').trim();
    const CUSTOM = String(user?.custom || '').trim();

    if (!ID || !MAIL) {
      alert('申請ボタンの個人設定を確認できませんでした。設定ページから作り直してください。');
      return;
    }

    let CFG;
    try {
      CFG = await loadLatestConfig();
    } catch (e) {
      alert('申請ツールの共通設定を読み込めませんでした。通信状態を確認して、もう一度お試しください。');
      return;
    }

    const STATIONS = CFG.stations.map(v => String(v).trim().replace(/^@/, '')).filter(Boolean);
    const REASONS = Array.isArray(CFG.reasons) ? CFG.reasons : [];
    const COLOR = CFG.color || '#d6f4ff';
    const REQUEST_URL = CFG.requestUrl || 'https://www.stationhead.com/p/request-channel';
    const REPORT_URL = CFG.reportUrl || '';

    const Q = s => [...D.querySelectorAll('input,textarea')]
      .find(e => (e.placeholder || '').toLowerCase().includes(s));
    const V = (e, v) => {
      if (!e) return;
      const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const d = Object.getOwnPropertyDescriptor(proto, 'value');
      if (d && d.set) d.set.call(e, v);
      else e.value = v;
      ['input', 'change', 'blur'].forEach(x => e.dispatchEvent(new Event(x, { bubbles: true })));
    };
    const W = t => new Promise(r => setTimeout(r, t));
    const N = t => D.createElement(t);
    const P = h => {
      const o = N('div');
      o.style = 'position:fixed;inset:0;z-index:2147483647;background:#0009;display:grid;place-items:center;padding:18px;font-family:-apple-system,BlinkMacSystemFont,sans-serif';
      o.innerHTML = '<div style="width:min(420px,100%);background:#fff;color:#22313a;padding:18px;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.28)">' + h + '</div>';
      D.body.append(o);
      return o;
    };

    const successPanel = () => {
      D.getElementById('sd')?.remove();
      const safeReportUrl = String(REPORT_URL || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
      const reportButton = REPORT_URL
        ? '<a id="sr" href="' + safeReportUrl + '" target="_blank" rel="noopener" style="display:block;padding:14px 12px;border:0;border-radius:11px;background:#d6f4ff;color:#172033;text-align:center;text-decoration:none;font-size:16px;font-weight:800">✅ 申請したことを報告する</a>'
        : '';
      const o = P('<b style="font-size:20px">❄️ Snow Manファンチャンネル申請完了</b><p style="margin:9px 0 0;font-size:13px;line-height:1.65;color:#66757f">申請数把握のため、最後に一報フォームへのご協力をお願いします。</p><div style="margin-top:14px;display:grid;gap:8px">' + reportButton + '<button id="sx" style="padding:12px;border:0;border-radius:10px;font-size:15px">𝕏 申請したことをシェアする</button><button id="sl" style="padding:12px;border:0;border-radius:10px;font-size:15px">🔗 申請ページのリンクをコピー</button><button id="sc" style="padding:10px;border:0;background:transparent;font-size:14px">閉じる</button></div>');
      o.id = 'sd';
      D.getElementById('sx').onclick = () => {
        location.href = 'https://x.com/intent/post?text=' + encodeURIComponent((CFG.shareText || 'Snow Manファンチャンネルの申請をしました❄️') + ' ' + REQUEST_URL);
      };
      D.getElementById('sl').onclick = () => navigator.clipboard.writeText(REQUEST_URL)
        .then(() => alert('コピーしました！'), () => prompt('コピーしてください', REQUEST_URL));
      D.getElementById('sc').onclick = () => { window._sc = 1; o.remove(); };
    };

    const watchSubmission = () => {
      window._so?.disconnect();
      window._sc = 0;
      const successText = () => (D.body.innerText || '').includes('You submitted a request');
      let done = 0;
      const hit = () => {
        if (done || !successText()) return;
        done = 1;
        window._so?.disconnect();
        setTimeout(() => !window._sc && successPanel(), 800);
        setTimeout(() => !window._sc && !D.getElementById('sd') && successPanel(), 2500);
      };
      window._so = new MutationObserver(hit);
      window._so.observe(D.body, { childList: true, subtree: true, characterData: true });
      hit();
    };

    const coHostList = () => {
      const label = [...D.querySelectorAll('p')].find(p => p.textContent.trim() === 'Co-Hosts');
      const ul = label?.nextElementSibling;
      if (ul?.tagName !== 'UL') return [];
      return [...ul.children]
        .map(li => li.querySelector('img[alt]')?.alt?.toLowerCase())
        .filter(Boolean);
    };
    const hasStation = name => coHostList().includes(name.toLowerCase());

    const fill = async why => {
      watchSubmission();
      V(Q('stationhead'), ID);
      V(Q('army'), CFG.fandom || 'Snow Man Fans');
      V(Q('you@example.com'), MAIL);
      V(Q('rihanna'), CFG.artist || 'Snow Man');
      V(D.querySelector('textarea'), why);
      V(Q('https://') || Q('playlist'), CFG.spotify || '');

      D.getElementById('smfc-progress')?.remove();
      const progress = P('');
      progress.id = 'smfc-progress';
      const box = progress.firstChild;
      box.style.textAlign = 'center';
      const title = N('div');
      title.style = 'font-size:20px;font-weight:800;margin-bottom:8px';
      title.textContent = 'Stationを追加しています';
      const status = N('div');
      status.style = 'font-size:13px;color:#6f7d86;line-height:1.6;white-space:pre-line';
      box.append(title, status);

      const stationPresent = name => {
        const wasHidden = progress.hidden;
        progress.hidden = true;
        const inBody = (D.body.innerText || '').toLowerCase().includes('@' + name.toLowerCase());
        const inList = hasStation(name);
        progress.hidden = wasHidden;
        return inBody || inList;
      };
      const stop = () => {
        const missing = STATIONS.filter(n => !stationPresent(n)).map(n => '@' + n);
        progress.remove();
        alert('追加済み一覧に確認できないStationがあります：' + missing.join('、') + '。自動入力を停止しました。画面で確認して手動で追加してください。');
      };

      for (let i = 0; i < STATIONS.length; i += 1) {
        const station = STATIONS[i];
        status.textContent = '確認中 ' + (i + 1) + ' / ' + STATIONS.length + '\n@' + station + '\n完了まで画面を触らずお待ちください';
        if (stationPresent(station)) continue;

        let added = false;
        for (let attempt = 0; attempt < 3 && !added; attempt += 1) {
          let input = Q('serena');
          if (!input) {
            await W(800);
            input = Q('serena');
          }
          if (!input) break;
          V(input, station);
          await W(800);
          ['keydown', 'keyup'].forEach(k => input.dispatchEvent(new KeyboardEvent(k, { key: 'Enter', code: 'Enter', bubbles: true })));
          await W(1400);
          progress.hidden = true;
          added = stationPresent(station);
          progress.hidden = false;
        }

        if (!added) {
          stop();
          return;
        }
      }

      if (STATIONS.some(n => !stationPresent(n))) {
        stop();
        return;
      }

      progress.remove();
      alert(STATIONS.length + '局すべて追加できました。🎨 Fan Channelのカラーを ' + COLOR + ' に設定し、内容を確認してからSubmitしてください！\n\nSubmit完了後、申請報告フォームへのボタンが表示されます。');
    };

    if (CUSTOM) {
      fill(CUSTOM);
      return;
    }

    D.getElementById('smfc-helper')?.remove();
    const overlay = P('<b style="font-size:20px">申請理由を選んでください</b><p style="font-size:13px;line-height:1.6;margin:8px 0 12px">使いたい理由を1つ選んでください。</p><div style="font-size:13px;line-height:1.7;margin:0 0 12px;padding:9px 10px;border-radius:10px;background:#f5fbff">🎨 <b>カラー設定も忘れずに</b><br>Submit前に Fan Channel のカラーを <span style="display:inline-block;width:14px;height:14px;background:' + COLOR + ';border:1px solid #9ccfe5;border-radius:2px;vertical-align:-2px"></span> <b>' + COLOR + '</b> に設定してください。</div>');
    overlay.id = 'smfc-helper';
    const box = overlay.firstChild;

    REASONS.forEach((r, i) => {
      const button = N('button');
      button.textContent = (i + 1) + ' ' + (r.label || ('理由' + (i + 1)));
      button.style = 'display:block;width:100%;margin:8px 0;padding:12px;border:1px solid #cfe5ef;border-radius:10px;background:#f8fcff;text-align:left;font-size:15px';
      button.onclick = () => { overlay.remove(); fill(r.text || ''); };
      box.append(button);
    });

    const cancel = N('button');
    cancel.textContent = 'キャンセル';
    cancel.style = 'width:100%;padding:10px;border:0;background:transparent;font-size:14px';
    cancel.onclick = () => overlay.remove();
    box.append(cancel);
  };
})();

