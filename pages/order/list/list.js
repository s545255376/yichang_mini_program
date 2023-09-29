const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    tabbar:['全部','待付款','待发货','待收货','已完成'],
    tabbarNum:0,
    list:[],
    pagenum:1,
    last_page:1,
    loadState:true,
    userinfo:{},
    needAdapt:app.globalData.system.needAdapt
  },
  onLoad: function (options) {
    let status = options.status;
    this.setData({
      tabbarNum:status,
      userinfo:app.globalData.userInfo
    })
  },
  onShow: function () {
    clearInterval(app.router.timeInterval);
    this.setData({
      list:[],
      pagenum:1,
      last_page:1
    })
    this.getList(this.data.tabbarNum,1);
  },
  //切换列表
  tabbarChange: function (e) {
    let idx = e.currentTarget.dataset.idx;
    this.setData({
      list:[],
      tabbarNum:idx,
      pagenum:1,
      last_page:1
    })
    this.getList(idx,1);
  },
  //获取列表
  getList(status,pagenum){
    let _this = this,postdata = {
      token:app.globalData.token,
      uid:app.globalData.userInfo.id,
      status:status,
      page:pagenum
    };
    getRequest.post('index/order/order', postdata).then(function(res){
      _this.setData({
        list:_this.data.list.concat(res.data.data),
        pagenum:res.data.current_page,
        last_page:res.data.last_page,
        loadState:true
      })
    }).catch(function(err){_this.setData({loadState:false})})
  },
  //跳转订单详情
  orderDetail: function (e) {
    let idx = e.currentTarget.dataset.idx;
    console.log(this.data.list[idx])
    if(6 <= this.data.list[idx].order_status){
      wx.navigateTo({
        url: '../refund/detail/detail?refund_id='+this.data.list[idx].refund_id+'&uid='+app.globalData.userInfo.id,
      })
    }
    else{
      wx.navigateTo({
        url: '../detail/detail?order_id='+this.data.list[idx].id+'&uid='+app.globalData.userInfo.id+'&is_cash='+this.data.list[idx],
      })
    }
  },
  //取消订单
  cancelOrder:function(e){
    let idx = e.currentTarget.dataset.idx,_this = this,list = this.data.list;
    wx.showModal({
      title: '提示',
      content: '是否确认要取消该订单？',
      success: function (info) {
        if (info.cancel) {}
        else {
          let postdata={
            uid:app.globalData.userInfo.id,
            token:app.globalData.token,
            order_id:list[idx].id
          };
          getRequest.post('index/order/cancel', postdata).then(function(res){
            list[idx].order_status =5;
            _this.setData({list:list})
            app.toastFun('操作成功');
          }).catch(function(err){app.toastFun(err.msg);})
        }
      },
      fail: function (res) { },
    })
  },
  //删除订单
  delOrder:function(e){
    let idx = e.currentTarget.dataset.idx,_this = this,list = this.data.list;
    wx.showModal({
      title: '提示',
      content: '是否确认要删除该订单？',
      success: function (info) {
        if (info.cancel) {}
        else {
          let postdata={
            uid:app.globalData.userInfo.id,
            token:app.globalData.token,
            order_id:list[idx].id
          };
          getRequest.post('index/order/del', postdata).then(function(res){
            list.splice(idx,1);
            _this.setData({list:list})
            app.toastFun('操作成功');
          }).catch(function(err){app.toastFun(err.msg);})
        }
      },
    })
  },
  //去支付
  payOrder:function(e){
    let idx = e.currentTarget.dataset.idx,_this = this,list = this.data.list;
    let postdata={
      uid:app.globalData.userInfo.id,
      token:app.globalData.token,
      order_id:list[idx].id
    };
    getRequest.post('index/order/goPay', postdata).then(function(res){
      let orderdata = {
        uid:app.globalData.userInfo.id,
        token:app.globalData.token,
        puid:res.data.puid,
        order_sn:res.data.order_sn,
        order_id:res.data.order_id,
        total_fee:res.data.total_fee,
        total:res.data.total,
        body:res.data.body,
      };
      getRequest.post('index/pay/wxPay',orderdata).then(function(info){
        wx.requestSubscribeMessage({
            tmplIds: app.globalData.subscribe,
            complete (allow) {
              if(_this.data.tabbarNum == 1){
                list.splice(idx,1);
                _this.setData({list:list})
              }
              else{
                list[idx].order_status =1;
                _this.setData({list:list})
              }
              app.toastFun('支付成功');
            }
          })
      }).catch(function(err){
        app.toastFun(err.msg);
        if(err.code == 204){
          wx.clearStorage();
          wx.reLaunch({
            url: '../../login/login',
          })
        }
      })
    }).catch(function(err){
      app.toastFun(err.msg);
      if(err.code == '706'){
        _this.data.list[idx].order_status = 5;
        _this.setData({
          list:_this.data.list
        })
      }
    })
  },
  //再次购买
  addCart:function(e){
    let idx = e.currentTarget.dataset.idx,_this = this,list = this.data.list;
    let postdata={
      uid:app.globalData.userInfo.id,
      token:app.globalData.token,
      cart:list[idx].cart
    };
    getRequest.post('index/cart/againAdd', postdata).then(function(res){
      app.toastFun('已添加至购物车');
    }).catch(function(err){app.toastFun(err.msg);})
    },
    handleContact(e) {
        console.log(e.detail.path)
        console.log(e.detail.query)
    },
  //确认收货
  confirmGet:function(e){
    let idx = e.currentTarget.dataset.idx,_this = this,list = this.data.list;
    wx.showModal({
      title: '提示',
      content: '是否确认收货？',
      success: function (info) {
        if (info.cancel) {}
        else {
          let postdata={
            uid:app.globalData.userInfo.id,
            token:app.globalData.token,
            order_id:list[idx].id
          };
          getRequest.post('index/order/confirmReceive', postdata).then(function(res){
            if(_this.data.tabbarNum == 3){
              list.splice(idx,1);
              _this.setData({list:list})
            }
            else{
              list[idx].order_status =3;
              _this.setData({list:list})
            }
            app.toastFun('操作成功');
          }).catch(function(err){app.toastFun(err.msg);})
        }
      },
      fail: function (res) { },
    })
  },
  //查看物流
  showLogistics:function(e){
    let idx = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../logistics/logistics?order_id='+this.data.list[idx].id,
    })
  },
  //加载更多
  onReachBottom: function () {
    if(this.data.pagenum < this.data.last_page){
      this.getList(this.data.tabbarNum,this.data.pagenum+1);
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
    this.getList(this.data.tabbarNum,this.data.pagenum);
    wx.stopPullDownRefresh();
  }

})