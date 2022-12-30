const app = getApp();
const insRequest = require('../../utils/network');
Page({
  data: {
    statenum:0,
    posinum:0
  },
  onLoad: function (options) {

  },
  onShow(){
    wx.closeBluetoothAdapter();
    wx.offBluetoothAdapterStateChange();
    wx.offBLEConnectionStateChange();
    wx.offBLECharacteristicValueChange();
  },
  // 检测护理前/后切换
  stateChange(e){
    this.setData({statenum:e.currentTarget.dataset.num})
  },
  // 检测部位切换
  positionChange(e){
    this.setData({posinum:e.currentTarget.dataset.num})
  },
  // 跳转检测页
  goNext(){
    wx.navigateTo({
      url: '../instrument/instrument?position='+this.data.posinum+'&type='+this.data.statenum,
    })
  },
  // 跳转历史记录
  goHist(){
    wx.navigateTo({
      url: '../hist/hist',
    })
  }
})