const app = getApp()
const getRequest = require('../../../utils/getRequest')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        token:'',
        teams: [],
        num: 0,
        static_day: 0,
        static_total: 0,
        loadState: true,
        current_page: 0,
        last_page: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.get_list(1);
    },

    get_list(current_page) {
        let _this = this;
        let postdata = {
            token: app.globalData.token,
            page: current_page
        };
        getRequest.post('index/Account/children2', postdata).then(function (res) {
            _this.setData({
                // points: res.data.points,
                static_total: res.data.staticTotal,
                static_day: res.data.staticDay,
                num: res.data.total,
                teams: _this.data.teams.concat(res.data.data),
                current_page: res.data.current_page,
                last_page: res.data.last_page
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
        if (this.data.current_page >= this.data.last_page) {
            app.toastFun('我是有底线哒');
        } else {
            this.get_list(this.data.current_page + 1);
        }
    }

})