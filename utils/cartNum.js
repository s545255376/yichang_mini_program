//商品数量统计
const app = getApp();
function changeTabCardNum() {
    if (app.globalData.userInfo.id != '') {
        let promise = new Promise(function (resolve, reject) {
            wx.request({
                url: app.globalData.url + 'index/cart/stats',
                data: {
                    uid: app.globalData.userInfo.id,
                    token: app.globalData.token
                },
                method: 'POST',
                success: function (res) {
                    if (res.data.code == 200) {
                        // if(res.data.data.cart_count == 0){
                        //   wx.hideTabBarRedDot({index: 1});
                        // }
                        // else{
                        //   wx.setTabBarBadge({ index: 1, text: res.data.data.cart_count+'' });
                        // }
                        resolve(res.data);
                    }
                    else {
                        reject(res.data);
                    }
                }
            })
        });
        return promise;
    }
    else {
        // let promise = new Promise(function () {
        //   wx.hideTabBarRedDot({index: 1});
        // });
        // return promise;
    }
}
module.exports = {
    sum: changeTabCardNum
}