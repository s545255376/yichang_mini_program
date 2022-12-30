const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        loadState: true,
        list: [{
            coupon_value: "",
            font_color: "#FFFFFF",
            id: "",
            image: "../../images/bard_bg3.png",
            name: "优惠券",
            share_image: "https://fenxiaopic.missshop.com/upload/20210527/cfc3a068cbc8ae6e851dcfa02729f104.png",
            share_title: "即刻前往激活会员权益，尊享逆龄之美",
            status: 0,
            type: 0,
            unit: "普通商品"
        }, {
            coupon_value: "100",
            font_color: "#FFFFFF",
            id: "",
            image: "https://fenxiaopic.chengmeijiangxuan.com/upload/20210727/6c115c1cd7365ca93be80575f5b05094.png",
            name: "用于21天代餐群内打卡累加型代金券",
            share_image: "https://cmjx.chengmeijiangxuan.com/static/web/21daka.png",
            share_title: "【每日签到＋￥100现金券】连续签到随心花",
            status: 0,
            type: 2,
            unit: "元"
        }],
        pagenum: 1,
        last_page: 1,
    },
    onLoad: function (options) {
        wx.hideShareMenu({
            menus: ['shareAppMessage', 'shareTimeline']
        })
        this.getList(1);
    },
    //获取小美优惠券列表
    getList(pagenum) {
        let _this = this;
        getRequest.post('index/coupons/getMarketList', {
            mobile: app.globalData.userInfo.mobile,
            page: pagenum
        }).then(function (res) {
            _this.setData({
                list: _this.data.list.concat(res.data),
                pagenum: res.data.current_page,
                last_page: res.data.last_page,
                loadState: true
            })
            console.log(_this.data.list);
        }).catch(function (err) {
            _this.setData({
                loadState: false
            })
        })
    },
    //加载更多
    onReachBottom: function () {
        if (this.data.pagenum < this.data.last_page) {
            this.getList(this.data.tabbarNum, this.data.pagenum + 1);
        } else {
            app.toastFun('我是有底线哒');
        }
    },
    onShareAppMessage: function (res) {
        let idx = res.target.dataset.idx;
        console.log(`/pages/login/login?t=xm&xmtype=${this.data.list[idx].type}&xmid=${this.data.list[idx].id}`)
        return {
            title: this.data.list[idx].share_title,
            imageUrl: this.data.list[idx].share_image,
            path: `/pages/login/login?t=xm&xmtype=${this.data.list[idx].type}&xmid=${this.data.list[idx].id}`
        }
    },
})