// pages/classify/classify.js
const app = getApp();
const Font = require('../../utils/getFont');
const cartNum = require('../../utils/cartNum.js');
const getRequest = require('../../utils/getRequest');
Page({
  data: {
    sort_sale: true,
    screenHeight: wx.getSystemInfoSync().windowHeight,  
    activeKey: 0,
    classifyList: [],
    cartnum: 0,
    value: '',
    message: '',
    columnGoods: {
      list: [],
      image:''
    }, 
  },
  onLoad(options) {
    let _this = this;
    let direct = "no";
    if ('table_number' in options) {
      app.globalData.table_number = options.table_number;
      direct = "yes"
    }
    if ('area_type' in options) {
      app.globalData.area_type = options.area_type;
    }
    let postdata = {
      uid: app.globalData.userInfo.id,
      token: app.globalData.token
    };
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
              // setTimeout(() => {
              //     wx.reLaunch({
              //       url: '../login/login?direct=' + direct,
              //     })
              // }, 1200);
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
    //减少数量
  delNum: function (e) {
    let idx = e.currentTarget.dataset.idx;
    let num = this.data.columnGoods.list[idx].num;
    if(1 < num) {
      num -= 1;
      // this.changeNum(idx,this.data.list[type][idx].cart_id,num,type);
    }
  },
  //增加数量
  addNum: function (e) {
    let idx = e.currentTarget.dataset.idx;
    let num = this.data.columnGoods.list[idx].num;
    num += 1;
    // this.changeNum(idx,this.data.list[type][idx].cart_id,num,type);
  },
  //保存数量
  changeNum(idx, cart_id, num, type) {
    let _this = this,postdata={
      uid:app.globalData.userInfo.id,
      token:app.globalData.token,
      cart_id:cart_id,
      num:num
    };
    getRequest.post('index/cart/revise',postdata).then(function(res){
      _this.data.list[type][idx].num = num;
      let listnum = "list["+type+"]["+idx+"].num";
      _this.setData({[listnum]:num})
      _this.priceSum(_this.data.searchList,_this.data.modeltype);
      // cartNum.sum().catch();
    }).catch(function(err){app.toastFun(err.msg);})
  },
  changeSort() {
    this.setData({
      sort_sale: !this.data.sort_sale
    })
  },
    //获取商品列表
  getGoodsList() {
        return new Promise((resolve, reject) => {
            getRequest.post('index/index/goods', {
                store_id: app.globalData.userInfo.store_id,
                role_id: app.globalData.userInfo.role_id,
                u_id: app.globalData.userInfo.id,
              is_cash: 1,
                area_type: app.globalData.area_type
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