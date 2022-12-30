// genetest/pages/index/index.js
const app = getApp();
Page({
    data: {
        windowHeight: app.globalData.system.winHeight,
        needAdapt: app.globalData.system.needAdapt,
        mainBox: true,
        notice: false
    },
    showNotice() {
        this.setData({
            mainBox: false,
            notice: true
        })
    },
    buttonClick() {
        wx.navigateTo({
            url: '../list/list',
        })
    },
    intoRegister() {
        wx.navigateTo({
            url: '../register/register',
        })
    },
    onLoad() {
        app.globalData.sharequery.t = '';
    }
})