const app = getApp();
const getRequest = require('../../../../utils/getRequest');
Page({
    data: {
        screenHeight:app.globalData.system.screenHeight,
        windowHeight:app.globalData.system.winHeight,
        needAdapt:app.globalData.system.needAdapt,
        tabList:[],
        active: 0,
        currentPage:'1',
        confirmPOPShow:true,
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
        canvasHeight: '',
        needAdapt: app.globalData.system.needAdapt
    },
    onLoad(e){
        if(Object.keys(e).length > 0){
            this.setArticleList(e);
        }else{
            this.init();
        }
    },
    intoCollection(){
        wx.navigateTo({
            url:'../collection/collection'
        })
    },
    //下载所有素材(一个人头记一次素材下载量)
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
                console.log(res)
            })
        })
    },
    confirmPOPShow(){
        this.setData({
            confirmPOPShow:true
        })
    },
    hide(){
        this.setData({
            confirmPOPShow:false
        })
    },
    //绘制下载所需canvas并下载
    async downloadMain(material, item, index){
        const _this = this;
        wx.showLoading({
            title: '下载中(' + index + '/' + material.length + ')',
        })
        wx.downloadFile({
            url:item.url,
            success: res => {
                if(item.type == 'image'){//下载图片
                    console.log(item.checked)
                    if(item.checked == 1){//下载的是海报
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
                            //下载绘制后的canvas
                            wx.canvasToTempFilePath({
                                canvas,
                                canvasId:'canvasPoster',
                                destWidth:canvasData[0].width,
                                destHeight:canvasData[0].height,
                                success: (reses) => {
                                    wx.saveImageToPhotosAlbum({
                                        filePath:reses.tempFilePath,
                                        success: (res) => {
                                            if(index == material.length){
                                                wx.hideLoading();
                                                app.toastFun('保存成功');
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
                                },fail: () => {}
                            })
                        }
                    }else{//直接下载图片
                        wx.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                if(index == material.length){
                                    wx.hideLoading();
                                    app.toastFun('下载完成~');
                                }
                                if(index < material.length){
                                    _this.downloadMain(material, material[index], index + 1);
                                }
                            }
                        })
                    }
                }else if(item.type == 'video'){//下载视频
                    wx.saveVideoToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => {
                            if(index == material.length){
                                wx.hideLoading();
                                app.toastFun('保存成功');
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
                app.toastFun('保存图片失败');
            }
        })
    },
    //全屏查看图片
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
    //点击绘制并查看海报
    initCanvas(){
        const _this = this;
        const _promise = new Promise((resolve, reject) => {
            const query = wx.createSelectorQuery();
            query.select('#canvasPoster').fields({node: true, size: true}).exec((res) => {
                const canvas = res[0].node;
                const ctx = canvas.getContext('2d');
                _this.setData({
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
                ctx.fillText('— 诚美匠选',30 * dpr, 831 * dpr);
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
    //复制文案
    copyClipboard(e){
        wx.setClipboardData({
            data: e.currentTarget.dataset.content,
            success (res) {wx.hideToast();app.toastFun('复制成功');}
        })
    },
    //收藏/取消收藏
    getCollection(e){
        let _this = this;
        getRequest.post('index/material/collection', {
            uid:app.globalData.userInfo.id,
            mid:e.currentTarget.dataset.mid,
            token:app.globalData.token
        }).then(res => {
            const { list } = _this.data.articleList;
            list.map((key, index) => {
                if(e.currentTarget.dataset.index == index){
                    key.collection = key.collection == 0 ? 1 : 0;
                }
            })
            _this.setData({
                ['articleList.list']:list
            })
        }).catch(function(res){
            console.log(res)
        })
    },
//     showAll(e){
//         let { list } = this.data.articleList
//         ,_r = 'articleList.list';
//         list[e.currentTarget.dataset.index].showAll = !(list[e.currentTarget.dataset.index].showAll);
//         this.setData({
//             [_r]:list
//         })
//     },
    //切换搜索的分类
    onChange(e) {
        this.setData({
            active:e.currentTarget.dataset.index,
            currentPage:'1',
            articleList:{
                list:[],
                next_page_flag:0
            }
        })
        this.getArticleList(this.data.tabList[e.currentTarget.dataset.index].id);
    },
    //获取分类下的列表
    getArticleList(cateId){
        let _this = this;
        getRequest.post('index/material/lists', {
            uid:app.globalData.userInfo.id,
            token:app.globalData.token,
            collection:'',
            cateId:cateId,
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
        }).catch(function(res){
            _this.setData({
                errorMsg:{
                    isError:true,
                    msg:res.msg
                }
            })
        })
    },
    //判断显示列表里素材是否配收藏
    setArticleList(e){
        const { list } = this.data.articleList;
        list.map(key => {
            if(key.id == e.mid){
                key.collection = e.collection == 0 ? 1 : 0
            }
        })
        this.setData({
            ['articleList.list']:list
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
    //获取基本信息
    init(){
        let _this = this;
        //获取分类
        getRequest.post('index/material/cates', {
            token:app.globalData.token
        }).then(res => {
            _this.setData({
                tabList:res.data,
                active:0,
                currentPage:'1',
                articleList:{
                    list:[],
                    next_page_flag:0
                },
                errorMsg:{
                    isError:false,
                    msg:''
                }
            })
            _this.getArticleList(this.data.tabList[0].id);
        }).catch(function(res){
            console.log(res);
            _this.setData({
                errorMsg:{
                    isError:true,
                    msg:res.msg
                }
            })
        })

        //获取素材库二维码
        const _tgScene = `u=${app.globalData.userInfo.id}&f=${app.globalData.userInfo.pid}&t=h`;

        const _tgStr = {
            scene:_tgScene,
            path:'pages/login/login',
            width:344,
            is_hyaline:0
        }
        getRequest.post('index/base/getQrCode', _tgStr,).then(res => {
            console.log(res.data.qrcode)
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
                    //res.pixelRatio
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
    },
})