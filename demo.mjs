import WeixinLoginClientHandler from './WeixinLoginClientHandler'

const weixinLoginClientHandler = new WeixinLoginClientHandler({
  appid: 'wx2d1d6aa2f86768d7',
  redirect_uri: 'https://wyr.me/api/weixin/login',
  state: ''
})

weixinLoginClientHandler.weixinUUID().then(r => {
  console.log(r)
  weixinLoginClientHandler.weixinQRCodeImgBase64(r).then(r => console.log(r))
})

weixinLoginClientHandler.weixinQRCodeImgURL().then(r => console.log(r))
