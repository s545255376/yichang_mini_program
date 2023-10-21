const app = getApp();
const util = require('../../utils/util')
const getRequest = require('../../utils/getRequest');
Page({
    data: {
      db: {}
    },
  onLoad: function () {
    let _this = this;
      let timestamp = new Date().getTime();
      let sign = util.getSign(timestamp);
      let url = '/h5/index/board?sign=' + sign + '&timestamp=' + timestamp;
      getRequest.get(url).then((res) => {
        _this.setData({
          db: res.data
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    onShow: function () {
        
    },
    goDetails: function (e) {
      let type = e.currentTarget.dataset.type
      wx.navigateTo({
        url: '../detailList/detailList?type=' + type,
      })
    },
    noWork: function () {
      app.toastFun('该功能暂未开放')
    }
})