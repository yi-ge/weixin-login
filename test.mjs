import http from 'http'

http.createServer(async (request, response) => {
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
    <script src="https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js"></script>
    <script>
      $(function () {
        var getCode = function (uuid, last) {
          $.ajax({
            type: "GET",
            url: "http://localhost:8033/api/login/weixin/check?uuid=" + uuid + (last ? '&last=' + last : ''),
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
            url: "http://localhost:8033/api/login/weixin/img",
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
  
        getUUID()
      });
    </script>
  </body>
  </html>  
      `)
}).listen(8032)
