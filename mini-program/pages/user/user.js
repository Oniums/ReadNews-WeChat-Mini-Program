// pages/user/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    collect_list: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openid: app.globalData.openid,
      userInfo: app.globalData.userInfo
    })
    if (this.data.openid == null)
      this.setData({
        openid: wx.getStorageSync('openid')
      })
    if (this.data.userInfo != null)
      this.setData({
        hasUserInfo: true
      })
    else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
  },

  onShow: function (options) {
    this.setData({
      openid: app.globalData.openid,
      userInfo: app.globalData.userInfo
    })
    if (this.data.openid == null)
      this.setData({
        openid: wx.getStorageSync('openid')
      })
    if (this.data.userInfo != null)
      this.setData({
        hasUserInfo: true
      })
    else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
    if (this.data.hasUserInfo && this.data.canIUse)
      this.getcollect()
  },

  getUserInfo: function (e) {
    if (e.detail.userInfo != undefined && e.detail.userInfo != null) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        hasUserInfo: true,
        userInfo: e.detail.userInfo,
      })
      this.getcollect()
    }
  },

  getcollect: function () {
    wx.request({
      method: "POST",
      url: 'https://url/getcollect',
      data: {
        openid: this.data.openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        // pageState.finish()
        if (res.data.collect == undefined)
          this.setData({
            collect_list: false
          })
        else
          this.setData({
            collect_list: res.data.collect
          })
      },
      fail: res => {
        // pageState.error()
      }
    })
  },
  Into: function (e) {
    var content = this.data.collect_list[e.currentTarget.dataset.id]
    console.log(content.id)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + encodeURIComponent(content.id)
    })
  },
  onRetry:function(e){
    this.onLoad()
  }
})