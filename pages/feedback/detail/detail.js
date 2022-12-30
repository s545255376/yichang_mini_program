const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    intro:{
      feedback_id:'',
      content: '',
      create_time: '',
      image:[]
    },
    list:[],
    needAdapt:app.globalData.system.needAdapt
  },
  onLoad: function (options) {
    this.setData({
      feedback_id:options.id
    })
  },
  onShow(){
    let _this = this,postdata={
      feedback_id:this.data.feedback_id,
      token:app.globalData.token
    };
    getRequest.post('index/feed_back/detail',postdata).then(function(res){
      _this.setData({
        list:res.data,
        intro:app.globalData.feedBackDetail
      })
    })
    .catch(function(err){app.toastFun(err.msg);});
  },
  //图片查看
  bannerClick:function(e){
    let idx = e.currentTarget.dataset.idx,type = e.currentTarget.dataset.type;
    if(type == 'parent'){
      wx.previewImage({
        current:this.data.intro.image[idx],
        urls: this.data.intro.image,
      })
    }
    else{
      wx.previewImage({
        current:this.data.list[idx].image[idx],
        urls: this.data.list[idx].image,
      })
    }
  },
  //新建反馈
  refuseBtn(){
    wx.navigateTo({
      url: '../add/add?type=refuse&id='+this.data.feedback_id,
    })
  }
})