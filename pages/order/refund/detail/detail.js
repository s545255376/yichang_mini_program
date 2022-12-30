const app = getApp();
const getRequest = require('../../../../utils/getRequest');
Page({
  data: {
    uid:'',
    info:{},
    refund_id:'',
    order_id:'',
    loglist:{},
    //物流
    expressList:[],
    expressidx:-1,
    expressCheck:-1,
    expressToast:false,
    express_name:'',
    express_sn:'',

    loadState:true,
    prizelist:[],
    needAdapt:app.globalData.system.needAdapt
  },
  onLoad: function (options) {
    let refund_id = options.refund_id,order_id = options.order_id,_this = this,uid=options.uid;
    this.setData({
      order_id:order_id,
      refund_id:refund_id,
      uid:uid
    })
    //物流
    getRequest.post('index/base/express', {}).then(function(res){
      _this.setData({expressList:res.data.express})
    }).catch(function(err){_this.setData({loadState:false})})
  },
  onShow() {
    this.getInfo(this.data.refund_id);
  },
  //跳转奖品列表
  showMoreGifts:function(){
    wx.navigateTo({
      url: '../../giftlist/giftlist?order_id='+this.data.order_id
    })
  },
  //获取详情
  getInfo(refund_id){
    let _this = this,postdata = {
      token:app.globalData.token,
      uid:app.globalData.userInfo.id||this.data.uid,
      refund_id:refund_id
    };
    getRequest.post('index/refund/info', postdata).then(function(res){
      wx.setNavigationBarTitle({title: res.data.refund_type+'详情'})
      _this.setData({
        info:res.data,
        loadState:true,
        express_name:res.data.express_name,
        express_sn:res.data.express_sn,
      })
    }).catch(function(err){_this.setData({loadState:false})})
    //奖品列表
    let pricePostData = {
      token:app.globalData.token,
      uid:app.globalData.userInfo.id||this.data.uid,
      order_id:this.data.order_id
    };
    getRequest.noToastPost('index/order/getOrderGoodsList', pricePostData).then(function(res){
      _this.setData({
        prizelist:res.data
      })
    }).catch(function(err){console.log(err);})
  },
  //图片查看
  bannerClick:function(e){
    let idx = e.currentTarget.dataset.idx;
    wx.previewImage({
      current:this.data.info.return_voucher[idx],
      urls: this.data.info.return_voucher,
    })
  },
  //跳转商品详情
  goGoodsInfo:function(e){
    let idx = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../../../goodsdetail/goodsdetail?goods_id='+this.data.info.goods[idx].goods_id+'&props='+this.data.info.goods[idx].props+'&live=false',
    })
  },
  //撤回退款/退货申请
  returnApply:function(){
    let logCheck = this.goLogin();
    if(logCheck == true){
      let _this = this
      wx.showModal({
        title: '提示',
        content: '是否确认撤回申请？',
        success: function (info) {
          if (info.cancel) {}
          else {
            let postdata={
              uid:app.globalData.userInfo.id,
              token:app.globalData.token,
              order_id:_this.data.info.order.id,
              return_id:_this.data.info.id,
            };
            getRequest.post('index/refund/withdraw', postdata).then(function(res){
              _this.getInfo(_this.data.refund_id);
              app.toastFun('操作成功');
            }).catch(function(err){app.toastFun(err.msg);})
          }
        },
        fail: function (res) { },
      })
    }
  },
  //提交物流单号
  refuseLogs: function () {
    let logCheck = this.goLogin();
    if(logCheck == true){
      if(this.data.expressCheck != -1 && this.data.express_sn != ''){
        let _this = this,postdata={
          uid:app.globalData.userInfo.id,
          token:app.globalData.token,
          return_id:this.data.info.id,
          express_name:this.data.expressList[this.data.expressCheck].name,
          express_code:this.data.expressList[this.data.expressCheck].code,
          express_sn:this.data.express_sn
        };
        getRequest.post('index/refund/refundExpress', postdata).then(function(res){
          _this.getInfo(_this.data.refund_id);
          app.toastFun('操作成功');
        }).catch(function(err){app.toastFun(err.msg);})
      }
      else{
        app.toastFun('您还有未选择项');
      }
    }
  },
  //退货申请流程
  //显示弹窗-快递公司
  openExpressToast:function(){
    this.setData({expressToast:true})
  },
  //选择快递公司
  expressChange:function(e){
    this.setData({expressidx:e.detail.value})
  },
  //确认快递公司选择
  confirmReason:function(){
    this.setData({expressCheck:this.data.expressidx})
    this.closeToast();
  },
  //关闭弹窗-快递公司
  closeToast:function(){
    this.setData({
      expressToast:false
    })
  },
  //填写物流单号
  expressInput: function(e) {
    this.setData({express_sn:e.detail.value})
  },
  //去登陆--可删除
  goLogin: function () {
    if(app.globalData.userInfo.id == ''){
      wx.navigateTo({url: '../../../login/login'})
    }
    else{
      return true;
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
    this.getInfo(this.data.refund_id);
    wx.stopPullDownRefresh();
  }
})