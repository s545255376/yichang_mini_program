const app = getApp();
const getRequest = require("../../utils/getRequest");
const log = require('../../utils/log.js');
Page({
    data: {
        btnType: 1,
        token: "",
        mobile: "",
        tips: "获得你的手机号码",
        userinfo: {
            nickName: "",
            avatarUrl: "",
            gender: 0,
        },
        agreement: [],
        treatyshow: false,
        // 顾客绑定注册相关
        registerToast: false,
        registerValue: ''
    },
    onLoad(e) {
        // s=35000&f=10000&t=e&gid=10000
        //u:user_id(用户id),f:pid(上级id),t:type(分享类型),gid:goodsid(商品id),eid:essayid(文章id),l:live(直播 true:是直播商品)
        // jx:是否为匠选商品 0否1是
        let newE = {};
        if (Object.keys(e).length > 0) {
            if (e.scene) {
                let obj = decodeURIComponent(e.scene);
                newE = obj.split("&").reduce((a, b) => {
                    const currentVal = b.split("=");
                    if (isNaN(currentVal[1])) {
                        a[currentVal[0]] = currentVal[1];
                    } else {
                        a[currentVal[0]] = parseInt(currentVal[1]);
                    }
                    return a;
                }, {});
            }
            // else if(e.custom_params){
            //   let livePlayer = requirePlugin('live-player-plugin');
            //   let shareinfo = e;
            //   livePlayer.getShareParams().then(res => {
            //     shareinfo.f = res.custom_params.f;
            //     shareinfo.u = res.custom_params.u;
            //     newE = shareinfo;
            //     // console.log('直播分享进入',res);
            //     console.log(newE);
            //   }).catch(err => {
            //       console.log('get share params', err)
            //   })
            // }
            else {
                newE = e;
            }
            app.globalData.sharequery = newE;
            console.warn('[onLoad]登录时携带参数:', newE);
        } else {
            console.warn('[onLoad]本次登录未携带参数');
        }
        //微信提醒模版id
        getRequest
            .noToastPost("index/base/subscribe", {})
            .then(function (res) {
                app.globalData.subscribe = res.data.subscribe;
            });
    },
    onShow: function () {
        const _this = this;
        //是否处于审核状态
        console.warn('[onShow]查看全局下sharequery是否有写入', app.globalData.sharequery);
        // console.log(app.globalData.examineStr);
        getRequest
            .noToastPost("index/check/loginCheck", {
                number: app.globalData.examineStr,
            })
            .then(function (check) {
                if (check.data.type == 0) {
                    //正常用户
                    //获取登录缓存
                    wx.getStorage({
                        key: "logindata",
                        success: function (logstorage) {
                            //获取成功
                            //缓存登录
                            /**
                             * 模拟登录
                             */
                            // const {
                            //     data
                            // } = logstorage;
                            // data.mobile = '';
                            getRequest
                                .noToastPost("index/user/updateUserInfo", logstorage.data)
                                .then(function (info) {
                                    app.globalData.token = info.data.token;
                                    app.globalData.userInfo = info.data;
                                    const logindata = {
                                        mobile: info.data.mobile,
                                        token: info.data.token,
                                        id: info.data.id,
                                        carryparam: Object.keys(app.globalData.sharequery).length > 0 ? JSON.stringify(app.globalData.sharequery) : null
                                    };
                                    wx.setStorage({
                                        key: "logindata",
                                        data: logindata,
                                    });
                                    log.info(logindata);
                                    log.setFilterMsg('loginUserInfo');
                                    _this.checkContract(info.data.id);
                                })
                                .catch(function () {
                                    //token已过期，清除缓存
                                    wx.removeStorage({
                                        key: "logindata",
                                        success(res) {
                                            app.globalData.token = "";
                                            app.globalData.userInfo = {
                                                mobile: "",
                                                username: "",
                                                portrait: "",
                                                sex: "",
                                                stauts: "",
                                                fid: "",
                                                id: "",
                                                store_id: "",
                                                role_id: "",
                                            };
                                        },
                                    });
                                    _this.getTokenFun();
                                });
                        },
                        fail: function () {
                            //获取失败
                            _this.getTokenFun();
                        },
                    });
                } else {
                    //审核状态
                    wx.removeStorage({
                        key: "logindata"
                    });
                    app.globalData.userInfo = check.data.user;
                    _this.checkContract(check.data.user.id);
                }
            });
    },
    getTokenFun() {
        const _this = this;
        //获取登录token
        wx.login({
            success: function (wxlogin) {
                getRequest
                    .post("index/user/login", {
                        code: wxlogin.code
                    })
                    .then(function (gettoken) {
                        _this.data.token = gettoken.data.token;
                        _this.setData({
                            token: gettoken.data.token,
                            mobile: gettoken.data.mobile,
                        });
                    })
                
                // .catch(function (tokenerr) {
                //     getRequest.errlogPost("token获取", tokenerr, {
                //         code: wxlogin.code,
                //     }, {
                //         methods: 'getTokenFun',
                //         version: app.globalData.version
                //     });
                // });
            },
            // fail: function (codeerr) {
            //     getRequest.errlogPost("wx.login获取code", codeerr, {}, {
            //         methods: 'getTokenFun',
            //         version: app.globalData.version
            //     });
            // },
        });
    },
    //签署协议检查
    checkContract(uid) {
        const _this = this;
        getRequest
            .post("index/user/is_agree_sign", {
                uid: uid
            })
            .then(function (res) {
                if (res.data.is_agree_sign == 1) {
                    //已签署过-跳转首页
                    wx.switchTab({
                        url: "../index/index"
                    });
                } else {
                    //未签署过-显示协议确认弹窗
                    getRequest
                        .post("index/user/agreement", {
                            uid: uid
                        })
                        .then(function (list) {
                            try {
                                _this.setData({
                                    agreement: list.data,
                                    treatyshow: true,
                                });
                            } catch (error) {
                                // getRequest.errlogPost("协议列表赋值", error, {}, {
                                //     methods: 'checkContract',
                                //     version: app.globalData.version
                                // });
                                setTimeout(() => {
                                    _this.setData({
                                        agreement: list.data,
                                        treatyshow: true,
                                    });
                                }, 500);
                            }
                        })
                    // .catch(function (err) {
                    //     console.log(err);
                    //     getRequest.errlogPost("协议列表失败", err, {}, {
                    //         methods: 'checkContract',
                    //         version: app.globalData.version
                    //     });
                    // });
                }
            })
        // .catch(function (err) {
        //     getRequest.errlogPost("签署协议检查", err, {
        //         uid: uid
        //     }, {
        //         methods: 'checkContract',
        //         version: app.globalData.version
        //     });
        //     console.log(err);
        // });
    },
    //查看协议详情
    goContract(e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "../contract/contract?id=" + id,
        });
    },
    //拒绝签署协议
    cancelBtn() {
        this.setData({
            treatyshow: false
        });
    },
    //同意签署协议
    confirmBtn() {
        getRequest
            .post("index/user/agree_sign", {
                uid: app.globalData.userInfo.id
            })
            .then(function () {
                wx.switchTab({
                    url: "../index/index",
                });
            });
    },
    //获取手机号
    getPhoneNumber: function (e) {
        const _this = this;
        if (e.detail.iv) {
            let token = this.data.token;
            if (token == "") {
                wx.login({
                    success: function (wxlogin) {
                        getRequest
                            .post("index/user/login", {
                                code: wxlogin.code
                            })
                            .then(function (gettoken) {
                                token = gettoken.data.token;
                                _this.mobileLogin({
                                    token: token,
                                    iv: e.detail.iv,
                                    encryptedData: e.detail.encryptedData,
                                    nickName: _this.data.userinfo.nickName,
                                    avatar: _this.data.userinfo.avatarUrl,
                                    gender: "",
                                    fid: app.globalData.sharequery.f,
                                    user_id: '',
                                    invitee_uid: app.globalData.sharequery.u,
                                });
                            })
                        // .catch(function (tokenerr) {
                        //     getRequest.errlogPost("token获取", tokenerr, {
                        //         code: wxlogin.code,
                        //     }, {
                        //         methods: 'getPhoneNumber',
                        //         version: app.globalData.version
                        //     });
                        // });
                    },
                    // fail: function (codeerr) {
                    //     getRequest.errlogPost("wx.login获取code", codeerr, {}, {
                    //         methods: 'getPhoneNumber',
                    //         version: app.globalData.version
                    //     });
                    // },
                });
            } else {
                this.mobileLogin({
                    token: token,
                    iv: e.detail.iv,
                    encryptedData: e.detail.encryptedData,
                    nickName: _this.data.userinfo.nickName,
                    avatar: _this.data.userinfo.avatarUrl,
                    gender: "",
                    fid: app.globalData.sharequery.f,
                    user_id: '',
                    invitee_uid: app.globalData.sharequery.u,
                });
            }
        } else {
            // console.log(e);
            app.toastFun("手机号获取时发生系统错误，请重试");
        }
    },
    mobileLogin(postdata) {
        getRequest
            .noToastPost("index/user/getMobile", postdata)
            .then((info) => {
                app.globalData.token = info.data.token;
                app.globalData.userInfo = info.data;
                let logindata = {
                    mobile: info.data.mobile,
                    token: info.data.token,
                    id: info.data.id,
                };
                wx.setStorage({
                    key: "logindata",
                    data: logindata,
                });
                log.info(logindata);
                log.setFilterMsg('loginUserInfo');
                this.checkContract(info.data.id);
            })
            .catch((err) => {
                console.error("[mobileLogin]:", err);
                if (err.code == 208) {
                    /**
                     * 208错误
                     * 代表新客没有邀请进入需反向绑定邀请人
                     */
                    this.setData({
                        registerToast: true
                    })
                } else {
                    // getRequest.errlogPost("手机号登录", err, postdata, {
                    //     methods: 'mobileLogin',
                    //     version: app.globalData.version
                    // });
                    wx.showModal({
                        title: '提示',
                        content: err.msg,
                        showCancel: false,
                        success: (res) => {
                            this.getTokenFun();
                        }
                    })
                }
            });
    },
    //获取微信头像
    // getUserInfo: function (e) {
    //     const livePlayer = requirePlugin("live-player-plugin");
    //     livePlayer
    //         .getShareParams()
    //         .then((res) => {
    //             console.log('[getUserInfo]从直播进入获取到分享卡片的入口', res);
    //             if (res.custom_params.f) {
    //                 app.globalData.sharequery.f = res.custom_params.f;
    //                 app.globalData.sharequery.u = res.custom_params.u;
    //             }
    //         })
    //         .catch(() => {});
    //     wx.getUserProfile({
    //         desc: "用于完善资料",
    //         success: (res) => {
    //             this.setData({
    //                 btnType: 1,
    //                 userinfo: res.userInfo,
    //                 tips: "获得你的手机号码",
    //             });
    //         },
    //     });
    // },
    /**
     * 顾客绑定美容注册相关 
     */
    //隐藏弹窗
    closeToast: function (e) {
        const {
            detail
        } = e
        this.setData({
            [detail]: false,
        })
    },
    registerOnChange(e) {
        this.setData({
            registerValue: e.detail
        })
    },
    confirmBind() {
        const {
            registerValue: mobile
        } = this.data;
        getRequest
            .noToastPost("index/user/get_seller_id", {
                mobile
            })
            .then(res => {
                if (res.code == 200) {
                    app.globalData.sharequery.f = res.data.id;
                    app.globalData.sharequery.u = res.data.id;
                    this.setData({
                        registerToast: false
                    })
                    app.toastFun('绑定成功,请登录');
                }
            }).catch(res => {
                app.toastFun(res.msg);
            })
    }
});