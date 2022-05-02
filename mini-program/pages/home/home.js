// pages/home/home.js
const app = getApp()
import pagestate from '../pagestate/pagestate'
Page({
  data: {
    state_day: false,
    weather: null,
    list_is_show: 'none',
    cover_is_hidden: true,
    status: 'hidden',
    tab_id: 0,
    content_id: 0,
    degree: null,
    predict: false,
    predict_list: null,
    predict_id: 1,
    list_data: {
      Hot: null,
      domestic: null,
      international: null,
      military: null,
      financial: null,
      social: null,
      sports: null,
      game: null,
      local: null,
      entertainment: null
    },
    tab_list: [{
        id: 0,
        name: "热点",
        key: "Hot",
        channel: "国内焦点"
      }, {
        id: 1,
        name: "国内",
        key: "domestic",
        channel: "国内最新"
      }, {
        id: 2,
        name: "国际",
        key: "international",
        channel: "国际最新"
      }, {
        id: 3,
        name: "军事",
        key: "military",
        channel: "军事最新"
      },
      {
        id: 4,
        name: "经济",
        key: "financial",
        channel: "财经最新"
      }, {
        id: 5,
        name: "社会",
        key: "social",
        channel: "社会最新"
      }, {
        id: 6,
        name: "体育",
        key: "sports",
        channel: "体育最新"
      }, {
        id: 7,
        name: "游戏",
        key: "game",
        channel: "游戏最新"
      },
      {
        id: 8,
        name: "本地",
        key: "local",
      }, {
        id: 9,
        name: "娱乐",
        key: "entertainment",
        channel: "娱乐最新"
      },
    ]
  },

  /**
   * 页面加载生命周期函数
   */
  onLoad: function (options) {
    if (options.url) {
      let url = decodeURIComponent(options.url);
      wx.navigateTo({
        url: url
      })
    }
    this.changetab({
      detail: {
        current: 0
      }
    })
    this.setData({
      list_data: this.data.list_data
    })
    this.change()
  },

  /**
   * 重新获取数据函数
   */
  onRetry: function () {
    this.getNew()
  },

  /**
   * 访问服务器获取新闻函数
   */
  getNew: function (channel, page, index) {
    const pageState = pagestate(this)
    pageState.loading()
    wx.request({
      method: "POST",
      url: 'https://url/news',
      data: {
        page: page,
        channel: channel
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        this.setData({
          ['list_data.' + this.data.tab_list[index].key]: app.upset(res.data.news)
        })
        pageState.finish()
      },
      fail: res => {
        pageState.error()
      }
    })
  },

  /**
   * 显示导航栏下拉框
   */
  show_list: function (e) {
    this.setData({
      status: 'show',
      cover_is_hidden: false,
      list_is_show: 'block'
    })
  },

  /**
   * 隐藏导航栏下拉框
   */
  hidden_list: function (e) {
    var index = e.currentTarget.dataset.item
    if (index != undefined) {
      this.setData({
        tab_id: index,
        content_id: index
      })
      this.switchTap(e)
    }
    this.setData({
      test: 'hidden',
      cover_is_hidden: true,
      list_is_show: 'none'
    })
  },

  /**
   * 导航栏选择栏目
   */
  switchTap(e) {
    let screenWidth = wx.getSystemInfoSync().windowWidth;
    let itemWidth = (screenWidth * 0.9) / 5;
    let index = e.currentTarget.dataset.item;
    const {
      tab_list
    } = this.data;
    let scrollX = itemWidth * index - itemWidth * 2;
    let maxScrollX = (tab_list.length + 1) * itemWidth;
    if (scrollX < 0) {
      scrollX = 0;
    } else if (scrollX >= maxScrollX) {
      scrollX = maxScrollX;
    }
    this.setData({
      x: scrollX,
      content_id: index,
      tab_id: index
    })
  },

  /**
   * 栏目切换
   */
  changetab: function (e) {
    var index = e.detail.current
    this.setData({
      tab_id: index
    })
    if (this.data.list_data[this.data.tab_list[index].key] == null) {
      if (this.data.tab_list[index].id == 8) {
        this.getweather()
      } else
        this.getNew(this.data.tab_list[index].channel, 1, index)
    }
  },

  /**
   * 刷新栏目内容
   */
  refresh: function () {
    console.log("上拉刷新")
    this.setData({
      y: 0
    })
  },

  /**
   * 进入新闻内容
   */
  Into: function (e) {
    var content = this.data.list_data[this.data.tab_list[this.data.tab_id].key][e.currentTarget.dataset.id]
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + encodeURIComponent(content.id)
    })
  },

  /**
   * 下拉加载更多新闻列表
   */
  show_more: function (e) {
    const bottomState = pagestate(this)
    bottomState.loading_bottom()
    var page = this.data.list_data[this.data.tab_list[this.data.tab_id].key].length / 10
    var channel = this.data.tab_list[this.data.tab_id].channel
    page += 1
    var temp = this.data.list_data[this.data.tab_list[this.data.tab_id].key]
    wx.request({
      method: "POST",
      url: 'url',
      data: {
        page: page,
        channel: channel
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        temp = temp.concat(app.upset(res.data.news))
        this.setData({
          ['list_data.' + this.data.tab_list[this.data.tab_id].key]: temp
        })
        setTimeout(() => {
          bottomState.finish_bottom()
        }, 5000)
      },
      fail: res => {
        this.setData({
          hint_bottom: "重新加载"
        })
        bottomState.error_bottom()
      }
    })
    setTimeout(() => {
      wx.hideLoading(),
        this.setData({
          y: "6"
        })
    }, 2000)

  },

  /**
   * 获取用户本地天气
   */
  getweather: function () {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        wx.request({
          url: "url",
          method: "POST",
          data: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          header: {
            'content-type': 'application/json'
          },
          success: res => {
            if (parseInt(res.data.weather.now.aqi) <= 50)
              this.setData({
                degree: "greenyellow"
              })
            else if (parseInt(res.data.weather.now.aqi) <= 100)
              this.setData({
                degree: "orange"
              })
            else if (parseInt(res.data.weather.now.aqi) <= 100)
              this.setData({
                degree: "red"
              })
            this.setData({
              "tab_list[8].name": res.data.weather.cityInfo.c5,
              weather: res.data.weather,
              next: 1,
              back: 0
            })
            if (this.data.weather.f1.weekday == 1) {
              this.setData({
                "weather.f1.weekday": "一",
                "weather.f2.weekday": "二",
                "weather.f3.weekday": "三"
              })
            } else if (this.data.weather.f1.weekday == 2) {
              this.setData({
                "weather.f1.weekday": "二",
                "weather.f2.weekday": "三",
                "weather.f3.weekday": "四"
              })
            } else if (this.data.weather.f1.weekday == 3) {
              this.setData({
                "weather.f1.weekday": "三",
                "weather.f2.weekday": "四",
                "weather.f3.weekday": "五"
              })
            } else if (this.data.weather.f1.weekday == 4) {
              this.setData({
                "weather.f1.weekday": "四",
                "weather.f2.weekday": "五",
                "weather.f3.weekday": "六"
              })
            } else if (this.data.weather.f1.weekday == 5) {
              this.setData({
                "weather.f1.weekday": "五",
                "weather.f2.weekday": "六",
                "weather.f3.weekday": "日"
              })
            } else if (this.data.weather.f1.weekday == 6) {
              this.setData({
                "weather.f1.weekday": "六",
                "weather.f2.weekday": "日",
                "weather.f3.weekday": "一"
              })
            } else if (this.data.weather.f1.weekday == 7) {
              this.setData({
                "weather.f1.weekday": "日",
                "weather.f2.weekday": "一",
                "weather.f3.weekday": "二"
              })
            }
            this.setData({
              "weather.f1.day_wind_power": this.data.weather.f1.day_wind_power.substring(2, 4),
              "weather.f2.day_wind_power": this.data.weather.f2.day_wind_power.substring(2, 4),
              "weather.f3.day_wind_power": this.data.weather.f3.day_wind_power.substring(2, 4),
              "weather.f1.night_wind_power": this.data.weather.f1.night_wind_power.substring(2, 4),
              "weather.f2.night_wind_power": this.data.weather.f2.night_wind_power.substring(2, 4),
              "weather.f3.night_wind_power": this.data.weather.f3.night_wind_power.substring(2, 4),
              "weather.f1.mouth": this.data.weather.f1.day.substring(4, 6),
              "weather.f1.date": this.data.weather.f1.day.substring(6, 8),
              "weather.f2.mouth": this.data.weather.f2.day.substring(4, 6),
              "weather.f2.date": this.data.weather.f2.day.substring(6, 8),
              "weather.f3.mouth": this.data.weather.f3.day.substring(4, 6),
              "weather.f3.date": this.data.weather.f3.day.substring(6, 8),
              predict_list: res.data.weather.f1,
            })
            this.getlocal()
          }
        })
      }
    })
  },

  /**
   * 获取本地新闻
   */
  getlocal: function () {
    if (this.data.list_data.local == null) {
      const pageState = pagestate(this)
      pageState.loading()
      wx.request({
        method: "POST",
        url: 'https://url/local',
        data: {
          page: 1,
          city: this.data.tab_list[8].name
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          this.setData({
            'list_data.local': app.upset(res.data.news)
          })
          pageState.finish()
        },
        fail: res => {
          pageState.error()
        }
      })
    } else {
      const bottomState = pagestate(this)
      bottomState.loading_bottom()
      var page = this.data.list_data.local.length / 10
      page += 1
      var temp = this.data.list_data.local
      wx.request({
        method: "POST",
        url: 'https://url/local',
        data: {
          page: page,
          city: this.data.tab_list[8].name
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          temp = temp.concat(app.upset(res.data.news))
          this.setData({
            'list_data.local': temp
          })
          setTimeout(() => {
            bottomState.finish_bottom()
          }, 2000)
        },
        fail: res => {
          this.setData({
            hint_bottom: "重新加载"
          })
          bottomState.error_bottom()
        }
      })
    }
  },

  /**
   * 天气预报
   */
  show_predict: function () {
    this.setData({
      predict: true,
      cover_is_hidden: false
    })
  },
  hidden_predict: function () {
    this.setData({
      predict: false,
      cover_is_hidden: true
    })
  },
  change: function (e) {
    this.setData({
      state_day: !this.data.state_day
    })
    if (this.data.state_day) {
      this.setData({
        day: 0.2,
        night: 0
      })
    } else {
      this.setData({
        day: 0,
        night: 0.2
      })
    }
  },
  next: function () {
    if (this.data.predict_id == 3) {} else {
      var id = this.data.predict_id + 1
      this.setData({
        predict_id: id
      })
      if (id == 2)
        this.setData({
          predict_list: this.data.weather.f2,
          next: 1,
          back: 1
        })
      else if (id == 3)
        this.setData({
          predict_list: this.data.weather.f3,
          next: 0,
          back: 1
        })
    }
  },
  back: function () {
    if (this.data.predict_id == 1) {} else {
      var id = this.data.predict_id - 1
      this.setData({
        predict_id: id
      })
      if (id == 2)
        this.setData({
          predict_list: this.data.weather.f2,
          next: 1,
          back: 1
        })
      else if (id == 1)
        this.setData({
          predict_list: this.data.weather.f1,
          next: 1,
          back: 0
        })
    }
  }
})