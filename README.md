# hydro-better

一个 Hydro 站点的篡改猴（Tampermonkey / Violentmonkey / Userscripts）美化脚本。

- 站点：`https://zsoj.gbfish.cn/`、内网镜像 `http://10.3.44.224/`（含带端口的写法，如 `http://10.3.44.224:8080/`），以及脚本头部 `@match` 里的其它 Hydro 站点
- 当前版本：**v1.14.1**
- 脚本文件：`Hydro-UI-Beautifier.user.js`
- 历史版本：`versions/Hydro-UI-Beautifier-<版本号>.user.js`

## 安装

推荐用「从 URL 安装」，这样脚本管理器自己也能帮你检查更新：

```
https://raw.githubusercontent.com/lscminxi/hydro-better/main/Hydro-UI-Beautifier.user.js
```

如果 `raw.githubusercontent.com` 打不开（国内很常见），用 jsDelivr 镜像手动安装一次：

```
https://cdn.jsdelivr.net/gh/lscminxi/hydro-better@main/Hydro-UI-Beautifier.user.js
```

装好 v1.9.0 之后就不再依赖镜像了：脚本自带的三条更新通道（raw / GitHub API / codeload）任一条可用即可。

- Tampermonkey：仪表盘 → 实用工具 → 「从 URL 安装」→ 粘贴上面的地址。
- Violentmonkey：设置 → 「从 URL 安装」。
- 或者直接打开上面的地址，脚本管理器会自动弹出安装页。

首次本地安装的话，打开 `Hydro-UI-Beautifier.user.js` 把内容复制进「新建脚本」也可以，但那样脚本管理器不认识更新源，只能依赖脚本内置的更新检测（见下）。

## v1.14.1 更新内容

- 继续修复局部跳转后配置失效：除 body 外，也监测并恢复 html 上被清空/覆盖的美化 CSS 变量、卡片识别 class 和被移除的样式表；只恢复脚本自己的状态，不改站点其它属性、不重置保存的配置。
- 增加 PJAX 完成、浏览器返回页面时的补充恢复，保留原有 body 替换处理。
- 作业 / 比赛题号按钮禁止压缩成细线，数量过多时在题号区域自动换行；取消容器固定高度和溢出裁剪，卡片随换行高度预留空间。

回归测试（需要 Node.js）：

```sh
npm install --prefix /tmp/hb-tests jsdom
NODE_PATH=/tmp/hb-tests/node_modules node tests/navigation.cjs
```

测试覆盖根变量被清空/覆盖、body/卡片 class 丢失、样式表删除、body 替换、PJAX 事件，以及配置不被重置、恢复流程不无限循环。题号换行的实际视觉效果需在浏览器中验证。

## v1.14.0 更新内容

- 评测记录题目自动补全：抬高所在卡片的层级，避免候选列表被后面的表格盖住，并统一深浅色。
- IDE：补齐 Monaco 根节点、右侧 minimap、输入框、光标及默认文本颜色，不覆盖语法高亮色。
- 局部跳转：重新应用配置；body 被替换时恢复美化状态，避免重复初始化事件和观察器。
- 题面 blockquote（含数学输入格式）跟随卡片透明度、圆角和毛玻璃。
- 比赛 / 作业筛选栏保持单行，窄屏横向滚动，搜索按钮不再折行。

## v1.13.0 更新内容

### 代码块并入「卡片」

- 删掉独立的「代码块」标签页，设置合并到 **卡片** 页顶部。
- 代码块外观改为**与卡片同源**：底色 = 卡片底色 + 卡片不透明度，毛玻璃 = 卡片毛玻璃，边框/阴影也复用卡片设置 —— 所以背景图片会像透过卡片一样透过代码块（此前代码块是实色，看不透）。
- 保留的独立项只有：`代码块跟随卡片`（开关）、内边距、字号、边框、自动换行。
- 语法高亮依旧不动 `span.hljs-*`，只是容器变成半透明玻璃。

### 修复「乱」的筛选条（图 1 / 图 2）

- 之前 `.section__tools` 被改成 `static` 后与标题抢位置；现在标题和工具栏在同一行 flex 布局里，标题过长自动换行，工具栏靠右，窄屏（≤900px）整体左对齐换行。
- 工具栏内部统一高度（2.15rem）、圆角、内边距与间距：`input` / `select` / `button` / 「查看：<select>」这类内联控件不再是不同高度的方块堆叠。
- 主按钮（提交/搜索）使用强调色，次要按钮中性色，hover 统一强调色描边。

