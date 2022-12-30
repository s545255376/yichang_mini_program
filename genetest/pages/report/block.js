// genetest/pages/report/block.js
const app = getApp()
Page({
    data: {
        screenHeight: wx.getSystemInfoSync().windowHeight,
        type: '',
        imgData: ''
    },
    clicks() {
        const {
            imgData
        } = this.data;
        try {
            wx.downloadFile({
                url: imgData,
                success: function (res) {
                    console.log(res)
                    //图片保存到本地
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: function (data) {
                            wx.showToast({
                                title: '已保存至相册',
                            })
                            setTimeout(() => {
                                wx.navigateBack({
                                    delta: 1 // 返回上一级页面。
                                })
                            }, 3000)
                        },
                    })
                }
            })
        } catch (e) {
            console.error(e)
        }
    },
    onLoad(e) {
        console.log(e);
        const {
            imgData,
            type
        } = e;
        this.setData({
            type,
            imgData
        })
        if (type == 'saveimg') {
            this.clicks();
        }
    }
})