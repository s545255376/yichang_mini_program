const app = getApp()
const getRequest = require('../../../utils/getRequest')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        point: '',
        user_id: '',
        pay_mode: 2
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            user_id: options.userid
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

    getInputValue(e) {
        this.setData({
            point: e.detail.value
        })
    },
    change() {
        if (this.data.pay_mode == 1) {
            this.setData({
                pay_mode: 2
            })
        } else if (this.data.pay_mode == 2) {
            this.setData({
                pay_mode: 1
            })
        }
    },
    bonusPoints: function (e) {
        let _this = this;
        if (_this.data.point == '') {
            app.toastFun("请输入金额");
            return;
        }
        wx.showModal({
          cancelText: '取消',
          confirmText: '确认',
          content: `目前消费${_this.data.pay_mode == 1 ? "积分" : "余额"},消费金额${_this.data.point}`,
          editable: false,
          showCancel: true,
          title: '消费确认',
            success: (res) => {
                if (res.confirm) {
                    _this.cast();
                }
          },
        })
    },
    cast() {
        let _this = this;
        let postdata = {
            point: _this.data.point,
            token: app.globalData.token,
            user_id: _this.data.user_id,
            pay_mode: _this.data.pay_mode
        };
        getRequest.post('index/Account/hx', postdata).then(function (res) {
            wx.showToast({
                title: '消费成功',
                icon: "success"
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000);
        }).catch(function(err) {
            console.log(err)
            _this.setData({loadState:true})
        })
    }
})