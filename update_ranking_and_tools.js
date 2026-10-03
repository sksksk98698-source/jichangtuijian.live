const fs = require('fs');
const path = require('path');

// 28 Proprietary Airports for Paihangbang
const paihangbangAirports = [
  { rank: 1, name: "光速云", href: "/pianyijichang/guangsuyun", badge: "TOP 1 主推", badgeClass: "lab-badge-orange", priceMain: "¥7.5/月起", priceSub: "年付59G折合 · 月付¥23(148G)", lineMain: "企业级IEPL专线", lineSub: "VLESS · 2020老牌稳定", affUrl: "https://sahude.gsyvipaff.com/#/?code=keqgvT5Y", coupon: "8折码 AMM" },
  { rank: 2, name: "飞猫云", href: "/pianyijichang/flycat", badge: "TOP 2 低价专线", badgeClass: "lab-badge-blue", priceMain: "¥7/月起", priceSub: "年付50G折合 · 月付¥25(150G)", lineMain: "IEPL专线", lineSub: "全端支持 · 季付8折", affUrl: "https://guangs.flycataff.com/#/?code=6uq0Xe9y", coupon: "8折码 flycat888" },
  { rank: 3, name: "星岛梦", href: "/pianyijichang/xingdaomeng", badge: "TOP 3 稳定平价", badgeClass: "lab-badge-blue", priceMain: "¥8/月起", priceSub: "年付60G折合 · 含不限时套餐", lineMain: "企业级内网专线", lineSub: "VLESS · 9折优惠", affUrl: "https://guangs.xingdaomeng.com/#/?code=1TynBYnR", coupon: "9折码 nmw888" },
  { rank: 4, name: "唯兔云", href: "/pianyijichang/weituyun", badge: "TOP 4", badgeClass: "lab-badge-gray", priceMain: "¥20/月", priceSub: "月付100G · 高速专线", lineMain: "IEPL专线", lineSub: "VLESS协议 · 晚高峰稳定", affUrl: "https://guangs.v2yunvipaff.com/#/?code=xIutqOBA", coupon: "优惠码 v2yun" },
  { rank: 5, name: "极连云", href: "/pianyijichang/jilianyun", badge: "TOP 5", badgeClass: "lab-badge-gray", priceMain: "¥18/月", priceSub: "月付100G · 平价专线", lineMain: "IEPL专线", lineSub: "晚高峰稳定 · 4K秒开", affUrl: "https://guangs.jlyvipaff.com/#/?code=VM1rKGUu", coupon: "优惠码 ji8888" },
  { rank: 6, name: "宇宙云", href: "/pianyijichang/yuzhouyun", badge: "TOP 6", badgeClass: "lab-badge-gray", priceMain: "¥14.9/月", priceSub: "月付100G · 门槛极低", lineMain: "IEPL专线", lineSub: "新手平价首选", affUrl: "https://wzjc.yuzoucloud.cc/#/?code=yrThwMP1", coupon: "8折优惠" },
  { rank: 7, name: "隐形人", href: "/pianyijichang/invisible", badge: "TOP 7", badgeClass: "lab-badge-gray", priceMain: "¥24/月起", priceSub: "60+独立原生IP · 晚高峰秒开", lineMain: "企业级IEPL专线", lineSub: "2Gbps带宽 · 24h售后", affUrl: "https://yinxingren1.invisibleaff.com/#/?code=kcyEeoJT", coupon: "8折码 yxr888" },
  { rank: 8, name: "Firefly", href: "/iplc/firefly", badge: "TOP 8", badgeClass: "lab-badge-gray", priceMain: "¥8/月起", priceSub: "年付60G折合 · 月付¥25(150G)", lineMain: "IPLC纯专线", lineSub: "8年老牌团队 · 原生IP池", affUrl: "https://vip02.fireflyaff.com/#/?code=2n7VURre", coupon: "8折码 firefly" },
  { rank: 9, name: "SOGO 云", href: "/pianyijichang/sogoyun", badge: "TOP 9", badgeClass: "lab-badge-gray", priceMain: "¥25/月", priceSub: "150GB月付 · 自研客户端", lineMain: "IEPL专线", lineSub: "2026综合新锐", affUrl: "https://guangs.sogoyunaff.cc/#/?code=327Vs0w7", coupon: "优惠码 sss777" },
  { rank: 10, name: "速界", href: "/pianyijichang/sujie", badge: "TOP 10", badgeClass: "lab-badge-gray", priceMain: "¥25/月", priceSub: "ChatGPT/Claude深度调优", lineMain: "IEPL专线", lineSub: "干净高信誉IP池", affUrl: "https://guangs.speedworldaff.cc/#/register?code=xgXzEfZB", coupon: "优惠码 sss1111" },
  { rank: 11, name: "闪跃", href: "/pianyijichang/shanyue", badge: "TOP 11", badgeClass: "lab-badge-gray", priceMain: "¥24/月", priceSub: "150GB月付 · 多端并发", lineMain: "IEPL专线", lineSub: "4K流媒体秒开", affUrl: "https://vip02.flashleapaff.com/#/?code=3lgzm9mm", coupon: "优惠码 shanyue" },
  { rank: 12, name: "可信云", href: "/pianyijichang/kexinyun", badge: "TOP 12", badgeClass: "lab-badge-gray", priceMain: "¥25/月", priceSub: "150GB月付 · 高并发", lineMain: "IEPL专线", lineSub: "VLESS · 纯净链路", affUrl: "https://guangs.kosingaff.com/#/register?code=UYDtNlCY", coupon: "优惠码 kkk333" },
  { rank: 13, name: "微风网络", href: "/pianyijichang/breezenet", badge: "TOP 13", badgeClass: "lab-badge-gray", priceMain: "¥7/月起", priceSub: "年付50G折合 · 季付9折", lineMain: "IEPL专线", lineSub: "小流量轻度优选", affUrl: "https://edp01.breezenetaff.com/#/?code=t3huofyI", coupon: "9折码 flat888" },
  { rank: 14, name: "无忧链接", href: "/pianyijichang/worryfree", badge: "TOP 14", badgeClass: "lab-badge-gray", priceMain: "¥6/月起", priceSub: "月付¥19(100G) · 免转换", lineMain: "IEPL专线", lineSub: "全平台一键直连", affUrl: "https://wep01.worryfreeaff.com/#/?code=4ZoSbLdL", coupon: "优惠码 wuyou666" },
  { rank: 15, name: "幕光加速", href: "/pianyijichang/twilight", badge: "TOP 15", badgeClass: "lab-badge-gray", priceMain: "¥20/月", priceSub: "月付120G · 专线保障", lineMain: "IEPL专线", lineSub: "VLESS · 中等流量", affUrl: "https://varnexa.twilightaff.com/#/?code=D1LHglg3", coupon: "优惠码 可用" },
  { rank: 16, name: "二猫云", href: "/pianyijichang/ermaoyun", badge: "TOP 16", badgeClass: "lab-badge-gray", priceMain: "¥20/月", priceSub: "月付130G · 第三方导入", lineMain: "IEPL专线", lineSub: "均衡规格", affUrl: "https://guangs.2maoyunaff.cc/#/?code=7mjvgGbW", coupon: "优惠码 可用" },
  { rank: 17, name: "梯子云", href: "/pianyijichang/tiziyun", badge: "TOP 17", badgeClass: "lab-badge-gray", priceMain: "¥18/月", priceSub: "月付100G · 均衡老牌", lineMain: "IEPL专线", lineSub: "全协议支持", affUrl: "https://tizi01.tiziyunaff.com/#/?code=pX1mKoLa", coupon: "8折码 tizi888" },
  { rank: 18, name: "神行", href: "/pianyijichang/shenxing", badge: "TOP 18", badgeClass: "lab-badge-gray", priceMain: "¥22/月", priceSub: "月付120G · 极速节点", lineMain: "IEPL专线", lineSub: "高速传输", affUrl: "https://guangs.shenxingaff.cc/#/?code=sx888", coupon: "优惠码 可用" },
  { rank: 19, name: "闪电鼠", href: "/pianyijichang/shandianshu", badge: "TOP 19", badgeClass: "lab-badge-gray", priceMain: "¥19/月", priceSub: "月付100G · 小额灵活", lineMain: "IEPL专线", lineSub: "全平台一键连", affUrl: "https://guangs.shandianshuaff.com/#/?code=sds888", coupon: "优惠码 可用" },
  { rank: 20, name: "榴莲云", href: "/pianyijichang/liulianyun", badge: "TOP 20", badgeClass: "lab-badge-gray", priceMain: "¥18/月", priceSub: "月付100G · 新锐专线", lineMain: "IEPL专线", lineSub: "高速流媒体", affUrl: "https://guangs.liulianaff.com/#/?code=ll888", coupon: "优惠码 可用" },
  { rank: 21, name: "一凡云", href: "/pianyijichang/yifanyun", badge: "TOP 21", badgeClass: "lab-badge-gray", priceMain: "¥16/月", priceSub: "月付100G · 轻量平价", lineMain: "IEPL专线", lineSub: "高性价比", affUrl: "https://guangs.yifanaff.com/#/?code=yf888", coupon: "优惠码 可用" },
  { rank: 22, name: "云界线", href: "/pianyijichang/yunjiexian", badge: "TOP 22", badgeClass: "lab-badge-gray", priceMain: "¥22/月", priceSub: "月付150G · 大流量", lineMain: "IEPL专线", lineSub: "多节点互备", affUrl: "https://guangs.yunjieaff.com/#/?code=yj888", coupon: "优惠码 可用" },
  { rank: 23, name: "大佬云", href: "/pianyijichang/dalaoyun", badge: "TOP 23", badgeClass: "lab-badge-gray", priceMain: "¥25/月", priceSub: "月付150G · 进阶首选", lineMain: "IEPL专线", lineSub: "全协议接入", affUrl: "https://guangs.dalaoaff.com/#/?code=dl888", coupon: "优惠码 可用" },
  { rank: 24, name: "环球梯", href: "/pianyijichang/huanqiuti", badge: "TOP 24", badgeClass: "lab-badge-gray", priceMain: "¥19/月", priceSub: "月付100G · 稳定穿透", lineMain: "IEPL专线", lineSub: "多区域落地", affUrl: "https://guangs.huanqiuaff.com/#/?code=hq888", coupon: "优惠码 可用" },
  { rank: 25, name: "光年梯", href: "/pianyijichang/guangnianti", badge: "TOP 25", badgeClass: "lab-badge-gray", priceMain: "¥20/月", priceSub: "月付120G · 极速专线", lineMain: "IEPL专线", lineSub: "低延迟链路", affUrl: "https://guangs.guangnianaff.com/#/?code=gn888", coupon: "优惠码 可用" },
  { rank: 26, name: "全球云", href: "/pianyijichang/quanqiuyun", badge: "TOP 26", badgeClass: "lab-badge-gray", priceMain: "¥22/月", priceSub: "月付120G · 跨境优选", lineMain: "IEPL专线", lineSub: "多线冗余", affUrl: "https://guangs.quanqiuaff.com/#/?code=qq888", coupon: "优惠码 可用" },
  { rank: 27, name: "U1S1", href: "/pianyijichang/u1s1", badge: "TOP 27", badgeClass: "lab-badge-gray", priceMain: "¥15/月", priceSub: "月付80G · 极致平价", lineMain: "IEPL专线", lineSub: "轻量备用", affUrl: "https://guangs.u1s1aff.com/#/?code=u1888", coupon: "优惠码 可用" },
  { rank: 28, name: "狸猫云", href: "/pianyijichang/civetnet", badge: "TOP 28", badgeClass: "lab-badge-gray", priceMain: "¥18/月", priceSub: "月付100G · 均衡首选", lineMain: "IEPL专线", lineSub: "全设备兼容", affUrl: "https://guangs.limaoyunaff.com/#/?code=lm888", coupon: "优惠码 可用" }
];

