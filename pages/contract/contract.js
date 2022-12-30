const app = getApp();
const WxParse = require('../wxParse/wxParse.js');
const getRequest = require('../../utils/getRequest');
Page({
  data: {
    tabbarNum:0,
    checkBtn:false,

    list:[]
  },
  onLoad: function (options) {
    let _this = this;
    getRequest.post('index/user/agreement', {}).then(function(res){
      _this.setData({list:res.data})

      if(options.id){//登录进入
        res.data.forEach(function(e,idx){
          if(e.id == options.id){
            _this.setData({tabbarNum:idx})
            let content = res.data[idx].content;
            WxParse.wxParse('contentname', 'html', content, _this, 5);
          }
        })
      }
      else{//个人中心进入
        let content = res.data[0].content;
        WxParse.wxParse('contentname', 'html', content, _this, 5);
      }
    }).catch(function(err){console.log(err);})
  },
  //协议切换
  tabbarChange(e){
    let num = e.currentTarget.dataset.num,_this = this;
    let content = this.data.list[num].content;
    // console.log(content)
    this.setData({tabbarNum:num})
    WxParse.wxParse('contentname', 'html', content, this, 5);
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
})