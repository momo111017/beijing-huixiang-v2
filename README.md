# 北境回响网页原型 V2

## 公网预览

- GitHub Pages：<https://momo111017.github.io/beijing-huixiang-v2/>
- Cloudflare Pages：<https://beijing-huixiang-v2.pages.dev/>

以上地址发布的是 V2 电脑端候选版本，V1 原地址保持不变。俄语音频和五个点位坐标仍保留“待人工复核”状态。

## 本地运行

```bash
cd "/Users/学习/挑战杯/网页原型 V1/v2-package"
npm run serve
```

打开 `http://127.0.0.1:5174/`。定位功能要求 HTTPS 或 localhost。

## 验证

```bash
npm run validate
```

## 数据与隐私

- 百度地图浏览器端 AK 会随网页公开，正式域名必须加入 Referer 白名单。
- 用户位置只在浏览器当前页面中显示，不写入本地进度，也不上传到项目服务器。
- 语言、游览进度和收藏仅保存在浏览器 localStorage。
- MiniMax 凭据不得写入本目录。

## V2 边界

本轮只正式验收电脑端。网站不提供账号、真实后台、路线连线、转弯级导航、支付、AR、数字人或开放域 AI。
