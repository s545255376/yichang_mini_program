// pages/poster/huodong20220614.js
const app = getApp()
const getRequest = require('../../utils/getRequest')
// const getLiveStatusFun = require('../../utils/getLiveStatusFun.js');
Page({
    data: {
        screenHeight: wx.getSystemInfoSync().windowHeight,
        roomid: null,
        password: '',
        passwordToast: false,
        isClose: false,
        liveData: {},
        needGetDot: false,
        needPassword: false
    },
    activeEnter() {
        const {
            needGetDot,
            needPassword
        } = this.data;

        if (needGetDot) {
            if (needPassword) {
                this.setData({
                    passwordToast: true
                })
            } else {
                this.getDotEnter();
            }
        } else {
            //非顾客用户直接进入直播间
            this.getDotEnter();
        }
    },
    getDotEnter() {
        const {
            userInfo
        } = app.globalData
        const {
            f
        } = app.globalData.sharequery;
        const {
            roomid
        } = this.data;

        getRequest.noToastPost('index/live/operator_log', {
            uid: userInfo.id,
            store_id: userInfo.store_id,
            room_id: roomid,
            share_uid: f,
            type: 1
        }).then(res => {
            if (res.code == 200) {
                this.intoRoom();
            }
        })
    },
    intoRoom() {
        const {
            roomid,
            liveData
        } = this.data;
        const param = encodeURIComponent(JSON.stringify({
            f: app.globalData.userInfo.pid,
            u: app.globalData.userInfo.id
        }));
        getLiveStatusFun.get(roomid, liveData.live_status);
        let postdata = {
            uid: app.globalData.userInfo.id,
            room_id: roomid,
            token: app.globalData.token
        }
        getRequest.noToastPost('index/live/roomLog', postdata);
        wx.navigateTo({
            url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}&open_share_ticket=1&custom_params=${param}`
        })
    },
    //隐藏弹窗
    closeToast: function (e) {
        const {
            detail
        } = e
        this.setData({
            [detail]: false,
        })
    },
    passwordOnChange(e) {
        this.setData({
            password: e.detail
        })
    },
    confirmCheck() {
        const {
            password,
            roomid
        } = this.data;
        const {
            userInfo
        } = app.globalData
        // 验证直播间密码
        console.log({
            uid: userInfo.id,
            store_id: userInfo.store_id,
            room_id: roomid,
            password
        }, '直播间密码接口传参')
        getRequest.post('/index/live/password', {
            uid: userInfo.id,
            store_id: userInfo.store_id,
            room_id: roomid,
            password
        }).then(res => {
            if (res.code == 200) {
                this.getDotEnter();
            }
        })
        // .catch(res => {
        //     getRequest.errlogPost("直播海报输入密码错误", res, {
        //         uid: userInfo.id,
        //         store_id: userInfo.store_id,
        //         room_id: roomid,
        //         password,
        //         mobile: app.globalData.userInfo.mobile
        //     }, {
        //         methods: 'confirmCheck',
        //         version: app.globalData.version
        //     });
        // })
    },
    onLoad() {
        const {
            roomid,
            f
        } = app.globalData.sharequery;
        const {
            userInfo
        } = app.globalData

        //顾客需要记录打开次数
        const needGetDot = userInfo.level_id == 3 || userInfo.level_id == 5 || userInfo.level_id == 6 ? true : false;
        this.setData({
            roomid,
            needGetDot
        })

        getRequest.noToastPost('index/live/lists', {
            uid: userInfo.id,
            role_id: (userInfo.level_id == 1 || userInfo.level_id == 2) ? 1 : userInfo.level_id == 3 ? 4 : userInfo.level_id == 4 ? 2 : 3, //是 	int 	用户角色 1店老板 2美容师 3顾客 4匠选官
            type: 1,
            token: app.globalData.token,
            room_id: roomid
        }).then(res => {
            console.log(res);
            if (res.code == 200 && res.data.total > 0) {
                this.setData({
                    liveData: res.data.data[0],
                    needPassword: res.data.data[0].need_password == 1
                })

                //当直播间是需要密码的直播间并且身份是顾客的时候 打点记录打开次数一次
                needGetDot ? getRequest.noToastPost('index/live/operator_log', {
                    uid: userInfo.id,
                    store_id: userInfo.store_id,
                    room_id: roomid,
                    share_uid: f,
                    type: 0
                }) : '';
            } else {
                this.setData({
                    isClose: true
                })
            }
        }).finally(() => {
            app.clearShareQuery();
        })
    }
})