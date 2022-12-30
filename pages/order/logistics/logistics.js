const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    list:{
      Traces:[]
    },
    name:'',
    loadState:false
  },
  onLoad: function (options) {
    // options.order_id = 473;
    // options.uid = 1695;
    // app.globalData.userInfo.id = 1695;

    // options.order_id = 465;
    // options.uid = 1258;
    // app.globalData.userInfo.id = 1258;

    let _this = this,postdata = {
      token:app.globalData.token,
      uid:app.globalData.userInfo.id || options.uid,
      order_id: options.order_id
    };
    getRequest.post('index/order/express', postdata).then(function(res){
      res.data.forEach(function(expressInfo){
        expressInfo.Traces.forEach(function(e){
          e.AcceptStation = _this.strGetTel(e.AcceptStation);
        })
      })
      console.log(res)
      _this.setData({list:res.data,loadState:true})
    }).catch(function(err){//物流获取失败，返回订单详情页
      console.log(err)
      _this.setData({loadState:true})
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1000);
    })
  },
  //手机号提取
  strGetTel: function (str) {
    var regx = /(1[3|4|5|7|8][\d]{9}|0[\d]{2,3}-[\d]{7,8}|400[-]?[\d]{3}[-]?[\d]{4})/g;
    var phoneNums = str.match(regx),arr = [];
    if (phoneNums) {
      for (var i = 0; i < phoneNums.length; i++) {
        var temp = phoneNums[i];
        arr.push({type:'msg',msg:str.split(temp)[0]});
        arr.push({type:'tel',msg:temp});
        str = str.split(temp)[1];
      }
    }
    else{
      arr.push({type:'msg',msg:str});
    }
    return arr;
  },
  //复制文本
  copyText: function () {
    let text = this.data.list.LogisticCode;
    wx.setClipboardData({
      data: text,
      success: function (info) {
        app.toastFun('复制成功');
      }
    })
  },
})