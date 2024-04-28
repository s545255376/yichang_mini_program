const app = getApp()
const compareVersion = require('../../utils/compareVersion.js')
const cartNum = require('../../utils/cartNum.js')
const Font = require('../../utils/getFont')
const getRequest = require('../../utils/getRequest')
var WxParse = require('../wxParse/wxParse.js')
import util, {
    formatTime
} from '../../utils/util'
Page({
    data: {
        bannerHeight: 0,
        statusBarHeight: 0,
        needAdapt: app.globalData.system.needAdapt,
        pageShow: false,
        cartnum: 0,
    goods_id: '',
    is_cash: 0,

        banner: [],
        indicatorDots: false, //指示点
        autoplay: false, //自动播放
        footerShow: true,
        current: 0,

        list: {
            video: '',
        },
        giveLimitNum: 0,
        giveCheckList: [],

        toastBtn: '',
        goodsToast: false, //商品加入购物车/立即购买
        goods_search: {
            sku_id: '',
            image: '',
            price: '',
            market_price: '',
            unsearch: true,
            stock: 0,
        },
        // 套盒
        suit_goods_search: [],
        sumprice: {
            price: 0,
            market_price: 0,
        },

        goodsnum: 1,
        integralToast: false, //积分
        posterToast: false, //海报
        model: '',
        codeimg: '',

        drawCanvasType: 'old', //canvas绘制方法 2.9.0以上new:新方法 old:老方法
        jxShow: false, //匠选商品 false不显示分享，true显示分享

        liveStatus: false, //是否是直播商品

        pd_oid: '', //拼购邀请码
        togetherToast: false, //拼购弹窗
        pdNum: 0,
        level_id: '', //角色 3：匠选官
        room_id: '', //直播房间号

        pt_sku: [], //一个单独定义的sku数组,在商品加载后把res.data.sku的枚举转换而成,目的用来循环选择商品弹窗用
        ptToast: false,
        ptSlotShow: false, //拼团玩法文案展开收起
        ptTotalNums: 0,
        pt_buytype: 0, //拼团购买类型 0：自己299原价购买 1：拼团去购买

        fakesuccessList: [],
    },
  onLoad: function (options) {
      if ('is_cash' in options) {
        this.setData({
            is_cash: options.is_cash
          })
      }

      if ('table_number' in options) {
        app.globalData.table_number = options.table_number
      }
      // app.globalData.table_number = 'A1'
        //用户未登录，保存分享参数，跳转登录页
        if (app.globalData.userInfo.id == '') {
            if (Object.keys(options).length > 0) {
                let newE
                if (options.scene) {
                    let obj = decodeURIComponent(options.scene)
                    newE = obj.split('&').reduce((a, b) => {
                        const currentVal = b.split('=')
                        if (isNaN(currentVal[1])) {
                            a[currentVal[0]] = currentVal[1]
                        } else {
                            a[currentVal[0]] = parseInt(currentVal[1])
                        }
                        return a
                    }, {})
                } else {
                    newE = options
                }
                console.log(newE, 'onload扫码后处理完毕的携带参数')
                app.globalData.sharequery = newE
            }
            wx.reLaunch({
                url: `../login/login?is_cash=${this.data.is_cash}&goods_id=${options.goods_id}`,
            })
        } else {
            /**
             * option带参
             * 下面注释的参数 都是从直播间跳转过来时携带的
             * @param {String} custom_params 跳转直播间时携带的参数，从直播间跳转回来时回调的，里面内容：f：美容师id，u：自己的id
             * @param {String} gid
             * @param {Boolean} l
             * @param {String} openid
             * @param {String} room_id
             * @param {String} share_openid 分享者openid 只有从分享卡片跳转直播间又进入商品详情的才会出现这个参数
             * @param {String} t
             * @param {String} wxlive_type
          **/
            // var pages = getCurrentPages();
            // var prevPage = pages[pages.length - 2];
            // if (options.pre == 'classify') {
            //     prevPage.setData({
            //         activeKey: options.active_key
            //     })
            // }else {
            //     prevPage.setData({
            //         locationNum: options.location_num
            //     })
            // }
            const goods_id = options.goods_id ? options.goods_id : options.gid
            const {
                props = '',
                    pd_oid = '',
                    pdjnum = '',
                    room_id = '',
                    live = '',
                    l = '',
            } = options
            // 这里live的传参'false' 是个string 不是boolean
            let _this = this,
                drawCanvasType = 'old',
                goods_search = {},
                suit_goods_search = [],
                sumprice = {
                    price: 0,
                    market_price: 0,
                },
                pdNum = 0

            const pt_sku = []

            /**
             * 整理一下携带参数
             * 只保留分享者的信息
             * 多余的内容全部清空
             */
            app.clearShareQuery()
            app.router.giveCheckList = []
            app.router.giveChecked = []
            if (
                compareVersion.contrast(
                    app.globalData.system.SDKVersion,
                    '2.9.0'
                ) != -1
            ) {
                drawCanvasType = 'new'
            }

            getRequest
                .post('index/goods/info', {
                    goods_id: goods_id,
                    store_id: app.globalData.userInfo.store_id,
                    u_id: app.globalData.userInfo.id,
                    room_id: room_id,
                    pd_oid,
                })
                .then(function (res) {
                    if (
                        res.data.is_jx_goods == 1 &&
                        app.globalData.userInfo.level_id == 5
                    ) {
                        app.globalData.userInfo.level_id = 6
                        app.globalData.userInfo.jx_goods_id = goods_id
                    }

                    let content = res.data.content
                    WxParse.wxParse('contentname', 'html', content, _this, 5)

                    if (res.data.is_suit == 0) {
                        goods_search = {
                            sku_id: '',
                            image: res.data.images[0].image,
                            price: res.data.price,
                            market_price: res.data.market_price,
                            unsearch: true,
                            stock: res.data.stock,
                        }
                        let sku = res.data.sku
                        if (props) {
                            //购物车进入商品详情，循环显示已选择的商品规格与金额
                            if (sku[props].image != '') {
                                goods_search.image = sku[props].image
                            }
                            goods_search.sku_id = sku[props].sku_id
                            goods_search.price = sku[props].price
                            goods_search.market_price = sku[props].market_price
                            goods_search.unsearch = false
                            goods_search.stock = sku[props].stock
                        }
                        //循环定义规格选中状态
                        res.data.specs.forEach(function (e, idx) {
                            if (props) {
                                //购物车进入商品详情，循环判断已选择规格
                                e.item.forEach(function (item, itemidx) {
                                    if (item.id == sku[props].item[idx].id) {
                                        e.searchidx = itemidx
                                    }
                                })
                            } else {
                                e.searchidx = -1
                            }
                        })

                        if (res.data.is_pd == 1) {
                            //拼团单独处理一个sku数组以供弹窗选择
                            for (const i in sku) {
                                pt_sku.push(Object.assign(sku[i], {
                                    num: 0
                                }))
                            }
                            const {
                                fakesuccessList
                            } = _this.data
                            let _arr = []
                            if (res.data.pd_success.length >= 2) {
                                res.data.pd_success.map((key) => {
                                    key.create_time = formatTime(
                                        new Date(key.create_time * 1000)
                                    )
                                    _arr.push(key)
                                    if (_arr.length == 2) {
                                        fakesuccessList.push(_arr)
                                    }
                                    if (_arr.length == 2) _arr = []
                                })
                            } else if (res.data.pd_success.length !== 0) {
                                res.data.pd_success[0].create_time = formatTime(
                                    new Date(
                                        res.data.pd_success[0].create_time *
                                        1000
                                    )
                                )
                                fakesuccessList.push(res.data.pd_success)
                            }
                            _this.setData({
                                fakesuccessList,
                            })
                        }
                    } else {
                        let addsearch = {
                            sku_id: '',
                            image: res.data.images[0].image,
                            price: res.data.price,
                            market_price: res.data.market_price,
                            unsearch: true,
                            stock: res.data.stock,
                        }
                        sumprice = {
                            price: res.data.price,
                            market_price: res.data.market_price,
                        }

                        res.data.suit_list.forEach(function (suite, suitidx) {
                            let sku = suite.sku
                            if (props) {
                                //购物车进入商品详情，循环显示已选择的商品规格与金额
                                if (sku[props].image != '') {
                                    addsearch.image = sku[props].image
                                }
                                addsearch.sku_id = sku[props].sku_id
                                addsearch.price = sku[props].price
                                addsearch.market_price = sku[props].market_price
                                addsearch.unsearch = false
                                addsearch.stock = sku[props].stock
                                suit_goods_search.push(addsearch)
                            }
                            //循环定义规格选中状态
                            suite.specs.forEach(function (e, idx) {
                                if (props) {
                                    //购物车进入商品详情，循环判断已选择规格
                                    e.item.forEach(function (item, itemidx) {
                                        if (
                                            item.id == sku[props].item[idx].id
                                        ) {
                                            e.searchidx = itemidx
                                        }
                                    })
                                } else {
                                    e.searchidx = -1
                                }
                            })
                        })

                        pdNum = res.data.pd_choice.indexOf(pdjnum + '')
                    }

                    let banner = []
                    res.data.images.forEach(function (e, idx) {
                        banner.push(e.image)
                    })
                    //匠选商品-不允许分享
                    if (res.data.is_jx_goods == 1) {
                        wx.hideShareMenu()
                    }
                    //直播商品，不允许分享
                    let liveStatus = live ? live : l ? l : 'false'
                    if (liveStatus == 'true') {
                        wx.hideShareMenu()
                        if (res.data.can_buy == 0) {
                            app.toastFun(res.msg)
                        }
                    }

                    _this.setData({
                        bannerHeight: app.globalData.system.windowWidth,
                        banner: banner,
                        content: content,
                        list: {
                            ...res.data
                        },
                        giveLimitNum: res.data.check_num_limit,
                        goods_id: goods_id,
                        goods_search: goods_search,
                        suit_goods_search: suit_goods_search,
                        sumprice: sumprice,
                        model: app.globalData.system.model,
                        drawCanvasType: drawCanvasType,
                        statusBarHeight: app.globalData.system.statusBarHeight + 6,
                        jxShow: res.data.is_jx_goods == 1 ? false : true,
                        liveStatus: liveStatus,
                        pd_oid: pd_oid,
                        pdNum: pdNum,
                        level_id: app.globalData.userInfo.level_id,
                        room_id: room_id,
                        pt_sku,
                    })
                    app.router.giveList = res.data.check_give_lsit
                })
                .catch(function (err) {
                    // app.toastFun('抱歉，该商品已下架！');
                    // getRequest.errlogPost('商品详情', err, {
                    //     goods_id: goods_id,
                    //     store_id: app.globalData.userInfo.store_id,
                    //     u_id: app.globalData.userInfo.id,
                    //     mobile: app.globalData.userInfo.mobile,
                    // }, {
                    //     methods: 'onload',
                    //     version: app.globalData.version
                    // })
                    app.toastFun(err.msg)
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1000)
                })
            //加载字体
            if (app.globalData.loadFont == false) {
                Font.get()
                    .then(function () {
                        _this.setData({
                            pageShow: true,
                        })
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
            } else {
                this.setData({
                    pageShow: true,
                })
            }
        }
    },
  onShow: function () {
        //获取并显示购物车中已有商品数量，以及显示已经选中的赠品列表
        if (app.globalData.userInfo.id != '') {
            let _this = this
            cartNum
                .sum()
                .then(function (res) {
                    _this.setData({
                        cartnum: res.data.cart_count,
                        giveCheckList: app.router.giveChecked,
                        giveLimitNum: _this.data.list.check_num_limit -
                            app.router.giveChecked.length,
                    })
                })
                .catch()
        }
    },
    //返回上一页
    returnBack: function () {
        wx.navigateBack({
            delta: 1,
        })
    },
    //banner切换
    swiperChange: function (e) {
        this.setData({
            current: e.detail.current,
        })
    },
    //图片预览
    bannerClick: function (e) {
        let idx = e.currentTarget.dataset.idx
        wx.previewImage({
            current: this.data.banner[idx],
            urls: this.data.banner,
        })
    },
    //滑动显示底部按钮
    onPageScroll: function (e) {
        if (50 < e.scrollTop) {
            if (this.data.footerShow) return
            this.setData({
                footerShow: true,
            })
        } else {
            if (!this.data.footerShow) return
            this.setData({
                footerShow: false,
            })
        }
    },
    //跳转首页
    goHome: function () {
        wx.switchTab({
            url: '../index/index',
        })
    },
    //跳转购物车
    goCart: function () {
        wx.navigateTo({
            url: '../cart/cart',
        })
    },
    goList: function () {
        wx.switchTab({
          url: '../offline/classify',
        })
    },
    // 加入购物车-弹窗
    addCart: function () {
        if (this.data.list.can_buy == 1) {
            this.setData({
                toastBtn: '加入购物车',
                goodsToast: true,
            })
        }
    },
    // 立即购买-弹窗
  buyNow: function () {
    app.globalData.table_number = 'A1'
    if (this.data.is_cash == 1 && Boolean(app.globalData.table_number) == false) {
      app.toastFun('请先扫描桌上二维码确定桌号');
      return
    }
        if (this.data.list.can_buy == 1) {
            this.setData({
                toastBtn: '立即购买',
                goodsToast: true,
            })
        }
    },
    // 拼团玩法展开收缩
    showSlot() {
        this.setData({
            ptSlotShow: !this.data.ptSlotShow,
        })
    },
    // 拼团购买-弹窗
    ptBuyNow(e) {
        if (this.data.list.can_buy == 1) {
            const {
                pt_buytype
            } = e.currentTarget.dataset
            if (this.data.pd_oid && pt_buytype == 0) return
            let {
                pt_sku
            } = this.data
            pt_sku.map((key) => {
                key.num = 0
            })
            this.setData({
                toastBtn: pt_buytype == 0 ? '单独购买' : '拼单购买',
                ptToast: true,
                ptTotalNums: 0,
                pt_buytype,
                pt_sku,
            })
        }
    },

    // 积分-弹窗
    // integralShow: function () {
    //     this.setData({
    //         toastBtn: '我知道了',
    //         integralToast: true
    //     })
    // },
    //海报-弹窗
    // posterShow: function () {
    //     if (this.data.codeimg == '') {
    //         // 拼单处理
    //         const {
    //             is_pd
    //         } = this.data.list
    //         let _this = this,
    //             image = this.data.list.image
    //         let title = this.data.list.goods_name,
    //             desc = this.data.list.goods_sub,
    //             price =
    //             is_pd == 1 ?
    //             this.data.list.pd_setting.pd_price :
    //             this.data.list.price
    //         let scene =
    //             'u=' +
    //             app.globalData.userInfo.id +
    //             '&f=' +
    //             app.globalData.userInfo.pid +
    //             '&t=g&gid=' +
    //             this.data.list.id

    //         let postdata = {
    //             is_hyaline: 0,
    //             width: 80,
    //             scene: scene,
    //             path: 'pages/login/login',
    //             env_version: 'release',
    //             token: app.globalData.token,
    //         }
    //         getRequest
    //             .post('index/base/getQrCode', postdata)
    //             .then(function (newqrcode) {
    //                 _this.setData({
    //                     codeimg: newqrcode.data.qrcode,
    //                 })
    //                 if (_this.data.drawCanvasType == 'new') {
    //                     _this.saveImage(
    //                         newqrcode.data.qrcode,
    //                         image,
    //                         title,
    //                         desc,
    //                         price
    //                     )
    //                 } else {
    //                     _this.downImg(newqrcode.data.qrcode).then((res) => {
    //                         _this.downImg(image).then((info) => {
    //                             _this.saveImage(res, info, title, desc, price)
    //                         })
    //                     })
    //                 }
    //             })
    //             .catch(function (err) {
    //                 app.toastFun(err.msg)
    //             })
    //     } else {
    //         this.setData({
    //             posterToast: true,
    //         })
    //     }
    // },
    //关闭弹窗
    closeToast: function () {
        this.setData({
            goodsToast: false,
            integralToast: false,
            posterToast: false,
            togetherToast: false,
            ptToast: false,
        })
    },
    // 规格选择
    specsSearch: function (e) {
        let gidx,
            pidx = e.currentTarget.dataset.pidx,
            idx = e.currentTarget.dataset.idx,
            unsearch = false,
            props = '',
            is_suit = this.data.list.is_suit,
            defaultimg = '',
            sku = [],
            specs,
            goods_search = this.data.goods_search,
            sumprice = this.data.sumprice,
            goodsid
        if (is_suit == 0) {
            specs = this.data.list.specs
            defaultimg = this.data.goods_search.image
            sku = this.data.list.sku
        } else {
            gidx = e.currentTarget.dataset.gidx
            specs = this.data.list.suit_list[gidx].specs
            defaultimg = this.data.list.images[0].image
            sku = this.data.list.suit_list[gidx].sku
            goodsid = this.data.list.suit_list[gidx].goods_id
        }

        specs[pidx].searchidx = idx
        specs.forEach(function (info) {
            if (info.searchidx == -1) {
                unsearch = true
            } else {
                if (props == '') {
                    props = info.item[info.searchidx].id
                } else {
                    props = props + ',' + info.item[info.searchidx].id
                }
            }
        })

        if (unsearch == false) {
            goods_search = {
                sku_id: sku[props].sku_id,
                image: sku[props].image == '' ? defaultimg : sku[props].image,
                price: sku[props].price,
                market_price: sku[props].market_price,
                unsearch: false,
                stock: sku[props].stock,
            }
        }

        if (is_suit == 0) {
            this.data.goods_search = goods_search
            this.data.goods_search.unsearch = unsearch
            this.setData({
                list: this.data.list,
                goods_search: this.data.goods_search,
            })
        } else {
            goods_search.goodsid = goodsid
            this.data.suit_goods_search[gidx] = goods_search
            this.data.suit_goods_search[gidx].unsearch = unsearch
            this.setData({
                list: this.data.list,
                suit_goods_search: this.data.suit_goods_search,
            })
        }
    },
    //添加数量
    addNum: function (e) {
        const {
            is_pd = 0
        } = this.data.list
        if (is_pd == 1) {
            let {
                pt_sku,
                ptTotalNums,
                pt_buytype
            } = this.data
            const {
                allow_pd_num
            } = this.data.list
            const {
                index
            } = e.currentTarget.dataset
            if (pt_buytype == 0) {
                pt_sku[index].num += 1
                ptTotalNums += 1
                this.setData({
                    pt_sku,
                    ptTotalNums,
                })
            } else {
                if (ptTotalNums == allow_pd_num) {
                    app.toastFun(`商品数量不得超过${allow_pd_num}个`)
                } else {
                    pt_sku[index].num += 1
                    ptTotalNums += 1
                    this.setData({
                        pt_sku,
                        ptTotalNums,
                    })
                }
            }
        } else {
            if (
                this.data.goodsnum < this.data.list.max_allow_num ||
                this.data.list.max_allow_num == 0
            ) {
                this.data.goodsnum += 1
                this.setData({
                    goodsnum: this.data.goodsnum,
                })
            }
        }
    },
    //减少数量
    delNum: function (e) {
        const {
            is_pd = 0
        } = this.data.list
        if (is_pd == 1) {
            let {
                pt_sku,
                ptTotalNums,
                pt_buytype
            } = this.data
            const {
                index
            } = e.currentTarget.dataset
            if (pt_sku[index].num >= 1) {
                pt_sku[index].num -= 1
                ptTotalNums -= 1
                this.setData({
                    pt_sku,
                    ptTotalNums,
                })
            }
        } else {
            if (1 < this.data.goodsnum) {
                this.data.goodsnum -= 1
                this.setData({
                    goodsnum: this.data.goodsnum,
                })
            }
        }
    },
    //生成订单/加入购物车
    setOrder: function () {
        if (app.globalData.userInfo.id == '') {
            wx.navigateTo({
                url: '../login/login',
            })
        } else {
            if (this.data.list.give_mode == 1 && this.data.giveLimitNum != 0) {
                app.toastFun('您还没有选择完赠品')
            } else {
                let _this = this,
                    check_give = ''
                this.data.giveCheckList.forEach(function (e) {
                    if (check_give == '') {
                        check_give = e.id
                    } else {
                        check_give = check_give + ',' + e.id
                    }
                })

                if (this.data.list.is_suit == 0) {
                    if (
                        this.data.list.sku.length != 0 &&
                        this.data.goods_search.sku_id == ''
                    ) {
                        app.toastFun('您还有未选择项')
                    } else {
                        if (this.data.toastBtn == '立即购买') {
                          _this.closeToast()
                          wx.navigateTo({
                            url: `../payment/payment?sku_id=${this.data.goods_search.sku_id}&goods_id=${this.data.goods_id}&num=${this.data.goodsnum}&cart_id=&is_jx_goods=${this.data.list.is_jx_goods}&check_give=${check_give}&activity_id=${this.data.list.activity_id}&is_cash=${this.data.is_cash}`,
                          })
                        } else if (this.data.toastBtn == '加入购物车') {
                            let postdata = {
                                uid: app.globalData.userInfo.id,
                                sku_id: this.data.goods_search.sku_id,
                                goods_id: this.data.goods_id,
                                num: this.data.goodsnum,
                                token: app.globalData.token,
                                check_give: check_give,
                            }
                            getRequest
                                .post('index/cart/add', postdata)
                                .then(function (res) {
                                    app.toastFun('已加入购物车')
                                    _this.setData({
                                        cartnum: _this.data.cartnum +
                                            _this.data.goodsnum,
                                    })
                                    _this.closeToast()
                                })
                                .catch(function (err) {
                                    app.toastFun(err.msg)
                                })
                        }
                    }
                } else {
                    let searchType = true,
                        suit_sku_ids = {}
                    this.data.suit_goods_search.forEach(function (e) {
                        if (e.unsearch == true) {
                            searchType = false
                        }
                        if (e.sku_id) {
                            suit_sku_ids[e.goodsid] = e.sku_id
                        }
                    })

                    if (
                        this.data.list.suit_list.length ==
                        this.data.suit_goods_search.length &&
                        searchType == true
                    ) {
                        if (this.data.toastBtn == '立即购买') {
                            _this.closeToast()
                            app.router.suit_sku_ids = suit_sku_ids
                            wx.navigateTo({
                                url: '../payment/payment?sku_id=&goods_id=' +
                                    this.data.goods_id +
                                    '&num=' +
                                    this.data.goodsnum +
                                    '&cart_id=' +
                                    '&is_jx_goods=' +
                                    this.data.list.is_jx_goods +
                                    '&check_give=' +
                                    check_give,
                            })
                        } else if (this.data.toastBtn == '加入购物车') {
                            let postdata = {
                                uid: app.globalData.userInfo.id,
                                goods_id: this.data.goods_id,
                                num: this.data.goodsnum,
                                token: app.globalData.token,
                                check_give: check_give,
                                suit_sku_ids: suit_sku_ids,
                            }
                            getRequest
                                .post('index/cart/add', postdata)
                                .then(function (res) {
                                    app.toastFun('已加入购物车')
                                    _this.setData({
                                        cartnum: _this.data.cartnum +
                                            _this.data.goodsnum,
                                    })
                                    _this.closeToast()
                                })
                                .catch(function (err) {
                                    app.toastFun(err.msg)
                                })
                        }
                    } else {
                        app.toastFun('您还有未选择项')
                    }
                }
            }
        }
    },
    // 老拼单相关开始
    // 拼单购买
    buyTogether() {
        let pd_oid = this.data.pd_oid

        if (this.data.list.can_buy != 1) {
            app.toastFun('您不可以购买本商品')
        } else {
            if (pd_oid) {
                if (app.globalData.userInfo.level_id != 3) {
                    this.pdBuyNow()
                } else {
                    app.toastFun('您不可以购买本商品')
                }
            } else {
                if (app.globalData.userInfo.level_id == 3) {
                    //匠选官发起拼单
                    this.setData({
                        togetherToast: true,
                    })
                } else {
                    //顾客不能发起拼单，先购买匠选商品
                    app.toastFun('请联系美容师先购买匠选商品成为匠选官')
                    // setTimeout(() => {
                    //   wx.redirectTo({
                    //     url: '../goodsdetail/goodsdetail?goods_id='+app.globalData.userInfo.jx_goods_id,
                    //   })
                    // }, 1000);
                }
            }
        }
    },
    //购买方式选择
    togetherNumSearch(e) {
        let idx = e.currentTarget.dataset.idx
        this.setData({
            pdNum: idx,
        })
    },
    //拼单跳转
    pdBuyNow() {
        if (app.globalData.userInfo.id == '') {
            wx.navigateTo({
                url: '../login/login',
            })
        } else {
            if (this.data.list.give_mode == 1 && this.data.giveLimitNum != 0) {
                app.toastFun('您还没有选择完赠品')
            } else {
                let check_give = ''
                this.data.giveCheckList.forEach(function (e) {
                    if (check_give == '') {
                        check_give = e.id
                    } else {
                        check_give = check_give + ',' + e.id
                    }
                })
                if (
                    this.data.list.sku.length != 0 &&
                    this.data.goods_search.sku_id == ''
                ) {
                    app.toastFun('您还有未选择项')
                } else if (
                    this.data.pdNum == -1 &&
                    this.data.list.activity_id == 2
                ) {
                    app.toastFun('您还未选择购买方式')
                } else {
                    this.closeToast()
                    let link = ''
                    if (this.data.pd_oid) {
                        link = '&pd_oid=' + this.data.pd_oid
                    }

                    wx.navigateTo({
                        url: '../payment/payment?sku_id=&goods_id=' +
                            this.data.goods_id +
                            '&num=1&cart_id=&is_jx_goods=' +
                            this.data.list.is_jx_goods +
                            '&check_give=' +
                            check_give +
                            '&pd_number=' +
                            this.data.list.pd_choice[this.data.pdNum] +
                            '&activity_id=2' +
                            link,
                    })
                }
            }
        }
    },
    // 老拼单相关结束

    // 新拼单开始
    pdConfirmBuyNow() {
        const {
            is_pd
        } = this.data.list //增加一个拼团的判断，如果非拼团则进入正常流程
        const {
            list,
            ptTotalNums,
            pt_sku,
            pt_buytype,
            goods_id,
            pd_oid
        } =
        this.data
        if (ptTotalNums == 0) {
            app.toastFun('参加盲盒活动需要至少选择1个进行购买')
        } else {
            const suit_sku_ids = {}
            pt_sku.map((item) => {
                if (item.num > 0) {
                    suit_sku_ids[item.sku_id] = item.num
                }
            })
            app.router.suit_sku_ids = suit_sku_ids

            let link = ''
            if (pd_oid) {
                link = `&pd_oid=${pd_oid}`
            }
            wx.navigateTo({
                url: `../payment/payment?sku_id=&cart_id=&check_give=&goods_id=${goods_id}&num=${ptTotalNums}&is_jx_goods=${list.is_jx_goods}&activity_id=${list.activity_id}&is_pd=${is_pd}&pt_buytype=${pt_buytype}${link}`,
            })
        }
    },
    // 新拼单结束

    // 海报相关开始
    //下载图片到本地
    downImg(url) {
        wx.showLoading({
            title: '请稍后',
        })
        let promise = new Promise(function (resolve, reject) {
            wx.downloadFile({
                url: url, //请求的网络图片路径
                success: function (res) {
                    wx.hideLoading()
                    resolve(res.tempFilePath)
                },
                fail: function (res) {
                    wx.hideLoading()
                    app.toastFun('生成失败，请重试')
                    console.log('下载网络图片失败', res)
                },
            })
        })
        return promise
    },
    //canvas绘制图片-新方法
    canvasDrawImg(canvas, addimg, dpr, ctx, x, y, width, height) {
        const img = canvas.createImage()
        img.src = addimg
        img.onload = () => {
            ctx.drawImage(img, x * dpr, y * dpr, width * dpr, height * dpr)
        }
    },
    //判断canvas绘制文字是否需要换行
    findBreakPoint(text, width, context) {
        var min = 0
        var max = text.length - 1
        while (min <= max) {
            var middle = Math.floor((min + max) / 2)
            var middleWidth = context.measureText(text.substr(0, middle)).width
            var oneCharWiderThanMiddleWidth = context.measureText(
                text.substr(0, middle + 1)
            ).width
            if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
                return middle
            }
            if (middleWidth < width) {
                min = middle + 1
            } else {
                max = middle - 1
            }
        }
        return -1
    },
    //文字换行绘制
    textDraw(canvas, text) {
        let result = [],
            breakPoint = 0
        const dpr = wx.getSystemInfoSync().pixelRatio
        while (
            (breakPoint = this.findBreakPoint(text, 240 * dpr, canvas)) !== -1
        ) {
            result.push(text.substr(0, breakPoint))
            text = text.substr(breakPoint)
        }
        if (text) {
            result.push(text)
        }
        return result
    },
    //绘制海报
    saveImage(code, card, title, desc, price) {
        // 拼单处理
        const {
            is_pd
        } = this.data.list
        if (this.data.drawCanvasType == 'new') {
            //新方法绘制
            const query = wx.createSelectorQuery()
            query
                .select('#saveimg')
                .fields({
                    node: true,
                    size: true,
                })
                .exec((res) => {
                    const canvas = res[0].node
                    const dpr = wx.getSystemInfoSync().pixelRatio
                    const ctx = canvas.getContext('2d')
                    canvas.width = 300 * dpr
                    canvas.height = 500 * dpr
                    ctx.fillStyle = '#ffffff'
                    ctx.fillRect(0, 0, 300 * dpr, 500 * dpr)
                    ctx.shadowBlur = 7 * dpr
                    ctx.shadowColor = '#D1D4D9'
                    ctx.fillRect(15 * dpr, 70 * dpr, 270 * dpr, 420 * dpr)

                    //title
                    ctx.fillStyle = '#231F20'
                    ctx.shadowBlur = 0
                    ctx.font = 15 * dpr + 'px SourceHanSans'
                    ctx.fillText('诚美匠选', 65 * dpr, 37.5 * dpr)

                    this.canvasDrawImg(
                        canvas,
                        '../../images/mine/logo.png',
                        dpr,
                        ctx,
                        15,
                        15,
                        35,
                        35
                    )
                    this.canvasDrawImg(canvas, card, dpr, ctx, 15, 70, 270, 270)

                    ctx.fillStyle = '#231F20'
                    ctx.font = 12 * dpr + 'px SourceHanSans'
                    // ctx.fillText(title, 30*dpr, 420*dpr);
                    if (is_pd == 1) {
                        title = this.textDraw(
                            ctx,
                            '小红书爆款清洁盲盒正在拼团中，不要错过噢'
                        )
                    } else {
                        title = this.textDraw(ctx, title)
                    }
                    title.forEach(function (text, idx) {
                        ctx.fillText(text, 30 * dpr, (366 + 20 * idx) * dpr)
                    })

                    if (is_pd == 1) {
                        ctx.fillStyle = '#C2253A'
                        ctx.font = 14 * dpr + 'px SourceHanSans'
                        ctx.fillText('拼团价：', 30 * dpr, 416 * dpr)
                        ctx.font = 20 * dpr + 'px SourceHanSans'
                        ctx.fillText(price, 85 * dpr, 416 * dpr)
                        ctx.fillStyle = '#231F20'
                    } else {
                        // ctx.fillText(desc, 30*dpr, 440*dpr);
                        ctx.font = 13 * dpr + 'px SourceHanSans'
                        ctx.fillText('积分', 30 * dpr, 416 * dpr)
                        ctx.font = 16 * dpr + 'px SourceHanSans'
                        ctx.fillText(price, 40 * dpr, 416 * dpr)
                    }

                    this.canvasDrawImg(canvas, code, dpr, ctx, 220, 391, 50, 50)
                    ctx.font = 9 * dpr + 'px SourceHanSans'
                    ctx.fillText('长按识别小程序', 212 * dpr, 458 * dpr)
                    this.setData({
                        canvas: canvas,
                    })
                })
        } else {
            //老方法绘制
            const ctx = wx.createCanvasContext('saveimg')
            var dpr = 1
            if (this.data.model == 'iPhone 5') {
                dpr = 0.9
            }
            ctx.setFillStyle('#ffffff')
            ctx.fillRect(0, 0, 300 * dpr, 500 * dpr)
            ctx.setFillStyle('#ffffff')
            ctx.shadowBlur = 7 * dpr
            ctx.shadowColor = '#D1D4D9'
            ctx.fillRect(15 * dpr, 70 * dpr, 270 * dpr, 420 * dpr)
            ctx.shadowBlur = 0 * dpr
            ctx.drawImage(card, 15 * dpr, 70 * dpr, 270 * dpr, 270 * dpr)
            ctx.setFillStyle('#231F20')
            ctx.setFontSize(12 * dpr)
            // ctx.fillText(title, 30*dpr, 420*dpr);
            if (is_pd == 1) {
                title = this.textDraw(
                    ctx,
                    '小红书爆款清洁盲盒正在拼团中，不要错过噢'
                )
            } else {
                title = this.textDraw(ctx, title)
            }
            title.forEach(function (text, idx) {
                ctx.fillText(text, 30 * dpr, (366 + 20 * idx) * dpr)
            })
            // ctx.fillText(desc, 30*dpr, 440*dpr);

            if (is_pd == 1) {
                ctx.setFillStyle('#C2253A')
                ctx.setFontSize(14 * dpr)
                ctx.fillText('拼团价：', 30 * dpr, 416 * dpr)
                ctx.setFontSize(20 * dpr)
                ctx.fillText(price, 85 * dpr, 416 * dpr)
                ctx.setFillStyle('#231F20')
            } else {
                ctx.setFontSize(13 * dpr)
                ctx.fillText('积分', 30 * dpr, 416 * dpr)
                ctx.setFontSize(16 * dpr)
                ctx.fillText(price, 45 * dpr, 416 * dpr)
            }

            ctx.drawImage(code, 220 * dpr, 391 * dpr, 50 * dpr, 50 * dpr)
            ctx.setFontSize(9)
            ctx.fillText('长按识别小程序', 212 * dpr, 458 * dpr)

            //title
            ctx.shadowBlur = 0
            ctx.setFillStyle('#231F20')
            ctx.setFontSize(15 * dpr)
            ctx.fillText('诚美匠选', 65 * dpr, 37.5 * dpr)
            ctx.drawImage(
                '../../images/mine/logo.png',
                15 * dpr,
                15 * dpr,
                35 * dpr,
                35 * dpr
            )
            ctx.draw()
        }
        this.setData({
            posterToast: true,
        })
    },
    //保存海报
    downLoadImg: function () {
        var _this = this
        if (this.data.drawCanvasType == 'new') {
            wx.canvasToTempFilePath({
                canvas: _this.data.canvas,
                success: function (res) {
                    if (!res.tempFilePath) {
                        wx.showModal({
                            title: '提示',
                            content: '图片绘制中，请稍后重试',
                            showCancel: false,
                        })
                    }
                    //4. 当用户点击分享到朋友圈时，将图片保存到相册
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success(save) {
                            wx.showModal({
                                title: '图片保存成功',
                                content: '图片成功保存到相册了，去发圈噻~',
                                showCancel: false,
                                confirmText: '好哒',
                                confirmColor: '#72B9C3',
                                success: function () {
                                    _this.closeToast()
                                },
                            })
                        },
                    })
                },
                fail: function (res) {
                    console.log(res)
                },
            })
        } else {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                canvasId: 'saveimg',
                success: function (res) {
                    if (!res.tempFilePath) {
                        wx.showModal({
                            title: '提示',
                            content: '图片绘制中，请稍后重试',
                            showCancel: false,
                        })
                    }
                    //4. 当用户点击分享到朋友圈时，将图片保存到相册
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success(save) {
                            wx.showModal({
                                title: '图片保存成功',
                                content: '图片成功保存到相册了，去发圈噻~',
                                showCancel: false,
                                confirmText: '好哒',
                                confirmColor: '#72B9C3',
                                success: function () {
                                    _this.closeToast()
                                },
                            })
                        },
                        fail(save) {
                            console.log(save)
                        },
                    })
                },
                fail: function (res) {
                    console.log(res)
                },
            })
        }
    },
    // 海报相关结束
    //赠品选择/更换
    getNorms(e) {
        let type = e.currentTarget.dataset.type
        if (type == 'new') {
            wx.navigateTo({
                url: '../goodsnorms/goodsnorms?giveid=&idx=',
            })
        } else {
            wx.navigateTo({
                url: '../goodsnorms/goodsnorms?giveid=' +
                    e.currentTarget.dataset.id +
                    '&idx=' +
                    e.currentTarget.dataset.idx,
            })
        }
    },
    //客服
    customerService() {
        wx.makePhoneCall({
            phoneNumber: app.globalData.userInfo.store_mobile,
            success() {},
            fail() {},
        })
    },
    // 分享
    // onShareAppMessage: function (res) {
    //     return {
    //         title: this.data.list.is_pd == 1 ?
    //             '小红书爆款清洁盲盒正在拼团中，不要错过噢' : this.data.list.goods_name,
    //         imageUrl: this.data.list.image,
    //         path: 'pages/login/login?u=' +
    //             app.globalData.userInfo.id +
    //             '&f=' +
    //             app.globalData.userInfo.pid +
    //             '&t=g&gid=' +
    //             this.data.list.id,
    //     }
    // },
})