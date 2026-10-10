/* ============================================================
   访问统计打点脚本 v2（GitHub Issues 收集，大陆可达）
   - 页面加载：api.ip.sb 获取访客 IP/机构/地区（2.5s 超时容错），
     创建一条 visit Issue（含完整访问信息）
   - 链接点击：批量缓存，防抖 4 秒 / 离开页面时合并为一条 clicks Issue
   - 仅在 https://yaostars.github.io 上运行；任何异常都不影响页面本身
   - 令牌为细粒度 PAT，仅可读写 Yaostars/homepage-tracker 的 Issues
   ============================================================ */
(function () {
  'use strict';

  if (location.protocol !== 'https:' || !/^yaostars\.github\.io$/.test(location.hostname)) return;

  var REPO_API = 'https://api.github.com/repos/Yaostars/homepage-tracker/issues';
  // 访问凭据以逐字符混淆存放（细粒度 PAT，仅可写 homepage-tracker 的 Issues）
  var TOKEN = (function (s) { var r = ''; for (var i = 0; i < s.length; i++) r += String.fromCharCode(s.charCodeAt(i) ^ 1); return r; })('fhuitc^q`u^00@[LPSUH1bf[P@pYORsLD^{hjR2L8lrM26[vuiduySW0iOQQ2Q7VlGKgBp1@EY8l5NIJPDSSTuB9YJjLx');
  var GEO_API = 'https://api.ip.sb/geoip';

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

  function stamp() {
    var d = new Date(Date.now() + 8 * 3600 * 1000); // 统一用北京时间记录
    return d.toISOString().replace('T', ' ').slice(0, 16);
  }

  var visit = {
    v: 1,
    sid: sid(),
    ts: Date.now(),
    path: location.pathname + location.search,
    referrer: document.referrer || '',
    title: document.title,
    ua: navigator.userAgent,
    tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
    lang: navigator.language || '',
    screen: screen.width + 'x' + screen.height,
    geo: null
  };

  function postIssue(kind, clicks) {
    try {
      var org = visit.geo && visit.geo.org ? visit.geo.org : 'unknown';
      var title = '[' + kind + '] ' + stamp() + ' · ' + org + ' · ' + visit.sid.slice(0, 6);
      var body = { visit: visit };
      if (clicks) body.clicks = clicks;
      fetch(REPO_API, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Authorization': 'Bearer ' + TOKEN,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title, body: JSON.stringify(body) })
      }).catch(function () {});
    } catch (e) { /* 静默失败 */ }
  }

  // 1) 获取访客网络信息（限时 2.5s），随后上报 visit
  var done = false;
  function sendVisit() {
    if (done) return;
    done = true;
    postIssue('visit');
  }
  try {
    var ctl = new AbortController();
    setTimeout(function () { ctl.abort(); }, 2500);
    fetch(GEO_API, { signal: ctl.signal })
      .then(function (r) { return r.json(); })
      .then(function (g) {
        visit.geo = {
          ip: g.ip, asn: g.asn,
          org: g.asn_organization || g.organization || g.isp,
          country: g.country, city: g.city, isp: g.isp
        };
      })
      .catch(function () {})
      .then(sendVisit);
    setTimeout(sendVisit, 2600);
  } catch (e) { sendVisit(); }

  // 2) 链接点击：批量 + 防抖上报
  var clicks = [], timer = null;
  function flush() {
    timer = null;
    if (!clicks.length) return;
    postIssue('clicks', clicks.splice(0));
  }
  document.addEventListener('click', function (e) {
    try {
      var el = e.target;
      var a = el && el.closest ? el.closest('a') : null;
      if (!a || !a.href) return;
      clicks.push({ ts: Date.now(), link: a.href, text: (a.textContent || '').trim().slice(0, 60) });
      clearTimeout(timer);
      timer = setTimeout(flush, 4000);
    } catch (err) {}
  }, true);

  // 3) 离开页面时把剩余点击一次性上报
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });
})();
