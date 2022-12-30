const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    list: [],
    needAdapt:app.globalData.system.needAdapt
  },
  onShow(){
    app.globalData.feedBackDetail = {
      content: '',
      create_time: '',
      image:[]
    };
    this.getList();
  },
  //获取列表
  getList(){
    let _this = this,postdata={
      uid:app.globalData.userInfo.id,
      token:app.globalData.token
    };
    getRequest.post('index/feed_back/list',postdata).then(function(res){
      _this.setData({
        list:res.data
      })
    })
    .catch(function(err){app.toastFun(err.msg);});
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getList();
    wx.stopPullDownRefresh();
  },
  //跳转详情
  goDetail(e){
    let idx = e.currentTarget.dataset.idx;
    app.globalData.feedBackDetail = {
      content: this.data.list[idx].content,
      create_time: this.data.list[idx].create_time,
      image:this.data.list[idx].image
    };
    wx.navigateTo({
      url: '../detail/detail?id='+this.data.list[idx].id,
    })
  },
  //新建反馈
  addNew(){
    wx.navigateTo({
      url: '../add/add?type=new&id=',
    })
  },
  //图片查看
  bannerClick:function(e){
    let pidx = e.currentTarget.dataset.pidx,idx = e.currentTarget.dataset.idx,type = e.currentTarget.dataset.type;
    if(type == 'parent'){
      wx.previewImage({
        current:this.data.list[pidx].image[idx],
        urls: this.data.list[pidx].image,
      })
    }
    else{
      wx.previewImage({
        current:this.data.list[pidx].reply[0].image[idx],
        urls: this.data.list[pidx].reply[0].image,
      })
    }
  },
})