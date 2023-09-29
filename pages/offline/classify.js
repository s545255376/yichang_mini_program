// pages/classify/classify.js
const app = getApp();
const Font = require('../../utils/getFont');
const getRequest = require('../../utils/getRequest');
Page({
    data: {
        screenHeight: wx.getSystemInfoSync().windowHeight,  
        activeKey: 0,
        classifyList: [],
        value:'',
        columnGoods: {
            list: [],
            image:''
        }
    },
    onLoad(options) {
        wx.hideShareMenu();
        this.getGoodsList(0);
        let query = wx.createSelectorQuery();
        query.select('#search').boundingClientRect((rect) => {
            if (rect) {
                // console.log(wx.getSystemInfoSync().windowHeight - wx.getSystemInfoSync().safeArea.top - 50 - rect.height);
                // console.log(rect.height);
                // console.log(wx.getSystemInfoSync().windowHeight - wx.getSystemInfoSync().safeArea.top - 50)
                this.setData({
                    screenHeight: this.data.screenHeight - rect.height + 10
                })
            }
        }).exec();
    },
    onShow() {
        
    },
    //获取商品列表
    getGoodsList() {
        return new Promise((resolve, reject) => {
            getRequest.post('index/index/goods', {
                store_id: app.globalData.userInfo.store_id,
                role_id: app.globalData.userInfo.role_id,
                u_id: app.globalData.userInfo.id,
                is_cash: 1
            }, true).then((res) => {
                if (res.code == 200) {
                    let _data = res.data;
                    let allGoods = [];
                    res.data.map(key => {
                        allGoods = allGoods.concat(key.columnGoods);
                    });
                    _data.unshift({
                        columnGoods: allGoods,
                        title: '全部',
                        image:''
                    })
                    this.setData({
                        classifyList: _data,
                        columnGoods: {
                            list: [..._data[0].columnGoods],
                            image: _data[0].image
                        }
                    })
                }
            }).finally(() => {
                resolve();
            })
        })
    },
    onChange(e) {
        const { detail } = e;
        const { classifyList } = this.data;
        this.setData({
            activeKey: detail,
            columnGoods: {
                list: [...classifyList[detail].columnGoods],
                image: classifyList[detail].image
            }
        })
    },
    //商品详情
    goGoodsInfo(e) {
        const { goodsid } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `../goodsdetail/goodsdetail?goods_id=${goodsid}&live=false&active_key=${this.data.activeKey}&pre=classify&is_cash=1`,
        })
    },
    intoSearchPage() {
        wx.navigateTo({
            url: `../classifySearch/classifySearch`
        })
    }
})