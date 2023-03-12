import http from 'http'
import URL from 'url'
import querystring from 'querystring'
import WeixinLoginClientHandler from './WeixinLoginClientHandler.js'

const weixinLoginClientHandler = new WeixinLoginClientHandler({
  appid: 'wx827225356b689e24',
  redirect_uri: 'https://qq.jd.com/',
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
  } else if (/^\/demo/.test(request.url)) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(`
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>测试微信扫码登陆</title>
</head>

<body>
  <img id="qrcode" src="" />
  <h1 id="code"></h1>
  <p style="font-weight: 600">使用您的应用测试？</p>
  <p>您的AppID：<input type="text" id="appid" /></p>
  <p>开放平台设置的授权回调域(以http/https开头)：<input type="text" id="redirectUri" /></p>
  <p><input type="button" value="测试" id="test" /></p>
  <script src="https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js"></script>
  <script>
    function GetQueryString(name) {
      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if(r!=null)return unescape(r[2]); return '';
    }

    $(function () {
      var getCode = function (uuid, last) {
        $.ajax({
          type: "GET",
          url: "/api/login/weixin/check?uuid=" + uuid + (last ? '&last=' + last : ''),
          dataType: "json",
          cache: !1,
          timeout: 6e4,
          success: function (data) {
            if (data.status === 405) {
              $('#code').text('登陆成功，code = ' + data.result.code)
            } else if (data.status === 404) {
              $('#code').text(data.msg.title + ', ' + data.msg.content)
              getCode(uuid, data.result.wxErrCode)
            } else if (data.status === 403) {
              $('#code').text(data.msg.title + ', ' + data.msg.content)
              getCode(uuid, data.result.wxErrCode)
            } else if (data.status === 500) {
              getUUID()
            } else {
              setTimeout(function () {
                getCode(uuid)
              }, 2000)
            }
          },
          error: function () {
            setTimeout(function () {
              getCode(uuid)
            }, 2000)
          }
        })
      }

      var getUUID = function (uuid) {
        $.ajax({
          type: "GET",
          url: "/api/login/weixin/img?appid=" + GetQueryString("appid") + "&redirect_uri=" + GetQueryString("redirect_uri"),
          dataType: "json",
          cache: !1,
          timeout: 6e4,
          success: function (data) {
            if (data.status === 1) {
              var uuid = data.result.wxUUID
              $('#qrcode').attr('src', data.result.imgData)
              getCode(uuid)
            } else {
              setTimeout(function () {
                window.location.reload();
              }, 2000)
            }
          },
          error: function () {
            setTimeout(function () {
              window.location.reload();
            }, 2000)
          }
        })
      }

      $("#appid").val(GetQueryString("appid"))
      $("#redirectUri").val(GetQueryString("redirect_uri"))

      $("#test").click(function () {
        window.location.href = window.location.origin + "/demo?appid=" + $("#appid").val() + "&redirect_uri=" + $("#redirectUri").val();
      })

      getUUID()
    });
  </script>
</body>
</html>`)
  } else {
    response.writeHead(404, {
      'Content-Type': 'text-plain'
    })
    response.end('404\n')
  }
}).listen(65533)

console.log('服务器已启动: 65533')
