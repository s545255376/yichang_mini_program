const app = getApp();
const getRequest = require('../../../../utils/getRequest');
Page({
  data: {
    list:[],
    pagenum:1,
    last_page:1,
    loadState:true,
    needAdapt:app.globalData.system.needAdapt
  },
  onLoad: function (options) {
    let status = options.status;
    if(status == 5){
      wx.setNavigationBarTitle({title: '退款详情'})
    }
  },
  onShow: function () {
    this.setData({
      list:[],
      pagenum:1,
      last_page:1
    })
    this.getList(1);
  },
  //获取列表
  getList(pagenum){
    let _this = this,postdata = {
      token:app.globalData.token,
      uid:app.globalData.userInfo.id,
      status:5,
      page:pagenum
    };
    getRequest.post('index/refund/refund', postdata).then(function(res){
      _this.setData({
        list:_this.data.list.concat(res.data.data),
        pagenum:res.data.current_page,
        last_page:res.data.last_page,
        loadState:true
      })
    }).catch(function(err){_this.setData({loadState:false})})
  },
  //跳转订单详情
  orderDetail:function(e){
    let idx = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../detail/detail?refund_id='+this.data.list[idx].id+'&uid='+app.globalData.userInfo.id+'&order_id='+this.data.list[idx].order_id,
    })
  },
  //加载更多
  onReachBottom: function () {
    if(this.data.pagenum < this.data.last_page){
      this.getList(this.data.pagenum+1);
    }
    else{
      app.toastFun('我是有底线哒');
    }
  },
  //客服
  customerService(){
    wx.makePhoneCall({
      phoneNumber: app.globalData.userInfo.store_mobile,
      success(){},
      fail(){}
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.data.pagenum = 1;
    this.setData({
      list:[],
      pagenum:1,
    })
    this.getList(this.data.pagenum);
    wx.stopPullDownRefresh();
  }
})