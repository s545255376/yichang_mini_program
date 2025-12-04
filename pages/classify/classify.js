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
        // this.getGoodsList(0);  // 注意：getGoodsList没有参数，这里的0无意义
        this.getGoodsList(); // bug1: getGoodsList()本身无参数，应去掉 0
        let query = wx.createSelectorQuery();
        query.select('#search').boundingClientRect((rect) => {
            if (rect) {
                // 修改点：this.data.screenHeight 此时页面刚onLoad使用windowHeight，存在未渲染时query/select不到#search，或者高度异常，需容错
                // 建议校验rect.height为正常数值
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
            // bug2: 如果app.globalData.userInfo为null或未赋值，会报错，需加容错
            const userInfo = app.globalData.userInfo || {};
            getRequest.post('index/index/goods', {
                store_id: userInfo.store_id, // 如果未登录未必有值
                role_id: userInfo.role_id,
                u_id: userInfo.id
            }, true).then((res) => {
                if (res.code == 200) {
                    let _data = res.data;
                    let allGoods = [];
                    // bug3: res.data可能不是数组或返回空时会报错
                    if (Array.isArray(res.data)) {
                        res.data.map(key => {
                            allGoods = allGoods.concat(key.columnGoods || []);
                        });
                    }
                    _data.unshift({
                        columnGoods: allGoods,
                        title: '全部',
                        image:''
                    })
                    // bug4: _data[0]可能不存在，需防御性代码
                    this.setData({
                        classifyList: _data,
                        columnGoods: {
                            list: Array.isArray(_data[0]?.columnGoods) ? [..._data[0].columnGoods] : [],
                            image: _data[0]?.image || ''
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
        // bug5: detail可能越界或columnGoods不存在
        if (!Array.isArray(classifyList) || !classifyList[detail]) return;
        this.setData({
            activeKey: detail,
            columnGoods: {
                list: Array.isArray(classifyList[detail].columnGoods) ? [...classifyList[detail].columnGoods] : [],
                image: classifyList[detail].image || ''
            }
        })
    },
    //商品详情
    goGoodsInfo(e) {
        // bug6: goodsid 可能拿不到，应该先校验
        const { goodsid } = e.currentTarget.dataset;
        if (!goodsid) return;
        wx.navigateTo({
            url: `../goodsdetail/goodsdetail?goods_id=${goodsid}&live=false&active_key=${this.data.activeKey}&pre=classify`,
        })
    },
    intoSearchPage() {
        wx.navigateTo({
            url: `../classifySearch/classifySearch`
        })
    }
})