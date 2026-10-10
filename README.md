# Xincheng Yao · 学术极简个人主页（英文版）

纯静态三件套（`index.html` + `style.css` + `script.js`），无任何构建依赖、不引用外部 CDN，双击 `index.html` 即可本地预览，可直接部署到 GitHub Pages / Vercel / Netlify。

页面内容已根据简历 `assets/cv.pdf` 填写为**全英文**真实信息，并按本人要求做了取舍：淡化本科背景（不出现 Agriculture 与本科导师）、仅收录已发表/已录用的 3 篇论文（在审论文不上站）、实习只写公司与职位不展示任何细节、不设 Awards 区块。

自带功能：明暗双主题（跟随系统、可手动切换并记忆）、论文摘要 / BibTeX 折叠、吸顶导航 + 滚动高亮、移动端自适应、打印友好。

## 本地预览

直接用浏览器打开 `index.html`，或起一个本地服务：

```bash
cd academic-homepage
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 还需要你补的内容（都在 index.html 里，搜索 TODO）

| 待补充 | 位置 |
| --- | --- |
| （可选）恢复 Google Scholar / CV 链接 | 已按要求暂时撤下，注释保留在页头 `hero-links` 区块，取消注释即可恢复 |

照片为原图 `assets/intro.jpg`（保持原比例显示、不裁剪、与文字列右对齐；换照片直接覆盖该文件）。

论文区说明：三篇论文的标题分别链接到官方页面（MICCAI 2026 PDF / MICCAI 2025 页面 / Nature 文章页），摘要与 BibTeX 均取自官方来源；每条仅保留 Abstract / BibTeX 折叠按钮。

Zhipu AI logo：使用 `assets/Z_black.svg`（你的原文件，透明底、未做修改），显示在 Experience 区块最右侧；深色主题自动反色。

Zhipu AI logo 已接入：官方图 `zhipu logo.png` 经自动去白底、裁边后存为 `assets/zhipu.png`（透明底黑色标志，深色主题自动反色），显示在 Experience 区块最右侧、与文字列右缘对齐。

## 日常维护

| 想改什么 | 位置 |
| --- | --- |
| 个人简介 | 搜索 `bio`（两段为宜） |
| 教育经历 | 对应 `plain-list` 列表，复制一行 `<li>` 即可新增 |
| 研究兴趣标签 | 搜索 `chips`（增删 `<span class="chip">`） |
| 动态 News | 搜索 `news`，复制一条 `<div class="news-item">…</div>` 修改即可；最新的加 `<span class="badge-new">New</span>` |
| 论文 | 搜索 `publications`，复制整个 `<article class="pub">…</article>`（日后论文录用，照此模板加回即可，编号 [n] 顺延）；作者里自己名字用 `<strong>` 包住；「摘要 / BibTeX」面板不需要就整块删掉 |
| 经历 Experience | 搜索 `experience`，每段经历一个 `<div class="exp">` |
| 获奖 Awards | 搜索 `awards`，复制一行 `<li>` 即可新增 |
| 页脚「最后更新」日期 | 搜索 `Last updated` |

按本人要求：无独立 Contact 区块（联系入口为页头 Email 图标与简介结尾句）；页脚不写模板致谢。

## 换配色 / 字体

主题颜色与字体集中在 `style.css` 顶部的 `:root`（浅色）和 `[data-theme="dark"]`（深色）变量中，改 `--accent` 一个变量即可整体换主色。

## 部署

**GitHub Pages（推荐）**

1. 新建一个公开仓库（如 `username.github.io` 或任意名字）；
2. 把本目录所有文件推上去；
3. 仓库 Settings → Pages → Branch 选 `main`、目录选 `/ (root)`，保存后几分钟即可通过 `https://username.github.io/仓库名/` 访问。

**Vercel / Netlify**：把整个文件夹拖进控制台即可，无需任何配置。

## 目录结构

```
academic-homepage/
├── index.html   # 全部页面内容（日常维护基本只改这个文件）
├── style.css    # 样式与主题变量
├── script.js    # 主题切换 / 折叠面板等交互
├── assets/
│   └── cv.pdf   # 简历（页头 CV 按钮即指向它，更新简历直接覆盖此文件）
└── README.md    # 本说明
```

模板可自由修改与商用，无版权负担。
