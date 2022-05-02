//app.js
App({
  onLaunch: function () {
    this.checkLogin(res => {
      if (!res.is_login) {
        this.login()
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  login: function () {
    wx.login({
      success: res => {
        wx.request({
          url: 'https://url/login',
          method: 'post',
          data: {
            code: res.code
          },
          success: res => {
            this.globalData.openid = res.data.openid
            wx.setStorage({
              key: 'openid',
              data: res.data.openid
            })
          }
        })
      }
    })
  },
  checkLogin: function (callback) {
    var openid = this.globalData.openid
    if (!openid) {
      openid = wx.getStorageSync('openid')
      if (openid) {
        this.globalData.openid = openid
      } else {
        callback({
          is_login: false
        })
        return
      }
    }
    wx.request({
      url: 'https://url/checklogin',
      method: "POST",
      data: {
        openid: openid
      },
      success: res => {
        callback({
          is_login: res.data.is_login
        })
      }
    })
  },
  upset: function (arr) {
    var temp = []
    var len = arr.length
    for (var i = 0; i < len; i++) {
      var index = Math.floor(Math.random() * (len - i))
      temp.push(arr[index])
      arr.splice(index, 1)
    }
    return temp
  },
  globalData: {
    userInfo: null,
    openid: null
  }
})