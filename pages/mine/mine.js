const app = getApp();
const Font = require('../../utils/getFont');
const getRequest = require('../../utils/getRequest');
import drawQrcode from '../../utils/weapp.qrcode.esm'
Page({
    data: {
        qrcode: '',
        point: 0,
        money: 0,
        card_money: 0,
        is_vip: false,
        pageShow: false,
        cancel_code: true,
        logType: false,
        hiddenmodalput: false,
        grouponToast:false,
        cardNumber: '',
        cardSecret: '',
        userinfo: {
            username: '点击登录',
            avatar: '',
        },
        orderList: {
            stayPaymentStats: 0,
            stayDeliverStats: 0,
            stayReceivStats: 0,
            stayCompleteStats: 0,
            stayRefundStats: 0
    },
    orderList_cash: {
      stayPaymentStats: 0,
      stayDeliverStats: 0,
      stayReceivStats: 0,
      stayCompleteStats: 0,
      stayRefundStats: 0
  },
        score: 0,
        card: 0,
        message: 0,

        showActionsheet: false,
        xiaomei: false,
        writeOffShow: false,
        card_no: '',
        scanInfo: {
            card_no: "",
            coupon_value: '',
            image: "",
            name: "",
            order: []
        },
        store: 0
    },
    onLoad: function () {
        let _this = this,
            xiaomei = ['18017111622', '17301627352', '17317186930', '18917985907', '15901814482', '13817722847', '18845719217', '18818219125', '18717884032', '15618306287'];

        if (app.globalData.loadFont == false) { //未加载字体
            Font.get().then(function () {
                _this.setData({
                    xiaomei: xiaomei.indexOf(app.globalData.userInfo.mobile) == -1 ? false : true,
                    pageShow: true
                })
            }).catch(function (err) {
                console.log('err' + err);
                _this.setData({
                    xiaomei: xiaomei.indexOf(app.globalData.userInfo.mobile) == -1 ? false : true,
                    pageShow: false
                })
            })
        } else {
            this.setData({
                xiaomei: xiaomei.indexOf(app.globalData.userInfo.mobile) == -1 ? false : true,
                pageShow: true
            })
        }
    },
    onShow: function () {
        wx.setStorageSync('intomyxprevpage', 'mine');
        let _this = this;

        if (app.globalData.userInfo.id != '') { //用户已登录
            // console.log(app.globalData.userInfo)
            _this.setData({
                store: app.globalData.userInfo.role_id
            })
            let postdata1 = {
                    uid: app.globalData.userInfo.id,
              token: app.globalData.token,
                    is_cash: 1
                };
            if (app.globalData.userInfo.id != '') {
                //订单统计
                getRequest.post('index/order/stats', postdata1, true).then(function (res) {
                  _this.setData({
                      logType: true,
                      userinfo: app.globalData.userInfo,
                      orderList_cash: res.data
                  })
              })
              .catch(function (err) {
                  _this.setData({
                      logType: true,
                      userinfo: app.globalData.userInfo
                  })
              });

              let postdata = {
                uid: app.globalData.userInfo.id,
                token: app.globalData.token
            };
                getRequest.post('index/order/stats', postdata, true).then(function (res) {
                        _this.setData({
                            logType: true,
                            userinfo: app.globalData.userInfo,
                            orderList: res.data
                        })
                    })
                    .catch(function (err) {
                        _this.setData({
                            logType: true,
                            userinfo: app.globalData.userInfo
                        })
                    });

                // //积分统计
                // getRequest.post('index/scores/stats',postdata).then(function(res){
                //   _this.setData({score:res.data.score})
                // })
                // .catch(function(err){console.log(err);});
                // //优惠券统计
                // getRequest.post('index/coupons/stats',postdata).then(function(res){
                //   _this.setData({card:res.data.card})
                // })
                // .catch(function(err){console.log(err);});
                //消息统计
                getRequest.post('index/message/stats', postdata, true).then(function (res) {
                        _this.setData({
                            message: res.data.msg
                        })
                    })
                    .catch(function (err) {
                        wx.removeStorage({
                            key: 'logindata',
                            success(res) {
                                app.globalData.token = '';
                                app.globalData.userInfo = {
                                    mobile: '',
                                    username: '',
                                    portrait: '',
                                    sex: '',
                                    stauts: '',
                                    fid: '',
                                    id: ''
                                };
                                wx.hideTabBarRedDot({
                                    index: 1
                                });
                                wx.clearStorage();
                                _this.setData({
                                    showActionsheet: false,
                                })
                                app.toastFun("用户登录信息已过期，请重新登录");
                                setTimeout(() => {
                                    wx.reLaunch({
                                      url: '../index/index',
                                    })
                                }, 1200);
                            }
                        })
                    });
            }
        } else { //用户未登录(已弃置)
            this.setData({
                logType: false,
                userinfo: {
                    username: '点击登录',
                    avatar: '',
                },
                orderList: {
                    stayPaymentStats: 0,
                    stayDeliverStats: 0,
                    stayReceivStats: 0,
                    stayCompleteStats: 0,
                    stayRefundStats: 0
                },
                score: 0,
                card: 0,
                message: 0
            })
        }

        getRequest.post('index/Account/hxQrcode', { token: app.globalData.token }).then(function (res) {
            _this.setData({
                qrcode: res.data.qrcode
            })
        })

        getRequest.post('index/Account/point', {
            token: app.globalData.token
        }).then(function (res) {
            _this.setData({
                point: res.data.point,
                money: res.data.balance,
                card_money: res.data.card_money,
                is_vip: res.data.is_vip
            })
        })
    },
    //去登陆--不需要
    goLogin: function () {
        if (app.globalData.userInfo.id == '') {
            wx.navigateTo({
                url: '../login/login'
            })
        } else {
            return true;
        }
  },
    //线下订单
    goOrderListCash: function (e) {
      let logCheck = this.goLogin();
      if (logCheck == true) {
          wx.navigateTo({
              url: '../order/list/list?status=' + e.currentTarget.dataset.type + '&is_cash=1'
          })
      }
  },
    //我的订单
    goOrderList: function (e) {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../order/list/list?status=' + e.currentTarget.dataset.type
            })
        }
    },
    //我的退款申请
    refundList: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../order/refund/list/list'
            })
        }
    },
    handleContact(e) {
        console.log(e.detail.path);
        console.log(e.detail.query);
    },
    showCode: function () {
        this.setData({
            cancel_code: false
        })
    },
    cancelCode: function () {
        this.setData({
            cancel_code: true
        })
    },
    //消费积分
    // bonusPoints: function () {
    //     let logCheck = this.goLogin();
    //     if (logCheck == true) {
    //         wx.navigateTo({
    //             url: '../points/spend/spend'
    //         })
    //     }
    // },
    //扫描积分
    scanPoints: function () {
        let _this = this;
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.scanCode({
              onlyFromCamera: true,
              scanType: [],
                success: (result) => {
                    wx.navigateTo({
                        url: `../points/scan/scan?${result.result}`
                    })
              }
            })
        }
    },
    //我的亲友
    goMyTeam: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../points/team/team'
            })
        }
    },
    inputchange: function(e) {
        const {
            name
        } = e.currentTarget.dataset;
        if (name == 'card') {
            this.setData({
                cardNumber: e.detail.value
            })
        } else {
            this.setData({
                cardSecret: e.detail.value
            })
        }
    },
    // 激活卡密
    goActive: function() {
        let _this = this
        const {cardNumber, cardSecret} = this.data;
        getRequest
            .post(
                '/index/Account/activeCdkey', {
                    card_no: cardNumber,
                    pwd: cardSecret,
                    token: app.globalData.token,
                },
                true
            )
            .then(function (res) {
                app.toastFun('激活成功！')
                _this.setData({
                    grouponToast: false,
                })
                wx.reLaunch({
                    url: '../mine/mine',
                })
            })
            .catch(function (err) {
                app.toastFun(err.msg)
            })
    },
    //消费明细
    goDetails: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../details/details'
            })
        }
    },
    //我的收货地址
    myAddress: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../address/list/list'
            })
        }
    },
    //积分
    myScores: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../scores/scores'
            })
        }
    },
    //卡券
    myCoupon: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../coupon/coupon'
            })
        }
    },
    //分享海报
    sharePoster: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../../other/pages/jxposter/jxposter'
            })
        }
    },
    //消息
    messageList: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../message/list/list?type=0'
            })
        }
    },
    buyPoints() {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../balance/fellow/fellow?type=1'
            })
        }
    },
    active() {
        this.setData({
            grouponToast: true
        })
    },
    //隐藏弹窗
    closeToast: function (e) {
        const {
            detail
        } = e
        // console.log(detail)
        this.setData({
            [detail]: false,
        })
    },
    //常见问题
    questionBtn: function () {
        let logCheck = this.goLogin();
        if (logCheck == true) {
            wx.navigateTo({
                url: '../question/question'
            })
        }
    },
    //意见反馈
    feedBack: function () {
        wx.navigateTo({
            url: '../feedback/list/list'
        })
    },
    //更多功能
    moreFun: function (e) {
        console.log(e);
        this.setData({
            showActionsheet: true
        })
    },
    //退出登录-取消弹窗
    logoutCancel() {
        this.setData({
            showActionsheet: false,
            writeOffShow: false
        })
    },
    //退出账号
    logoutBtn() {
        let _this = this;
        wx.showModal({
            title: '提示',
            content: '是否确认要退出登录？',
            success: function (info) {
                if (info.confirm) {
                    wx.removeStorage({
                        key: 'logindata',
                        success(res) {
                            app.globalData.token = '';
                            app.globalData.userInfo = {
                                mobile: '',
                                username: '',
                                portrait: '',
                                sex: '',
                                stauts: '',
                                fid: '',
                                id: ''
                            };
                            wx.hideTabBarRedDot({
                                index: 1
                            });
                            wx.clearStorage();
                            _this.setData({
                                showActionsheet: false,
                            })
                            app.toastFun('退出成功');
                            wx.reLaunch({
                                url: '../login/login',
                            })
                        }
                    })
                }
            },
        })
    },
    clicklogin() {
        let _this = this;
        wx.removeStorage({
            key: 'logindata',
            success(res) {
                app.globalData.token = '';
                app.globalData.userInfo = {
                    mobile: '',
                    username: '',
                    portrait: '',
                    sex: '',
                    stauts: '',
                    fid: '',
                    id: ''
                };
                wx.hideTabBarRedDot({
                    index: 1
                });
                wx.clearStorage();
                _this.setData({
                    showActionsheet: false,
                })
                wx.reLaunch({
                    url: '../login/login',
                })
            }
        })
    },
    //注销账号
    logoffBtn() {
        let _this = this;
        wx.showModal({
            title: '提示',
            content: '是否确认要注销账号？',
            success: function (info) {
                // console.log(info)
                if (info.confirm) {
                    getRequest.post('index/user/del', {
                        uid: app.globalData.userInfo.id
                    }).then(function (res) {
                        wx.removeStorage({
                            key: 'logindata',
                            success(res) {
                                app.globalData.userInfo.id = '';
                                _this.setData({
                                    showActionsheet: false,
                                })
                                app.toastFun('注销成功');
                                wx.reLaunch({
                                    url: '../login/login',
                                })
                            }
                        })
                    }).catch(function (err) {
                        console.log(err);
                    });

                }
            },
        })
    },
    //我的协议
    agreementList() {
        wx.navigateTo({
            url: '../contract/contract'
        })
    },
    //顾客订单
    customerOrder() {
        wx.navigateTo({
            url: '../../other/pages/customer/order/order'
        })
    },
    //素材区
    goMaterial() {
        wx.navigateTo({
            url: '../../other/pages/material/list/list'
        })
    },
    //肌肤报警器
    goInstrument() {
        wx.navigateTo({
            url: '../../instrument/pages/link/link',
        })
    },
    //小美
    xiaoMei() {
        wx.navigateTo({
            url: '../../other/pages/xiaomei/xiaomei',
        })
    },
    //客服
    goCustService() {
        wx.navigateTo({
            url: '../custservice/custservice',
        })
    },
    //扫码
    ScanBtn() {
        let _this = this;
        wx.scanCode({
            success(code) {
                let postdata = {
                    card_no: code.result,
                    uid: app.globalData.userInfo.id,
                    role_id: app.globalData.userInfo.role_id
                };
                getRequest.post('index/coupons/getCardUseInfo', postdata).then(function (res) {
                    _this.setData({
                        scanInfo: res.data,
                        card_no: code.result,
                        writeOffShow: true
                    })
                }).catch(function (err) {
                    console.log(err);
                })
            }
        })
    },
    //核销确认
    writeOffBtn() {
        let _this = this;
        wx.showModal({
            title: '提示',
            content: '是否确认核销？',
            success: function (info) {
                if (info.cancel) {} else {
                    let postdata = {
                        card_no: _this.data.card_no,
                        uid: app.globalData.userInfo.id,
                        role_id: app.globalData.userInfo.role_id
                    };
                    getRequest.post('index/coupons/useCoupon', postdata).then(function (res) {
                        app.toastFun('核销成功');
                        _this.setData({
                            card_no: '',
                            writeOffShow: false
                        })
                    }).catch(function (err) {
                        console.log(err);
                    })
                }
            },
            fail: function (res) {},
        })
    }
})