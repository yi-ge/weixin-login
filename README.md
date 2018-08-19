# 微信扫码登陆

微信开放平台扫码登陆解析处理工具😊，将frame数据处理为图片或Base64图片数据返回客户端进行扫码。

解决Chrome70中open.weixin.qq.com腾讯SSL证书不被信任的问题，解决Chrome68中frame跨域被拦截的问题。

`最大特点`：**扫码登录无跳转**🤠。

## 须知
仅适用于`微信开放平台`-`网站应用`。ES6，Node.js 9，standard规范。

#### 为什么不封为NPM库？
这个功能的代码比较简单，https和URL库都是nodejs自带的，直接复制过去用就好了。

## 使用方法
阅`WeixinLoginClientHandler.mjs`文件。  
第一步：获取微信UUID；  
第二步：根据微信UUID获取二维码图片；  
第三步：获取微信服务器返回的Code（[详见微信开放平台文档](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)）。  

## 测试方法
先阅读源码，修改`server.mjs`里面的配置信息，然后类似以下的方法执行。  
`node --experimental-modules server.mjs`

访问`http://localhost:8033/login/weixin/demo`即可进行测试。

### API

``` js
weixinLoginClientHandler.weixinUUID().then(r => console.log(r)) \\ 获取微信uuid（用于获取微信二维码和Ajax轮询结果所需参数）

weixinLoginClientHandler.weixinQRCodeImgURL().then(r => console.log(r)) \\ 可以直接获取二维码图片

weixinLoginClientHandler.weixinQRCodeImgBase64().then(r => console.log(r)) \\ 获取二维码图片的Base64数据（主要用于Chrome70中腾讯所使用的赛门铁克证书失效的情况）

weixinLoginClientHandler.getCode(uuid, params.last).then(r => console.log(r)) \\ 获取微信服务器返回的Code（第一个连接是长连接，当用户处于“扫描成功，请在微信中点击确认即可登录”状态时可能会变为轮询，这主要由腾讯服务器控制）
```

### Example

``` js
import WeixinLoginClientHandler from './WeixinLoginClientHandler'

const weixinLoginClientHandler = new WeixinLoginClientHandler({
  appid: 'wx827225356b689e24',
  redirect_uri: 'https://qq.jd.com/',
  state: ''
})

weixinLoginClientHandler.weixinUUID().then(r => {
  console.log(r)
  weixinLoginClientHandler.weixinQRCodeImgBase64(r).then(r => console.log(r))
})

weixinLoginClientHandler.weixinQRCodeImgURL().then(r => console.log(r))
```

## 小提示

1. 如果您看不懂此项目文件的代码内容，请弃用此方案（😂这可能说明您并不需要使用该方案，这个方案可能只适合少部分应用）。  
2. 使用此方法，无需经由服务器端跳转，可以直接获得code。如果是Electron环境，可以直接在主进程请求。  
3. 该文件使用原生Node.js方法，直接复制`WeixinLoginClientHandler.mjs`文件到你的项目，然后可自由发挥。  
4. 理论上你可以模拟任何网站的二维码，但是没有私钥就算拿到code也没有用。  
