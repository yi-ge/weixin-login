import http from 'http'
import URL from 'url'
import querystring from 'querystring'
import WeixinLoginClientHandler from './WeixinLoginClientHandler'

const weixinLoginClientHandler = new WeixinLoginClientHandler({
  appid: 'wx2d1d6aa2f86768d7',
  redirect_uri: 'https://wyr.me/api/weixin/login',
  state: ''
})

const jsonHeader = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Headers': 'Authorization, DNT, User-Agent, Keep-Alive, Origin, X-Requested-With, Content-Type, Accept, x-clientid',
  'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Origin': '*'
}

http.createServer(async (request, response) => {
  if (/^\/api\/login\/weixin\/img/.test(request.url)) {
    try {
      const arg = URL.parse(request.url).query
      const params = querystring.parse(arg)
      const wxUUID = await weixinLoginClientHandler.weixinUUID(params.appid, params.redirect_uri)
      const r = await weixinLoginClientHandler.weixinQRCodeImgBase64(wxUUID)
      response.writeHead(200, jsonHeader)
      response.end(JSON.stringify({
        status: 1,
        result: {
          wxUUID,
          imgData: r
        }
      }))
    } catch (err) {
      response.writeHead(200, jsonHeader)
      response.end(JSON.stringify({
        status: 3,
        msg: '参数错误'
      }))
    }
  } else if (/^\/api\/login\/weixin\/check/.test(request.url)) {
    if (request.url.split('?') && request.url.split('?').length >= 2) {
      try {
        const arg = URL.parse(request.url).query
        const params = querystring.parse(arg)
        const uuid = params.uuid
        const r = await weixinLoginClientHandler.getCode(uuid, params.last)
        response.writeHead(200, jsonHeader)
        response.end(JSON.stringify(r))
      } catch (err) {
        response.writeHead(200, jsonHeader)
        response.end(JSON.stringify({
          status: 3,
          msg: '参数错误'
        }))
      }
    } else {
      response.writeHead(200, jsonHeader)
      response.end(JSON.stringify({
        status: 2,
        msg: '缺少必须参数'
      }))
    }
  } else {
    response.writeHead(404, {
      'Content-Type': 'text-plain'
    })
    response.end('404\n')
  }
}).listen(8033)