const fs = require('fs');
const path = require('path');

// 1. Update 2phv55ne0t87m.js table container width and remove align-top
const chunkFile = path.join(__dirname, '_next/static/chunks/2phv55ne0t87m.js');
if (fs.existsSync(chunkFile)) {
  let js = fs.readFileSync(chunkFile, 'utf8');
  // replace min-w-[34rem] with min-w-[48rem]
  js = js.replace(/min-w-\[34rem\]/g, 'min-w-[48rem]');
  // remove align-top from td classes
  js = js.replace(/align-top /g, '');
  fs.writeFileSync(chunkFile, js, 'utf8');
  console.log('Updated _next/static/chunks/2phv55ne0t87m.js');
}

// Helper to render HTML row for standard category table
function renderCategoryHtmlRow(item) {
  const nameHtml = item.href 
    ? `<a class="text-accent underline decoration-1 underline-offset-2 hover:decoration-2 font-bold" href="${item.href}">${item.name}</a>`
    : `<span class="font-bold">${item.name}</span>`;
  
  const badgeHtml = item.badgeText 
    ? `<span class="lab-badge ${item.badgeClass}">${item.badgeText}</span>`
    : '';

  const btnHtml = item.affUrl 
    ? `<a href="${item.affUrl}" target="_blank" rel="nofollow sponsored noopener noreferrer">官网 ↗</a>${item.couponText ? `<br><span class="coupon-tag">${item.couponText}</span>` : ''}`
    : `<span class="text-muted">—</span>`;

  return `<tr>` +
    `<td class="border-b border-rule px-3 py-2.5 font-medium whitespace-nowrap">${nameHtml}${badgeHtml}</td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-foreground block">${item.priceMain}</span><span class="block text-xs text-muted">${item.priceSub}</span></td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap font-medium text-accent">${item.priceGb}</td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-foreground block">${item.lineMain}</span><span class="text-xs text-muted block">${item.lineSub}</span></td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap text-center">${btnHtml}</td>` +
    `</tr>`;
}

// Helper to render RSC row for standard category table
function renderCategoryRscRow(item) {
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
  if (item.badgeText) {
    nameChildren.push(["$", "span", null, {
      "className": `lab-badge ${item.badgeClass}`,
      "children": item.badgeText
    }]);
  }

  const btnChildren = [];
  if (item.affUrl) {
    btnChildren.push(["$", "a", null, {
      "href": item.affUrl,
      "target": "_blank",
      "rel": "nofollow sponsored noopener noreferrer",
      "children": "官网 ↗"
    }]);
    if (item.couponText) {
      btnChildren.push(["$", "br", null, {}]);
      btnChildren.push(["$", "span", null, {
        "className": "coupon-tag",
        "children": item.couponText
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
          "children": [
            ["$", "span", null, {
              "className": "font-medium text-foreground block",
              "children": item.priceMain
            }],
            ["$", "span", null, {
              "className": "block text-xs text-muted",
              "children": item.priceSub
            }]
          ]
        }],
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 whitespace-nowrap font-medium text-accent",
          "children": item.priceGb
        }],
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 whitespace-nowrap",
          "children": [
            ["$", "span", null, {
              "className": "font-medium text-foreground block",
              "children": item.lineMain
            }],
            ["$", "span", null, {
              "className": "text-xs text-muted block",
              "children": item.lineSub
            }]
          ]
        }],
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 whitespace-nowrap text-center",
          "children": btnChildren
        }]
      ]
    }
  ];
}

