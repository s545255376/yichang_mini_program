// pages/classifySearch/classifySearch.js
const app = getApp();
const getRequest = require('../../utils/getRequest');
Page({
    data: {
        screenHeight: wx.getSystemInfoSync().windowHeight - 20,
        value:'',
        columnGoods: [],
        searchBarHeight: 0,
        is_cash: 0
    },
  onLoad(option) {
        console.log(option);
        if (option.is_cash) {
          this.setData({
            is_cash: option.is_cash
        })
        }
        let query = wx.createSelectorQuery();
        query.select('#search').boundingClientRect((rect) => {
            if (rect) {
                this.setData({
                    searchBarHeight: rect.height
                })
            }
        }).exec();
    },
  confirmSearch(e) {
        let _this = this
        return new Promise((resolve, reject) => {
            getRequest.post('index/index/goods', {
                store_id: app.globalData.userInfo.store_id,
                role_id: app.globalData.userInfo.role_id,
                u_id: app.globalData.userInfo.id,
                keywords: e.detail,
                is_cash:  _this.data.is_cash
            }, true).then((res) => {
                console.log(res);
                if (res.code == 200 && res.data.length > 0) {
                    let columnGoods = [];
                    res.data.map(key => {
                        columnGoods = columnGoods.concat(key.columnGoods);
                    })
                    this.setData({
                        columnGoods
                    })
                }
            }).finally(() => {
                resolve();
            })
        })
    },
    //商品详情
    goGoodsInfo(e) {
        const { goodsid } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `../goodsdetail/goodsdetail?goods_id=${goodsid}&live=false`,
        })
    }
})