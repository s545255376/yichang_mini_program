// groupon/pages/tuaninfo/tuaninfo.js
const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        info: {}, //主要订单信息
        goods: {}, //订单商品
        timeCount: 0,
        timeData: {}, //时间转换
        progress: 0, //整数进度
        progressWord: '',
        uid: null, //从支付通知弹窗进来的uid 默认是空
        notice: 0, //从支付通知弹窗进来的 0 不是 1 是
        is_frompayment: false, //是否从支付页跳转过来
        is_storeStaff: false, //是否是门店员工 包括店老板或美容师
        pd_oid: null //拼团订单id
    },
    onChange(e) {
        let {
            days,
            hours,
            minutes,
            seconds
        } = e.detail;
        hours = hours >= 10 ? hours : `0${hours}`;
        minutes = minutes >= 10 ? minutes : `0${minutes}`;
        seconds = seconds >= 10 ? seconds : `0${seconds}`;
        this.setData({
            timeData: {
                days,
                hours,
                minutes,
                seconds
            },
        });
    },
    joinTuan(e) {
        // type 0 表示参加或者续单当前的团  1 表示新开一个团
        const {
            type
        } = e.currentTarget.dataset;
        if (type == 0) {
            app.globalData.sharequery['npdoid'] = this.data.pd_oid;
        } else {
            app.globalData.sharequery['npdoid'] = '';
        }
        app.globalData.sharequery['t'] = 'g';
        app.globalData.sharequery['gid'] = this.data.info.pd_goods_id;

        const _pages = getCurrentPages();
        if (_pages[0].route == 'pages/index/index') {
            wx.navigateBack({
                delta: _pages.length,
            })
        } else {
            wx.reLaunch({
                url: '/pages/index/index'
            })
        }
    },
    onLoad(e) {
        const {
            pd_oid = null, notice = 0, uid = null
        } = e;
        const {
            is_frompayment = false
        } = app.router.cache_groupon;
        this.setData({
            pd_oid,
            is_frompayment,
            is_storeStaff: app.globalData.userInfo.level_name == '店老板' || app.globalData.userInfo.level_name == '美容师',
        })

        getRequest.post('/index/collage/tuanInfo', {
            u_id: notice == 1 ? uid : app.globalData.userInfo.id,
            pd_oid
        }).then(res => {
            if (res.code == 200) {
                const _progress = Math.round((res.data.success_num / res.data.pd_number) * 100);
                console.log(_progress);
                this.setData({
                    info: res.data,
                    goods: res.data.goods,
                    progressWord: `拼团进度${res.data.success_num}/${res.data.pd_number}单`,
                    timeCount: res.data.deadline * 1000 - Math.round(new Date()) > 0 ? res.data.deadline * 1000 - Math.round(new Date()) : null,
                    progress: _progress
                })
            }
            app.router.cache_groupon = {};
            app.globalData.sharequery['t'] = '';
        }).catch(function (err) {
            app.router.cache_groupon = {};
            app.globalData.sharequery['t'] = '';
            app.toastFun(err.msg);
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000);
        })
    },
    // 分享
    onShareAppMessage: function (res) {
        return {
            title: '2折拼团嗨购9款抗初老清洁盲盒，就差妳啦！',
            imageUrl: 'https://cmjx.chengmeijiangxuan.com/static/web/pt/share.jpg',
            path: `pages/login/login?u=${app.globalData.userInfo.id}&f=${app.globalData.userInfo.pid}&t=m&gid=${this.data.info.pd_goods_id}&npdoid=${this.data.pd_oid}`
        }
    }
})