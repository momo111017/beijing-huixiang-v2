# V2 Five-stop Polish Design

## Goal

统一修正路线页与五个点位导览页的视觉问题，删除首页无必要的数据说明，补齐四个缺失实景图，并对五段俄语讲解做技术与内容一致性核对。

## Approved direction

- “我的路线”当前点位卡不再使用松绿色底色。选中态采用暖米灰底、红褐色边框、深色正文和红褐色编号，避免绿色与红色同时争夺注意力。
- 首页从 DOM、文案和样式中删除“5 个真实点位／1 个完整旗舰导览／RU 每站俄语音频”三项数据说明，不用隐藏元素或其他装饰内容替代。
- 五个点位共用同一套导览布局，不为哈尔滨站写单独样式。右侧章节、正文、音频、任务与史料追问文字整体放大；任务与追问模块利用中下部空间；底部按钮上移并左右收窄。
- 哈尔滨站保留现有实景图；苏联红军烈士纪念碑、秋林公司、圣索菲亚大教堂、斯大林公园补充 Wikimedia Commons 实景图。图片缩放到适合网页的尺寸并保存到本地，页面明确标注“经尺寸压缩与界面裁切”，同时提供作者、来源页和许可证链接。
- 五段俄语 MP3 均保留现有文件。核对包括文件存在、FFmpeg 完整解码零错误、时长 20—60 秒、非静音、页面元数据加载成功，以及 Whisper large-v3-turbo 俄语转写与 TXT、页面讲解所含关键事实一致。结果逐站写入验收记录。未经俄方成员确认，不把 `reviewStatus` 从 `needs-review` 改为 `approved`。
- 本轮只修改 `v2-package`，不触碰 V1 `public-package`；除四站新增 `visual` 对象和必要版权字段外，不修改地图、坐标、路线顺序、任务、问答和音频文件。

## Image sources

所有 `visual` 对象固定使用 `src`、双语 `alt`、`credit`、`license`、`licenseUrl`、`sourceUrl` 和 `modificationNote` 字段。

| Stop | Local file and bilingual alt | Author | License and source |
|---|---|---|---|
| 苏联红军烈士纪念碑 | `assets/images/soviet-memorial.jpg`；`Памятник советским воинам на Музейной площади в Харбине`／`哈尔滨博物馆广场西侧的苏联红军烈士纪念碑` | EditQ | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；[来源页](https://commons.wikimedia.org/wiki/File:%E5%93%88%E5%B0%94%E6%BB%A8%E8%8B%8F%E8%81%94%E7%BA%A2%E5%86%9B%E8%8B%B1%E9%9B%84%E7%BA%AA%E5%BF%B5%E7%A2%91.jpg) |
| 秋林公司 | `assets/images/qiulin-company.jpg`；`Здание торгового дома «Чурин и Ко» в Харбине`／`哈尔滨秋林公司建筑实景` | N509FZ | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；[来源页](https://commons.wikimedia.org/wiki/File:Churin_Company_Building_(20240502122705).jpg) |
| 圣索菲亚大教堂 | `assets/images/saint-sophia.jpg`；`Западный фасад Софийского собора в Харбине`／`哈尔滨圣索菲亚大教堂西立面` | N509FZ | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；[来源页](https://commons.wikimedia.org/wiki/File:West_facade_of_St._Sophia_Cathedral,_Harbin_(20230721150540).jpg) |
| 斯大林公园 | `assets/images/stalin-park.jpg`；`Парк Сталина на набережной Сунгари в Харбине`／`哈尔滨松花江畔斯大林公园实景` | EditQ | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)；[来源页](https://commons.wikimedia.org/wiki/File:Stalin_Park,_Harbin_1.jpg) |

## Layout behavior

- 1366×768 是最紧凑验收尺寸。五站、俄中两种语言均需在 1366×768、1440×900、1920×1080 下验证：导览根容器没有页面级横向或纵向滚动，底部按钮始终可见。
- 章节正文不通过缩小字号换取空间。问答答案如超长，继续在模块内部滚动。
- 底部按钮宽度限制为右侧内容区宽度减去 80px，并水平居中；与底部保留 10—14px 间距。

## Verification

- 自动测试锁定首页数据模块及其文案从 DOM 中移除、四站均有完整 `visual` 数据、五个音频和文字稿均存在。浏览器读取选中卡的实际计算颜色并截图，确认不是绿色硬编码或 `var(--pine)`。
- 音频验收表逐站记录 MP3 时长、完整解码、非静音、Whisper 转写与 TXT／页面关键事实比对结果，以及仍待俄方母语审核的状态；浏览器验证播放、暂停、拖动和加载失败降级。
- `npm run validate` 全部通过。
- 浏览器逐站打开五个导览页，检查图片、音频元数据、任务、问答和下一站按钮；验收 1366×768、1440×900、1920×1080。
