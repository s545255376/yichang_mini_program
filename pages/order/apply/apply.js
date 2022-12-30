const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        order_id: '',
        order_status: '',
        info: {},

        reasonList: [],
        reasonidx: -1,
        reasonCheck: -1,

        typeList: [],
        typeidx: -1,
        typeCheck: -1,

        expressList: [],
        expressidx: -1,
        expressCheck: -1,

        reasonToast: false,
        typeToast: false,
        expressToast: false,
        upToast: false,

        uploadimg: [],
        content: '',
        express_name: '',
        express_sn: '',
        loadState: true,
        prizelist: []
    },
    onLoad: function (options) {
        let _this = this,
            order_id = options.order_id,
            order_status = options.order_status;

        if (order_status == 1) {
            wx.setNavigationBarTitle({
                title: '退款申请'
            })
        } else if (order_status == 2) {
            wx.setNavigationBarTitle({
                title: '退货申请'
            })
        }
        this.setData({
            order_id: order_id,
            order_status: order_status
        })
        this.getInfo(order_id);
        //原因
        getRequest.post('index/order/cause', {}).then(function (res) {
            _this.setData({
                reasonList: res.data
            })
        }).catch(function (err) {
            _this.setData({
                loadState: false
            })
        })
        //物流
        getRequest.post('index/base/express', {}).then(function (res) {
            _this.setData({
                expressList: res.data.express
            })
        }).catch(function (err) {
            _this.setData({
                loadState: false
            })
        })
    },
    //跳转奖品列表
    showMoreGifts() {
        wx.navigateTo({
            url: '../giftlist/giftlist?order_id=' + this.data.order_id
        })
    },
    //获取详情
    getInfo(order_id) {
        let _this = this,
            postdata = {
                token: app.globalData.token,
                uid: app.globalData.userInfo.id,
                order_id: order_id
            };
        getRequest.post('index/order/info', postdata).then(function (res) {
            _this.setData({
                info: res.data
            })
        }).catch(function (err) {
            _this.setData({
                loadState: false
            })
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
    //打开弹窗-选择原因
    openReasonToast: function () {
        this.setData({
            reasonToast: true,
            upToast: true
        })
    },
    //选择退款原因
    reasonChange: function (e) {
        this.setData({
            reasonidx: e.detail.value
        })
    },
    //选择类型
    openTypeToast: function () {
        this.setData({
            typeToast: true,
            upToast: true
        })
    },
    //选择退货类型
    typeChange: function (e) {
        this.setData({
            typeidx: e.detail.value
        })
    },
    //选择公司
    openExpressToast: function () {
        this.setData({
            expressToast: true,
            upToast: true
        })
    },
    //选择快递公司
    expressChange: function (e) {
        this.setData({
            expressidx: e.detail.value
        })
    },
    //确认选择
    confirmReason: function () {
        if (this.data.reasonToast == true) {
            this.setData({
                reasonCheck: this.data.reasonidx
            })
        } else if (this.data.typeToast == true) {
            this.setData({
                typeCheck: this.data.typeidx
            })
        } else if (this.data.expressToast == true) {
            this.setData({
                expressCheck: this.data.expressidx
            })
        }

        this.closeToast();
    },
    //关闭弹窗
    closeToast: function () {
        this.setData({
            reasonToast: false,
            typeToast: false,
            expressToast: false,
            upToast: false
        })
    },
    //上传图片
    uploadImg: function () {
        const uploadimg = this.data.uploadimg;
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            success: (info) => {
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
                            uploadimg.push({
                                img: tempFilePaths,
                                url: json.data.url
                            });
                            this.setData({
                                uploadimg: uploadimg
                            })
                        } else {
                            app.toastFun(json.msg);
                        }
                    }
                })
            }
        })
    },
    //删除图片
    delImg: function (e) {
        let idx = e.currentTarget.dataset.idx,
            uploadimg = this.data.uploadimg;
        uploadimg.splice(idx, 1);
        this.setData({
            uploadimg: uploadimg
        })
    },
    //退货说明
    contentInput: function (e) {
        this.setData({
            content: e.detail.value
        })
    },
    // //请填写物流单号
    // expressInput: function(e) {
    //   this.setData({express_sn:e.detail.value})
    // },
    //提交
    submitBtn: function () {
        let _this = this,
            return_voucher = '',
            content = this.data.content,
            uploadimg = this.data.uploadimg;
        if (this.data.reasonCheck == -1) {
            app.toastFun('您还有未填项');
        } else if (this.data.order_status == 2 && this.data.typeCheck == -1) {
            app.toastFun('您还有未填项');
        }
        // else if(this.data.typeCheck == 1 && ( this.data.expressCheck == -1 || this.data.express_sn == '')){
        //   app.toastFun('您还有未填项');
        // }
        else {
            wx.showModal({
                title: '提示',
                content: '是否确认提交申请？',
                success: function (info) {
                    if (info.cancel) {} else {
                        uploadimg.forEach(function (e) {
                            if (return_voucher == '') {
                                return_voucher = e.url;
                            } else {
                                return_voucher = return_voucher + ',' + e.url;
                            }
                        })
                        let postdata = {
                            token: app.globalData.token,
                            uid: app.globalData.userInfo.id,
                            order_id: _this.data.order_id,
                            cause_id: _this.data.reasonList[_this.data.reasonCheck].id,
                            return_num: _this.data.info.total,
                            return_price: _this.data.info.pay_price,
                            return_content: content,
                            return_voucher: return_voucher,
                            // express_name:_this.data.typeCheck == -1?'':_this.data.typeCheck == 0?'':_this.data.expressList[_this.data.expressCheck].name,
                            // express_sn:_this.data.typeCheck == -1?'':_this.data.typeCheck == 0?'':express_sn,
                            type: _this.data.typeCheck == -1 ? 0 : _this.data.typeCheck == 0 ? 0 : 1
                        };
                        getRequest.post('index/refund/apply', postdata).then(function (res) {
                            _this.getInfo(_this.data.order_id);
                            app.toastFun('申请成功')
                            setTimeout(() => {
                                wx.navigateBack({
                                    delta: 2
                                })
                            }, 1000);
                        }).catch(function (err) {
                            app.toastFun(err.msg);
                        })
                    }
                }
            })
        }
    },

})