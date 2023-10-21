const app = getApp()
const getRequest = require('../../utils/getRequest')
Page({
    data: {
        tabbar: ['充值列表', '余额消费列表'],
        point_type: ['recharge', 'balance'],
        type_name: '充值列表',
        tabbarNum: 0,
        point: 0,
        details: [],
        loadState: true,
        current_page: 0,
        last_page: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options)
        this.getList(0, 0)
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
        if (this.data.current_page < this.data.last_page) {
            this.getList(this.data.tabbarNum, this.data.current_page);
        }
        else {
            app.toastFun('已经没有了');
        }
    },

    tabbarChange: function (e) {
        let idx = e.currentTarget.dataset.idx;
        this.setData({
            tabbarNum: idx,
            type_name: this.data.tabbar[idx],
            details: []
        })
        this.getList(idx, 0);
    },

    getList(type, idx) {
        let _this = this;
        let postdata = {
            token: app.globalData.token,
            page: idx + 1,
            cur: type + 1
        };
        getRequest.post('index/Account/pointLog', postdata).then(function (res) {
            _this.setData({
                details: _this.data.details.concat(res.data.data),
                current_page: res.data.current_page,
                last_page: res.data.last_page
            })
        }).catch(function (err) {
            // console.log(err)
            _this.setData({ loadState: true })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000);
        })

        getRequest.post('index/Account/point', { token: app.globalData.token }).then(function (res) {
            if (res.data.is_vip) {
                _this.setData({
                    tabbar: ['积分', '余额', '电子卡', '实体卡'],
                    point: res.data[_this.data.point_type[idx]]
                })
            } else {
                _this.setData({
                    point: res.data[_this.data.point_type[idx]]
                })
            }
        })
    }
})