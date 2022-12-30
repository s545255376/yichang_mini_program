// genetest/pages/list/list.js
const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        qrcodeToast: false,
        authToast: false,
        list: [],
        currentid: 0
    },
    showpreview() {
        wx.previewImage({
            current: 'https://cmjx.chengmeijiangxuan.com/static/web/genetest/qrcode.png', // 当前显示图片的 http 链接
            urls: ['https://cmjx.chengmeijiangxuan.com/static/web/genetest/qrcode.png']
        })
    },
    confirmscan() {
        wx.downloadFile({
            url: 'https://cmjx.chengmeijiangxuan.com/static/web/genetest/qrcode.png',
            success: function (res) {
                console.log(res)
                //图片保存到本地
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (data) {
                        wx.showToast({
                            title: '保存成功',
                        })
                    },
                })
            }
        })
    },
    rejectauth() {
        this.setData({
            authToast: false
        })
    },
    confirmauth() {
        const {
            id,
            username
        } = app.globalData.userInfo;
        const _id = this.data.currentid;
        this.setData({
            authToast: false
        })
        wx.navigateTo({
            url: `../report/report?id=${_id}&name=${username}&uid=${id}`,
        })
    },
    showQrcode(e) {
        const {
            id
        } = e.currentTarget.dataset;
        this.setData({
            qrcodeToast: true
        })
        getRequest.noToastPost('/index/gene/status', {
            id,
            token: app.globalData.token
        }).finally(() => {
            this.init()
        })
    },
    //隐藏弹窗
    closeToast: function (e) {
        const {
            detail
        } = e
        this.setData({
            [detail]: false,
        })
    },
    sendmessages(e) {
        const {
            id
        } = e.currentTarget.dataset;
        getRequest.post('/index/gene/consultation', {
            id,
            uid: app.globalData.userInfo.id
        }).then(res => {
            if (res.code == 200) {
                wx.showModal({
                    title: '提示',
                    content: '已提交咨询至门店，请耐心等待门店顾问会尽快和您联系',
                    confirmText: '我知道了',
                    showCancel: false
                })
            }
        })

    },
    checkreport(e) {
        this.setData({
            currentid: e.currentTarget.dataset.id,
            authToast: true
        })
    },
    init() {
        getRequest.post('/index/gene/lists', {
            uid: app.globalData.userInfo.id,
            token: app.globalData.token
        }).then(res => {
            if (res.code == 200) {
                this.setData({
                    list: res.data.data
                })
            }
        })
    },
    onLoad() {
        this.init();
    },
})