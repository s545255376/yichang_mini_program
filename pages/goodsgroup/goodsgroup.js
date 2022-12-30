const app = getApp();
const getRequest = require('../../utils/getRequest');
Page({
  data: {
    list:{}
  },
  onLoad: function (options) {
    console.log(app.globalData.levelTwoList)
    this.setData({
      list:app.globalData.levelTwoList
    })
    app.globalData.levelTwoList = {};
  },
  //跳转商品详情
  goGoodsInfo(e){
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: '../goodsdetail/goodsdetail?goods_id='+e.currentTarget.dataset.goodsid+'&live=false',
    })
  },
})