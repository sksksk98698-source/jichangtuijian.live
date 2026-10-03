const fs = require('fs');
const path = require('path');

// Helper to format generic tool row in HTML
function renderToolHtmlRow(item) {
  const nameHtml = item.href 
    ? `<a class="text-accent underline decoration-1 underline-offset-2 hover:decoration-2 font-bold" href="${item.href}">${item.name}</a>`
    : `<span class="font-bold">${item.name}</span>`;
  
  const badgeHtml = item.badge 
    ? `<span class="lab-badge ${item.badgeClass}">${item.badge}</span>`
    : '';

  const btnHtml = item.affUrl 
    ? `<a href="${item.affUrl}" target="_blank" rel="nofollow sponsored noopener noreferrer">${item.btnText || '官网 ↗'}</a>${item.coupon ? `<br><span class="coupon-tag">${item.coupon}</span>` : ''}`
    : `<span class="text-muted">—</span>`;

  return `<tr>` +
    `<td class="border-b border-rule px-3 py-2.5 font-medium whitespace-nowrap">${nameHtml}${badgeHtml}</td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-foreground block">${item.col2Main}</span>${item.col2Sub ? `<span class="block text-xs text-muted">${item.col2Sub}</span>` : ''}</td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-accent block">${item.col3Main}</span>${item.col3Sub ? `<span class="block text-xs text-muted">${item.col3Sub}</span>` : ''}</td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap text-muted text-xs">${item.col4}</td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap text-center">${btnHtml}</td>` +
    `</tr>`;
}

// Helper to format generic tool row in RSC
function renderToolRscRow(item) {
  const nameChildren = [];
  if (item.href) {
    nameChildren.push(["$", "a", null, {
      "href": item.href,
      "className": "text-accent underline decoration-1 underline-offset-2 hover:decoration-2 font-bold",
      "children": item.name
    }]);
  } else {
    nameChildren.push(item.name);
  }
  if (item.badge) {
    nameChildren.push(["$", "span", null, {
      "className": `lab-badge ${item.badgeClass}`,
      "children": item.badge
    }]);
  }

  const col2Children = [
    ["$", "span", null, { "className": "font-medium text-foreground block", "children": item.col2Main }]
  ];
  if (item.col2Sub) {
    col2Children.push(["$", "span", null, { "className": "block text-xs text-muted", "children": item.col2Sub }]);
  }

  const col3Children = [
    ["$", "span", null, { "className": "font-medium text-accent block", "children": item.col3Main }]
  ];
  if (item.col3Sub) {
    col3Children.push(["$", "span", null, { "className": "block text-xs text-muted", "children": item.col3Sub }]);
  }

  const btnChildren = [];
  if (item.affUrl) {
    btnChildren.push(["$", "a", null, {
      "href": item.affUrl,
      "target": "_blank",
      "rel": "nofollow sponsored noopener noreferrer",
      "children": item.btnText || "官网 ↗"
    }]);
    if (item.coupon) {
      btnChildren.push(["$", "br", null, {}]);
      btnChildren.push(["$", "span", null, {
        "className": "coupon-tag",
        "children": item.coupon
      }]);
    }
  } else {
    btnChildren.push(["$", "span", null, {
      "className": "text-muted",
      "children": "—"
    }]);
  }

  return [
    "$", "tr", item.id, {
      "children": [
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 font-medium whitespace-nowrap",
          "children": nameChildren
        }],
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 whitespace-nowrap",
          "children": col2Children
        }],
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 whitespace-nowrap",
          "children": col3Children
        }],
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 whitespace-nowrap text-muted text-xs",
          "children": item.col4
        }],
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 whitespace-nowrap text-center",
          "children": btnChildren
        }]
      ]
    }
  ];
}