### 在线 IDE（程序坞 / scratchpad）

- 之前脚本对 `mode--scratchpad` 直接跳过，IDE 里还是 Hydro 原生白底。现在 IDE 也有完整主题：容器、面板标题、工具栏、Tab 列表、数据输入区、评测记录表格、Monaco/CodeMirror 编辑器底色全部跟随脚本的深色/浅色主题与圆角。
- 兼容两种进入方式：`body.mode--scratchpad` 或页面里直接出现 `#scratchpad` / `.scratchpad-container`（后者会自动补上标记）。

## v1.12.0 更新内容

### 代码块可配置（新增「代码块」标签页）

代码块现在和卡片一样有一整套独立参数，**站点原本的语法高亮配色完整保留**（脚本只改底色、圆角、留白、字号，不碰 `span.hljs-*` 的颜色）：

| 参数 | 说明 |
| --- | --- |
| 启用代码块卡片化 | 总开关，关掉即恢复站点原始样式 |
| 代码块底色 | 任意颜色，默认深色 `#1b2030` |
| 底色不透明度 | 0–100%，可做出半透明玻璃底 |
| 圆角 / 内边距 | 0–24px / 0–40px |
| 毛玻璃 | 0–24px（配合半透明底使用） |
| 代码字号 | 70–160%，只缩放代码块内部 |
| 显示边框 / 阴影 | 复用全局边框与阴影强度 |
| 自动换行 | 开启后长行折行，手机上不用横向滚动 |

另带三个快捷预设：**深色代码底 / 浅色代码底 / 跟随强调色**，以及「恢复默认」。

### 修复

| 问题 | 处理 |
| --- | --- |
| 评测记录页筛选区没有圆角（图 1） | `.section__body > .row` 不再溢出卡片；`label > input.textbox / select` 与 `.filter-form` 统一圆角、间距；表格容器 `overflow:hidden` 让圆角真正裁切 |
| 文章编辑页编辑区、分屏、预览区没有圆角（图 2） | 按 md-editor-rt 的实际结构给 `.md-editor / .md-editor-content / .md-editor-input-wrapper / .md-editor-preview-wrapper / .md-editor-preview / toolbar / footer` 全部补圆角 + 半透明 + 毛玻璃，`.cm-editor` 底角跟随外壳 |
| 编辑器与右侧「发布设置」区块不统一 | 同上，并保证窄屏下 `.md-editor-wrapper` 不被挤压 |
| 比赛列表筛选栏与标题没对齐（图 3 圈内） | `.section__tools` 之前被改成 `static` 导致错位，现在恢复 Hydro 原生的 `position:absolute` 靠右对齐，只统一内部控件圆角；≤820px 时才回到文档流并左对齐 |

## v1.11.0 更新内容

### 移除自动打开（按 #11 / #12 的反馈）

- 删掉「打开 `10.3.44.224` 就自动打开云原神」「打开云原神就自动跳回内网」的联动，以及配套的 `@match https://ys.mihoyo.com/cloud*`、`@grant GM_openInTab`。脚本不再自动打开任何标签页，只做美化。

### 修复的工单

| 工单 | 问题 | 处理 |
| --- | --- | --- |
| #5 | 进入新页面短暂闪屏 | 改为 `@run-at document-start`：样式与背景变量在首帧前写入（新增轻量 boot 样式），HTML 里也提前带上 `hb170-bg-active`，不再先渲染原生白/灰底再翻成毛玻璃；DOM 初始化等 `body` 就绪后再跑（body 被站点框架替换时会自动重挂） |
| #6 | 学术页圆角出现得慢 | 学术卡片 `border-radius` / `background-clip` 由纯 CSS 直接命中，不再依赖 JS 扫描后才加类；列表栅格 `min-width:0` 防止撑破 |
| #7 | 评测记录 / 作业 / 比赛顶部搜索、筛选没圆角 | `.section__tools` 及其内部 `input/select/button` 统一圆角与配色，窄屏自动换行 |
| #8 | 文章编辑页编辑框不透明、无毛玻璃 | `textarea[data-markdown]`、`.textarea-container` 与 CodeMirror / EasyMDE / Monaco 外壳统一圆角 + 半透明底 + 毛玻璃，聚焦时强调色描边 |
| #9 | `/home/settings/domain` 没有圆角 | 所有 `.section / .section__header / .section__body / .section__footer / .section__table-container / .data-table` 统一圆角（首尾元素继承外圆角），域名管理页的表格与表单控件一并适配 |
| #10 | 账号 / 偏好 / 安全设置页没有圆角 | 同上；另外 `platform-list` / `sessionlist` / `autherlist` 的每一项改成独立圆角小卡片，`textbox` / 按钮统一圆角与配色 |

