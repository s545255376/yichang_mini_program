const app = getApp()
const getRequest = require('../../../utils/getRequest')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        buttom: [
            { id: 0, money: '5000', img: 'http://images.lexuanhui.online/platform_pic/part1.jpg?v=1',selected: false },
            { id: 1, money: '10000', img: 'http://images.lexuanhui.online/platform_pic/part2.jpg?v=2',selected: false },
            { id: 2, money: '20000', img: 'http://images.lexuanhui.online/platform_pic/part3.jpg?v=3',selected: true }
        ],
        money: '20000',
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

    setMoney(e) {
        for (let i = 0; i < this.data.buttom.length; i++) {
            if (Number(e.target.id) == this.data.buttom[i].id) {
                this.setData({ money: this.data.buttom[i].money });
                this.data.buttom[i].selected = true;
            } else {
                this.data.buttom[i].selected = false;
            }
        }
        this.setData({
            buttom: this.data.buttom
        })
    },
    spendMoney() {
        let _this = this;
        let postdata = {
            price: _this.data.money,
            token: app.globalData.token,
        }
        getRequest.post('index/Recharge/createOrder', postdata).then(function (res) {
            console.log(res.data);
            wx.requestPayment({
                nonceStr: res.data.nonceStr,
                package: res.data.package,
                paySign: res.data.paySign,
                timeStamp: res.data.timeStamp,
                signType: res.data.signType,
                success() {
                    app.toastFun("支付成功");
                    setTimeout(() => {
                        wx.redirectTo({
                          url: '../../index/index?pay=success',
                        })
                    }, 1200);
                },
                fail() {
                    app.toastFun("支付失败!");
                }
            })
          }).catch(function(err) {
            console.log(err)
            _this.setData({loadState:true})
            // setTimeout(() => {
            //   wx.navigateBack({
            //     delta: 1,
            //   })
            // }, 1000);
          })
    }
})