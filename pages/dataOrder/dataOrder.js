const app = getApp();
const util = require('../../utils/util');
const getRequest = require('../../utils/getRequest');
Page({
    data: {
        tabbar: ['积分订单', '茶馆订单'],
        tabbarNum: 0,
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
        tabbarNum: options.type
      })
      this.getList(options.type, 0);
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
          details: [],
          current_page: 0,
          last_page: 0
        })
        this.getList(idx, 0);
    },

    getList(type, idx) {
        let _this = this;
        let timestamp = new Date().getTime();
        let sign = util.getSign(timestamp);
        let page = idx + 1;
        let url  = '/h5/index/orders?sign=' + sign + '&timestamp=' + timestamp + '&page=' + page + '&mobile=&start=&end=&is_cash=' + type;
        getRequest.get(url).then((res) => {
          _this.setData({
            current_page: res.data.current_page,
            last_page: res.data.last_page,
            details: _this.data.details.concat(res.data.data)
          })
          }).catch((err) => {
            console.log(err)
        })
    }
})