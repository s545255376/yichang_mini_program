// genetest/pages/register/register.js
const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        windowHeight: app.globalData.system.winHeight,
        needAdapt: app.globalData.system.needAdapt,
        name: '',
        sex: '',
        age: '',
        sexpop: false, //性别显示弹窗
        columns: ['男', '女'],
        scantips: '扫描条码', //条码框，默认显示“扫描条码”，扫码后显示条形码
        policy: false, //隐私政策checkbox
        sendback: false,
        qrcodeToast: false, //二维码弹窗
        id: null, //激活状态用
    },
    onClose() {
        this.setData({
            sexpop: false
        })
    },
    scan() {
        const _this = this;
        wx.scanCode({
            success(code) {
                console.log(code);
                if (code.scanType == 'CODE_128') {
                    //code.result
                    _this.setData({
                        scantips: code.result
                    })
                } else {
                    app.toastFun('请确认扫描的条码！')
                }
            }
        })
    },
    checkboxchange(e) {
        this.setData({
            policy: e.detail
        })
    },
    inputchange(e) {
        console.log(e);
        const {
            name
        } = e.currentTarget.dataset;

        if (name == 'sex') {
            this.setData({
                sexpop: true
            })
        } else if (name == 'sexselect') {
            const {
                value,
                index
            } = e.detail;
            this.setData({
                sex: value
            })
            this.onClose();
        } else {
            this.setData({
                [name]: e.detail.value
            })
        }

    },
    intopolicy() {
        wx.navigateTo({
            url: '../policy/policy',
        })
    },
    showQrcode() {
        this.setData({
            qrcodeToast: true
        })
        getRequest.noToastPost('/index/gene/status', {
            id: this.data.id,
            token: app.globalData.token
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
    intoNext() {
        const {
            name,
            sex,
            age,
            scantips,
            policy
        } = this.data;
        const agereg = /^(?:[1-9][0-9]?|1[01][0-9]|130)$/;
        if (name == '' || sex == '' || age == '') {
            app.toastFun('个人信息请填写完毕');
        } else if (scantips == '扫描条码') {
            app.toastFun('请扫描条码');
        } else if (!policy) {
            app.toastFun('请阅读并同意《隐私政策》和《个人信息保护》')
        } else if (!agereg.test(age)) {
            app.toastFun('请输入正确的年龄')
        } else {
            getRequest.post('/index/gene/uploadInfo', {
                name,
                sex,
                age,
                wbarcode: scantips,
                uid: app.globalData.userInfo.id,
                agreement: policy ? 1 : 0,
                token: app.globalData.token
            }).then(res => {
                if (res.code == 200) {
                    this.setData({
                        id: res.data.id,
                        sendback: true
                    })
                }
            })
        }
    }
})