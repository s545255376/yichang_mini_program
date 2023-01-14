const app = getApp()
const getRequest = require('../../../utils/getRequest')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        point: 0,
        details: [],
        loadState: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let _this = this;
        let postdata = {
            token: app.globalData.token,
        };
        getRequest.post('index/Account/pointLog', postdata).then(function (res) {
            _this.setData({
                details: res.data.data
            })
        }).catch(function (err) {
            console.log(err)
            _this.setData({ loadState: true })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000);
        })

        getRequest.post('index/Account/point', { token: app.globalData.token }).then(function (res) {
            _this.setData({
                point: res.data.point
            })
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    }

})