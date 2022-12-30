const app = getApp();
function post(link,params){
  let promise = new Promise(function (resolve, reject) {
    if (app.globalData.icloading == false) {
      wx.showLoading({ title: '加载中' })
      app.globalData.icloading = true;
    }
    wx.request({
      url: 'https://yiqi.chengmei.com/index/instrument/' + link,
      data: params,
      method: 'POST',
      success: function (res) {
        if (app.globalData.icloading == true) {
            app.globalData.icloading = false;
        }
        wx.hideLoading();
        if (res.data.code == 200) {
          resolve(res.data);
        }
        else if (res.data.code == 204) {
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
        }
        else {
          app.toastFun(res.data.msg);
          reject(res.data);
        }
      },
      fail: function (res) {
        console.log(res)
        if (app.globalData.icloading == true) {
            app.globalData.icloading = false;
        }
        wx.hideLoading();
        wx.showToast({
          title: '服务器连接失败，请稍后重试！',
          icon: 'none',
          duration: 2000
        })
        reject(res.data);
      }
    })
  });
  return promise
}
module.exports = {
  post: post
}