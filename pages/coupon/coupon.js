const app = getApp();
const getRequest = require('../../utils/getRequest');
var waitState = false;
Page({
    data: {
        tabbar: ['可赠送', '已使用'],
        tabbarNum: 0,
        details: [],
        current_page: 1,
        page_size: 20,
        last_page: 1,
        loadState: true
    },
    onLoad: function (options) {
        this.getList(this.data.current_page);
    },
    //切换筛选条件
    tabbarChange: function (e) {
        if (waitState == true) {
            app.toastFun('操作频繁，请稍后');
        }
        else {
            let idx = e.currentTarget.dataset.idx;
            this.setData({
                details: [],
                tabbarNum: idx,
                current_page: 1,
                last_page: 1
            })
            this.getList(this.data.current_page);
        }
    },
    //获取列表
    getList(current_page) {
        waitState = true;
        let _this = this, postdata = {
            token: app.globalData.token,
            type: _this.data.tabbarNum + 1,
            page: current_page,
            page_size: _this.data.page_size
        };
        getRequest.post('index/Account/redeemCard', postdata).then(function (res) {
            // console.log(res);
            _this.setData({
                details: _this.data.details.concat(res.data.data),
                page: res.data.current_page,
                last_page: res.data.last_page,
                loadState: true
            })
            waitState = false;
        }).catch(function (err) { _this.setData({ loadState: false }) })
    },
    //加载更多
    onReachBottom: function () {
        if (this.data.page < this.data.last_page) {
            this.getList(this.data.current_page + 1);
        }
        else {
            app.toastFun('已经没有了');
        }
    },
    // transferCardId: function (e) {
    //     const { cardId } = e.currentTarget.dataset;
    //     this.onShareAppMessage(cardId)
    // },
    onShareAppMessage: function (e) {
        // console.log(e.target.dataset)
        // console.log(e.target.dataset.cardid)
        const cardId = e.target.dataset.cardid
        return {
            title: '来自好友价值2000元的夷畅茶馆的电子卡',
            imageUrl: 'http://images.lexuanhui.online/platform_pic/WechatIMG5480.jpeg',
            path: 'pages/login/login?u=' +
                app.globalData.userInfo.id +
                '&f=' +
                app.globalData.userInfo.pid +
                '&t=h' +
                '&c=' + cardId,
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        let _this = this;
        _this.setData({
            details: [],
            current_page: 1,
            last_page: 1
        })
        // setTimeout(() => {
        _this.getList(_this.data.current_page);
        // }, 50);
        wx.stopPullDownRefresh();
    }
})