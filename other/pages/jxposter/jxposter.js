const app = getApp();
const compareVersion = require('../../../utils/compareVersion.js');
const getRequest = require('../../../utils/getRequest');
var shopnDraw = false;
Page({
    data: {
        userinfo: {},
        list: [],
        model: '',
        posterToast: false,
        shopnToast: false,
        codeimg: '',
        loadState: true,

        drawCanvasType: 'old',//canvas绘制方法 2.9.0以上new:新方法 old:老方法
    },
    onLoad: function (options) {
        let _this = this, drawCanvasType = 'old';
        if (compareVersion.contrast(app.globalData.system.SDKVersion, '2.9.0') != -1) { drawCanvasType = 'new'; }

        getRequest.post('index/poster/index', {
            uid: app.globalData.userInfo.id,
            store_id: app.globalData.userInfo.store_id,
            token: app.globalData.token
        }).then(function (res) {
            _this.setData({
                userinfo: app.globalData.userInfo,
                list: res.data,
                model: app.globalData.system.model,
                loadState: true,
                drawCanvasType: drawCanvasType
            })
        }).catch(function (err) {
            app.toastFun(err.msg);
            _this.setData({ loadState: false })
        });

        let scene = 'u=' + app.globalData.userInfo.id + '&f=' + app.globalData.userInfo.pid + '&t=h';
        let postdata = {
            is_hyaline: 1,
            width: 80,
            scene: scene,
            path: 'pages/login/login',
            token: app.globalData.token
        };
        getRequest.post('index/base/getQrCode', postdata).then(function (newqrcode) {
            _this.setData({ codeimg: newqrcode.data.qrcode })
        })
    },
    //关闭弹窗
    closeToast: function () {
        this.setData({
            posterToast: false,
            shopnToast: false
        })
    },
    //打开弹窗-商城海报
    shareShopn: function () {
        let _this = this;
        if (this.data.drawCanvasType == 'new') {
            this.shopnImage(this.data.codeimg);
        }
        else {
            this.downImg(_this.data.codeimg).then(function (res) {
                _this.shopnImage(res);
            });
        }
    },
    //打开弹窗-匠选商品海报
    shareBtn: function (e) {
        let idx = e.currentTarget.dataset.idx, _this = this;
        let qrcode = this.data.list[idx].qrcode, image = this.data.list[idx].image, goodsid = this.data.list[idx].id, avatar = app.globalData.userInfo.portrait, username = app.globalData.userInfo.username;
        if (qrcode) {//已生成过小程序码
            if (_this.data.drawCanvasType == 'new') {
                _this.saveImage(qrcode, image, avatar, username);
            }
            else {
                this.downImg(qrcode).then((res) => {
                    _this.downImg(image).then((info) => {
                        _this.downImg(avatar).then((avatarinfo) => {
                            _this.saveImage(res, info, avatarinfo, username);
                        })
                    })
                })
            }
        }
        else {//未生成过小程序码
            let scene = 'u=' + app.globalData.userInfo.id + '&f=' + app.globalData.userInfo.pid + '&t=g&gid=' + goodsid;
            let postdata = {
                uid: app.globalData.userInfo.id,
                goods_id: goodsid,
                is_hyaline: 1,
                width: 80,
                scene: scene,
                path: 'pages/login/login',
                token: app.globalData.token
            };
            getRequest.post('index/poster/add', postdata).then(function (newqrcode) {
                if (_this.data.drawCanvasType == 'new') {
                    _this.saveImage(newqrcode.data.qrcode, image, avatar, username);
                }
                else {
                    _this.downImg(newqrcode.data.qrcode).then((res) => {
                        _this.downImg(image).then((info) => {
                            _this.downImg(avatar).then((avatarinfo) => {
                                _this.saveImage(res, info, avatarinfo, username);
                            })
                        })
                    })
                }
            })
                .catch(function (err) { app.toastFun(err.msg); });
        }
    },
    //下载图片到本地
    downImg(url) {
        wx.showLoading({ title: '请稍后' });
        let promise = new Promise(function (resolve, reject) {
            wx.downloadFile({
                url: url, //请求的网络图片路径
                success: function (res) {
                    wx.hideLoading();
                    resolve(res.tempFilePath);
                },
                fail: function (res) {
                    wx.hideLoading();
                    app.toastFun('生成失败，请重试');
                    console.log('下载网络图片失败', res);
                }
            })
        });
        return promise;
    },
    //绘制图片-新方法
    canvasDrawImg(canvas, addimg, dpr, ctx, x, y, width, height) {
        const img = canvas.createImage();
        img.src = addimg;
        img.onload = () => {
            ctx.drawImage(img, x * dpr, y * dpr, width * dpr, height * dpr);
        }
    },
    //裁剪圆形图片-新方法
    canvasClipImg(canvas, addimg, dpr, ctx, x, y, width, height) {
        let img = canvas.createImage();
        img.src = addimg;
        img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc((x + width / 2) * dpr, (y + width / 2) * dpr, width / 2 * dpr, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, x * dpr, y * dpr, width * dpr, height * dpr);
            ctx.restore();
        }
    },
    //绘制海报-新方法
    goodsDraw(canvas, ctx, dpr, code, card, avatar, username) {
        canvas.width = 306 * dpr;
        canvas.height = 472.5 * dpr;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 306 * dpr, 472.5 * dpr);

        this.canvasDrawImg(canvas, card, dpr, ctx, 15, 15, 276, 330.5);
        ctx.fillStyle = '#231F20';
        ctx.font = 15 * dpr + 'px SourceHanSans';
        ctx.fillText(username, 81.5 * dpr, 403 * dpr);
        ctx.fillStyle = '#A7A5A6';
        ctx.font = 12 * dpr + 'px SourceHanSans';
        ctx.fillText('匠选官邀请码', 82.5 * dpr, 428 * dpr);

        this.canvasDrawImg(canvas, code, dpr, ctx, 220, 370, 60, 60);
        ctx.fillStyle = '#231F20';
        ctx.font = 9 * dpr + 'px SourceHanSans';
        ctx.fillText('长按识别小程序', 220 * dpr, 449 * dpr);

        this.canvasClipImg(canvas, avatar, dpr, ctx, 20, 382, 54, 54);
    },
    //绘制海报
    saveImage(code, card, avatar, username) {
        if (this.data.drawCanvasType == 'new') {
            let canvas = this.data.canvas, ctx;
            let dpr = wx.getSystemInfoSync().pixelRatio;
            if (!canvas) {
                let query = wx.createSelectorQuery();
                query.select('#saveimg').fields({ node: true, size: true }).exec((res) => {
                    canvas = res[0].node;
                    ctx = canvas.getContext('2d');
                    this.goodsDraw(canvas, ctx, dpr, code, card, avatar, username);
                    this.setData({ canvas: canvas });
                })
            }
            else {
                ctx = canvas.getContext('2d');
                this.goodsDraw(canvas, ctx, dpr, code, card, avatar, username);
            }
        }
        else {
            const ctx = wx.createCanvasContext('saveimg');
            var dpr = 1;
            if (this.data.model == 'iPhone 5') { dpr = 0.9; }
            ctx.setFillStyle('#FFFFFF');
            ctx.fillRect(0, 0, 306 * dpr, 472.5 * dpr);
            ctx.drawImage(card, 15 * dpr, 15 * dpr, 276 * dpr, 330.5 * dpr);
            ctx.setFillStyle('#231F20');
            ctx.setFontSize(15 * dpr);
            ctx.fillText(username, 81.5 * dpr, 403 * dpr);
            ctx.setFillStyle('#A7A5A6');
            ctx.setFontSize(12 * dpr);
            ctx.fillText('匠选官邀请码', 82.5 * dpr, 428 * dpr);

            ctx.drawImage(code, 220 * dpr, 370 * dpr, 60 * dpr, 60 * dpr);
            ctx.setFillStyle('#231F20');
            ctx.setFontSize(9);
            ctx.fillText('长按识别小程序', 220 * dpr, 449 * dpr);

            ctx.save();
            ctx.beginPath();
            ctx.arc(47 * dpr, 409 * dpr, 27 * dpr, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(avatar, 20 * dpr, 382 * dpr, 54 * dpr, 54 * dpr);
            ctx.restore();
            ctx.draw();
        }
        this.setData({ posterToast: true })
    },
    //绘制商城海报
    shopnImage(qrcode) {
        if (shopnDraw == false) {
            if (this.data.drawCanvasType == 'new') {
                let shopnquery = wx.createSelectorQuery();
                shopnquery.select('#shopnimg').fields({ node: true, size: true }).exec((res) => {
                    let shopncanvas = res[0].node;
                    let ctx = shopncanvas.getContext('2d');
                    let dpr = wx.getSystemInfoSync().pixelRatio;
                    shopncanvas.width = 306 * dpr;
                    shopncanvas.height = 472.5 * dpr;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, 306 * dpr, 472.5 * dpr)
                    this.canvasDrawImg(shopncanvas, '../../images/poster_img.png', dpr, ctx, 15, 15, 276, 330.5);
                    this.canvasDrawImg(shopncanvas, '../../images/poster_logo.png', dpr, ctx, 20, 380, 99, 42.5);
                    ctx.fillStyle = '#231F20';
                    ctx.font = 9 * dpr + 'px SourceHanSans';
                    this.canvasDrawImg(shopncanvas, qrcode, dpr, ctx, 225, 370, 60, 60);
                    ctx.fillText('长按识别小程序', 225 * dpr, 445 * dpr);
                    this.setData({ shopncanvas: shopncanvas })
                })
            }
            else {
                const ctx = wx.createCanvasContext('shopnimg');
                let dpr = 1;
                if (this.data.model == 'iPhone 5') { dpr = 0.9; }
                ctx.setFillStyle('#ffffff');
                ctx.fillRect(0, 0, 306 * dpr, 472.5 * dpr)
                ctx.drawImage('../../images/poster_img.png', 15 * dpr, 15 * dpr, 276 * dpr, 330.5 * dpr);
                ctx.drawImage('../../images/poster_logo.png', 20 * dpr, 380 * dpr, 99 * dpr, 42.5 * dpr);
                ctx.setFillStyle('#231F20');
                ctx.setFontSize(9 * dpr);
                ctx.drawImage(qrcode, 225 * dpr, 370 * dpr, 60 * dpr, 60 * dpr);
                ctx.fillText('长按识别小程序', 225 * dpr, 445 * dpr);
                ctx.draw();

            }
            shopnDraw = true;
        }
        this.setData({ shopnToast: true })
    },
    //保存海报
    downLoadImg: function (e) {
        var _this = this, canvasId = e.currentTarget.dataset.canvasid, downid = '';
        if (this.data.drawCanvasType == 'new') {
            if (canvasId == 'shopnimg') { downid = this.data.shopncanvas; }
            else { downid = this.data.canvas; }
            wx.canvasToTempFilePath({
                canvas: downid,
                success: function (res) {
                    if (!res.tempFilePath) {
                        wx.showModal({
                            title: '提示',
                            content: '图片绘制中，请稍后重试',
                            showCancel: false
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
                                success: function (success) {
                                    _this.closeToast();
                                }
                            })
                        }
                    })
                },
                fail: function (res) { console.log(res); }
            })
        }
        else {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                canvasId: canvasId,
                success: function (res) {
                    if (!res.tempFilePath) {
                        wx.showModal({
                            title: '提示',
                            content: '图片绘制中，请稍后重试',
                            showCancel: false
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
                                success: function (success) {
                                    _this.closeToast();
                                }
                            })
                        },
                        fail(save) {
                            console.log(save)
                        }
                    })
                },
                fail: function (res) {
                    console.log(res)
                }
            })
        }
    },
    //分享
    onShareAppMessage: function () {
        return {
            title: '邀妳一起即刻激活权益，闺蜜同享水光护理',
            imageUrl: 'https://cmjx.chengmeijiangxuan.com/static/common/images/share.jpg',
            path: 'pages/login/login?u=' + app.globalData.userInfo.id + '&f=' + app.globalData.userInfo.pid + '&t=h'
        }
    }
})