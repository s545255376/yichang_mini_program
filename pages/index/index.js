const app = getApp()
const cartNum = require('../../utils/cartNum.js')
const Font = require('../../utils/getFont')
const getRequest = require('../../utils/getRequest')
// const getLiveStatusFun = require('../../utils/getLiveStatusFun.js')
import {
    Queue,
    //liveHomeDate,
    objType
} from '../../utils/util.js'
const queryPop = new Queue() //弹窗队列
var locationType = 0,
    locationScroll = true,
    locationSettime = ''
Page({
    data: {
        errorShow: false,
        statusBarHeight: 0,
        pageShow: false,
        windowHeight: 0,
        banner: [],
        indicatorDots: false, //指示点
        currentIndex: 0,
        bannerleft: 100,
        // autoplay: true,//自动播放
        // interval: 5000,//自动播放间隔时长
        // duration: 500,//幻灯片切换时长

        list: [],
        jxlist: [],
        couponToast: true,
        coupons: [],
        couponbtn: true,
        introimg: '',
        showCard: 0,
        notice: {
            wholewidth: 0,
            width: 0,
            left: 0,
            marginleft: 0,
            info: '',
        },
        noticeTimer: '',
        cartNum: 0,

        getCateTimer: '',
        locationShow: false, //定位到顶部固定
        locationNum: 0,
        pageScroll: true, //是否允许页面滑动
        scrollLeft: '', //顶部跳转标签横向滚动位置

        liveBroadcast: false, //直播显示
        liveInfo: {}, //直播详情
        liveInterval: '', //直播轮训

        disttoparr: [],

        grouponShow: {}, //盲盒团购信息
        grouponToast: false,

        getQuestionnaire: {},
        questionnaireToast: false, //调查问卷
        questunloadimg: [],
        tiankong: '',
        duoxuan1: [],
        duoxuan2: [],
    },
    onLoad(options) {
        // console.log(options);
        // console.log(this.data.showCard)
        console.log(app.globalData.sharequery.c)
        this.setData({ showCard: app.globalData.sharequery.c ? 1 : 0  })
        if(options.pay == 'success') {
            
        }
        wx.hideShareMenu()
        if (app.globalData.userInfo.id == '') {
            wx.reLaunch({
                url: '../login/login',
            })
        } else {
            this.showLoad()
            this.dealpopQuery() //处理弹窗、活动等相关信息统一汇总

            //获取定位位置
            this.data.getCateTimer = setInterval(() => {
                if (locationType == 0) {
                    this.getCateTop()
                } else {
                    clearInterval(this.data.getCateTimer)
                }
            }, 500)

            //加载字体
            if (app.globalData.loadFont == false) {
                Font.get()
                    .then(() => {
                        this.setData({
                            pageShow: true,
                            currentIndex: 0,
                        })
                    })
                    .catch((err) => {
                        console.log('加载字体失败' + err)
                        this.setData({
                            pageShow: false,
                            currentIndex: 0,
                        })
                    })
            } else {
                this.setData({
                    pageShow: true,
                    currentIndex: 0,
                })
            }
        }
    },
    onShow() {
        wx.setStorageSync('intomyxprevpage', 'index')

        clearInterval(this.data.liveInterval)
        if (app.router.orderid != '') {
            //跳转订单详情
            wx.navigateTo({
                url: '../order/detail/detail?order_id=' + app.router.orderid,
            })
        } else if (app.globalData.sharequery.t == 'm') {
            //新拼团盲盒
            wx.navigateTo({
                url: `../../groupon/pages/tuaninfo/tuaninfo?pd_oid=${app.globalData.sharequery.npdoid}`,
            })
        } else if (app.globalData.sharequery.t == 'e') {
            //跳转文章详情
            wx.navigateTo({
                url: '../skin/detail/detail?aid=' +
                    app.globalData.sharequery.eid,
            })
        } else if (app.globalData.sharequery.t == 'g') {
            //跳转商品详情
            getRequest
                .noToastPost('index/goods/info', {
                    goods_id: app.globalData.sharequery.gid,
                    store_id: app.globalData.userInfo.store_id,
                    u_id: app.globalData.userInfo.id,
                })
                .then((res) => {
                    if (res.data.can_buy == 1) {
                        let link = ''
                        if (app.globalData.sharequery.pdoid) {
                            link =
                                '&pd_oid=' +
                                app.globalData.sharequery.pdoid +
                                '&pdjnum=' +
                                app.globalData.sharequery.pdjnum
                        }
                        if (
                            app.globalData.sharequery.hasOwnProperty(
                                'npdoid'
                            ) &&
                            app.globalData.sharequery.npdoid
                        ) {
                            link = `&pd_oid=${app.globalData.sharequery.npdoid}`
                        }
                        wx.navigateTo({
                            url: '../goodsdetail/goodsdetail?goods_id=' +
                                app.globalData.sharequery.gid +
                                '&live=' +
                                (app.globalData.sharequery.l ?
                                    app.globalData.sharequery.l :
                                    false) +
                                link,
                        })
                    } else {
                        app.toastFun('该商品已下架')
                        app.clearShareQuery()
                        app.router.giveCheckList = []
                        app.router.giveChecked = []
                    }
                })
                .catch(function (err) {
                    app.clearShareQuery()
                    app.router.giveCheckList = []
                    app.router.giveChecked = []
                    setTimeout(() => {
                        app.toastFun(err.msg)
                    }, 500)
                })
            // wx.navigateTo({
            //   url: '../goodsdetail/goodsdetail?goods_id='+app.globalData.sharequery.gid+'&live='+(app.globalData.sharequery.l?app.globalData.sharequery.l:false),
            // })
        } else if (app.globalData.sharequery.t == 'xm') {
            //小美优惠券领取激活
            this.xmCoupons()
        } else if (app.globalData.sharequery.t == 'l') {
            //直播列表
            wx.switchTab({
                url: '../livelist/livelist',
            })
        } else if (app.globalData.sharequery.t == 'pl') {
            //美容师分享特殊直播间给顾客
            // console.log(app.globalData.sharequery, '从这里进入活动页');
            wx.navigateTo({
                url: `../poster/huodong20220614`,
            })
        } else if (app.globalData.sharequery.t == 'j') {
            //基因检测
            // console.log('进入了基因检测的index入口')
            wx.navigateTo({
                url: `/genetest/pages/index/index`,
            })
        } else {
            //不跳转
            wx.showShareMenu()
        }
    },
    dealpopQuery() {
        //优惠券弹窗
        const _promise_coupon = new Promise((resolve) => {
            getRequest
                .noToastPost('index/coupons/regCoupon', {
                    uid: app.globalData.userInfo.id,
                    token: app.globalData.token,
                    role_id: app.globalData.userInfo.role_id,
                })
                .then((res) => {
                    //每天弹出1次
                    const _coupondate = wx.getStorageSync('coupondate')
                    if (_coupondate) {
                        if (parseInt(_coupondate) < new Date().getTime()) {
                            wx.setStorage({
                                key: 'coupondate',
                                data: new Date().getTime() + 60 * 60 * 24 * 1000,
                            })
                            this.setData({
                                coupons: res.data,
                            })
                            queryPop.enqueue('couponToast')
                        }
                    } else {
                        queryPop.enqueue('couponToast')
                        this.setData({
                            coupons: res.data,
                        })
                        wx.setStorage({
                            key: 'coupondate',
                            data: new Date().getTime() + 60 * 60 * 24 * 1000,
                        })
                    }
                })
                .catch(function () {})
                .finally(() => {
                    resolve()
                })
        })

        //盲盒弹窗
        //图片 tc 弹出  rk 入口  fb 浮标  fx 分享
        const _promise_groupon = new Promise((resolve) => {
            getRequest
                .post('/index/collage/collageInfo', {}, true)
                .then((res) => {
                    if (res.code == 200) {
                        queryPop.enqueue('grouponToast')
                        this.setData({
                            grouponShow: res.data,
                        })
                    }
                })
                .finally(() => {
                    resolve()
                })
        })


        //问卷调查
        const _promise_questionnaireFlag = new Promise((resolve) => {
            getRequest
                .noToastPost('/index/coupons/questionnaireFlag', {
                    uid: app.globalData.userInfo.id
                })
                .then((res) => {
                    if (res.code == 200) {
                        this.getQuestionnaireInfo(1).then(() => {
                            queryPop.unshiftqueue('questionnaireToast')
                            resolve()
                        })
                    }
                }).catch(err => {
                    resolve();
                })
        })
        Promise.all([_promise_questionnaireFlag, _promise_coupon, _promise_groupon]).then(() => {
            /**
             * 按照栈先进先出的原则设置
             */
            if (!queryPop.isEmpty()) {
                this.popToast()
            }
        })
    },
    //展示弹窗
    popToast() {
        const showFirst = queryPop.toOriginal()[0]
        this.setData({
            [showFirst]: true,
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
        queryPop.dequeue()
        if (!queryPop.isEmpty()) {
            this.popToast()
        }
    },
    onHide() {
        let _this = this
        //this.returnTop();
        this.setData({
            locationNum: 0,
        })
        clearInterval(_this.data.noticeTimer)
        clearInterval(_this.data.getCateTimer)
    },
    onUnload() {
        let _this = this
        queryPop.clear();
        clearInterval(_this.data.noticeTimer)
        clearInterval(_this.data.getCateTimer)
    },
    //跳转公告详情
    goNotice(e) {
        wx.navigateTo({
            url: '../message/detail/detail?type=1&id=' +
                e.currentTarget.dataset.id,
        })
    },
    //跳转二级页面
    goLevelTwoPage(e) {
        let position = e.currentTarget.dataset.position,
            idx = e.currentTarget.dataset.idx
        if (position == 1) {
            app.globalData.levelTwoList = this.data.list[idx]
            wx.navigateTo({
                url: '../goodsgroup/goodsgroup',
            })
        }
    },
    //获取定位距离顶部距离
    getCateTop() {
        let query = wx.createSelectorQuery()
        query
            .select('#locationStay')
            .boundingClientRect(function (rect) {
                if (rect) {
                    locationType = rect.top + 20
                }
            })
            .exec()
    },
    //首页定位滚动
    goCate(e) {
        if (locationSettime == '') {
            let idx = e.currentTarget.dataset.idx
            locationScroll = false
            this.setData({
                locationNum: idx,
                locationShow: true,
            })
            wx.pageScrollTo({
                selector: '#homeGoods-' + idx,
                duration: 300,
            })
        } else {
            app.toastFun('操作频繁')
        }
    },
    noScroll() {},
    //滑动显示底部按钮
    onPageScroll: function (e) {
        if (locationScroll == false) {
            if (locationSettime == '') {
                setTimeout(() => {
                    locationScroll = true
                    locationSettime = ''
                }, 500)
            }
            locationSettime = 'setTimeout'
        } else {
            let _this = this,
                locationNum = this.data.locationNum,
                scrollTop = e.scrollTop
            if (locationType < scrollTop) {
                this.data.list.forEach(function (info, idx) {
                    if (
                        idx == _this.data.list.length - 1 &&
                        info.disttop <= scrollTop
                    ) {
                        if (info.title != '' || info.subtitle != '') {
                            locationNum = idx
                        }
                    } else if (
                        info.disttop <= scrollTop &&
                        scrollTop < _this.data.list[idx + 1].disttop
                    ) {
                        if (info.title != '' || info.subtitle != '') {
                            locationNum = idx
                        }
                    }
                })

                let query = wx.createSelectorQuery()
                query
                    .select('.location_click')
                    .boundingClientRect(function (rect) {
                        if (rect) {
                            if (
                                app.globalData.system.windowWidth <
                                rect.width + rect.left
                            ) {
                                _this.setData({
                                    scrollLeft: rect.width +
                                        rect.left -
                                        app.globalData.system.windowWidth +
                                        28,
                                })
                            } else if (rect.left < 50) {
                                _this.setData({
                                    scrollLeft: 0,
                                })
                            }
                        }
                    })
                    .exec()

                this.setData({
                    locationShow: true,
                    locationNum: locationNum,
                })
            } else {
                this.setData({
                    locationShow: false,
                })
            }
        }
    },
    //返回页面顶部
    returnTop() {
        wx.pageScrollTo({
            selector: '.banner',
            duration: 300
        })
    },
    navigate() {
        wx.openLocation({
            latitude: 30.002340, // 纬度，范围为-90~90，负数表示南纬
            longitude: 120.577102, // 经度，范围为-180~180，负数表示西经
            scale: 30, // 缩放比例
            name:"夷畅茶馆",
            address:"地址：浙江省绍兴市越城区城市广场27号，近仓桥直街"
          })
    },
    //小美优惠券领取激活
    xmCoupons() {
        if (app.globalData.sharequery.xmid) {
            //小美券
            // 0 激活券 1 直送券
            let postdata = {
                mobile: app.globalData.userInfo.mobile,
                uid: app.globalData.userInfo.id,
                card_id: app.globalData.sharequery.xmid,
            }
            if (app.globalData.sharequery.xmtype == 0) {
                getRequest
                    .noToastPost(
                        'index/coupons/userActivationXmMarket',
                        postdata
                    )
                    .then(function (res) {
                        app.globalData.sharequery.t = ''
                        app.toastFun(res.msg)
                    })
                    .catch(function (err) {
                        console.log(err)
                        app.globalData.sharequery.t = ''
                    })
            } else if (app.globalData.sharequery.xmtype == 1) {
                getRequest
                    .noToastPost('index/coupons/userReceiveXmMarket', postdata)
                    .then(function (res) {
                        app.globalData.sharequery.t = ''
                        app.toastFun(res.msg)
                    })
                    .catch(function (err) {
                        console.log(err)
                        app.globalData.sharequery.t = ''
                    })
            }
        } else {
            //普通券全激活
            if (app.globalData.sharequery.xmtype == 0) {
                getRequest
                    .noToastPost('index/coupons/userActivationMarket', {
                        uid: app.globalData.userInfo.id,
                    })
                    .then(function (res) {
                        // console.log(res)
                        app.globalData.sharequery.t = ''
                        app.toastFun(res.msg)
                    })
                    .catch(function (err) {
                        console.log(err)
                        app.globalData.sharequery.t = ''
                    })
            } else {
                getRequest
                    .noToastPost('index/attendance/substituteMealAttendance', {
                        uid: app.globalData.userInfo.id,
                        flag: 'substitute_meal'
                    })
                    .then(function (res) {
                        // console.log(res)
                        app.globalData.sharequery.t = ''
                        wx.showModal({
                            title: '提示',
                            content: res.msg,
                            showCancel: false
                        })
                    })
                    .catch(function (err) {
                        console.log(err)
                        wx.showModal({
                            title: '提示',
                            content: err.msg,
                            showCancel: false
                        })
                        app.globalData.sharequery.t = ''
                    })
            }

        }
        delete app.globalData.sharequery.xmid
    },
    //获取首页更新信息
    showLoad() {
        wx.showLoading({
            title: '加载中'
        })
        const _getSwiperList = this.getSwiperList()
        const _getGoodsList = this.getGoodsList()
        const _getLive = this.getLive() //获取当前直播状态
        const _getCartNum = this.getCartNum() //获取购物车内容
        const _getNotice = this.getNotice() //获取公告列表
        const _getJxGoodsList = this.getJxGoodsList() //获取swiper匠选商品
        Promise.all([
            _getSwiperList,
            _getGoodsList,
            _getLive,
            _getCartNum,
            _getNotice,
            _getJxGoodsList,
        ]).then(() => {
            wx.hideLoading()
        })
    },
    //获取首页固定信息
    getSwiperList() {
        const _this = this
        //获取banner
        return new Promise((resolve, reject) => {
            getRequest
                .post('index/index/swiper', {}, true)
                .then(function (res) {
                    let bannerleft = 100 / res.data.length
                    _this.setData({
                        banner: res.data,
                        bannerleft: bannerleft,
                        statusBarHeight: app.globalData.system.statusBarHeight + 13.5,
                    })
                })
                .catch(function (err) {
                    console.log(err)
                })
                .finally(() => {
                    resolve()
                })
        })
        // //获取底部说明图片
        // getRequest.post('index/index/quality', {}).then(function(res){
        //   _this.setData({introimg:res.data.url})
        // }).catch(function(err){console.log(err);})
    },
    //获取购物车内商品数量
    getCartNum() {
        const _this = this
        return new Promise((resolve, reject) => {
            cartNum
                .sum()
                .then(function (res) {
                    _this.setData({
                        cartNum: res.data.cart_count,
                    })
                })
                .catch()
                .finally(() => {
                    resolve()
                })
        })
    },
    //获取商品列表
    getGoodsList() {
        return new Promise((resolve, reject) => {
            getRequest
                .post(
                    'index/index/goods', {
                        store_id: app.globalData.userInfo.store_id,
                        role_id: app.globalData.userInfo.role_id,
                        u_id: app.globalData.userInfo.id,
                    },
                    true
                )
                .then((res) => {
                    let query = wx.createSelectorQuery()
                    res.data.forEach((e, idx) => {
                        e.subtitle = e.subtitle ? e.subtitle.toUpperCase() : ''
                        e.disttop = ''
                        this.setData({
                                ['list[' + idx + ']']: e,
                                pageScroll: false,
                            },
                            () => {
                                query
                                    .select('#homeGoods-' + idx)
                                    .boundingClientRect(function (rect) {
                                        if (rect) {
                                            e.disttop = rect.top
                                        }
                                    })
                                    .exec()
                                this.setData({
                                    ['list[' + idx + ']']: e,
                                    pageScroll: true,
                                })
                            }
                        )
                        // //获取各个分类的位置定位
                        // setTimeout(() => {
                        //   query.select('#homeGoods-'+idx).boundingClientRect(function(rect) {
                        //     if(rect){e.disttop = rect.top;}
                        //   }).exec();
                        //   _this.setData({['list['+idx+']']:e,pageScroll:true})
                        //   wx.hideLoading()
                        // }, 500);
                    })
                    this.setData({
                        errorShow: false,
                    })
                })
                .catch((err) => {
                    console.log(err)
                    this.setData({
                        errorShow: true,
                    })
                })
                .finally(() => {
                    resolve()
                })
        })
    },
    getJxGoodsList() {
        const _this = this
        //获取匠选商品
        return new Promise((resolve, reject) => {
            getRequest
                .post(
                    'index/index/getJxGoodsList', {
                        store_id: app.globalData.userInfo.store_id,
                        role_id: app.globalData.userInfo.role_id,
                        u_id: app.globalData.userInfo.id,
                    },
                    true
                )
                .then((res) => {
                    _this.setData({
                        jxlist: res.data,
                    })
                })
                .catch((err) => {
                    console.log(err)
                })
                .finally(() => {
                    resolve()
                })
        })
    },
    getNotice() {
        const _this = this
        //公告列表
        return new Promise((resolve, reject) => {
            getRequest
                .post(
                    'index/notice/list', {
                        token: app.globalData.token,
                        uid: app.globalData.userInfo.id,
                        store_id: app.globalData.userInfo.store_id,
                    },
                    true
                )
                .then(function (res) {
                    app.globalData.noticeList = res.data
                    let info = []
                    res.data.forEach(function (e) {
                        if (e.type == 0) {
                            info.push(e)
                        }
                    })
                    _this.data.notice.info = info
                    _this.setData({
                        notice: _this.data.notice,
                    })
                    if (info.length != 0) {
                        let query = wx.createSelectorQuery()
                        query
                            .select('.notice_msg')
                            .boundingClientRect(function (rect) {
                                _this.data.notice.width = rect.width
                                _this.data.notice.marginleft = rect.left
                            })
                            .exec()
                        query
                            .select('.notice_part .info')
                            .boundingClientRect(function (rect) {
                                _this.data.notice.left = 0
                                _this.data.notice.wholewidth = rect.width
                            })
                            .exec()

                        //公告滚动
                        if (app.globalData.noticeList.length != 0) {
                            _this.data.noticeTimer = setInterval(() => {
                                let noticeWidth = _this.data.notice.width,
                                    noticeLeft = _this.data.notice.left
                                if (-noticeLeft < noticeWidth) {
                                    noticeLeft -= 1
                                } else {
                                    noticeLeft = _this.data.notice.wholewidth
                                }
                                _this.data.notice.left = noticeLeft
                                _this.setData({
                                    notice: _this.data.notice,
                                })
                            }, 50)
                        }
                    }
                })
                .catch(function (err) {
                    _this.setData({
                        loadState: false,
                    })
                })
                .finally(() => {
                    resolve()
                })
        })
    },
    getLive() {
        const _this = this
        //查询直播
        let level_id = app.globalData.userInfo.level_id
        let role_id =
            level_id == 1 || level_id == 2 ?
            1 :
            level_id == 3 ?
            4 :
            level_id == 4 ?
            2 :
            3
        return new Promise((resolve, reject) => {
            getRequest
                .noToastPost('index/live/notice', {
                    uid: app.globalData.userInfo.id,
                    token: app.globalData.token,
                    role_id: role_id,
                })
                .then(function (res) {
                    if (objType(res.data) == 'object') {
                        res.data['date'] = liveHomeDate(
                            new Date(res.data.start_time * 1000)
                        )
                        _this.setData({
                            liveInfo: res.data,
                            liveBroadcast: true,
                        })
                    }
                })
                .catch(function (err) {
                    _this.setData({
                        liveBroadcast: false,
                    })
                })
                .finally(() => {
                    resolve()
                })
        })
    },
    //轮播图监听
    swiperChange: function (e) {
        let bannerleft =
            (100 / this.data.banner.length) * (e.detail.current + 1)
        this.setData({
            bannerleft: bannerleft,
        })
    },
    //轮播跳转
    bannerClick: function (e) {
        let num = e.target.dataset.imgnum
        if (
            this.data.banner[num].is_jump == 1 &&
            this.data.banner[num].url != ''
        ) {
            wx.navigateTo({
                url: '../../' + this.data.banner[num].url,
            })
        } else if (
            this.data.banner[num].is_jump == 2 &&
            this.data.banner[num].url != ''
        ) {
            wx.navigateToMiniProgram({
                appId: this.data.banner[num].url,
                fail(res) {
                    app.toastFun('跳转失败')
                },
            })
        }
    },
    //获取调查问卷列表
    getQuestionnaireInfo(qid) {
        return new Promise((resolve, reject) => {
            getRequest
                .noToastPost('/index/questionnaire/info', {
                    uid: app.globalData.userInfo.id,
                    qid
                })
                .then(res => {
                    // console.log(res, '4444444444');
                    if (res.code == 200) {
                        this.setData({
                            getQuestionnaire: res.data
                        })
                        resolve();
                    }
                })
        })
    },
    onChange(e) {
        this.setData({
            [e.currentTarget.dataset.name]: e.detail
        })
    },
    //上传图片
    uploadImg: function () {
        const questunloadimg = this.data.questunloadimg;
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            success: (info) => {
                if (info.tempFiles.length > 0) {
                    const tempFilePaths = info.tempFiles[0].tempFilePath;
                    wx.uploadFile({
                        url: app.globalData.url + 'index/base/upload',
                        filePath: tempFilePaths,
                        name: 'file',
                        formData: {
                            'file': tempFilePaths
                        },
                        success: (res) => {
                            const json = JSON.parse(res.data);
                            if (json.code == 200) {
                                questunloadimg.push({
                                    img: tempFilePaths,
                                    url: json.data.url
                                });
                                this.setData({
                                    questunloadimg
                                })
                            } else {
                                app.toastFun(json.msg);
                            }
                        }
                    })
                }
            }
        })
    },
    //删除图片
    delImg: function (e) {
        let idx = e.currentTarget.dataset.idx,
            questunloadimg = this.data.questunloadimg;
        questunloadimg.splice(idx, 1);
        this.setData({
            questunloadimg: questunloadimg
        })
    },
    confirmQuestion() {
        // console.log(this.data);
        const {
            questunloadimg,
            duoxuan1,
            duoxuan2,
            tiankong
        } = this.data;

        if (questunloadimg.length == 0 || duoxuan1.length == 0 || duoxuan2.length == 0 || !tiankong) {
            app.toastFun('请尽量选择完善');
            return
        }

        const option = [{
            s_id: 1,
            answer: duoxuan1.join(',')
        }, {
            s_id: 2,
            answer: duoxuan2.join(',')
        }, {
            s_id: 3,
            answer: tiankong
        }, {
            s_id: 4,
            answer: questunloadimg[0].url
        }];
        getRequest
            .post('/index/questionnaire/questionnaire', {
                uid: app.globalData.userInfo.id,
                qid: 1,
                option
            })
            .then(res => {
                if (res.code == 200) {
                    app.toastFun('感谢您的参与');
                    this.closeToast({
                        detail: 'questionnaireToast'
                    })
                }
            })
    },
    //领取电子卡
    getCard: function () {
        let _this = this
        if (this.data.couponbtn == true) {
        //     let _this = this,
        //         coupons = this.data.coupons,
        //         id = []
        //     coupons.forEach(function (e) {
        //         id.push(e.id)
        //     })
        getRequest
            .post(
                'index/Account/acceptCard', {
                    card_id: app.globalData.sharequery.c,
                    // card_id: 7,
                    token: app.globalData.token,
                },
                true
            )
            .then(function (res) {
                app.toastFun('电子卡领取成功')
                _this.setData({
                    couponbtn: false,
                })
                app.globalData.sharequery.c = ''
                wx.navigateTo({
                    url: '../coupon/coupon',
                })
            })
            .catch(function (err) {
                app.toastFun(err.msg)
            })
        } else {
            _this.closeToast({
                detail: 'couponToast'
            })
            wx.navigateTo({
                url: '../coupon/coupon',
            })
        }
    },
    //肌肤研究院
    goEssay(e) {
        wx.navigateTo({
            url: '../skin/index/index?pid=' + e.currentTarget.dataset.pid,
        })
    },
    //商品详情
    goGoodsInfo(e) {
        // console.log(e.currentTarget.dataset)
        wx.navigateTo({
            url: `../goodsdetail/goodsdetail?goods_id=${e.currentTarget.dataset.goodsid}&live=false&location_num=${this.data.locationNum}&pre=index`,
        })
    },
    goGroupon() {
        wx.navigateTo({
          url: '../balance/fellow/fellow',
        })
    },
    //跳转购物车
    goCart() {
        wx.navigateTo({
            url: '../cart/cart',
        })
    },
    //查看更多商品
    showMoreList(e) {
        let idx = e.currentTarget.dataset.index
        this.data.list[idx].showAll =
            this.data.list[idx].showAll == undefined ||
            this.data.list[idx].showAll == 'none' ||
            this.data.list[idx].showAll == false ?
            true :
            false

        this.setData({
            list: this.data.list,
        })
    },
    //跳转直播
    goLive() {

        const {
            userInfo
        } = app.globalData
        const {
            f
        } = app.globalData.sharequery;
        const roomid = this.data.liveInfo.roomid,
            live_status = this.data.liveInfo.live_status,
            param = encodeURIComponent(
                JSON.stringify({
                    f: userInfo.pid,
                    u: userInfo.id,
                })
            )

        getRequest.noToastPost('index/live/operator_log', {
            uid: userInfo.id,
            store_id: userInfo.store_id,
            room_id: roomid,
            share_uid: f,
            type: 1
        }).then(res => {
            if (res.code == 200) {
                //修改直播间状态
                getLiveStatusFun.get(roomid, live_status)
                // 往后间隔5分钟或更慢的频率去轮询获取直播状态
                this.data.liveInterval = setInterval(() => {
                    // console.log(roomid)
                    getLiveStatusFun.get(roomid, live_status)
                }, 60000)

                wx.navigateTo({
                    url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}&open_share_ticket=1&custom_params=${param}`,
                })
            }
        })


    },
    //分享
    onShareAppMessage: function () {
        return {
            title: '夷畅-助力中小企业，保护优质产品',
            imageUrl: 'http://images.lexuanhui.online/pl_pic/ad.jpg',
            path: 'pages/login/login?u=' +
                app.globalData.userInfo.id +
                '&f=' +
                app.globalData.userInfo.pid +
                '&t=h',
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        this.showLoad()
        wx.stopPullDownRefresh()
    },
})