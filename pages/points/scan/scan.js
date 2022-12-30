Page({

    /**
     * 页面的初始数据
     */
    data: {
        spendpoints: 0,
        loadState: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },
    getInputValue: function (e) {
        this.setData({
            spendpoints: e.detail.value
        })
    },
    bonusPoints: function (e) {
        let _this = this;
        wx.scanCode({
            onlyFromCamera: true,
            scanType: [],
            success: (result) => {
                postdata = {
                    
                };
                getRequest.post('index/order/points', postdata).then(function (res) {
                    
                  }).catch(function(err){//获取二维码失败
                    console.log(err)
                    _this.setData({loadState:true})
                    setTimeout(() => {
                      wx.navigateBack({
                        delta: 1,
                      })
                    }, 1000);
                  })
            },
            fail: (res) => {

            },
            complete: (res) => {

            },
        })
    }
})