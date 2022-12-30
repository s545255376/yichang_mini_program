const app = getApp();
//const db = wx.cloud.database();
//网络请求-非正常情况弹窗提示
function post(link, params, hideLoading = false) {
    /**
     * @param {Boolean} hideLoading 有些请求非必要显示loading界面
     */
    let promise = new Promise(function (resolve, reject) {
        if (app.globalData.icloading == false) {
            if (!hideLoading) wx.showLoading({
                title: '加载中'
            })
            app.globalData.icloading = true;
        }
        wx.request({
            url: app.globalData.url + link,
            data: params,
            method: 'POST',
            success: function (res) {
                if (app.globalData.icloading == true) {
                    app.globalData.icloading = false;
                }
                wx.hideLoading();
                if (res.data.code == 200) {
                    resolve(res.data);
                } else if (res.data.code == 204) {
                    app.globalData.token = '';
                    app.globalData.userInfo = {
                        mobile: '',
                        username: '',
                        portrait: '',
                        sex: '',
                        stauts: '',
                        fid: '',
                        id: ''
                    };
                    app.toastFun(res.data.msg);
                    reject(res.data);
                } else {
                    app.toastFun(res.data.msg);
                    reject(res.data);
                }
            },
            fail: function (res) {
                console.log(res, '接口请求失败回调');
                if (app.globalData.icloading == true) {
                    app.globalData.icloading = false;
                }
                wx.hideLoading();
                app.toastFun('服务器连接失败，请稍后重试！');
                reject(res.data);
            }
        })
    });
    return promise;
}
//网络请求-非正常情况不弹窗提示
function noToastPost(link, params) {
    let promise = new Promise(function (resolve, reject) {
        wx.request({
            url: app.globalData.url + link,
            data: params,
            method: 'POST',
            success: function (res) {
                if (res.data.code == 200) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail: function (res) {
                console.log(res)
            }
        })
    });
    return promise;
}

// function errlogPost(title, msg = {}, postdata = {}, other = {}) {
//     /**
//      * 云开发计费调整后没有使用意义
//      */
//     let date = new Date();
//     db.collection('errorlog').add({
//         data: Object.assign({
//             date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
//             title: title,
//             msg: msg,
//             postdata: postdata,
//             mobile: msg.hasOwnProperty('mobile') ? msg.mobile : ''
//         }, other)
//     })
// }

module.exports = {
    post: post,
    noToastPost: noToastPost,
    //errlogPost: errlogPost
}