const app = getApp()
const getRequest = require('../../utils/getRequest')
Page({
    data: {
        tabbar: ['积分', '余额'],
        point_type: ['point', 'balance'],
        type_name: '积分',
        tabbarNum:0,
        point: 0,
        details: [],
        loadState: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getList(0)
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
    onReachBottom: function () {
        if (this.data.pagenum < this.data.last_page) {
            this.getList(this.data.tabbarNum, );
        }
        else {
            app.toastFun('已经没有了');
        }
    },

    tabbarChange: function (e) {
        let idx = e.currentTarget.dataset.idx;
        this.setData({
            tabbarNum: idx,
            type_name: this.data.tabbar[idx]
        })
        this.getList(idx);
    },

    getList(idx) {
        let _this = this;
        let postdata = {
            token: app.globalData.token,
            cur: idx + 1
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
                point: res.data[_this.data.point_type[idx]]
            })
        })
    }
})