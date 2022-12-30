const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    list:[],
    pagenum:1,
    last_page:1,
    loadState:true,

    tabNum:0
  },
  onLoad: function (options) {
    this.setData({tabNum:options.type})
  },
  onShow(){
    this.getList(this.data.tabNum,1);
  },
  //切换列表
  tabbarChange(e){
    let type = e.currentTarget.dataset.type;
    this.setData({
      tabNum:type,
      list:[],
      pagenum:1,
      last_page:1
    })
    this.getList(type,1);
  },
  //获取列表
  getList(type,pagenum){
    let _this = this;
    if(type == 0){//系统通知
      let postdata = {
        token:app.globalData.token,
        uid:app.globalData.userInfo.id,
        page:pagenum
      };
      getRequest.post('index/message/index', postdata).then(function(res){
        _this.setData({
          list:res.data.data,
          pagenum:res.data.current_page,
          last_page:res.data.last_page,
          loadState:true
        })
      }).catch(function(err){_this.setData({loadState:false})})
    }
    else if(type == 1){//活动公告
      this.setData({
        list:app.globalData.noticeList
      })
    }
  },
  //跳转详情
  goDetail:function(e){
    let idx = e.currentTarget.dataset.idx;
    this.data.list[idx].status = 1;
    this.setData({list:this.data.list})
    wx.navigateTo({
      url: '../detail/detail?type='+this.data.tabNum+'&id='+e.currentTarget.dataset.id,
    })
  },
  //加载更多
  onReachBottom: function () {
    if(this.data.tabNum == 0){
      if(this.data.pagenum < this.data.last_page){
        this.getList(this.data.tabNum,this.data.pagenum+1);
      }
      else{
        app.toastFun('我是有底线哒');
      }
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    if(this.data.tabNum == 0){
      this.data.pagenum = 1;
      this.setData({
        list:[],
        pagenum:1,
      })
      this.getList(this.data.tabNum,this.data.pagenum);
    }
    wx.stopPullDownRefresh();
  }
})