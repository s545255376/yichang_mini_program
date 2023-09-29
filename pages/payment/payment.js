const app = getApp();
const getRequest = require('../../utils/getRequest');
import {
    objType
} from '../../utils/util'
Page({
    data: {
        info: {
            goods_vip: []
        },
        cart_id: '',
        remark: '',
        modeval: 0,
    pick: [],
    is_cash: 0,
    table_number: 0,

        couponToast: false,
        couponid: -1,
        couponRadioIdx: -1,
        switchChecked: false,
        is_jx_goods: '',
        level_id: '',
        check_give: '',
        needAdapt: app.globalData.system.needAdapt,

        suit_sku_ids: [],
        goodsToast: false,
        normsList: [],

        // 老拼单
        pd_number: '', //拼单人数
        pd_oid: '', //拼单链接
        activity_id: 0, //拼单标识

        //新拼单
        is_pd: 0,
        pt_buytype: 0 //0 拼团原价购买 1 拼团拼单购买
    },
    onLoad: function (options) {
        const {
            goods_id,
            num,
            cart_id,
            is_jx_goods,
            sku_id = '',
            check_give = '',
            pd_number = '',
            pd_oid = '',
            activity_id = 0,
            is_pd = 0,
            pt_buytype = 0
        } = options;
        const suit_sku_ids = app.router.suit_sku_ids;
        this.setData({
            check_give,
            sku_id,
            goods_id,
            num,
            cart_id,
            is_jx_goods,
          level_id: app.globalData.userInfo.level_id,
            table_number: app.globalData.table_number,
            suit_sku_ids: suit_sku_ids,
            pd_number,
            pd_oid,
            activity_id,
            is_pd,
            pt_buytype
        })
        if ('is_cash' in options) {
          this.setData({
              is_cash: options.is_cash
            })
        }
        app.router.suit_sku_ids = [];

        this.getPaymentInfo();
    },
    onShow() {
        this.getPaymentInfo();
    },
    //跳转匠选商品详情
    buyJxGoods() {
        wx.navigateTo({
            url: '../goodsdetail/goodsdetail?goods_id=' + app.globalData.userInfo.jx_goods_id,
        })
    },
    //获取详情
    getPaymentInfo() {
        let postdata = {},
            posturl = '';
        const _this = this;
        const {
            sku_id,
            goods_id,
            num,
            cart_id = '',
            check_give,
            suit_sku_ids,
            pd_number,
            pd_oid,
            is_pd,
            pt_buytype
        } = this.data;

        if (cart_id) { //购物车
            postdata = {
                uid: app.globalData.userInfo.id,
                cart_id: JSON.parse(cart_id),
                token: app.globalData.token
            };
            posturl = 'index/goods/cartConfirmOrder';
        } else if (is_pd == 1) { //新拼团
            postdata = {
                uid: app.globalData.userInfo.id,
                goods_id: goods_id,
                num: num,
                suit_sku_ids,
                is_pd: pt_buytype, //传参容易误会，这个is_pd 只代表拼单里的原价购买还是拼单购买
                pd_oid
            }
            posturl = 'index/collage/confirmOrder';
        } else { //直接购买
            postdata = {
                uid: app.globalData.userInfo.id,
                goods_id: goods_id,
                num: num,
                token: app.globalData.token,
                check_give: check_give
            };
            if (pd_number) { //拼购
                postdata.pd_number = parseInt(pd_number);
            } else if (sku_id) { //单品
                postdata.sku_id = sku_id;
            } else { //套盒
                postdata.suit_sku_ids = suit_sku_ids;
            }
            posturl = 'index/goods/confirmOrder';
        }
        getRequest.noToastPost(posturl, postdata).then(function (res) {
            let couponid = -1,
                switchChecked = false;

            res.data.card.forEach(function (info, idx) {
                if (info.selected == 1) {
                    couponid = idx;
                }
            })

            if (res.data.cardVIP.length != 0) {
                if (res.data.cardVIP.selected == 1) {
                    switchChecked = true;
                }
            }

            _this.setData({
                // modeval:0,
                pick: res.data.pick[0],
                couponid: couponid,
                couponRadioIdx: couponid,
                switchChecked: switchChecked,
                info: res.data
            })
        }).catch(function (err) {
            if (err.code != 603) {
                app.toastFun(err.msg);
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1,
                    })
                }, 1000);
            }
            // getRequest.errlogPost('支付详情', err, {
            //     ...postdata,
            //     mobile: app.globalData.userInfo.mobile
            // }, {
            //     methods: 'getPaymentInfo',
            //     version: app.globalData.version
            // });
        })
    },
    // 显示套盒弹窗
    showNorms(e) {
        let idx = e.currentTarget.dataset.idx;
        this.setData({
            goodsToast: true,
            normsList: this.data.info.goods_def[idx]
        })
    },
    // 关闭套盒弹窗
    closeNorms() {
        this.setData({
            goodsToast: false
        })
    },
    //修改配送方式
    radioChange: function (e) {
        this.setData({
            modeval: e.detail.value
        })
    },
    //跳转新建地址
    addNewAddress: function () {
        wx.navigateTo({
            url: '../address/add/add?type=new',
        })
    },
    //跳转修改收货地址
    changeAddress: function () {
        //快递配送修改地址
        if (this.data.info.pick[0][this.data.modeval].val != 0) {
            wx.navigateTo({
                url: '../address/list/list?type=change',
            })
        }
    },
    //选择优惠券
    searchCoupon: function () {
        if (this.data.info.card.length != 0) {
            this.setData({
                couponToast: true
            })
        } else {
            app.toastFun('您暂时没有可用优惠券');
        }
    },
    //优惠券-选择
    couponChange: function (e) {
        let info = this.data.info,
            idx = e.detail.value;
        info.card.forEach(function (info) {
            info.selected = 0;
        })
        info.card[idx].selected = 1;
        this.setData({
            couponRadioIdx: e.detail.value,
            info: info
        })
    },
    //优惠券-确认选择
    couponConfirm: function () {
        this.setData({
            couponid: this.data.couponRadioIdx
        })
        this.closeToast();
        this.payPriceChange();
    },
    //关闭优惠券
    closeToast: function () {
        this.setData({
            couponToast: false
        })
    },
    //选择是否使用满减券
    switchChange: function (e) {
        this.setData({
            switchChecked: e.detail.value,
            couponRadioIdx: -1,
            couponid: -1
        })
        this.payPriceChange();
    },
    //金额统计计算
    payPriceChange() {
        let _this = this,
            info = this.data.info,
            switchChecked = this.data.switchChecked,
            couponid = this.data.couponid;
        let cardid = info.card[couponid].id;
        let postdata = {
            token: app.globalData.token,
            uid: app.globalData.userInfo.id,
            selected: switchChecked == true ? 1 : 0,
            coupon_id: couponid == -1 ? '' : cardid,
            goods: info.goods
        };
        getRequest.post('index/goods/modifyCard', postdata).then(function (res) {
            info.card = res.data.card;
            info.coupon_num = res.data.coupon_num;
            info.amount = res.data.amount;
            res.data.card.forEach(function (e, idx) {
                if (e.id == cardid) {
                    couponid = idx;
                }
            })
            _this.setData({
                info: info,
                couponid: couponid
            })
        }).catch(function (err) {
            console.log(err);
        })
    },
    //留言
    remarkInput: function (e) {
        this.setData({
            remark: e.detail.value
        })
    },
    //立即支付
    setOrder: function () {
        const _this = this;
        let postdata = {},
            couponid = this.data.couponid,
            coupon_id = [couponid == -1 ? '' : this.data.info.card[couponid].id, this.data.switchChecked == true ? this.data.info.cardVIP.id : ''],
            is_jx_goods = this.data.is_jx_goods,
            cart_id = this.data.cart_id,
            activity_id = this.data.activity_id,
            address_id = objType(this.data.info.pick[0][this.data.modeval].address) == 'object' ? this.data.info.pick[0][this.data.modeval].address.id : '';

        if (address_id !== '') {
            postdata = {
                uid: app.globalData.userInfo.id,
                total: this.data.info.amount.num,
                address_id: this.data.info.pick[0][this.data.modeval].address.id,
                order_price: this.data.info.amount.order_price,
                coupon_price: this.data.info.amount.coupon_price,
                jx_price: this.data.info.amount.jx_price,
                jx_discount: this.data.info.amount.jx_discount,
                discount_price: 0,
                express_fee: this.data.info.amount.express_fee,
                pay_price: this.data.info.amount.pay_price,
                points: this.data.info.amount.pay_price * this.data.info.score,
                buyer_msg: this.data.remark,
                coupon_id: coupon_id,
                goods: this.data.info.goods,
                token: app.globalData.token,
                pick_val: this.data.pick[this.data.modeval].val,
                activity_id
            };
            //判断赠品信息来源(购物车不需要该字段)
            if (cart_id == '') {
                postdata.check_give = this.data.check_give;
            }

            //老拼团
            //拼单发起
            if (this.data.pd_number) {
                postdata['pd_number'] = parseInt(this.data.pd_number);
            }

            //新拼团
            //拼单参与
            const {
                is_pd,
                pt_buytype,
                pd_oid
            } = this.data;
            if (pd_oid) { //如果pd_oid 代表订单是参团
                postdata['pd_oid'] = this.data.pd_oid;
            }

            let postUrl = ''
            if (is_pd == 0) {
                postUrl = 'index/goods/generateCartOrder';
            } else {
                postUrl = '/index/collage/generateCartOrder';
                postdata['is_pd'] = pt_buytype; //这个is_pd和判断里的is_pd是两个东西 这个代表拼团还是全价购买， 上面那个判断里的 代表当前订单是拼团活动订单还是正常的商品订单
                const {
                    goods
                } = this.data.info;
                const _arr = [];
                goods.map(key => {
                    const {
                        suit_sku_ids,
                        goods_id
                    } = key;
                    for (let i in suit_sku_ids) {
                        _arr.push({
                            goods_id,
                            sku_id: i,
                            num: suit_sku_ids[i]
                        })
                    }
                })
                postdata['goods'] = _arr
            }
            
          postdata['is_cash'] = this.data.is_cash
          postdata['table_number'] = this.data.table_number
            //生成订单
            getRequest.post(postUrl, postdata).then((res) => {
                let orderdata = {
                    uid: app.globalData.userInfo.id,
                    token: app.globalData.token,
                    puid: res.data.puid,
                    order_sn: res.data.order_sn,
                    order_id: res.data.order_id,
                    total_fee: res.data.total_fee, //价格
                    total: res.data.total,
                    body: res.data.body,
                };
                //积分支付
              getRequest.post('index/pay/wxPay', orderdata).then((info) => {
                if (this.data.is_cash == 1) {
                  wx.requestPayment({
                      "timeStamp": info.data.timeStamp,
                      "nonceStr": info.data.nonceStr,
                      "package": info.data.package,
                      "signType": info.data.signType,
                      "paySign": info.data.paySign,
                    "success": function (res) {
                      wx.requestSubscribeMessage({
                        tmplIds: app.globalData.subscribe,
                        complete(allow) {
                            app.toastFun('支付成功');
                            setTimeout(() => {
                              wx.navigateTo({
                                url: '../order/list/list?status=2&is_cash=1'
                            })
                                if (app.globalData.sharequery.hasOwnProperty('gid') && app.globalData.sharequery.gid !== '') {
                                    //通过分享直接消费的顾客进行上报
                                    wx.reportEvent("impulsive_customer", {})
                                } else {
                                    //自由消费顾客的上报
                                    wx.reportEvent("hesitant_customer", {})
                                }

                                if (is_jx_goods == 1) { //匠选商品返回上两页
                                    app.globalData.userInfo.level_id = 3;
                                    wx.navigateBack({
                                        delta: 2,
                                    })
                                } else if (is_pd == 1) {
                                    /**
                                     * 新拼团
                                     * 当订单支付完成后，缓存一些订单信息然后跳转回首页
                                     * is_frompayment 是否是从payment页面跳转的
                                     * pd_oid 订单id
                                     * 
                                     * 关于跳转
                                     * 这里做一下测试
                                     * 判断下页面栈的0下标是index的话  就使用新的跳转方法 不然还使用switchTab switchTab有个官方bug就是进入index 会执行两次onshow
                                     */
                                    const _cacheinfo = {
                                        is_frompayment: true
                                    }
                                    app.router.cache_groupon = {
                                        ..._cacheinfo
                                    }
                                    app.globalData.sharequery['t'] = 'm';
                                    app.globalData.sharequery['npdoid'] = res.data.order_id;


                                    const _pages = getCurrentPages();
                                    if (_pages[0].route == 'pages/index/index') {
                                        wx.navigateBack({
                                            delta: _pages.length,
                                        })
                                    } else {
                                        wx.switchTab({
                                            url: '../index/index',
                                        })
                                    }

                                } else { //非匠选商品回到首页后跳转订单详情
                                    app.router.orderid = res.data.order_id;
                                    wx.switchTab({
                                        url: '../index/index',
                                    })
                                }
                            }, 1000)
                        }
                    })
                      },
                    "fail": function (res) {
                        app.toastFun("支付失败")
                      },
                      "complete":function(res){}
                    }
                  )
                } else {
                  wx.requestSubscribeMessage({
                    tmplIds: app.globalData.subscribe,
                    complete(allow) {
                        app.toastFun('支付成功');
                        setTimeout(() => {

                            if (app.globalData.sharequery.hasOwnProperty('gid') && app.globalData.sharequery.gid !== '') {
                                //通过分享直接消费的顾客进行上报
                                wx.reportEvent("impulsive_customer", {})
                            } else {
                                //自由消费顾客的上报
                                wx.reportEvent("hesitant_customer", {})
                            }

                            if (is_jx_goods == 1) { //匠选商品返回上两页
                                app.globalData.userInfo.level_id = 3;
                                wx.navigateBack({
                                    delta: 2,
                                })
                            } else if (is_pd == 1) {
                                /**
                                 * 新拼团
                                 * 当订单支付完成后，缓存一些订单信息然后跳转回首页
                                 * is_frompayment 是否是从payment页面跳转的
                                 * pd_oid 订单id
                                 * 
                                 * 关于跳转
                                 * 这里做一下测试
                                 * 判断下页面栈的0下标是index的话  就使用新的跳转方法 不然还使用switchTab switchTab有个官方bug就是进入index 会执行两次onshow
                                 */
                                const _cacheinfo = {
                                    is_frompayment: true
                                }
                                app.router.cache_groupon = {
                                    ..._cacheinfo
                                }
                                app.globalData.sharequery['t'] = 'm';
                                app.globalData.sharequery['npdoid'] = res.data.order_id;


                                const _pages = getCurrentPages();
                                if (_pages[0].route == 'pages/index/index') {
                                    wx.navigateBack({
                                        delta: _pages.length,
                                    })
                                } else {
                                    wx.switchTab({
                                        url: '../index/index',
                                    })
                                }

                            } else { //非匠选商品回到首页后跳转订单详情
                                app.router.orderid = res.data.order_id;
                                wx.switchTab({
                                    url: '../index/index',
                                })
                            }
                        }, 1000)
                    }
                })
                  }
                }).catch(function (err) {
                    if (err.code == 204) { //204状态，用户未登录，清除缓存后跳转登录页
                        wx.clearStorage();
                        wx.reLaunch({
                            url: '../login/login',
                        })
                    } else { //其他原因导致支付失败，回到首页后跳转订单详情
                        app.toastFun(err.msg);
                        setTimeout(function () {
                            app.router.orderid = res.data.order_id;
                            wx.switchTab({
                                url: '../index/index',
                            })
                        }, 1000)
                    }
                })
            }).catch(function (err) {
                app.toastFun(err.msg);
            })

        } else {
            app.toastFun('请添加收货地址');
        }

    },
})