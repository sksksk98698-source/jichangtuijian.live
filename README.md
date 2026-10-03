# jichangtuijian.live

<p align="center">
  <strong>高标准独立网络节点评测与科学上网技术科普平台</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/SEO_Health-100%25-brightgreen?style=for-the-badge&logo=google&logoColor=white" alt="SEO 100%" />
  <img src="https://img.shields.io/badge/Sitemap_0.9-Verified-blue?style=for-the-badge" alt="Sitemap Verified" />
  <img src="https://img.shields.io/badge/License-ISC-orange?style=for-the-badge" alt="License" />
</p>

---

## 项目概览

`jichangtuijian.live` 是一套深度面向搜索引擎优化与高水准用户体验的静态化网络评测发布系统。全站围绕网络代理服务、专线质量、客户端配置以及最新传输协议展开横向客观测评。

网站全量文章均配套详实的数据测速记录、单价换算对比与退款条款核实，全流程践行透明的推广披露标准。

---

## 核心技术特色

* **双端水合一致性渲染**  
  采用静态预渲染 HTML 与 React Server Component 数据载荷深度对齐架构，首屏秒开且无水合报错。

* **E-E-A-T 权威实体对齐**  
  全站评测文章顶部均嵌入主笔工程师可见署名并深度链接至背景档案，与底层的 JSON-LD Schema 结构化实体完全吻合。

* **严格商业推广合规**  
  全站所有出站商业返利链接均符合搜索引擎商业赞助标记规范，全量附加 `rel="nofollow sponsored noopener noreferrer"` 属性，并在分类列表页首屏配备合规提示。

* **零冗余搜索引擎友好度**  
  全站实现重复标题、重复元描述与重复 H1 标签全量清零，全量分页均附带独立识别序列，点击深度均控制在 3 层以内。

* **动态精准站点地图**  
  内置标准 XML 0.9 站点地图，依据文章实际修改日期提取精确 `lastmod` 字段，构建层次分明的更新权重矩阵。

---

## 站点目录拓扑

```text
jichangtuijian.live/
├── pianyijichang/      # 平价性价比节点测评专栏（含 220+ 篇独立测评）
├── iplc/               # IPLC / IEPL 内网专线测评专栏
├── gaoduanjichang/     # 旗舰高端节点与高可用方案
├── anliangfufei/       # 不限时长按量计费套餐专栏
├── dailiruanjian/      # Clash、Surge、Sing-box 等客户端配置指南
├── guowaivpn/          # 国际知名商业 VPN 客观评测
├── huiguo/             # 海外华人回国加速专栏
├── paihangbang/        # 多维度综合实力榜单
├── xieyi/              # 协议科普（Hysteria 2、VLESS、Reality、Trojan 等）
├── about/              # 评测团队资历档案
├── methodology/        # 评测测试方法论与实测标准
├── disclosure/         # 商业赞助与佣金披露声明
├── robots.txt          # 主流爬虫协议配置
└── sitemap.xml         # 标准化站点收录索引
```

---

## 本地启动与调试

### 运行环境准备
本项目无需庞大复杂的外部构建依赖，只需本地具备 Node.js 18 或更高版本。

```bash
# 检查 Node 版本
node -v
```

### 启动本地 HTTP 服务
项目内置轻量高性能静态服务器，具备 clean-url 映射、RSC 请求识别与 gzip 压缩能力。

```bash
# 启动本地服务
npm start

# 或直接运行
node server.js
```

服务就绪后，直接在浏览器中打开调试地址

```text
http://localhost:3008
```

---

## 自动化维护工具箱

项目根目录配备了一整套自动化维护脚本，便于在内容增补时快速执行批量检查与构建。

| 脚本名称 | 核心职能 |
| :--- | :--- |
| `build_optimized_sitemap.js` | 遍历全站有效页面，自动提取真实更新日期并重构 `sitemap.xml` |
| `validate_sitemap.js` | 严格校验站点地图结构、链接有效性、日期格式与物理文件存在性 |
| `comprehensive_seo_audit.js` | 执行全站死链排查、商业外链标记检测与孤立页面扫描 |
| `check_duplicates.js` | 快速扫描全站 HTML 的 Title、Description 以及 H1 重复率 |
| `dedup_pagination_h1.js` | 为所有分页自动注入序列标识，规避分页标题竞争 |
| `sync_all_article_bylines.js` | 双端同步文章作者署名与底层水合载荷 |

---

## 生产部署说明

### Nginx 部署
推荐使用 Nginx 作为反向代理与静态资源服务器，参考根目录的 [nginx.conf.example](nginx.conf.example) 即可。

```nginx
server {
    listen 80;
    server_name jichangtuijian.live www.jichangtuijian.live;
    return 301 https://jichangtuijian.live$request_uri;
}

server {
    listen 443 ssl http2;
    server_name jichangtuijian.live;

    root /var/www/jichangtuijian.live;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
}
```

### 边缘托管（Cloudflare Pages / Vercel / Netlify）
本项目输出为纯粹的静态网页体系，可直接将代码仓连接至 Cloudflare Pages 或 GitHub Pages，无需额外的 Build Command，直接将根目录设为静态输出根路径即可秒级完成全球 CDN 部署。

---

## 协议与准则

* 本项目代码及静态资源遵循 ISC 开源协议。
* 评测内容与测试数据仅供海外华人、留学生及合规跨境科研办公人员参考。
