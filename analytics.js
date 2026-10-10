/* ============================================================
   访问统计打点脚本（随主页公开加载）
   - 上报页面浏览与所有 <a> 链接点击（sendBeacon，不阻塞页面）
   - ENDPOINT 在 Worker 部署后填写；占位符状态下自动停用
   ============================================================ */
(function () {
  'use strict';

  var ENDPOINT = 'https://homepage-analytics.yaostars.workers.dev/collect';

  function sid() {
    try {
      var s = sessionStorage.getItem('v_sid');
      if (!s) {
        s = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        sessionStorage.setItem('v_sid', s);
      }
      return s;
    } catch (e) { return 'anon'; }
  }

  function send(type, extra) {
    var payload = JSON.stringify(Object.assign({
      t: type,
      sid: sid(),
      u: location.pathname + location.search,
      r: document.referrer || '',
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
      sw: screen.width + 'x' + screen.height,
      lang: navigator.language || ''
    }, extra || {}));
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, payload);
    } else {
      fetch(ENDPOINT, { method: 'POST', body: payload, keepalive: true }).catch(function () {});
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target;
    var a = el && el.closest ? el.closest('a') : null;
    if (!a || !a.href) return;
    send('click', { link: a.href, text: (a.textContent || '').trim().slice(0, 60) });
  }, true);

  if (ENDPOINT.indexOf('__') !== 0) send('pageview', { title: document.title });
})();
