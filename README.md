# 微信扫码登陆

微信开放平台扫码登陆解析处理工具，将frame数据处理为图片或Base64图片数据返回客户端进行扫码。

解决Chrome70中open.weixin.qq.com腾讯SSL证书不被信任的问题，解决Chrome68中frame跨域被拦截的问题。

## 须知
ES6，Node.js 9，standard规范。

## 测试方法

先阅读源码，然后类似以下方法执行。
`node --experimental-modules demo.mjs`
`node --experimental-modules server.mjs`
`node --experimental-modules test.mjs`

## 使用方法
见`WeixinLoginClientHandler.mjs`文件。

```
weixinLoginClientHandler.weixinUUID().then(r => console.log(r)) \\ 获取微信uuid（用于获取微信二维码和Ajax轮询结果所需参数）

weixinLoginClientHandler.weixinQRCodeImgURL().then(r => console.log(r)) \\ 可以直接获取二维码图片

weixinLoginClientHandler.weixinQRCodeImgBase64().then(r => console.log(r)) \\ 获取二维码图片的Base64数据（主要用于Chrome70中腾讯所使用的赛门铁克证书失效的情况）
```

## 小提示

1. 如果您看不懂此项目文件的代码内容，请弃用此方案（😂这可能说明您并不需要使用该方案，这个方案可能只适合少部分应用）。  
2. 使用此方法，无需经由服务器端跳转，可以直接获得code。如果是Electron环境，可以直接在主进程请求。  
3. 该文件使用原生Node.js方法，直接复制`WeixinLoginClientHandler.mjs`文件到你的项目，然后可自由发挥。  
4. 理论上你可以模拟任何网站的二维码，但是没有私钥就算拿到code也没有用。  
