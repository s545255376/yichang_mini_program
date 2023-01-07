const app = getApp()
const getRequest = require('../../../utils/getRequest')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        points: 0,
        details: [
            { time: '2020-01-01', point: '+800', detail: '充值' },
            { time: '2020-01-02', point: '-600', detail: '消费' } 
        ],
        loadState: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let _this = this;
        postdata = {
            token: app.globalData.token,
            uid: app.globalData.userInfo.id,
        };
        getRequest.post('index/team', postdata).then(function (res) {
            _this.setData({
                points: res.data.points,
                team: res.data.team
            })
          }).catch(function(err){
            console.log(err)
            _this.setData({loadState:true})
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 1000);
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