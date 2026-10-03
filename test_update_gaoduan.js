const fs = require('fs');

// Data for gaoduanjichang proprietary airports
const proprietaryAirports = [
  {
    id: "pianyijichang/guangsuyun",
    name: "光速云",
    href: "/pianyijichang/guangsuyun",
    badgeText: "TOP 1 专线旗舰",
    badgeClass: "lab-badge-orange",
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
    badgeText: "TOP 2 原生机房",
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
    id: "iplc/firefly",
    name: "Firefly",
    href: "/iplc/firefly",
    badgeText: "TOP 3 IPLC原生",
    badgeClass: "lab-badge-blue",
    priceMain: "¥25/月起",
    priceSub: "年付折合¥8/月 · 150G",
    priceGb: "¥0.13",
    lineMain: "IPLC纯专线",
    lineSub: "8年老牌团队 · 原生IP池",
    affUrl: "https://vip02.fireflyaff.com/#/?code=2n7VURre",
    couponText: "8折码 firefly"
  },
  {
    id: "pianyijichang/sogoyun",
    name: "SOGO 云",
    href: "/pianyijichang/sogoyun",
    badgeText: "TOP 4 综合旗舰",
    badgeClass: "lab-badge-gray",
    priceMain: "¥25/月",
    priceSub: "150GB月付 · 自研客户端",
    priceGb: "¥0.16",
    lineMain: "IEPL专线",
    lineSub: "2026综合新锐",
    affUrl: "https://guangs.sogoyunaff.cc/#/?code=327Vs0w7",
    couponText: "优惠码 sss777"
  },
  {
    id: "pianyijichang/sujie",
    name: "速界",
    href: "/pianyijichang/sujie",
    badgeText: "TOP 5 AI专属调优",
    badgeClass: "lab-badge-gray",
    priceMain: "¥25/月",
    priceSub: "ChatGPT/Claude深度调优",
    priceGb: "¥0.16",
    lineMain: "IEPL专线",
    lineSub: "干净高信誉IP池",
    affUrl: "https://guangs.speedworldaff.cc/#/register?code=xgXzEfZB",
    couponText: "优惠码 sss1111"
  },
  {
    id: "pianyijichang/shanyue",
    name: "闪跃",
    href: "/pianyijichang/shanyue",
    badgeText: "TOP 6",
    badgeClass: "lab-badge-gray",
    priceMain: "¥24/月",
    priceSub: "150GB月付 · 多设备支持",
    priceGb: "¥0.16",
    lineMain: "IEPL专线",
    lineSub: "4K流媒体秒开",
    affUrl: "https://vip02.flashleapaff.com/#/?code=3lgzm9mm",
    couponText: "优惠码 shanyue"
  },
  {
    id: "pianyijichang/kexinyun",
    name: "可信云",
    href: "/pianyijichang/kexinyun",
    badgeText: "TOP 7",
    badgeClass: "lab-badge-gray",
    priceMain: "¥25/月",
    priceSub: "150GB月付 · 高并发",
    priceGb: "¥0.16",
    lineMain: "IEPL专线",
    lineSub: "VLESS · 纯净链路",
    affUrl: "https://guangs.kosingaff.com/#/register?code=UYDtNlCY",
    couponText: "优惠码 kkk333"
  }
];

// Third party airports in gaoduanjichang
const thirdPartyAirports = [
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
    id: "bitznet",
    name: "Bitznet",
    href: null,
    priceMain: "¥23.33/月起",
    priceSub: "80G/月",
    priceGb: "¥0.046",
    lineMain: "IEPL专线",
    lineSub: "平价大流量",
    affUrl: "https://ent.webitz.net/#/register?code=RxW1PoPV",
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
    id: "maying",
    name: "魅影极速 MAYING",
    href: null,
    priceMain: "¥60/月起",
    priceSub: "400G/月",
    priceGb: "¥0.074",
    lineMain: "BGP中转",
    lineSub: "SSR协议",
    affUrl: null,
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
  },
  {
    id: "tag",
    name: "TAG机场（TAGSS）",
    href: null,
    priceMain: "¥114/月起",
    priceSub: "500G/月",
    priceGb: "¥0.22",
    lineMain: "IEPL专线",
    lineSub: "全球250+节点",
    affUrl: "https://user.tagss14.pro/#/auth/ZeQmTu3Z",
    couponText: null
  },
  {
    id: "tangguoyun",
    name: "糖果云",
    href: null,
    priceMain: "¥18/月起",
    priceSub: "100G/月",
    priceGb: "¥0.098",
    lineMain: "IEPL专线",
    lineSub: "BGP中转",
    affUrl: "https://candytally2.com/web/#/register?code=rWs0LMC8",
    couponText: null
  }
];

const allAirports = [...proprietaryAirports, ...thirdPartyAirports];

// HTML Row Generator
function renderHtmlRow(item) {
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

// RSC Row Generator
function renderRscRow(item) {
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

const htmlRows = allAirports.map(renderHtmlRow).join('\n');
const rscRows = allAirports.map(renderRscRow);

// First update the .rsc file and get the exact line 20
function getUpdatedRscLine(rscFilePath) {
  const content = fs.readFileSync(rscFilePath, 'utf8');
  const lines = content.split('\n');
  const idx20 = lines.findIndex(l => l.startsWith('20:'));
  if (idx20 === -1) throw new Error('20: not found in ' + rscFilePath);
  
  let rscObj = JSON.parse(lines[idx20].slice(3));
  let div = rscObj[0][1];
  let table = div[3].children;
  table[3].className = "w-full min-w-[46rem] border-collapse text-left text-sm";
  table[3].children[1][3].children = rscRows;
  
  const newLine = '20:' + JSON.stringify(rscObj);
  lines[idx20] = newLine;
  fs.writeFileSync(rscFilePath, lines.join('\n'), 'utf8');
  console.log(`Updated RSC file: ${rscFilePath}`);
  return newLine;
}

const newRscLine = getUpdatedRscLine('gaoduanjichang.rsc');
getUpdatedRscLine('gaoduanjichang/index.rsc');

function updateHtmlFile(htmlPath, rscPayloadLine) {
  let content = fs.readFileSync(htmlPath, 'utf8');

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
    const newScriptContent = `self.__next_f.push([1,${JSON.stringify(rscPayloadLine + '\n')}])</script>`;
    content = content.slice(0, startIdx) + newScriptContent + content.slice(endIdx + endMarker.length);
    console.log(`Updated script tag in ${htmlPath}`);
  }

  fs.writeFileSync(htmlPath, content, 'utf8');
  console.log(`Updated HTML file: ${htmlPath}`);
}

updateHtmlFile('gaoduanjichang.html', newRscLine);
updateHtmlFile('gaoduanjichang/index.html', newRscLine);

console.log('Successfully completed gaoduanjichang updates!');
