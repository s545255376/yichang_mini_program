const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    type:'',
    list:[],
    loadState:true,
    needAdapt:app.globalData.system.needAdapt
  },
  onLoad: function (options) {
    this.setData({
      type:options.type
    })
  },
  onShow:function(){
    this.getList();
  },
  //获取地址列表
  getList(){
    let _this = this;
    getRequest.post('index/address/index', {uid:app.globalData.userInfo.id,token:app.globalData.token}).then(function(res){
      _this.setData({
        list:res.data,
        loadState:true
      })
    }).catch(function(err){_this.setData({loadState:false})})
  },
  //添加新地址
  addNew: function () {
    wx.navigateTo({
      url: '../add/add?type=new',
    })
  },
  //修改默认地址
  radioChange:function(e){
    let address_id = e.detail.value,_this = this;
    getRequest.post('index/address/setDefault', {uid:app.globalData.userInfo.id,address_id:address_id,token:app.globalData.token}).then(function(res){
      if(_this.data.type == 'change'){
        wx.navigateBack({delta: 1})
      }
      else{
        _this.getList();
        app.toastFun('修改成功');
      }
    }).catch(function(err){console.log(err);})
  },
  //修改默认地址
  addressChange(e){
    let address_id = e.currentTarget.dataset.id,_this = this;
    getRequest.post('index/address/setDefault', {uid:app.globalData.userInfo.id,address_id:address_id,token:app.globalData.token}).then(function(res){
      if(_this.data.type == 'change'){
        wx.navigateBack({delta: 1})
      }
      else{
        _this.getList();
        app.toastFun('修改成功');
      }
    }).catch(function(err){console.log(err);})
  },
  //修改
  changeBtn:function(e){
    let address_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../add/add?type=change'+'&address_id='+address_id,
    })
  },
  //删除
  delBtn:function(e){
    let address_id = e.currentTarget.dataset.id,idx = e.currentTarget.dataset.idx,list = this.data.list,_this = this;
    wx.showModal({
      title: '提示',
      content: '是否确认删除该地址？',
      success: function (info) {
        if (info.cancel) {}
        else {
          getRequest.post('index/address/del', {uid:app.globalData.userInfo.id,address_id:address_id,token:app.globalData.token}).then(function(res){
            // list = list.splice(idx,1);
            // _this.setData({list:list})
            _this.getList();
            app.toastFun('删除成功');
          }).catch(function(err){console.log(err);})
        }
      }
    })
  },
})