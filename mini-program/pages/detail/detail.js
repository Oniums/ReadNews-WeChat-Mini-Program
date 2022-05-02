// pages/detail/detail.js
const app = getApp()
import pagestate from '../pagestate/pagestate'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    collect: false,
    content: null,
    recommend_list: null,
    hasUserInfo: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: decodeURIComponent(options.id)
    })
    this.getnew()
    this.randomnew()
    this.checkuser()
    if (this.data.hasUserInfo)
      this.checkcollect()
  },

  /**
   * 获取新闻详细内容
   */
  getnew: function (id) {
    const pageState = pagestate(this)
    pageState.loading()
    wx.request({
      method: "POST",
      url: 'https://url/new',
      data: {
        id: this.data.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        this.setData({
          content: res.data.new
        })
        pageState.finish()
      },
      fail: res => {
        pageState.error()
      }
    })
  },

  /**
   * 相关推荐
   */
  randomnew: function () {
    const pageState = pagestate(this)
    pageState.loading()
    wx.request({
      method: "POST",
      url: 'https://url/news',
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        page: 1,
        channel: "国内焦点"
      },
      success: res => {
        pageState.finish()
        this.setData({
          recommend_list: app.upset(res.data.news)
        })
      },
      fail: res => {
        pageState.error()
      }
    })
  },

  /**
   * 收藏与取消收藏
   */
  collect: function () {
    if (this.data.hasUserInfo) {
      wx.showLoading({
        title: '请稍候',
      })
      wx.request({
        url: 'https://url/collect',
        method: "POST",
        data: {
          status: !this.data.collect,
          openid: app.globalData.openid,
          id: this.data.id
        },
        header: {
          'content-type': 'application/json'
        },
        success: res => {
          if (res.data.status) {
            this.setData({
              collect: true
            })
            wx.showToast({
              title: '收藏成功'
            })
          } else {
            this.setData({
              collect: false
            })
            wx.showToast({
              title: '已取消收藏'
            })
          }
        }
      })
    }
  },

  /**
   * 检测是否收藏
   */
  checkcollect: function () {
    wx.request({
      url: 'https://url/checkcollect',
      method: "POST",
      data: {
        openid: app.globalData.openid,
        id: this.data.id
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        this.setData({
          collect: res.data.collect
        })
      }
    })
  },

  /**
   * 检测是否有用户信息
   */
  checkuser: function () {
    if (app.globalData.userInfo)
      this.setData({
        hasUserInfo: true
      })
    else if (wx.canIUse('button.open-type.getUserInfo')) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          hasUserInfo: true
        })
      }
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function (e) {
    if (e.detail.userInfo != undefined && e.detail.userInfo != null) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        hasUserInfo: true
      })
      this.checkcollect()
      if (!this.data.collect)
        this.collect()
    }
  },

  /**
   * 重新获取
   */
  onRetry: function (e) {
    this.onLoad()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let url = encodeURIComponent('/pages/detail/detail?id=' + this.data.id);
    return {
      title: this.data.content.title,
      path: `/pages/home/home?url=${url}`
    }
  },
  onShareTimeline: function () {
    let url = encodeURIComponent('/pages/detail/detail?id=' + this.data.id);
    return {
      title: this.data.content.title,
      path: `/pages/home/home?url=${url}`
    }
  },

  Into: function (e) {
    var content = this.data.recommend_list[e.currentTarget.dataset.id]
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + encodeURIComponent(content.id)
    })
  },
})