## v1.9.0 更新内容（修复「检查更新没效果」）

现象与原因：

1. 原来只从 `raw.githubusercontent.com` 取版本号，这个域名在很多网络里连不上，于是永远显示「检查失败」。
2. 检查结果（包括失败）缓存 6 小时，失败后不会重试，看起来就像「没反应」。
3. 面板打开时不会重新读取状态，只有页面加载后那一次结果可见，容易以为功能没生效。

现在的做法：

- **三个更新源自动降级**：`raw.githubusercontent.com` → `GitHub API 提交列表 + 该提交的 .patch` → `codeload 源码包（tar.gz，浏览器内解压）`。只要有一个能连上就能拿到版本号；面板里会显示实际用的是哪个源。
- **失败也会显示原因**：面板列出每个源的失败原因（如 `HTTP 404`、`网络错误`、`请求超时`），不再是静默失败。
- **缓存更合理**：成功 30 分钟内不重复请求，失败 10 分钟后自动重试；打开设置面板会立即刷新状态，也可随时点「立即检查更新」强制检查。
- **红点更明显**：发现新版时悬浮按钮上的红点带呼吸动画，标题栏显示「有新版本 vX.Y.Z」。
- 请求统一走 `GM_xmlhttpRequest`（没有 GM API 时退回 `fetch`），超时 6 秒，不会卡住页面。
- 同时清掉了 v1.8.1 头部重复的 `@match`。

## v1.8.1 更新内容

- 重新支持内网地址 `10.3.44.224`：新增 `http://10.3.44.224/*`、`https://10.3.44.224/*` 以及带端口的匹配规则（`http(s)://10.3.44.224:*`）。
- 顺带补上 `http://zsoj.gbfish.cn/*`（HTTP 访问也能生效）。
- ⚠️ 若脚本管理器开启了「仅 HTTPS」或对内网地址有限制，需要在管理器里允许该站点运行脚本；更新检查走 `GM_xmlhttpRequest`，不受局域网环境限制。

## v1.8.0 更新内容

1. **自动更新检测**
   - 脚本会读取本仓库 `main` 分支上脚本头部的 `@version`（每 6 小时最多检查一次，只发一个 `raw` 请求，失败不影响使用）。
   - 有新版时：右下角悬浮按钮上出现红点，设置面板标题显示「有新版本 vX.Y.Z」，并弹一次提示。
   - 设置面板「诊断/配置 → 自动更新」可以：立即检查更新、安装新版本（打开脚本地址交给管理器接管）、打开 GitHub 仓库、复制脚本地址。
   - 检查结果与上次检查时间缓存在 `localStorage` 的 `hydro_beautifier_update` 里。
   - 脚本头部已补上 `@updateURL` / `@downloadURL`，所以从 URL 安装后 Tampermonkey 自身的自动更新也会生效。
2. **代码块改为不透明**
   - `pre` / `pre > code` 使用实色背景（深色 `#1b2030`，浅色卡片下 `#f6f8fc`），不再让背景图和半透明卡片透过来。
   - 自动跳过程序坞 / Monaco / CodeMirror / 设置面板里的编辑器，不会染指评测机代码框。
   - 消息页面里的代码块同样生效。

## 支持的站点

| 地址 | 说明 |
| --- | --- |
| `https://zsoj.gbfish.cn/`、`http://zsoj.gbfish.cn/` | 公网站点 |
| `http://10.3.44.224/`、`https://10.3.44.224/` | 内网镜像 |
| `http://10.3.44.224:<端口>`、`https://10.3.44.224:<端口>` | 内网镜像（非 80/443 端口） |
| `https://hydro.ac/`、`https://oier.group/` | 其它 Hydro 站点 |

新增站点时，只需在脚本头部追加一条 `@match`，并在本表登记。

## 发布新版本（维护者）

1. 修改 `Hydro-UI-Beautifier.user.js`：同时更新脚本头 `// @version` 和代码里的 `const VERSION`。
2. 复制一份到 `versions/Hydro-UI-Beautifier-<新版本号>.user.js` 留档。
3. 提交并推送到 `main`。用户端下一次检查（或打开页面 2.5 秒后）即可看到更新提示。

## 说明

所有配置只保存在当前站点的浏览器本地，不会修改 Hydro 服务端数据。