// Function to update standard category (gaoduanjichang, iplc, pianyijichang, anliangfufei)
function updateStandardCategory(pageName, airports) {
  const htmlRows = airports.map(renderCategoryHtmlRow).join('\n');
  const rscRows = airports.map(renderCategoryRscRow);

  const rscFiles = [`${pageName}.rsc`, `${pageName}/index.rsc`];
  let newRscLine = '';

  for (let rscFile of rscFiles) {
    if (!fs.existsSync(rscFile)) continue;
    const content = fs.readFileSync(rscFile, 'utf8');
    const lines = content.split('\n');
    const idx20 = lines.findIndex(l => l.startsWith('20:'));
    if (idx20 !== -1) {
      let rscObj = JSON.parse(lines[idx20].slice(3));
      let div = rscObj[0][1];
      let table = div[3].children;
      table[3].className = "w-full min-w-[46rem] border-collapse text-left text-sm";
      table[3].children[1][3].children = rscRows;
      newRscLine = '20:' + JSON.stringify(rscObj);
      lines[idx20] = newRscLine;
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
    const newTableHtml = `<table class="w-full min-w-[46rem] border-collapse text-left text-sm"><thead><tr><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">机场</th><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">入门套餐</th><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">每 GB 单价</th><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">线路</th><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">官网</th></tr></thead><tbody>\n${htmlRows}\n</tbody></table>`;
    content = content.replace(tableRegex, newTableHtml);

    // 2. Script push replacement
    const marker = 'self.__next_f.push([1,"20:';
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

// Data for IPLC
const iplcAirports = [
  {
    id: "iplc/firefly",
    name: "Firefly",
    href: "/iplc/firefly",
    badgeText: "TOP 1 IPLC首选",
    badgeClass: "lab-badge-orange",
    priceMain: "¥8/月起",
    priceSub: "年付60G折合 · 月付¥25(150G)",
    priceGb: "¥0.13",
    lineMain: "IPLC纯专线",
    lineSub: "8年老牌团队 · 原生IP池",
    affUrl: "https://vip02.fireflyaff.com/#/?code=2n7VURre",
    couponText: "8折码 firefly"
  },
  {
    id: "pianyijichang/guangsuyun",
    name: "光速云",
    href: "/pianyijichang/guangsuyun",
    badgeText: "TOP 2 专线旗舰",
    badgeClass: "lab-badge-blue",
    priceMain: "¥7.5/月起",
    priceSub: "年付折合 · 月付¥23(148G)",
    priceGb: "¥0.05",
    lineMain: "企业级IEPL专线",
    lineSub: "VLESS · 2020老牌稳定",
    affUrl: "https://sahude.gsyvipaff.com/#/?code=keqgvT5Y",
    couponText: "8折码 AMM"
  },
  {
    id: "pianyijichang/invisible",
    name: "隐形人",
    href: "/pianyijichang/invisible",
    badgeText: "TOP 3 原生IP",
    badgeClass: "lab-badge-blue",
    priceMain: "¥24/月起",
    priceSub: "60+独立原生IP · 晚高峰秒开",
    priceGb: "¥0.16",
    lineMain: "企业级IEPL专线",
    lineSub: "2Gbps带宽 · 24h售后",
    affUrl: "https://yinxingren1.invisibleaff.com/#/?code=kcyEeoJT",
    couponText: "8折码 yxr888"
  },
  {
    id: "pianyijichang/flycat",
    name: "飞猫云",
    href: "/pianyijichang/flycat",
    badgeText: "TOP 4",
    badgeClass: "lab-badge-gray",
    priceMain: "¥7/月起",
    priceSub: "年付50G折合 · 月付¥25(150G)",
    priceGb: "¥0.14",
    lineMain: "IEPL专线",
    lineSub: "自研客户端 · 纯专线",
    affUrl: "https://guangs.flycataff.com/#/?code=6uq0Xe9y",
    couponText: "8折码 flycat888"
  },
  {
    id: "pianyijichang/xingdaomeng",
    name: "星岛梦",
    href: "/pianyijichang/xingdaomeng",
    badgeText: "TOP 5",
    badgeClass: "lab-badge-gray",
    priceMain: "¥8/月起",
    priceSub: "年付60G折合 · 不限时套餐",
    priceGb: "¥0.13",
    lineMain: "企业级内网专线",
    lineSub: "VLESS · 原生落地",
    affUrl: "https://guangs.xingdaomeng.com/#/?code=1TynBYnR",
    couponText: "9折码 nmw888"
  },
  {
    id: "pianyijichang/weituyun",
    name: "唯兔云",
    href: "/pianyijichang/weituyun",
    badgeText: "TOP 6",
    badgeClass: "lab-badge-gray",
    priceMain: "¥20/月",
    priceSub: "100GB月付 · 高速专线",
    priceGb: "¥0.20",
    lineMain: "IEPL专线",
    lineSub: "VLESS协议 · 晚高峰稳定",
    affUrl: "https://guangs.v2yunvipaff.com/#/?code=xIutqOBA",
    couponText: "优惠码 v2yun"
  },
  {
    id: "pianyijichang/jilianyun",
    name: "极连云",
    href: "/pianyijichang/jilianyun",
    badgeText: "TOP 7",
    badgeClass: "lab-badge-gray",
    priceMain: "¥18/月",
    priceSub: "100GB月付 · 平价专线",
    priceGb: "¥0.18",
    lineMain: "IEPL专线",
    lineSub: "晚高峰稳定 · 4K秒开",
    affUrl: "https://guangs.jlyvipaff.com/#/?code=VM1rKGUu",
    couponText: "优惠码 ji8888"
  },
  // Third party
  {
    id: "shandianmao",
    name: "闪电猫",
    href: null,
    priceMain: "¥20/月起",
    priceSub: "100G/月",
    priceGb: "¥0.163",
    lineMain: "IPLC专线",
    lineSub: "全平台覆盖",
    affUrl: "https://webinv04.sc-aff.cc/auth/register?code=4m9xwNfV",
    couponText: null
  },
  {
    id: "wgetcloud",
    name: "WgetCloud",
    href: null,
    priceMain: "¥79/月起",
    priceSub: "280G/月",
    priceGb: "¥0.28",
    lineMain: "BGP中转",
    lineSub: "IPLC专线",
    affUrl: "https://invite.wgetcloud.ltd/auth/register?code=p2s0",
    couponText: null
  },
  {
    id: "kuromi",
    name: "库洛米",
    href: null,
    priceMain: "¥34/月起",
    priceSub: "50G/月",
    priceGb: "¥0.128",
    lineMain: "IPLC专线",
    lineSub: "BGP中转",
    affUrl: "https://www.kuromis.com/register",
    couponText: null
  },
  {
    id: "naixi",
    name: "奶昔",
    href: null,
    priceMain: "¥54.6/月起",
    priceSub: "200G/月",
    priceGb: "¥0.193",
    lineMain: "IPLC专线",
    lineSub: "高速落地",
    affUrl: "https://nxonearth.com/signupbyemail.aspx?MemberCode=56f9a60e3a1c440684ae4731d4c70e4120250406103152",
    couponText: null
  },
  {
    id: "socloud",
    name: "SoCloud",
    href: null,
    priceMain: "¥20/月起",
    priceSub: "共 120G",
    priceGb: "¥0.15",
    lineMain: "IPLC专线",
    lineSub: "多国落地",
    affUrl: "https://getgoso.net?path=/auth/register&code=JTV2K2P2",
    couponText: null
  },
  {
    id: "efancc",
    name: "饿饭CC云",
    href: null,
    priceMain: "¥80/月起",
    priceSub: "500G/月",
    priceGb: "¥0.12",
    lineMain: "IPLC专线",
    lineSub: "老牌IEPL",
    affUrl: "https://api.efanapi.com/aff.php?aff=34025",
    couponText: null
  }
];

// Data for Pianyijichang
const pianyijichangAirports = [
  {
    id: "pianyijichang/guangsuyun",
    name: "光速云",
    href: "/pianyijichang/guangsuyun",
    badgeText: "TOP 1 性价比之王",
    badgeClass: "lab-badge-orange",
    priceMain: "¥7.5/月起",
    priceSub: "年付59G折合 · 月付¥23(148G)",
    priceGb: "¥0.05",
    lineMain: "企业级IEPL专线",
    lineSub: "2020老牌 · 自研客户端",
    affUrl: "https://sahude.gsyvipaff.com/#/?code=keqgvT5Y",
    couponText: "8折码 AMM"
  },
  {
    id: "pianyijichang/flycat",
    name: "飞猫云",
    href: "/pianyijichang/flycat",
    badgeText: "TOP 2 低价专线",
    badgeClass: "lab-badge-blue",
    priceMain: "¥7/月起",
    priceSub: "年付50G折合 · 月付¥25(150G)",
    priceGb: "¥0.14",
    lineMain: "IEPL专线",
    lineSub: "全端支持 · 季付8折",
    affUrl: "https://guangs.flycataff.com/#/?code=6uq0Xe9y",
    couponText: "8折码 flycat888"
  },
  {
    id: "pianyijichang/xingdaomeng",
    name: "星岛梦",
    href: "/pianyijichang/xingdaomeng",
    badgeText: "TOP 3 稳定平价",
    badgeClass: "lab-badge-blue",
    priceMain: "¥8/月起",
    priceSub: "年付60G折合 · 含不限时套餐",
    priceGb: "¥0.13",
    lineMain: "企业级内网专线",
    lineSub: "VLESS · 9折优惠",
    affUrl: "https://guangs.xingdaomeng.com/#/?code=1TynBYnR",
    couponText: "9折码 nmw888"
  },
  {
    id: "pianyijichang/yuzhouyun",
    name: "宇宙云",
    href: "/pianyijichang/yuzhouyun",
    badgeText: "TOP 4 百兆低门槛",
    badgeClass: "lab-badge-gray",
    priceMain: "¥14.9/月",
    priceSub: "月付100G · 门槛极低",
    priceGb: "¥0.149",
    lineMain: "IEPL专线",
    lineSub: "新手平价首选",
    affUrl: "https://wzjc.yuzoucloud.cc/#/?code=yrThwMP1",
    couponText: "8折优惠"
  },
  {
    id: "pianyijichang/jilianyun",
    name: "极连云",
    href: "/pianyijichang/jilianyun",
    badgeText: "TOP 5 综合优选",
    badgeClass: "lab-badge-gray",
    priceMain: "¥18/月",
    priceSub: "月付100G · 专线平价",
    priceGb: "¥0.18",
    lineMain: "IEPL专线",
    lineSub: "晚高峰稳定 · 4K秒开",
    affUrl: "https://guangs.jlyvipaff.com/#/?code=VM1rKGUu",
    couponText: "优惠码 ji8888"
  },
  {
    id: "pianyijichang/weituyun",
    name: "唯兔云",
    href: "/pianyijichang/weituyun",
    badgeText: "TOP 6",
    badgeClass: "lab-badge-gray",
    priceMain: "¥20/月",
    priceSub: "月付100G · 平价稳定",
    priceGb: "¥0.20",
    lineMain: "IEPL专线",
    lineSub: "VLESS协议",
    affUrl: "https://guangs.v2yunvipaff.com/#/?code=xIutqOBA",
    couponText: "优惠码 v2yun"
  },
  {
    id: "pianyijichang/breezenet",
    name: "微风网络",
    href: "/pianyijichang/breezenet",
    badgeText: "TOP 7",
    badgeClass: "lab-badge-gray",
    priceMain: "¥7/月起",
    priceSub: "年付50G折合 · 季付9折",
    priceGb: "¥0.14",
    lineMain: "IEPL专线",
    lineSub: "小流量轻度优选",
    affUrl: "https://edp01.breezenetaff.com/#/?code=t3huofyI",
    couponText: "9折码 flat888"
  },
  {
    id: "pianyijichang/worryfree",
    name: "无忧链接",
    href: "/pianyijichang/worryfree",
    badgeText: "TOP 8",
    badgeClass: "lab-badge-gray",
    priceMain: "¥6/月起",
    priceSub: "月付¥19(100G) · 免转换",
    priceGb: "¥0.19",
    lineMain: "IEPL专线",
    lineSub: "全平台一键直连",
    affUrl: "https://wep01.worryfreeaff.com/#/?code=4ZoSbLdL",
    couponText: "优惠码 wuyou666"
  },
  {
    id: "pianyijichang/twilight",
    name: "幕光加速",
    href: "/pianyijichang/twilight",
    badgeText: "TOP 9",
    badgeClass: "lab-badge-gray",
    priceMain: "¥20/月",
    priceSub: "月付120G · 专线保障",
    priceGb: "¥0.16",
    lineMain: "IEPL专线",
    lineSub: "VLESS · 中等流量",
    affUrl: "https://varnexa.twilightaff.com/#/?code=D1LHglg3",
    couponText: "优惠码 可用"
  },
  {
    id: "pianyijichang/ermaoyun",
    name: "二猫云",
    href: "/pianyijichang/ermaoyun",
    badgeText: "TOP 10",
    badgeClass: "lab-badge-gray",
    priceMain: "¥20/月",
    priceSub: "月付130G · 第三方导入",
    priceGb: "¥0.15",
    lineMain: "IEPL专线",
    lineSub: "均衡规格",
    affUrl: "https://guangs.2maoyunaff.cc/#/?code=7mjvgGbW",
    couponText: "优惠码 可用"
  },
  // Third party
  {
    id: "lanfanyun",
    name: "蓝帆云",
    href: null,
    priceMain: "¥12/月起",
    priceSub: "100G/月",
    priceGb: "¥0.12",
    lineMain: "IEPL专线",
    lineSub: "隧道中转",
    affUrl: "https://lanfanyun.com/#/register?code=lanfan",
    couponText: null
  },
  {
    id: "beibeiyun",
    name: "贝贝云",
    href: null,
    priceMain: "¥9.9/月起",
    priceSub: "80G/月",
    priceGb: "¥0.123",
    lineMain: "公网中转",
    lineSub: "平价轻量",
    affUrl: "https://beibeiyun.net/auth/register?code=beibei",
    couponText: null
  },
  {
    id: "shandianmao",
    name: "闪电猫",
    href: null,
    priceMain: "¥20/月起",
    priceSub: "100G/月",
    priceGb: "¥0.163",
    lineMain: "IPLC专线",
    lineSub: "全平台覆盖",
    affUrl: "https://webinv04.sc-aff.cc/auth/register?code=4m9xwNfV",
    couponText: null
  },
  {
    id: "zmkm",
    name: "芝麻开门",
    href: null,
    priceMain: "¥15/月起",
    priceSub: "120G/月",
    priceGb: "¥0.125",
    lineMain: "中转专线",
    lineSub: "高速节点",
    affUrl: "https://zmkm.net/#/register?code=zmkm",
    couponText: null
  },
  {
    id: "xnf",
    name: "小脑斧",
    href: null,
    priceMain: "¥9.9/月起",
    priceSub: "60G/月",
    priceGb: "¥0.165",
    lineMain: "BGP中转",
    lineSub: "入门小额",
    affUrl: "https://xnf.buzz/#/register?code=xnf",
    couponText: null
  },
  {
    id: "qyk",
    name: "轻云客",
    href: null,
    priceMain: "¥8/月起",
    priceSub: "50G/月",
    priceGb: "¥0.16",
    lineMain: "优质专线",
    lineSub: "轻度上网",
    affUrl: "https://qingyunke.cc/#/register?code=qyk",
    couponText: null
  }
];

// Data for Anliangfufei
const anliangfufeiAirports = [
  {
    id: "pianyijichang/xingdaomeng",
    name: "星岛梦",
    href: "/pianyijichang/xingdaomeng",
    badgeText: "TOP 1 不限时首选",
    badgeClass: "lab-badge-orange",
    priceMain: "¥8/月起",
    priceSub: "独家不限时不过期流量包",
    priceGb: "¥0.13",
    lineMain: "企业级内网专线",
    lineSub: "流量永不过期 · VLESS",
    affUrl: "https://guangs.xingdaomeng.com/#/?code=1TynBYnR",
    couponText: "9折码 nmw888"
  },
  {
    id: "pianyijichang/guangsuyun",
    name: "光速云",
    href: "/pianyijichang/guangsuyun",
    badgeText: "TOP 2 专线旗舰",
    badgeClass: "lab-badge-blue",
    priceMain: "¥7.5/月起",
    priceSub: "年付折合 · 月付¥23(148G)",
    priceGb: "¥0.05",
    lineMain: "企业级IEPL专线",
    lineSub: "大流量长效 · 2020老牌",
    affUrl: "https://sahude.gsyvipaff.com/#/?code=keqgvT5Y",
    couponText: "8折码 AMM"
  },
  {
    id: "pianyijichang/invisible",
    name: "隐形人",
    href: "/pianyijichang/invisible",
    badgeText: "TOP 3 独立IP定制",
    badgeClass: "lab-badge-blue",
    priceMain: "¥24/月起",
    priceSub: "60+独立原生IP · 按需定制",
    priceGb: "¥0.16",
    lineMain: "企业级IEPL专线",
    lineSub: "24h退款保障",
    affUrl: "https://yinxingren1.invisibleaff.com/#/?code=kcyEeoJT",
    couponText: "8折码 yxr888"
  },
  {
    id: "pianyijichang/yuzhouyun",
    name: "宇宙云",
    href: "/pianyijichang/yuzhouyun",
    badgeText: "TOP 4 随买随用",
    badgeClass: "lab-badge-gray",
    priceMain: "¥14.9/月",
    priceSub: "低成本月付100G · 随用随买",
    priceGb: "¥0.149",
    lineMain: "IEPL专线",
    lineSub: "小额灵活订阅",
    affUrl: "https://wzjc.yuzoucloud.cc/#/?code=yrThwMP1",
    couponText: "8折优惠"
  },
  // Third party
  {
    id: "skylinx",
    name: "SkyLinX",
    href: null,
    priceMain: "¥8/月起",
    priceSub: "50G/月",
    priceGb: "¥0.1",
    lineMain: "专线中转",
    lineSub: "按需计费",
    affUrl: "https://skylinx.cc/#/register",
    couponText: null
  },
  {
    id: "crosswall",
    name: "CrossWall 克斯洛斯",
    href: null,
    priceMain: "¥5/月起",
    priceSub: "200G/月",
    priceGb: "¥0.0099",
    lineMain: "直连节点",
    lineSub: "极低成本",
    affUrl: "https://crosswall.cc/#/register",
    couponText: null
  },
  {
    id: "m78",
    name: "M78星云",
    href: null,
    priceMain: "¥12.8/月起",
    priceSub: "150G/月",
    priceGb: "¥0.0666",
    lineMain: "BGP中转",
    lineSub: "IPLC专线",
    affUrl: "https://m78cloud.com/#/register",
    couponText: null
  },
  {
    id: "mojie",
    name: "魔戒机场 Mojie",
    href: null,
    priceMain: "¥1 起",
    priceSub: "纯按量付费",
    priceGb: "¥0.0867",
    lineMain: "公网中转",
    lineSub: "无月租限制",
    affUrl: "https://mojie.me/#/register",
    couponText: null
  },
  {
    id: "bajie",
    name: "八戒机场",
    href: null,
    priceMain: "¥12.9/月起",
    priceSub: "70G/月",
    priceGb: "¥0.093",
    lineMain: "直连 / 中转",
    lineSub: "按量包可选",
    affUrl: "https://bajie.me/#/register",
    couponText: null
  },
  {
    id: "quickcat",
    name: "快猫 QuickCAT",
    href: null,
    priceMain: "¥30/月起",
    priceSub: "300G/月",
    priceGb: "¥0.044",
    lineMain: "BGP中转",
    lineSub: "大流量包",
    affUrl: "https://quickcat.io/#/register",
    couponText: null
  },
  {
    id: "zhongzhuan",
    name: "中转云",
    href: null,
    priceMain: "¥10/月起",
    priceSub: "100G/月",
    priceGb: "¥0.1",
    lineMain: "隧道中转",
    lineSub: "永不过期",
    affUrl: "https://zhongzhuan.cloud/#/register",
    couponText: null
  },
  {
    id: "feimao",
    name: "肥猫云",
    href: null,
    priceMain: "¥15/月起",
    priceSub: "150G/月",
    priceGb: "¥0.1",
    lineMain: "中转专线",
    lineSub: "按量不限时",
    affUrl: "https://feimaoyun.com/#/register",
    couponText: null
  }
];

// Execute updates for standard category pages
updateStandardCategory('iplc', iplcAirports);
updateStandardCategory('pianyijichang', pianyijichangAirports);
updateStandardCategory('anliangfufei', anliangfufeiAirports);

console.log('Finished updating standard category pages!');
