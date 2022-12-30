const app = getApp();
Page({
  onLoad: function (options) {
    //该页面不允许右上角分享小程序
    wx.hideShareMenu();
  },
  onShareAppMessage: function (res) {
    return {
      title: '诚美匠选',
      imageUrl:'https://cmjx.chengmeijiangxuan.com/upload/20210722/share0227.jpg',
      path: 'pages/login/login?u='+app.globalData.userInfo.id+'&f='+app.globalData.userInfo.pid+'&t=h'
    }
  },
})