function renderPaihangbangHtmlRow(item) {
  const nameHtml = `<a class="text-accent underline decoration-1 underline-offset-2 hover:decoration-2 font-bold" href="${item.href}">${item.name}</a>`;
  const badgeHtml = `<span class="lab-badge ${item.badgeClass}">${item.badge}</span>`;
  const btnHtml = `<a href="${item.affUrl}" target="_blank" rel="nofollow sponsored noopener noreferrer">官网 ↗</a>${item.coupon ? `<br><span class="coupon-tag">${item.coupon}</span>` : ''}`;

  return `<tr>` +
    `<td class="border-b border-rule px-3 py-2.5 font-medium whitespace-nowrap">${nameHtml}${badgeHtml}</td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-foreground block">${item.priceMain}</span><span class="block text-xs text-muted">${item.priceSub}</span></td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-foreground block">${item.lineMain}</span><span class="text-xs text-muted block">${item.lineSub}</span></td>` +
    `<td class="border-b border-rule px-3 py-2.5 whitespace-nowrap text-center">${btnHtml}</td>` +
    `</tr>`;
}

function renderPaihangbangRscRow(item) {
  return [
    "$", "tr", item.href, {
      "children": [
        ["$", "td", null, {
          "className": "border-b border-rule px-3 py-2.5 font-medium whitespace-nowrap",
          "children": [
            ["$", "a", null, {
              "href": item.href,
              "className": "text-accent underline decoration-1 underline-offset-2 hover:decoration-2 font-bold",
              "children": item.name
            }],
            ["$", "span", null, {
              "className": `lab-badge ${item.badgeClass}`,
              "children": item.badge
            }]
          ]
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
          "children": [
            ["$", "a", null, {
              "href": item.affUrl,
              "target": "_blank",
              "rel": "nofollow sponsored noopener noreferrer",
              "children": "官网 ↗"
            }],
            item.coupon ? ["$", "br", null, {}] : null,
            item.coupon ? ["$", "span", null, {
              "className": "coupon-tag",
              "children": item.coupon
            }] : null
          ].filter(Boolean)
        }]
      ]
    }
  ];
}

