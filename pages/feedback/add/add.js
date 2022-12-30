const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        id: '',
        type: 'new',
        feedInfo: '',
        uploadimg: [],
        needAdapt: app.globalData.system.needAdapt
    },
    onLoad: function (options) {
        this.setData({
            type: options.type,
            id: options.id
        })
    },
    //全屏显示图片
    bannerClick(e) {
        let idx = e.currentTarget.dataset.idx;
        wx.previewImage({
            current: this.data.uploadimg[idx].img,
            urls: [this.data.uploadimg[idx].img],
        })
    },
    //输入反馈内容
    inputChange(e) {
        this.setData({
            feedInfo: e.detail.value
        })
    },
    //添加图片
    addImg() {
        const uploadimg = this.data.uploadimg;
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
                                uploadimg.push({
                                    img: tempFilePaths,
                                    url: json.data.url
                                });
                                this.setData({
                                    uploadimg
                                })
                            } else {
                                app.toastFun(json.msg);
                            }
                        }
                    })
                } else {
                    app.toastFun('图片选择失败，请重新选择');
                }
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
    //保存
    saveBtn() {
        let link = '',
            image = '';
        this.data.uploadimg.forEach(function (e) {
            if (image == '') {
                image = e.url;
            } else {
                image = image + '|' + e.url;
            }
        })
        let postdata = {
            content: this.data.feedInfo,
            store_id: app.globalData.userInfo.store_id,
            uid: app.globalData.userInfo.id,
            image: image,
            token: app.globalData.token
        };
        if (this.data.type == 'new') {
            link = 'index/feed_back/add';
        } else {
            link = 'index/feed_back/reply';
            postdata.feedback_id = this.data.id;
        }
        getRequest.post(link, postdata).then(function (res) {
                app.toastFun(res.msg);
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 1000);
            })
            .catch(function (err) {
                app.toastFun(err.msg);
            });
    }
})