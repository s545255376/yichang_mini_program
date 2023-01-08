// pages/intomyx/intomyx.js
const app = getApp();
Page({
    data: {},
    onShow: function () {
        const _this = this;
        const _beforePage = wx.getStorageSync('intomyxprevpage');
        setTimeout(function () {
            _this.intomyx();
        }, 500)
        wx.switchTab({
            url: `../${_beforePage}/${_beforePage}`
        })
    },
    intomyx() {
        // wx.navigateToMiniProgram({
        //     appId: 'wxb29a372fbd02cb13',
        //     path: '',
        //     extraData: {},
        //     envVersion: 'release',
        //     success(res) {
        //         // 打开成功
        //         console.log(res);
        //     }
        // })
        wx.showModal({
            title: '待开通',
            content: '此功能暂未开通，请等待后续通知',
        })
    }
})