// Build Paihangbang Table
const phbHtmlRows = paihangbangAirports.map(renderPaihangbangHtmlRow).join('\n');
const phbRscRows = paihangbangAirports.map(renderPaihangbangRscRow);

const phbTableHtml = `<div class="mt-8 border-b-2 border-foreground pb-6"><div class="flex flex-wrap items-baseline justify-between gap-x-4"><h2 class="font-serif text-2xl font-semibold tracking-tight">2026年度权威机场排行榜（前28强精选）</h2><span class="text-xs text-muted">28家专线机场综合横评</span></div><div class="table-scroll mt-4 overflow-x-auto"><table class="w-full min-w-[46rem] border-collapse text-left text-sm"><thead><tr><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">排名与品牌</th><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">入门套餐</th><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">专线与协议</th><th class="border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap">官网通道</th></tr></thead><tbody>\n${phbHtmlRows}\n</tbody></table></div></div>`;

const phbTableRsc = [
  "$", "div", null, {
    "className": "mt-8 border-b-2 border-foreground pb-6",
    "children": [
      ["$", "div", null, {
        "className": "flex flex-wrap items-baseline justify-between gap-x-4",
        "children": [
          ["$", "h2", null, {
            "className": "font-serif text-2xl font-semibold tracking-tight",
            "children": "2026年度权威机场排行榜（前28强精选）"
          }],
          ["$", "span", null, {
            "className": "text-xs text-muted",
            "children": "28家专线机场综合横评"
          }]
        ]
      }],
      ["$", "div", null, {
        "className": "table-scroll mt-4 overflow-x-auto",
        "children": [
          "$", "table", null, {
            "className": "w-full min-w-[46rem] border-collapse text-left text-sm",
            "children": [
              ["$", "thead", null, {
                "children": ["$", "tr", null, {
                  "children": [
                    ["$", "th", null, { "className": "border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap", "children": "排名与品牌" }],
                    ["$", "th", null, { "className": "border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap", "children": "入门套餐" }],
                    ["$", "th", null, { "className": "border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap", "children": "专线与协议" }],
                    ["$", "th", null, { "className": "border-b-2 border-foreground px-3 py-2.5 text-left font-semibold whitespace-nowrap", "children": "官网通道" }]
                  ]
                }]
              }],
              ["$", "tbody", null, { "children": phbRscRows }]
            ]
          }
        ]
      }]
    ]
  }
];

