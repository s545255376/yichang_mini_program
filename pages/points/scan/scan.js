const app = getApp()
const getRequest = require('../../../utils/getRequest')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        spendpoints: 0,
        customer: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            customer: options.data.userid
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

    },

    
    getInputValue: function (e) {
        this.setData({
            spendpoints: e.detail.value
        })
    },
    bonusPoints: function (e) {
        let _this = this;
        postdata = {
                    
        };
        getRequest.post('index/order/points', postdata).then(function (res) {
                    
        }).catch(function(err) {
            console.log(err)
            _this.setData({loadState:true})
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000);
        })
    },
})