// Function to update tool page
function updateToolPage(pageName, ths, items) {
  const htmlRows = items.map(renderToolHtmlRow).join('\n');
  const rscRows = items.map(renderToolRscRow);

  const thHtml = ths.map((th, i) => `<th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">${th}</th>`).join('');
  const thRsc = ths.map((th, i) => ["$", "th", null, { "className": "border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap", "children": th }]);

  const rscFiles = [`${pageName}.rsc`, `${pageName}/index.rsc`];
  let newRscLine = '';

  for (let rscFile of rscFiles) {
    if (!fs.existsSync(rscFile)) continue;
    const content = fs.readFileSync(rscFile, 'utf8');
    const lines = content.split('\n');
    const idx17 = lines.findIndex(l => l.startsWith('17:'));
    if (idx17 !== -1) {
      let rscObj = JSON.parse(lines[idx17].slice(3));
      let div = rscObj[3].children[1][1];
      let table = div[3].children;
      table[3].className = "w-full min-w-[42rem] border-collapse text-left text-sm";
      table[3].children[0] = ["$", "thead", null, { "children": ["$", "tr", null, { "children": thRsc }] }];
      table[3].children[1][3].children = rscRows;
      newRscLine = '17:' + JSON.stringify(rscObj);
      lines[idx17] = newRscLine;
      fs.writeFileSync(rscFile, lines.join('\n'), 'utf8');
      console.log(`Updated RSC: ${rscFile}`);
    }
  }

  const htmlFiles = [`${pageName}.html`, `${pageName}/index.html`];
  for (let htmlFile of htmlFiles) {
    if (!fs.existsSync(htmlFile)) continue;
    let content = fs.readFileSync(htmlFile, 'utf8');

    // 1. Static table replacement
    const tableRegex = /<table class="w-full min-w-\[\d+rem\] border-collapse text-left text-sm">[\s\S]*?<\/table>/;
    const newTableHtml = `<table class="w-full min-w-[42rem] border-collapse text-left text-sm"><thead><tr>${thHtml}</tr></thead><tbody>\n${htmlRows}\n</tbody></table>`;
    content = content.replace(tableRegex, newTableHtml);

    // 2. Script push replacement
    const marker = 'self.__next_f.push([1,"17:';
    const startIdx = content.indexOf(marker);
    if (startIdx !== -1) {
      const endMarker = '])</script>';
      const endIdx = content.indexOf(endMarker, startIdx);
      const newScriptContent = `self.__next_f.push([1,${JSON.stringify(newRscLine + '\n')}])</script>`;
      content = content.slice(0, startIdx) + newScriptContent + content.slice(endIdx + endMarker.length);
      console.log(`Updated script tag in ${htmlFile}`);
    }

    fs.writeFileSync(htmlFile, content, 'utf8');
    console.log(`Updated HTML: ${htmlFile}`);
  }
}