// Update paihangbang RSC
function updatePaihangbangRsc(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let idx20 = lines.findIndex(l => l.startsWith('20:'));
  if (idx20 !== -1) {
    let rscObj = JSON.parse(lines[idx20].slice(3));
    // rscObj is [h2, div.articles] or [phbTableRsc, h2, div.articles]
    let articlesDiv = rscObj.find(x => x && x[1] === 'div' && x[3] && x[3].className && x[3].className.includes('flex flex-col'));
    let h2Articles = ["$", "h2", null, { "className": "mt-12 font-serif text-2xl font-semibold tracking-tight", "children": "全部文章" }];
    
    let newRscObj = [phbTableRsc, h2Articles, articlesDiv];
    const newLine = '20:' + JSON.stringify(newRscObj);
    lines[idx20] = newLine;
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Updated RSC: ${filePath}`);
    return newLine;
  }
}

const phbNewLine = updatePaihangbangRsc('paihangbang.rsc');
updatePaihangbangRsc('paihangbang/index.rsc');

// Update paihangbang HTML
function updatePaihangbangHtml(filePath, newLine) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove any old custom table if exists
  content = content.replace(/<div class="mt-8 border-b border-rule pb-4">[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/g, '');
  content = content.replace(/<div class="mt-8 border-b-2 border-foreground pb-6">[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/g, '');

  // 2. Insert new table before <h2 class="mt-12 font-serif text-2xl font-semibold tracking-tight">全部文章</h2>
  const target = '<h2 class="mt-12 font-serif text-2xl font-semibold tracking-tight">全部文章</h2>';
  if (content.includes(target)) {
    content = content.replace(target, phbTableHtml + '\n' + target);
  }

  // 3. Update script tag
  const marker = 'self.__next_f.push([1,"20:';
  const startIdx = content.indexOf(marker);
  if (startIdx !== -1) {
    const endMarker = '])</script>';
    const endIdx = content.indexOf(endMarker, startIdx);
    const newScriptContent = `self.__next_f.push([1,${JSON.stringify(newLine + '\n')}])</script>`;
    content = content.slice(0, startIdx) + newScriptContent + content.slice(endIdx + endMarker.length);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated HTML: ${filePath}`);
}

updatePaihangbangHtml('paihangbang.html', phbNewLine);
updatePaihangbangHtml('paihangbang/index.html', phbNewLine);

console.log('Finished updating paihangbang!');
