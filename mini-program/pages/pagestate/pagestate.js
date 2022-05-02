const loading = (that) => {
  return () => {
    that.setData({
      pageState: {
        state: 'loading',
        message: '加载中'
      }
    })
  }
}

const error = (that, message) => {
  return (message = '请检查您的网络连接') => {
    that.setData({
      pageState: {
        state: 'error',
        message
      }
    })
  }
}

const finish = (that) => {
  return () => {
    that.setData({
      pageState: {
        state: 'finish',
        message: ''
      }
    })
  }
}

const loading_bottom = (that) => {
  return () => {
    that.setData({
      bottomState: {
        state: 'loading',
        message: '加载中'
      }
    })
  }
}

const error_bottom = (that, message) => {
  return (message = '重新加载') => {
    that.setData({
      bottomState: {
        state: 'error',
        message
      }
    })
  }
}

const finish_bottom = (that) => {
  return () => {
    that.setData({
      bottomState: {
        state: 'finish',
        message: ''
      }
    })
  }
}

export default (that) => {
  return {
    loading: loading(that),
    error: error(that),
    finish: finish(that),
    loading_bottom: loading_bottom(that),
    error_bottom: error_bottom(that),
    finish_bottom: finish_bottom(that)
  }
}
// Page({})