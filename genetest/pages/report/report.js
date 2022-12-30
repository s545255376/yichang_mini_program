// genetest/pages/report/report.js
const app = getApp()
Page({
    data: {
        urls: ''
    },
    onLoad(e) {
        const {
            username,
            id
        } = app.globalData.userInfo;
        wx.setNavigationBarTitle({
            title: `${username}-美容基因报告`
        })
        const _timestamp = new Date().getTime();
        const _urls = `https://cmjx.chengmeijiangxuan.com/static/web/s/index.html?id=${e.id}&name=${username}&uid=${id}&timestamp=${_timestamp}`;
        this.setData({
            urls: _urls
        })
    },
})