// 1. GUOWAIVPN
const guowaivpnThs = ["品牌与专线", "协议与架构", "入门价格", "支持平台", "官方通道"];
const guowaivpnItems = [
  { id: "guangsuyun", name: "光速云", href: "/pianyijichang/guangsuyun", badge: "TOP 1 专线", badgeClass: "lab-badge-orange", col2Main: "企业级IEPL内网专线", col2Sub: "VLESS防封抗干扰", col3Main: "¥7.5/月起", col3Sub: "年付折合 · 月付¥23", col4: "Win · Mac · iOS · 安卓", affUrl: "https://sahude.gsyvipaff.com/#/?code=keqgvT5Y", coupon: "8折码 AMM" },
  { id: "invisible", name: "隐形人", href: "/pianyijichang/invisible", badge: "TOP 2 原生IP", badgeClass: "lab-badge-blue", col2Main: "纯净独立原生IP池", col2Sub: "2Gbps带宽 · IEPL专线", col3Main: "¥24/月起", col3Sub: "24h无理由退款", col4: "全平台全协议支持", affUrl: "https://yinxingren1.invisibleaff.com/#/?code=kcyEeoJT", coupon: "8折码 yxr888" },
  { id: "firefly", name: "Firefly", href: "/iplc/firefly", badge: "TOP 3 纯专线", badgeClass: "lab-badge-blue", col2Main: "IPLC国际点对点纯专线", col2Sub: "原生IP · 8年团队", col3Main: "¥8/月起", col3Sub: "年付折合 · 月付¥25", col4: "全平台全协议支持", affUrl: "https://vip02.fireflyaff.com/#/?code=2n7VURre", coupon: "8折码 firefly" },
  // Third party
  { id: "wescloud", name: "威伯斯云", href: null, badge: null, col2Main: "AnyConnect(SSL)", col2Sub: "商用混淆", col3Main: "¥30/月起", col3Sub: null, col4: "Win · Mac · iOS · 安卓", affUrl: "https://wescloud.com/#/register", coupon: null },
  { id: "protonvpn", name: "ProtonVPN", href: null, badge: null, col2Main: "Stealth 混淆", col2Sub: "瑞士隐私加密", col3Main: "免费版 / $9.99/月", col3Sub: null, col4: "全平台客户端", affUrl: "https://protonvpn.com", coupon: null },
  { id: "hotspotshield", name: "Hotspot Shield", href: null, badge: null, col2Main: "Hydra 自带混淆", col2Sub: "商用加密", col3Main: "免费版 / $6.99/月", col3Sub: null, col4: "全平台客户端", affUrl: "https://hotspotshield.com", coupon: null },
  { id: "expressvpn", name: "ExpressVPN", href: null, badge: null, col2Main: "Lightway 协议", col2Sub: "全球老牌VPN", col3Main: "$6.67/月起", col3Sub: null, col4: "全平台支持", affUrl: "https://expressvpn.com", coupon: null },
  { id: "surfshark", name: "Surfshark", href: null, badge: null, col2Main: "WireGuard + NoBorders", col2Sub: "无限设备", col3Main: "$2.19/月起", col3Sub: null, col4: "全平台支持", affUrl: "https://surfshark.com", coupon: null },
  { id: "nordvpn", name: "NordVPN", href: null, badge: null, col2Main: "NordLynx + 混淆节点", col2Sub: "安全审计", col3Main: "$3.09/月起", col3Sub: null, col4: "全平台支持", affUrl: "https://nordvpn.com", coupon: null },
  { id: "cyberghost", name: "CyberGhost", href: null, badge: null, col2Main: "WireGuard", col2Sub: "流媒体专用", col3Main: "$2.03/月起", col3Sub: null, col4: "全平台支持", affUrl: "https://cyberghostvpn.com", coupon: null }
];

// 2. DAILIRUANJIAN
const dailiruanjianThs = ["软件与品牌", "支持平台", "价格与方案", "定位与特点", "官方通道"];
const dailiruanjianItems = [
  { id: "guangsuyun_client", name: "光速云", href: "/pianyijichang/guangsuyun", badge: "自研客户端", badgeClass: "lab-badge-orange", col2Main: "Win · Mac · Android", col2Sub: null, col3Main: "订阅免费送", col3Sub: "入门¥7.5/月起", col4: "免配置一键直连 · 新手首选", affUrl: "https://sahude.gsyvipaff.com/#/?code=keqgvT5Y", coupon: "8折码 AMM", btnText: "下载 ↗" },
  { id: "flycat_client", name: "飞猫云", href: "/pianyijichang/flycat", badge: "官方客户端", badgeClass: "lab-badge-blue", col2Main: "Win · Mac · Android · iOS", col2Sub: null, col3Main: "订阅免费送", col3Sub: "入门¥7/月起", col4: "纯专线一键加速 · 零门槛", affUrl: "https://guangs.flycataff.com/#/?code=6uq0Xe9y", coupon: "8折码 flycat888", btnText: "下载 ↗" },
  { id: "worryfree_client", name: "无忧链接", href: "/pianyijichang/worryfree", badge: "全端直连", badgeClass: "lab-badge-blue", col2Main: "Win · Mac · iOS · Android", col2Sub: null, col3Main: "订阅免费送", col3Sub: "入门¥6/月起", col4: "免复杂转换 · 即开即用", affUrl: "https://wep01.worryfreeaff.com/#/?code=4ZoSbLdL", coupon: "优惠码 wuyou666", btnText: "下载 ↗" },
  // Third party
  { id: "clash", name: "Clash 系客户端", href: null, badge: null, col2Main: "Win · Mac · Linux · 安卓", col2Sub: null, col3Main: "免费开源", col3Sub: null, col4: "客户端·需机场订阅", affUrl: null, coupon: null },
  { id: "geph", name: "迷雾通 Geph", href: null, badge: null, col2Main: "全平台客户端", col2Sub: null, col3Main: "免费版 / Plus另计", col3Sub: null, col4: "开源反审查VPN", affUrl: "https://geph.io", coupon: null },
  { id: "kuaifan", name: "快帆 KuaiFan", href: null, badge: null, col2Main: "全平台客户端", col2Sub: null, col3Main: "免费版 / ¥22/月起", col3Sub: null, col4: "回国加速器", affUrl: "https://kuaifan.co", coupon: null },
  { id: "malus", name: "Malus 加速器", href: null, badge: null, col2Main: "全平台客户端", col2Sub: null, col3Main: "免费版 / 首月¥9.9", col3Sub: null, col4: "回国加速器", affUrl: "https://getmalus.com", coupon: null },
  { id: "transocks", name: "穿梭 Transocks", href: null, badge: null, col2Main: "全平台客户端", col2Sub: null, col3Main: "移动端免费 / ¥0.72/天", col3Sub: null, col4: "回国加速器", affUrl: "https://transocks.com", coupon: null },
  { id: "outline", name: "Outline", href: null, badge: null, col2Main: "全平台支持", col2Sub: null, col3Main: "免费开源·需自备VPS", col3Sub: null, col4: "自建 VPN 工具", affUrl: "https://getoutline.org", coupon: null },
  { id: "singbox", name: "Sing-box", href: null, badge: null, col2Main: "全平台全架构", col2Sub: null, col3Main: "免费开源", col3Sub: null, col4: "新一代通用代理内核", affUrl: "https://sing-box.sagernet.org", coupon: null }
];

