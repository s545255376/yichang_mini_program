const app = getApp();
const util = require('../../utils/util');
const getRequest = require('../../utils/getRequest');
Page({
  data: {
        mobile: '',
        details: [],
        loadState: true,
        current_page: 0,
        last_page: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            mobile: options.mobile
        })
        this.getList(0);
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
<<<<<<< HEAD
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
=======
  onReachBottom: function () {
    if (this.data.current_page < this.data.last_page) {
      this.getList(this.data.current_page);
    }
    else {
      app.toastFun('已经没有了');
    }
  },

    getList(idx) {
>>>>>>> 8728272b02493cd006c52da4e25bd4e03a2fc121
        let _this = this;
        let timestamp = new Date().getTime();
        let sign = util.getSign(timestamp);
        let page = idx + 1;
        let url  = 'h5/index/balanceDedu?sign=' + sign + '&timestamp=' + timestamp + '&page=' + page + '&start=&end=&' + 'mobile=' + _this.data.mobile;
        getRequest.get(url).then((res) => {
          _this.setData({
            current_page: res.data.current_page,
            last_page: res.data.last_page,
            details: _this.data.details.concat(res.data.data)
          })
          }).catch((err) => {
            console.log(err)
        })
<<<<<<< HEAD
        // let postdata = {
        //     token: app.globalData.token,
        //     page: idx + 1,
        //     cur: type + 1
        // };
        // getRequest.post('index/Account/pointLog', postdata).then(function (res) {
        //     _this.setData({
        //         details: _this.data.details.concat(res.data.data),
        //         current_page: res.data.current_page,
        //         last_page: res.data.last_page
        //     })
        // }).catch(function (err) {
        //     // console.log(err)
        //     _this.setData({ loadState: true })
        //     setTimeout(() => {
        //         wx.navigateBack({
        //             delta: 1,
        //         })
        //     }, 1000);
        // })

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
=======
>>>>>>> 8728272b02493cd006c52da4e25bd4e03a2fc121
    }
})