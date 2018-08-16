import https from 'https'
import URL from 'url'

export default class WeixinLoginClientHandler {
  constructor (config) {
    this.config = Object.assign({}, config)
  }

  get requestURL () {
    const {
      appid,
      redirect_uri, // eslint-disable-line
      state
    } = this.config
    return `https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&scope=snsapi_login&redirect_uri=${encodeURI(redirect_uri)}&state=${state}&login_type=jssdk&self_redirect=default`
  }

  weixinUUID () {
    return new Promise((resolve, reject) => {
      const url = URL.parse(this.requestURL)
      const options = {
        protocol: 'https:',
        port: 443,
        hostname: url.hostname,
        family: 4,
        path: url.pathname + url.search,
        method: 'GET',
        timeout: 5e3,
        rejectUnauthorized: false,
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3522.0 Safari/537.36'
        }
      }
      const req = https.request(options, (res) => {
        let chunks = []
        res.on('data', (chunk) => {
          chunks.push(chunk)
        })
        res.on('end', (err) => {
          if (err) reject(err)
          const html = chunks.toString('utf8')
          try {
            resolve(html.match(/src="\/connect\/qrcode\/(\S*)" \/>/)[1])
          } catch (err) {
            reject(err)
          }
        })
      })

      req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`)
        reject(e)
      })

      req.end()
    })
  }

  async weixinQRCodeImgURL (uuid) {
    uuid = uuid || await this.weixinUUID()
    return 'https://open.weixin.qq.com/connect/qrcode/' + uuid
  }

  weixinQRCodeImgBase64 (uuid) {
    return new Promise(async (resolve, reject) => {
      const req = https.get('https://open.weixin.qq.com/connect/qrcode/' + uuid, (res) => {
        let chunks = []
        let size = 0
        res.on('data', (chunk) => {
          chunks.push(chunk)
          size += chunk.length
        })
        res.on('end', (err) => {
          if (err) reject(err)
          const data = Buffer.concat(chunks, size)
          resolve('data:image/jpeg;base64,' + data.toString('base64'))
        })
      })
    })
  }

  getCode (uuid, d, redirectUri, state) {
    return new Promise(async (resolve, reject) => {
      uuid = uuid
      redirectUri = redirectUri || this.redirect_uri
      state = state || this.state
      const url = URL.parse('https://long.open.weixin.qq.com/connect/l/qrconnect?uuid=' + uuid + (d ? '&last=' + d : ''))
      const options = {
        protocol: 'https:',
        port: 443,
        hostname: url.hostname,
        family: 4,
        path: url.pathname + url.search,
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3522.0 Safari/537.36'
        }
      }
      const req = https.request(options, (res) => {
        let chunks = []
        let size = 0
        res.on('data', (chunk) => {
          chunks.push(chunk)
          size += chunk.length
        })
        res.on('end', (err) => {
          if (err) reject(err)
          const result = chunks.toString('utf8')
          try {
            const wxErrCode = result.match(/window.wx_errcode=(\S*);w/)[1]
            switch (parseInt(wxErrCode)) {
              case 405:
                const wxCode = result.match(/window.wx_code='(\S*)';/)[1]
                let h = this.config.redirect_uri
                h = h.replace(/&amp;/g, '&')
                h += (h.indexOf('?') > -1 ? '&' : '?') + 'code=' + wxCode + '&state=' + this.config.state
                resolve({
                  status: 405,
                  msg: '登陆成功',
                  result: {
                    code: wxCode,
                    redirect: h,
                    state: this.config.state
                  }
                })
                break
              case 404:
                resolve({
                  status: 404,
                  msg: {
                    title: '扫描成功',
                    content: '请在微信中点击确认即可登录'
                  },
                  result: {
                    wxErrCode
                  }
                })
                break
              case 403:
                resolve({
                  status: 403,
                  msg: {
                    title: '您已取消此次登录',
                    content: '您可再次扫描登录，或关闭窗口'
                  },
                  result: {
                    wxErrCode
                  }
                })
                break
              case 402:
              case 500:
                resolve({
                  status: 500,
                  msg: '需要重新获取uuid'
                })
                break
              case 408:
                resolve({
                  status: 408,
                  msg: '需要再次请求'
                })
            }
          } catch (err) {
            reject(err)
          }
        })
      })

      req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`)
        reject(e)
      })

      req.end()
    })
  }
}
