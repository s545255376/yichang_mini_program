const app = getApp();
const getRequest = require('../../utils/getRequest');
var waitState = false;
Page({
    data: {
        tabbar: ['可用券', '待激活', '不可用券'],
        tabbarNum: 0,
        list: [],
        pagenum: 1,
        last_page: 1,
        loadState: true,

        posterToast: false,
        poster: {
            title: '',
            image: '',
            code: ''
        },
    },
    onLoad: function (options) {
        this.getList(1, 1);
    },
    //显示海报
    showCode(e) {
        let dataset = e.currentTarget.dataset;
        let idx = dataset.idx, status = dataset.status, type = dataset.type;
        if (status == 1) {
            if (type == 1) {
                this.setData({
                    poster: {
                        title: this.data.list[idx].name,
                        image: this.data.list[idx].image,
                        code: this.data.list[idx].qrcode
                    },
                    posterToast: true,
                })
            }
            else {
                wx.switchTab({
                    url: '../index/index',
                })
            }
        }
    },
    //关闭弹窗
    closeToast() {
        this.setData({
            posterToast: false
        })
    },
    //切换筛选条件
    tabbarChange: function (e) {
        if (waitState == true) {
            app.toastFun('操作频繁，请稍后');
        }
        else {
            let idx = e.currentTarget.dataset.idx, status = '';
            this.setData({
                list: [],
                tabbarNum: idx,
                pagenum: 1,
                last_page: 1
            })
            if (idx == 0) { status = 1; }
            else if (idx == 1) { status = 4; }
            else { status = 0; }
            this.getList(status, 1);
        }
    },
    //获取列表
    getList(status, pagenum) {
        waitState = true;
        let _this = this, postdata = {
            uid: app.globalData.userInfo.id,
            status: status,
            page: pagenum
        };
        getRequest.post('index/coupons/index', postdata).then(function (res) {
            res.data.data.forEach(function (e) {
                e.more = false;
            })
            _this.setData({
                tabbar: status == 1 ? ['可用券(' + res.data.total + ')', '待激活', '不可用券'] : _this.data.tabbar,
                list: _this.data.list.concat(res.data.data),
                pagenum: res.data.current_page,
                last_page: res.data.last_page,
                loadState: true
            })
            waitState = false;
        }).catch(function (err) { _this.setData({ loadState: false }) })
    },
    //展示优惠券规则
    showRules(e) {
        let idx = e.currentTarget.dataset.idx;
        console.log(this.data.list[idx].more)
        this.data.list[idx].more = !this.data.list[idx].more;
        this.setData({
            list: this.data.list
        })
    },
    //加载更多
    onReachBottom: function () {
        if (this.data.pagenum < this.data.last_page) {
            let status = '';
            if (this.data.tabbarNum == 0) { status = 1; }
            else { status = 0; }

            this.getList(status, this.data.pagenum + 1);
        }
        else {
            app.toastFun('已经没有了');
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        let status = '', _this = this;
        if (this.data.tabbarNum == 0) { status = 1; }
        else if (this.data.tabbarNum == 1) { status = 4; }
        else { status = 0; }
        this.setData({
            list: [],
            pagenum: 1,
            last_page: 1
        })
        // setTimeout(() => {
        _this.getList(status, 1);
        // }, 50);
        wx.stopPullDownRefresh();
    }
})