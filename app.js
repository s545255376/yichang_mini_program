// let livePlayer = requirePlugin('live-player-plugin')

//app.json
// "plugins": {
//     "live-player-plugin": {
//         "version": "1.3.4",
//         "provider": "wx2b03c6e691cd7370"
//     }
// },
App({
    onLaunch: function () {
        const _this = this
        wx.hideShareMenu()

        this.getNewVersion() //获取版本更新
        //设备基本信息
        wx.getSystemInfo({
            success: (res) => {
                _this.globalData.system = res
                _this.globalData.system.system = res.system.toLowerCase()
                // 视窗高度 顶部有占位栏时
                _this.globalData.system.winHeight =
                    res.screenHeight - res.statusBarHeight - 12 - 32
                _this.globalData.system.needAdapt = res.safeArea.top >= 44 || res.safeArea.top <= 50 ? true : false;
            }
        })
        // if (wx.cloud) {
        //     wx.cloud.init()
        // }
    },
    globalData: {
        examineStr: '20221008',
        url: 'https://cmjx.chengmeijiangxuan.com/', //正式
        // url: 'https://cmjxtest.shqlts.com/',//测试
        //url: 'http://192.168.7.68:4411/', //本地
        token: '',
        icloading: false, //仪器云链接状态
        sharequery: {
            f: '',
            u: '',
        }, //从分享进小程序所带的参数
        /**
         * 小程序内的分享，包括生成的二维码
         * u:自己的id
         * f:上级美容师id
         * t:分享类型 一般从哪个页面分享出来这里有特定的标识比如 g:商品详情页 xm:小美分享页 h:首页/活动页等 l:直播间列表 e:肌肤研究所 eid:进入肌肤研究所页面时同时会有这个id
         * gid:商品id
         * xmtype、xmid 从小美页面分享时特定的参数， 这时上面的t=xm
         * pdoid、pdjnum 和拼单相关的参数 老拼团
         * npdoid 新拼团
         *
         * 如果是扫直播间二维码进入的这里会有一套好几个和直播间相关的参数，参数解释在pages/goodsdetail页面@function onLoad 方法的option形参
         *
         */
        version: wx.getAccountInfoSync().miniProgram.version,
        system: {
            windowHeight: 0,
            windowWidth: 0,
            model: '',
            SDKVersion: '',
            statusBarHeight: '',
            // padding-bottom:env(safe-area-inset-bottom);
            needAdapt: false,
            system: '',
        }, //手机型号、屏幕尺寸等信息
        userInfo: {
            mobile: '',
            username: '',
            portrait: '',
            sex: '',
            stauts: '',
            fid: '',
            id: '',
            store_id: '',
            role_id: '',
        }, //用户信息
        loadFont: false, //字体下载判断
        subscribe: [], //模版id
        noticeList: '', //公告列表
        feedBackDetail: {
            content: '',
            create_time: '',
            image: [],
        }, //意见反馈存储详情
        levelTwoList: {}, //商品二级页面(商品分类页面)列表信息
    },
    instrument: {
        //仪器相关信息
        login: '',
        devmac: '',
        userInfo: {
            add_time: '',
            age: '',
            id: '',
            information: 0,
            instrument_list: [],
            phone: '',
            sex: '',
            skin_type: '',
            user_name: '',
        },
        result: {
            moisture: '',
            youfen: '',
            tanxing: '',
        },
    },
    //路由缓存
    router: {
        orderid: '',
        timeInterval: '',
        giveList: [],
        giveChecked: [],
        suit_sku_ids: {},
        cache_groupon: {},
    },
    //清除分享携带信息缓存
    clearShareQuery(global = false, param = '') {
        if (!global) {
            const {
                f = '', u = ''
            } = this.globalData.sharequery
            this.globalData.sharequery = {
                f,
                u,
            }
        } else {
            delete this.globalData.sharequery[param]
        }
    },
    //提示弹窗
    toastFun(info) {
        wx.showToast({
            title: info,
            icon: 'none',
        })
    },
    //版本检查
    getNewVersion() {
        // 检测自动更新
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调 console.log(res.hasUpdate)
        })
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                },
            })
        })
        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
                title: '更新提示',
                content: '新版本下载失败',
                showCancel: false,
            })
        })
    },
})