// 3. HUIGUO
const huiguoThs = ["工具与品牌", "定位与专线", "资费与套餐", "支持平台", "官方通道"];
const huiguoItems = [
  { id: "guangsuyun_huiguo", name: "光速云", href: "/pianyijichang/guangsuyun", badge: "跨境旗舰", badgeClass: "lab-badge-orange", col2Main: "双向企业级IEPL专线", col2Sub: "海外访问国内全场景", col3Main: "¥23/月起 (148G)", col3Sub: "年付折合¥7.5/月", col4: "全平台自研+第三方", affUrl: "https://sahude.gsyvipaff.com/#/?code=keqgvT5Y", coupon: "8折码 AMM" },
  { id: "xingdaomeng_huiguo", name: "星岛梦", href: "/pianyijichang/xingdaomeng", badge: "稳定推荐", badgeClass: "lab-badge-blue", col2Main: "企业级内网专线", col2Sub: "国内音视频极速解锁", col3Main: "¥8/月起", col3Sub: "含不限时流量包", col4: "全平台客户端", affUrl: "https://guangs.xingdaomeng.com/#/?code=1TynBYnR", coupon: "9折码 nmw888" },
  // Third party
  { id: "ednovas", name: "EdNovas云", href: null, badge: null, col2Main: "IEPL专线+回国线路", col2Sub: null, col3Main: "¥25/100G 起", col3Sub: null, col4: "全平台客户端", affUrl: "https://ednovas.cloud", coupon: null },
  { id: "kuaifan_hg", name: "快帆 KuaiFan", href: null, badge: null, col2Main: "回国加速器", col2Sub: null, col3Main: "免费版 / ¥22/月起", col3Sub: null, col4: "全平台客户端", affUrl: "https://kuaifan.co", coupon: null },
  { id: "malus_hg", name: "Malus 加速器", href: null, badge: null, col2Main: "回国加速器", col2Sub: null, col3Main: "免费版 / 首月¥9.9", col3Sub: null, col4: "全平台客户端", affUrl: "https://getmalus.com", coupon: null },
  { id: "transocks_hg", name: "穿梭 Transocks", href: null, badge: null, col2Main: "回国加速器", col2Sub: null, col3Main: "移动端免费 / ¥0.72/天", col3Sub: null, col4: "全平台客户端", affUrl: "https://transocks.com", coupon: null }
];

// Execute updates
updateToolPage('guowaivpn', guowaivpnThs, guowaivpnItems);
updateToolPage('dailiruanjian', dailiruanjianThs, dailiruanjianItems);
updateToolPage('huiguo', huiguoThs, huiguoItems);

console.log('Finished updating refined tool pages!');
