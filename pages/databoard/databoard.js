const app = getApp();
const util = require('../../utils/util')
const getRequest = require('../../utils/getRequest');
Page({
    data: {
        
    },
  onLoad: function () {
    let _this = this;
      let timestamp = new Date().getTime();
      let sign = util.getSign(timestamp);
    let url = '/h5/index/board?sign=' + sign + '&timestamp=' + timestamp;
    getRequest.get(url).then((res) => {
      console.log(res)
    }).catch((err) => {

    })
    },
    onShow: function () {
        
    }
})