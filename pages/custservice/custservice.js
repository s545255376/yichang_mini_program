const app = getApp();
const getRequest = require('../../utils/getRequest');
Page({
  data: {
    userinfo:{},
    telToast:false,
    sendtel:''
  },
  onLoad: function (options) {
    this.setData({
      userinfo:app.globalData.userInfo
    })
  },
  //显示弹窗
  sendBtn(e){
    this.setData({
      telToast:true,
      sendtel:e.currentTarget.dataset.tel
    })
  },
  //关闭弹窗
  closeBtn(){
    this.setData({
      telToast:false,
      sendtel:''
    })
  },
  //拨打电话
  sendConfirm(){
    wx.makePhoneCall({
      phoneNumber: this.data.sendtel,
      success(){},
      fail(){}
    })
  }
})