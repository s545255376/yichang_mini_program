const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    loadState:true,
    aid:'',
    title:'',
    desc:'',
    image:'',
    date:'',
    list:[]
  },
  onLoad: function (options) {
    let aid = options.aid,_this = this;
    // aid = 6;
    getRequest.post('index/article/info',{aid:aid}).then(function(res){
      let content = res.data.content;
      WxParse.wxParse('contentname', 'html', content, _this, 5);
      _this.setData({
        aid:aid,
        title:res.data.title,
        desc:res.data.desc,
        image:res.data.image,
        date:res.data.update_time,
        list:res.data.goods
      })
    }).catch(function(err){_this.setData({loadState:false});})
    wx.hideShareMenu();
  },
  onShow:function(){
    if(app.globalData.userInfo.id != ''){
      wx.showShareMenu();
    }
  },
  //跳转商品详情
  goGoods:function(e){
    let idx = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../../goodsdetail/goodsdetail?goods_id='+this.data.list[idx].id,
    })
  },
  //分享
  onShareAppMessage: function () {
    return {
      title: '诚美匠选',
      imageUrl: 'https://cmjx.chengmeijiangxuan.com/static/common/images/share.jpg',
      path: 'pages/login/login?u='+app.globalData.userInfo.id+'&f='+app.globalData.userInfo.pid+'&t=e&eid='+this.data.aid
    }
  }
})