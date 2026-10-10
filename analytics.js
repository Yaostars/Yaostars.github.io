/* ============================================================
   访问统计打点脚本 v3（GitHub Issues 收集，大陆可达）
   - 页面加载：api.ip.sb → ipwho.is 依次获取访客 IP/机构/地区（共 4s 容错），
     创建 visit Issue（含完整环境信息）
   - 链接点击：批量缓存，防抖 4 秒合并为 clicks Issue
   - 离开页面：leave Issue（停留时长 / 最大滚动深度 / 点击数）
   - 仅在 https://yaostars.github.io 上运行；任何异常都不影响页面本身
   - 凭据为细粒度 PAT（仅可写 Yaostars/homepage-tracker 的 Issues），混淆存放
   ============================================================ */
(function () {
  'use strict';

  if (location.protocol !== 'https:' || !/^yaostars\.github\.io$/.test(location.hostname)) return;

  var REPO_API = 'https://api.github.com/repos/Yaostars/homepage-tracker/issues';
  // 访问凭据以逐字符混淆存放（细粒度 PAT，仅可写 homepage-tracker 的 Issues）
  var TOKEN = (function (s) { var r = ''; for (var i = 0; i < s.length; i++) r += String.fromCharCode(s.charCodeAt(i) ^ 1); return r; })('fhuitc^q`u^00@[LPSUH1bf[P@pYORsLD^{hjR2L8lrM26[vuiduySW0iOQQ2Q7VlGKgBp1@EY8l5NIJPDSSTuB9YJjLx');

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

  function connInfo() {
    try {
      var c = navigator.connection || {};
      return [c.effectiveType, c.downlink ? c.downlink + 'Mbps' : '', c.rtt ? c.rtt + 'ms' : '']
        .filter(Boolean).join(' ');
    } catch (e) { return ''; }
  }

  var visit = {
    v: 3,
    sid: sid(),
    ts: Date.now(),
    path: location.pathname + location.search,
    referrer: document.referrer || '',
    title: document.title,
    ua: navigator.userAgent,
    platform: navigator.platform || '',
    viewport: innerWidth + 'x' + innerHeight,
    screen: screen.width + 'x' + screen.height,
    dpr: window.devicePixelRatio || 1,
    cores: navigator.hardwareConcurrency || 0,
    memory: navigator.deviceMemory || 0,       // 仅 Chrome 提供，其余为 0
    touch: navigator.maxTouchPoints || 0,
    net: connInfo(),
    tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
    lang: navigator.language || '',
    dnt: navigator.doNotTrack || '',
    geo: null
  };

  function postIssue(kind, extra, clicks) {
    try {
      var org = visit.geo && visit.geo.org ? visit.geo.org : 'unknown';
      var title = '[' + kind + '] ' + stamp() + ' · ' + org + ' · ' + visit.sid.slice(0, 6);
      var body = { visit: visit };
      if (extra) body.extra = extra;
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

  // 1) 获取访客网络信息（多源依次尝试，总限时 4s），随后上报 visit
  var done = false;
  function sendVisit() {
    if (done) return;
    done = true;
    postIssue('visit');
  }
  var GEO_SOURCES = [
    ['https://api.ip.sb/geoip', function (g) {
      return { ip: g.ip, asn: g.asn, org: g.asn_organization || g.organization || g.isp, country: g.country, city: g.city, isp: g.isp };
    }],
    ['https://ipwho.is/', function (g) {
      var c = g.connection || {};
      return { ip: g.ip, asn: c.asn, org: c.org || c.isp, country: g.country, city: g.city, isp: c.isp };
    }]
  ];
  try {
    var ctl = new AbortController();
    setTimeout(function () { ctl.abort(); sendVisit(); }, 4000);
    (function next(i) {
      if (done) return;
      if (i >= GEO_SOURCES.length) return sendVisit();
      fetch(GEO_SOURCES[i][0], { signal: ctl.signal })
        .then(function (r) { return r.json(); })
        .then(function (g) { visit.geo = GEO_SOURCES[i][1](g); })
        .catch(function () {})
        .then(function () { if (visit.geo) sendVisit(); else next(i + 1); });
    })(0);
  } catch (e) { sendVisit(); }

  // 2) 链接点击：批量 + 防抖上报
  var clicks = [], timer = null, totalClicks = 0;
  function flushClicks() {
    timer = null;
    if (!clicks.length) return null;
    return clicks.splice(0);
  }
  function flushAsIssue() {
    var batch = flushClicks();
    if (batch) postIssue('clicks', null, batch);
  }
  document.addEventListener('click', function (e) {
    try {
      var el = e.target;
      var a = el && el.closest ? el.closest('a') : null;
      if (!a || !a.href) return;
      clicks.push({ ts: Date.now(), link: a.href, text: (a.textContent || '').trim().slice(0, 60) });
      totalClicks++;
      clearTimeout(timer);
      timer = setTimeout(flushAsIssue, 4000);
    } catch (err) {}
  }, true);

  // 3) 最大滚动深度（passive 监听）
  var maxScroll = 0;
  window.addEventListener('scroll', function () {
    try {
      var h = document.documentElement.scrollHeight - innerHeight;
      var pct = h > 0 ? Math.round(((scrollY || 0) + innerHeight) / (h + innerHeight) * 100) : 100;
      if (pct > maxScroll) maxScroll = pct;
    } catch (e) {}
  }, { passive: true });

  // 4) 离开页面：上报停留时长 / 滚动深度 / 剩余点击
  var left = false;
  function leave() {
    if (left) return;
    left = true;
    var batch = flushClicks();
    postIssue('leave', {
      dwell_ms: Date.now() - visit.ts,
      scroll_pct: maxScroll,
      click_count: totalClicks
    }, batch || undefined);
  }
  window.addEventListener('pagehide', leave);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { flushAsIssue(); leave(); }
  });
})();
