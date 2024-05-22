// pages/classify/classify.js
const app = getApp();
const Font = require('../../utils/getFont');
const cartNum = require('../../utils/cartNum.js');
const getRequest = require('../../utils/getRequest');
Page({
    data: {
        screenHeight: wx.getSystemInfoSync().windowHeight,  
        activeKey: 0,
    classifyList: [],
    cartnum: 0,
    value: '',
    message: '',
        columnGoods: {
            list: [],
            image:''
        }
    },
  onLoad(options) {
    let direct = "no";
    if ('table_number' in options) {
      app.globalData.table_number = options.table_number;
      direct = "yes"
    }

    let postdata = {
      uid: app.globalData.userInfo.id,
      token: app.globalData.token
    };
    let _this = this;
    getRequest.post('index/message/stats', postdata, true).then(function (res) {
      _this.setData({
          message: res.data.msg
      })
  })
  .catch(function (err) {
      wx.removeStorage({
          key: 'logindata',
          success(res) {
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
              wx.hideTabBarRedDot({
                  index: 1
              });
              wx.clearStorage();
              _this.setData({
                  showActionsheet: false,
              })
              app.toastFun("用户登录信息已过期，请重新登录");
              setTimeout(() => {
                  wx.reLaunch({
                    url: '../login/login?direct=' + direct,
                  })
              }, 1200);
          }
      })
  });

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
        //获取并显示购物车中已有商品数量，以及显示已经选中的赠品列表
        if (app.globalData.userInfo.id != '') {
          let _this = this
          cartNum
              .sum()
              .then(function (res) {
                  _this.setData({
                      cartnum: res.data.cart_count
                  })
              })
              .catch()
      }
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
      console.log(this.data.activeKey);
      console.log(goodsid);
        wx.navigateTo({
            url: `../goodsdetail/goodsdetail?goods_id=${goodsid}&live=false&active_key=${this.data.activeKey}&pre=classify&is_cash=1`,
        })
  },
  //跳转购物车
  goCart: function () {
    wx.navigateTo({
        url: '../cart/cart',
    })
},
    intoSearchPage() {
        wx.navigateTo({
            url: `../classifySearch/classifySearch?is_cash=1`
        })
    }
})