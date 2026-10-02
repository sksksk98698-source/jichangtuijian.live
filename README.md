# 机场推荐 - 全站完整克隆镜像

本仓库为 [机场推荐 - VPN翻墙科学上网梯子测评 (https://jichangtuijian1.com/)](https://jichangtuijian1.com/) 的完整静态离线克隆版本。

---

## 📦 克隆内容概览

- **页面数量**：390 个完整 HTML 页面（包含全站 333 篇测评与文章、分类页面、多级分页等）。
- **静态资源**：
  - Next.js 核心 JS Chunks 与运行时
  - 全套 CSS 样式表
  - 17 个 WOFF2 字体文件
  - SVG 图标与 Favicon
- **动态功能支持**：
  - **站内实时搜索**：已抓取完整的 `/api/search-index`（387KB 索引库），本地搜索实时可用。
  - **RSC 数据流**：包含各页面的 React Server Component 流，支持无缝客户端路由。
  - **URL 规范化**：已将所有指向原站域名的绝对链接替换为相对路由，避免跳转回原站。

---

## 🚀 本地启动与预览

无需安装第三方依赖，Node.js 原生支持运行：

```bash
# 启动本地服务器（默认端口 3000）
npm start
# 或直接运行
node server.js
```

启动后在浏览器打开：
👉 [http://localhost:3000](http://localhost:3000)

---

## 🌐 线上部署说明

### 1. Cloudflare Pages
1. 在 Cloudflare Dashboard 创建 Pages 项目。
2. 上传当前目录，或关联 GitHub 仓库。
3. 构建命令留空，构建输出目录设置为根目录 `.` 即可（已包含 `_redirects`）。

### 2. Vercel
直接使用 `vercel` CLI 或推送到 GitHub 导入 Vercel 项目，已预配置 [`vercel.json`](vercel.json)。

### 3. Nginx
参考提供的配置范例 [`nginx.conf.example`](nginx.conf.example) 进行反向代理或静态根目录绑定。

---

## 📁 核心目录结构

```
jichangtuijian.family/
├── index.html              # 网站首页
├── page/                   # 首页各分页 (page/2 至 page/32)
├── pianyijichang/          # 便宜机场分类及分页
├── iplc/                   # IPLC 专线分类及分页
├── gaoduanjichang/         # 高端机场分类
├── anliangfufei/           # 按量付费分类
├── dailiruanjian/          # 客户端代理软件推荐
├── guowaivpn/              # 国外主流 VPN
├── huiguo/                 # 回国机场
├── paihangbang/            # 机场排行榜
├── xieyi/                  # 协议科普与对比
├── api/                    # 站内搜索索引 (search-index.json)
├── _next/static/           # 核心 JS、CSS、WOFF2 字体资源
├── sitemap.xml             # 站点地图
├── robots.txt              # 爬虫协议
├── server.js               # 本地轻量化高性能服务器
└── package.json            # 启动脚本
```
