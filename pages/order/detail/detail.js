const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        uid: '',
        info: {},
        order_id: '',
        loglist: {},
        //倒计时
    showtimearr: ['00', '00', '00'],
        is_cash: 0,

        //物流
        expressList: [],
        expressidx: -1,
        expressCheck: -1,
        expressToast: false,
        express_name: '',
        express_sn: '',

        loadState: true,

        getGiftShow: false,
        prizelist: [],
        needAdapt: app.globalData.system.needAdapt,

        goodsToast: false,
        normsList: [],

        //赠品选择弹窗
        giftList: [],
        show_giftPanel: false
    },
    onLoad: function (options) {
        app.router.orderid = '';
        wx.hideShareMenu();

        this.setData({
            order_id: options.order_id,
            uid: options.uid,
        })
      
        if ('is_cash' in options) {
          this.setData({
              is_cash: options.is_cash
            })
        }
    },
    onShow() {
        this.getInfo(this.data.order_id);
    },
    //订单详情
    getInfo(order_id) {
        clearInterval(app.router.timeInterval);
        let _this = this,
            postdata = {
                token: app.globalData.token,
                uid: app.globalData.userInfo.id || this.data.uid,
                order_id: order_id
            };
        //订单详情
        getRequest.noToastPost('index/order/info', postdata).then(async function (res) {
            _this.setData({
                info: res.data,
                loadState: true,
                getGiftShow: res.data.is_winning == 1 ? true : false
            })
            const {
                goods
            } = res.data;

            //设置赠品数据
            /**
             * 这里按多商品多赠品设计代码逻辑
             * 如果goods.length > 1
             * 那么_result 的length > 1
             */
            if (goods && goods.length > 0) {
                console.log(goods);
                const _result = await Promise.all(goods.map(async key => {
                    let _data = await _this.getGiftList(key.goods_sn).then(res => res.data)
                    _data.map(keys => {
                        keys['chouse'] = null;
                    })
                    return {
                        list: _data,
                        warn: '',
                        base_name: key.goods_name,
                        base_price: key.goods_price,
                        base_image: key.image
                    }
                }))
                _this.setData({
                    giftList: _result
                })
            }
            if (res.data.order_status == 0) {
                _this.countDown(res.data.cancel_time);
            }
        }).catch(function (err) {
            _this.setData({
                loadState: false
            })
        })
        //物流详情
        getRequest.noToastPost('index/order/express', postdata).then(function (res) {
            _this.setData({
                loglist: res.data.Traces[0]
            })
        }).catch(function (err) {
            console.log(err);
        })
        //奖品列表
        getRequest.noToastPost('index/order/getOrderGoodsList', postdata).then(function (res) {
            _this.setData({
                prizelist: res.data
            })
        }).catch(function (err) {
            console.log(err);
        })
    },
    onClose() {
        this.setData({
            show_giftPanel: false
        });
    },
    active20220401() {
        this.setData({
            show_giftPanel: true
        });
    },
    //获取商品对应可领取的配赠列表
    getGiftList(goods_sn) {
        return getRequest.noToastPost('/index/order/getGiftList', {
            goods_sn
        })
    },
    //选中当前商品对应的领取的赠品
    chousethisGift(e) {
        const {
            fatherindex,
            childindex,
            specsgoodsn
        } = e.currentTarget.dataset;
        const {
            giftList
        } = this.data;
        giftList[fatherindex].list.map(key => {
            key.chouse = ''
        })
        giftList[fatherindex].list[childindex].chouse = specsgoodsn;
        console.log(giftList);
        this.setData({
            giftList
        })
    },
    //确认提交赠品的选择
    setgiftConfirm() {
        const {
            giftList
        } = this.data;
        const _this = this;
        let check = false;
        let form = [];

        giftList.map(key => {
            let {
                list,
                warn
            } = key
            const res = list.filter((item) => {
                return item.chouse
            })
            console.log(res);
            if (res.length == 0) {
                key['warn'] = '请选择您的赠品'
            } else {
                key['warn'] = ''
                check = true;
                form.push(res[0].chouse);
            }
        })

        this.setData({
            giftList
        })

        if (check) {
            /**
             * wufeng
             * 赠品领取从设计上按多商品多奖品来写代码
             * 但实际上写到这里提交赠品时，接口无法满足多goods提交
             * 所以form暂时就转换成 a,b,c 这种形式提交
             */
            getRequest.noToastPost('/index/order/getBoxGift', {
                order_id: _this.data.order_id,
                goods_sn: form.join(',')
            }).then(() => {
                app.toastFun('申领成功!');
                this.setData({
                    show_giftPanel: false
                })
                this.getInfo(this.data.order_id);
            }).catch(function (err) {
                console.log(err);
            })
        }
    },
    //关闭抽奖产品提示
    closeGiveToast() {
        this.setData({
            getGiftShow: false
        })
    },
    //跳转奖品列表
    showMoreGifts: function () {
        wx.navigateTo({
            url: '../giftlist/giftlist?order_id=' + this.data.order_id
        })
    },
    //跳转商品详情
    goGoodsInfo: function (e) {
        let idx = e.currentTarget.dataset.idx;
        if (this.data.info.goods[idx].type != 2) {
            wx.navigateTo({
                url: '../../goodsdetail/goodsdetail?goods_id=' + this.data.info.goods[idx].goods_id + '&props=' + this.data.info.goods[idx].props + '&live=false',
            })
        }
    },
    //跳转物流详情
    logisticsList: function (e) {
        wx.navigateTo({
            url: '../logistics/logistics?order_id=' + this.data.order_id + '&uid=' + this.data.uid,
        })
    },
    //倒计时
    countDown(endtime) {
        let now = new Date().getTime(),
            _this = this;
        endtime = endtime * 1000;
        // console.log(now,endtime)
        if (now <= endtime) {
            let differ = endtime - now;
            //计算小时数
            let hours = Math.floor(differ % (24 * 60 * 60 * 1000) / (60 * 60 * 1000));
            //计算分钟数
            let minutes = Math.floor(differ % (60 * 60 * 1000) / (60 * 1000));
            //计算秒数
            var seconds = Math.round((differ % (60 * 60 * 1000) % (60 * 1000)) / 1000);

            app.router.timeInterval = setInterval(function () {
                console.log(seconds)
                if (hours == 0 && seconds == 0 && minutes == 0) {
                    clearInterval(app.router.timeInterval);
                    _this.getInfo(_this.data.order_id);
                } else if (seconds == 0 && minutes == 0) {
                    hours -= 1;
                    minutes = 59;
                    seconds = 59;
                } else if (seconds == 0) {
                    minutes -= 1;
                    seconds = 59;
                } else {
                    seconds -= 1;
                }
                _this.setData({
                    showtimearr: [hours < 10 ? '0' + hours : hours, minutes < 10 ? '0' + minutes : minutes, seconds < 10 ? '0' + seconds : seconds]
                })
            }, 1000)
        } else {
            console.log(this.data.info)
            this.data.info.order_status = 5;
            this.data.info.order_status_str = '已失效';
            this.setData({
                info: this.data.info
            })
            // this.getInfo(this.data.order_id);
        }
    },
    //取消订单
    cancelOrder: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            let _this = this;
            wx.showModal({
                title: '提示',
                content: '是否确认要取消该订单？',
                success: function (info) {
                    if (info.cancel) {} else {
                        let postdata = {
                            uid: app.globalData.userInfo.id,
                            token: app.globalData.token,
                            order_id: _this.data.info.id
                        };
                        getRequest.post('index/order/cancel', postdata).then(function (res) {
                            app.toastFun('取消成功');
                            _this.getInfo(_this.data.order_id);
                        }).catch(function (err) {
                            console.log(err);
                        })
                    }
                },
                fail: function (res) {},
            })
        }
    },
    //删除订单
    delOrder: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            let _this = this;
            wx.showModal({
                title: '提示',
                content: '是否确认要删除该订单？',
                success: function (info) {
                    if (info.cancel) {} else {
                        let postdata = {
                            uid: app.globalData.userInfo.id,
                            token: app.globalData.token,
                            order_id: _this.data.info.id
                        };
                        getRequest.post('index/order/del', postdata).then(function (res) {
                            app.toastFun('删除成功');
                            setTimeout(() => {
                                wx.navigateBack({
                                    delta: 1
                                })
                            }, 1000);
                        }).catch(function (err) {
                            app.toastFun(err.msg);
                        })
                    }
                },
                fail: function (res) {},
            })
        }
    },
    //去支付
    payOrder: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            let _this = this;
            let postdata = {
                uid: app.globalData.userInfo.id,
                token: app.globalData.token,
                order_id: _this.data.info.id
            };
            //生成订单
            getRequest.post('index/order/goPay', postdata).then(function (res) {
                let orderdata = {
                    uid: app.globalData.userInfo.id,
                    token: app.globalData.token,
                    puid: res.data.puid,
                    order_sn: res.data.order_sn,
                    order_id: res.data.order_id,
                    total_fee: res.data.total_fee,
                    total: res.data.total,
                    body: res.data.body,
                };
                //获取微信支付参数
                getRequest.post('index/pay/wxPay', orderdata).then(function (info) {
                    //掉起支付
                    wx.requestSubscribeMessage({
                        tmplIds: app.globalData.subscribe,
                        complete(allow) {
                            app.toastFun('支付成功');
                            //支付成功后刷新页面
                            _this.getInfo(_this.data.order_id);
                        }
                    })
                }).catch(function (err) { //生成订单是白
                    app.toastFun(err.msg);
                    if (err.code == 204) { //用户未登录，清除缓存后跳转登录页
                        wx.clearStorage();
                        wx.reLaunch({
                            url: '../../login/login',
                        })
                    }
                })
            }).catch(function (err) {
                app.toastFun(err.msg);
            })
        }
    },
    //再次购买
    addCart: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            let postdata = {
                uid: app.globalData.userInfo.id,
                token: app.globalData.token,
                cart: this.data.info.cart
            };
            getRequest.post('index/cart/againAdd', postdata).then(function (res) {
                app.toastFun('已添加至购物车');
            }).catch(function (err) {
                app.toastFun(err.msg);
            })
        }
    },
    //确认收货
    confirmGet: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            let _this = this;
            wx.showModal({
                title: '提示',
                content: '是否确认收货？',
                success: function (info) {
                    if (info.cancel) {} else {
                        let postdata = {
                            uid: app.globalData.userInfo.id,
                            token: app.globalData.token,
                            order_id: _this.data.info.id
                        };
                        getRequest.post('index/order/confirmReceive', postdata).then(function (res) {
                            app.toastFun('操作成功');
                            _this.getInfo(_this.data.order_id);
                        }).catch(function (err) {
                            app.toastFun(err.msg);
                        })
                    }
                }
            })
        }
    },
    //申请退款/退货
    applyReturn: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../apply/apply?order_id=' + this.data.order_id + '&order_status=' + this.data.info.order_status,
            })
        }
    },
    //销毁页面，清除倒计时
    onUnload: function () {
        clearInterval(app.router.timeInterval);
    },

    //去登陆--可删除
    goLogin: function () {
        if (app.globalData.userInfo.id == '') {
            wx.navigateTo({
                url: '../../login/login'
            })
        } else {
            return true;
        }
    },
    //客服
    customerService() {
        wx.makePhoneCall({
            phoneNumber: app.globalData.userInfo.store_mobile,
            success() {},
            fail() {}
        })
    },
    // 显示套盒弹窗
    showNorms(e) {
        let idx = e.currentTarget.dataset.idx;
        console.log(this.data.info.goods[idx].suit_info)
        this.setData({
            goodsToast: true,
            normsList: this.data.info.goods[idx]
        })
    },
    // 关闭套盒弹窗
    closeNorms() {
        this.setData({
            goodsToast: false
        })
    },
    //下拉刷新
    onPullDownRefresh: function () {
        this.getInfo(this.data.order_id);
        wx.stopPullDownRefresh();
    },
    // 分享
    onShareAppMessage: function (res) {
        return {
            title: '我正在秒杀超赞的VIP限定活动，邀请妳一起来拼单，go',
            imageUrl: 'https://fenxiaopic.chengmeijiangxuan.com/pdzf.jpg',
            path: 'pages/login/login?u=' + app.globalData.userInfo.id + '&f=' + app.globalData.userInfo.pid + '&t=g&gid=' + this.data.info.pd_info.goods_id + '&pdoid=' + this.data.info.pd_info.pd_oid + '&pdjnum=' + this.data.info.pd_info.pd_number
        }
    }
})