/* ============================================================
   学术极简个人主页 · 交互脚本
   1) 深色 / 浅色模式切换（记忆选择，默认跟随系统）
   2) 论文「摘要 / BibTeX」折叠面板
   3) 页脚年份自动更新
   4) 滚动时高亮当前导航项
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'theme';

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch (e) { /* 隐私模式下忽略 */ }
  }

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { /* 忽略 */ }
  if (stored === 'light' || stored === 'dark') {
    root.dataset.theme = stored;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.dataset.theme = 'dark';
  }

  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  document.querySelectorAll('.toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var body = btn.closest('.pub-body');
      var target = body && body.querySelector('.pub-' + btn.dataset.toggle);
      if (!target) return;
      var opening = target.hidden;
      target.hidden = !opening;
      btn.setAttribute('aria-expanded', String(opening));
    });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  if ('IntersectionObserver' in window && sections.length) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (current) current.classList.remove('active');
        current = map[entry.target.id] || null;
        if (current) current.classList.add('active');
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(function (section) { io.observe(section); });
  }
})();
