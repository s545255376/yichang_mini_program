const app = getApp();
const getRequest = require('../../utils/getRequest');
Page({
  data: {
    tabbar:['积分明细','积分说明'],
    tabbarNum:0,
    score:0,
    list:[],
    pagenum:1,
    last_page:1,
    loadState:true
  },
  onLoad: function (options) {
    this.getList(1);
  },
  //列表切换
  tabbarChange:function(e){
    let idx = e.currentTarget.dataset.idx;
    if(idx == 0){
      this.setData({
        list:[],
        tabbarNum:idx,
        pagenum:1,
        last_page:1
      })
      this.getList(1);
    }
    else{
      this.setData({
        tabbarNum:idx,
      })
    }
  },
  //获取列表
  getList(pagenum){
    let _this = this,postdata = {
      token:app.globalData.token,
      uid:app.globalData.userInfo.id,
      page:pagenum
    };
    getRequest.post('index/scores/list', postdata).then(function(res){
      _this.setData({
        score:res.data.score,
        list:_this.data.list.concat(res.data.data),
        pagenum:res.data.current_page,
        last_page:res.data.last_page,
        loadState:true
      })
    }).catch(function(err){
      _this.setData({loadState:false})
    })
  },
  //加载更多
  onReachBottom: function () {
    if(this.data.pagenum < this.data.last_page){
      this.getList(this.data.pagenum+1);
    }
    else{
      app.toastFun('已经没有了');
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      list:[],
      pagenum:1,
      last_page:1
    })
    this.getList(1);
    wx.stopPullDownRefresh();
  }
})