const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    list:[]
  },
  onLoad: function (options) {
    let _this = this,postdata = {
      token:app.globalData.token,
      uid:app.globalData.userInfo.id || this.data.uid,
      order_id:options.order_id
    };
    getRequest.noToastPost('index/order/getOrderGoodsList', postdata).then(function(res){
      _this.setData({
        list:res.data
      })
    }).catch(function(err){console.log(err);})
  },
})