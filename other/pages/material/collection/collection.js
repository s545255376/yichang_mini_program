const app = getApp();
const getRequest = require('../../../../utils/getRequest');
Page({
    data: {
        screenHeight:app.globalData.screenHeight,
        currentPage:'1',
        articleList:{
            list:[],
            next_page_flag:0
        },
        errorMsg:{
            isError:false,
            msg:''
        },
        qrcode:'',
        systemInfo:'',
        canvasWidth:'',
        canvasHeight:'',
    },
    onLoad(){
        this.init();
    },
    downloadAll(e){
        let _this = this;
        const { material,id } = e.currentTarget.dataset.item;
        this.initCanvas().then(() => {
            getRequest.post('index/material/download', {
                uid:app.globalData.userInfo.id,
                mid:id,
                token:app.globalData.token
            }).then(() => {
                _this.downloadMain(material, material[0], 1);
            }).catch(function(res){
                console.log(res);
            })
        })
    },
    async downloadMain(material, item, index){
        const _this = this;
        wx.showLoading({
            title: '下载中(' + index + '/' + material.length + ')',
        })
        const downloadTask = wx.downloadFile({
            url:item.url,
            success: res => {
                if(item.type == 'image'){
                    if(item.checked == 1){
                        //拿到canvas实例
                        const { canvasData, canvasCtx } = _this.data;
                        const canvas = canvasData[0].node;
                        const dpr = _this.data.systemInfo.pixelRatio;
                        //清空背景图位置
                        canvasCtx.fillStyle="#FFFFFF";  
                        canvasCtx.beginPath();  
                        canvasCtx.fillRect(0,0,550 * dpr, 730 * dpr);  
                        canvasCtx.closePath();
                        //绘制背景图
                        const bgImg = canvas.createImage();
                        bgImg.src = item.url;
                        bgImg.onload = () => {
                            canvasCtx.drawImage(bgImg,0, 0, 550 * dpr, 730 * dpr);
                            wx.canvasToTempFilePath({
                                canvas,
                                canvasId:'canvasPoster',
                                destWidth:canvasData[0].width,
                                destHeight:canvasData[0].height,
                                success: (reses) => {
                                    wx.saveImageToPhotosAlbum({
                                        filePath:reses.tempFilePath,
                                        success:(res) => {
                                            if(index == material.length){
                                                wx.hideLoading();
                                                wx.showToast({
                                                    title: '保存成功',
                                                });
                                            }
                                            if(index < material.length){
                                                _this.downloadMain(material, material[index], index + 1);
                                            }
                                        },
                                        fail: (res) => {
                                            //saveImageToPhotosAlbum:fail:auth denied
                                            //saveImageToPhotosAlbum:fail authorize no response
                                            wx.hideLoading();
                                            wx.showModal({
                                                content: '对不起，您曾经取消小程序授权访问您的相册，故本次登录无法保存图片，请退出小程序，删除缓存并尝试重新进入！',
                                                showCancel: false,
                                                confirmText: '好的'
                                            })
                                        }
                                    })
                                },fail: (res) => {}
                            })
                        }
                        
                    }else{
                        wx.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                if(index == material.length){
                                    wx.hideLoading();
                                    app.toastFun('下载完成~');
                                }
                                wx.hideLoading()
                                if(index < material.length){
                                    _this.downloadMain(material, material[index], index + 1);
                                }
                            }
                        })
                    }
                }else if(item.type == 'video'){
                    wx.saveVideoToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => {
                            if(index == material.length){
                                wx.hideLoading()
                                wx.showToast({
                                    title: '保存成功',
                                });
                            }
                            if(index < material.length){
                                _this.downloadMain(material, material[index], index + 1);
                            }
                        }
                    })
                }
            },
            fail: () => {
                wx.hideLoading();
                wx.showToast({
                    title: '保存图片失败',
                    icon: 'none',
                })
            }
        })
    },
    previewImages(e){
        const { material, item } = e.currentTarget.dataset;
        const _arr = [];
        material.map(key => {
            if (key.type == 'image') {
                _arr.push(key.url);
            }
        })
        
        wx.previewImage({
            current: item.url, // 当前显示图片的http链接
            urls: _arr // 需要预览的图片http链接列表
        })
    },
    initCanvas(){
        const _this = this;
        const _promise = new Promise((resolve, reject) => {
            const query = wx.createSelectorQuery();
            query.select('#canvasPoster').fields({node: true, size: true}).exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                this.setData({
                    canvasCtx:ctx,
                    canvasData:res
                })
                const dpr = _this.data.systemInfo.pixelRatio;
                canvas.width = res[0].width;
                canvas.height = res[0].height;
                ctx.scale(1, 1);
                ctx.fillStyle = '#FFFFFF'; //背景色
                ctx.fillRect(0, 0, res[0].width, res[0].height);   //背景矩形
                //绘制文字和虚线和二维码
                ctx.fillStyle = '#D90B33';
                ctx.font = `${24 * dpr}px Arial`;
                ctx.fillText('— 诚美匠选CMJX',30 * dpr, 831 * dpr);
                //绘制虚线
                ctx.lineWidth = 2 * dpr;
                ctx.strokeStyle = '#A8A8A8';
                ctx.beginPath();
                ctx.setLineDash([20, 20]);
                ctx.moveTo(30 * dpr, 851 * dpr);
                ctx.lineTo(324 * dpr, 851 * dpr);
                ctx.stroke();
                //绘制虚线结束
                ctx.fillStyle = '#A8A8A8';
                ctx.font = `${24 * dpr}px Arial`;
                ctx.fillText('长按二维码·随时随地开始学习',30 * dpr, 885 * dpr);
                //绘制二维码
                const qrcodeImg = canvas.createImage();
                qrcodeImg.src = _this.data.qrcode;
                qrcodeImg.onload = () => {
                    ctx.drawImage(qrcodeImg, 398 * dpr, 780 * dpr, 122 * dpr, 122 * dpr);
                }
                resolve();
            })
        })
        return _promise
    },
    copyClipboard(e){
        wx.setClipboardData({
            data: e.currentTarget.dataset.content,
            success (res) {wx.hideToast();app.toastFun('复制成功');}
        })
    },
    getCollection(e){
        let _this = this;
        getRequest.post('index/material/collection', {
            uid:app.globalData.userInfo.id,
            mid:e.currentTarget.dataset.mid,
            token:app.globalData.token
        }).then(res => {
            let list = _this.data.articleList.list;
            list.splice(e.currentTarget.dataset.index,1);
            _this.setData({
                ['articleList.list']:list
            })

            //获取当前页面的页面栈
            let page=getCurrentPages();
            //获取上一个页面的页面栈
            let lastPage=page[page.length-2];
            //调用onload事件
            lastPage.onLoad({
                mid:e.currentTarget.dataset.mid,
                collection:e.currentTarget.dataset.collection
            });
        }).catch(function(res){
            console.log(res)
        })
    },
    showAll(e){
        let { list } = this.data.articleList,_r = 'articleList.list';
        list[e.currentTarget.dataset.index].showAll = !(list[e.currentTarget.dataset.index].showAll);
        this.setData({
            [_r]:list
        })
    },
    getArticleList(){
        let _this = this;
        getRequest.post('index/material/lists', {
            uid:app.globalData.userInfo.id,
            cateId:'',
            token:app.globalData.token,
            collection:1,
            page:this.data.currentPage
        }).then(res => {
            let _list = _this.data.articleList.list,_arr = []; //预备数组
            const _data = res.data;
            _data.list.map(key => {
                let regex = new RegExp('\n', 'g'); // 使用g表示整个字符串都要匹配
                let result = key.content.match(regex);//match方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
                let count= !result ? 0 : result.length;
                key['hasArrow'] = count >= 4 || key.content.length > 200 ? true : false;
                key['showAll'] = count >= 4 || key.content.length > 200 ? false : true;
            })
            
            if(_list.length == 0){
                _arr = res.data.list;
            }else{
                _arr = _list.concat(res.data.list);
            }
            _data.list = _arr;
            _this.setData({
                articleList:_data,
                errorMsg:{
                    isError:false,
                    msg:''
                }
            })
        }).catch(res => {
            _this.setData({
                errorMsg:{
                    isError:true,
                    msg:res.msg
                }
            })
        })
    },
    onReachBottom(){
        let _isNextPage = this.data.articleList.next_page_flag,_currentPage = this.data.currentPage;
        if(_isNextPage == 1){
            this.setData({
                currentPage:parseInt(_currentPage) + 1
            })
            this.getArticleList(this.data.tabList[this.data.active].id);
        }else{
            app.toastFun('已经到底了');
        }
    },
    init(){
        let _this = this;
        //获取素材库二维码
        const _tgScene = `u=${app.globalData.userInfo.id}&f=${app.globalData.userInfo.pid}&t=h`;
        const _tgStr = {
            scene:_tgScene,
            path:'pages/login/login',
            width:344,
            is_hyaline:0
        }
        getRequest.post('index/base/getQrCode', _tgStr,).then(res => {
            if(res.code == 200){
                if(res.data){
                    this.setData({
                        qrcode:res.data.qrcode
                    })
                }else{
                    wx.showModal({
                        title: '提示',
                        content: '获取信息失败，请退出本页重新进入！',
                        showCancel:false,
                        success (res) {
                            if (res.confirm) {
                                wx.navigateBack({
                                    delta:1
                                })
                            }
                        }
                    })
                }
            }
        }).catch(function(res){console.log(res);})

        //初始化设备环境
        wx.getSystemInfo({
            success: (res) => {
                _this.setData({
                    systemInfo:{
                        pixelRatio:1
                    },
                    canvasWidth:550 * 1,
                    canvasHeight:952 * 1
                })
            },
            fail:() => {
                _this.setData({
                    systemInfo:{
                        pixelRatio:1
                    },
                    canvasWidth:550,
                    canvasHeight:952
                })
            }
        })
        //
        this.getArticleList();
    },
})
