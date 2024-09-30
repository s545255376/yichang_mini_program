const app = getApp();
const cartNum = require('../../utils/cartNum.js');
const getRequest = require('../../utils/getRequest');
Page({
  data: {
    list:[[],[],[]],
    cancel:[],
    modeltype:'none',
    modelall:[false,false,false],
    searchList:[],
    sumprice:0,
    //规格选择
    goodsToast:false,
    normstype:-1,
    normsid:-1,
    toastShow:{
      is_suit:0,
      price:'',
      goods_sn:'',
      market_price:'',
      image:'',
      sku_id:'',
      goods_id:''
    },
    loadState:true,
    loading:true,
    needAdapt:app.globalData.system.needAdapt
  },
  onShow: function () {
    let _this = this,list = [[],[],[]];
    //获取购物车列表
    getRequest.post('index/cart/index', {uid:app.globalData.userInfo.id,token:app.globalData.token}).then(function(res){
      list = [res.data.pick.store, res.data.pick.home, res.data.pick.home_store, res.data.pick.offline];
      _this.setData({
        searchList:[],
        list:list,
        cancel:res.data.cancel,
        loadState:true,
        modeltype:'none',
        modelall:[false,false,false],
        sumprice:0,
        loading:false
      })
    }).catch(function(err){_this.setData({loadState:false,list:list,loading:false})})
  },
  //去逛逛
  goShoping:function(){
    wx.switchTab({url: '../index/index'})
  },
  //单选
  cartSearch:function(e){
    let searcharr = e.detail.value,type = e.currentTarget.dataset.type,modelall = [false,false,false];
    if(searcharr.length == 0){
      this.setData({modeltype:'none',modelall:modelall,searchList:searcharr})
    }
    else if(searcharr.length == this.data.list[type].length){
      modelall[type] = true;
      this.setData({modeltype:type,modelall:modelall,searchList:searcharr})
    }
    else{
      this.setData({modeltype:type,modelall:modelall,searchList:searcharr})
    }
    this.priceSum(searcharr,type);
  },
  //全选
  searchAll:function(e){
    let type = e.currentTarget.dataset.type;
    if(e.detail.value.length == 0){//取消全选
      this.data.modelall[type] = false;
      this.data.list[type].forEach(function(e){
        e.checked = false;
      })
      this.setData({
        modeltype:'none',
        modelall:this.data.modelall,
        list:this.data.list,
        searchList:[]
      })
      this.priceSum([],type);
    }
    else{
      let searcharr = [];
      this.data.modelall = [false,false,false];
      this.data.modelall[type] = true;
      this.data.list[type].forEach(function(e,idx){
        e.checked = true;
        searcharr.push(idx);
      })
      this.setData({
        modeltype:type,
        modelall:this.data.modelall,
        list:this.data.list,
        searchList:searcharr
      })
      this.priceSum(searcharr,type);
    }
  },
  //支付总金额计算
  priceSum(searcharr,type){
    let list = this.data.list[type],sumprice = 0;
    searcharr.forEach(function(e){
      sumprice = sumprice + list[e].num * parseFloat(list[e].price);
    })
    this.setData({sumprice:sumprice})
  },
  // ------------------------------数量------------------------------
  //减少数量
  delNum: function (e) {
    let idx = e.currentTarget.dataset.idx,type = e.currentTarget.dataset.type;
    let num = this.data.list[type][idx].num;
    if(1 < this.data.list[type][idx].num){
      num -= 1;
      this.changeNum(idx,this.data.list[type][idx].cart_id,num,type);
    }
  },
  //增加数量
  addNum: function (e) {
    console.log(this.data.list)
    let idx = e.currentTarget.dataset.idx,type = e.currentTarget.dataset.type;
    let num = this.data.list[type][idx].num;
    num += 1;
    this.changeNum(idx,this.data.list[type][idx].cart_id,num,type);
  },
  //保存数量
  changeNum(idx,cart_id,num,type){
    let _this = this,postdata={
      uid:app.globalData.userInfo.id,
      token:app.globalData.token,
      cart_id:cart_id,
      num:num
    };
    getRequest.post('index/cart/revise',postdata).then(function(res){
      _this.data.list[type][idx].num = num;
      let listnum = "list[" + type + "][" + idx + "].num";
      _this.setData({[listnum]:num})
      _this.priceSum(_this.data.searchList,_this.data.modeltype);
      // cartNum.sum().catch();
    }).catch(function(err){app.toastFun(err.msg);})
  },
  // ------------------------------数量-end------------------------------
  // ------------------------------规格------------------------------
  //规格弹窗-显示
  normsChange:function(e){
    let idx = e.currentTarget.dataset.idx,type = e.currentTarget.dataset.type;
console.log(this.data.list[type][idx]);

    if(this.data.list[type][idx].is_suit == 0){//单品
      let specs = this.data.list[type][idx].specs,item = this.data.list[type][idx].item;
      //循环判断已经选中的规格
      specs.forEach(function(specsinfo,specsidx){
        specsinfo.item.forEach(function(iteminfo,itemidx){
          if(iteminfo.item == item[specsidx]){
            specsinfo.searchidx = itemidx;
          }
        })
      })
      let toastShow={
        is_suit:this.data.list[type][idx].is_suit,
        price:this.data.list[type][idx].price,
        goods_sn:this.data.list[type][idx].goods_sn,
        market_price:this.data.list[type][idx].market_price,
        image:this.data.list[type][idx].image,
        sku_id:this.data.list[type][idx].sku_id,
        goods_id:this.data.list[type][idx].goods_id,
        specs:specs,
        item:this.data.list[type][idx].item
      };
      
      this.setData({
        goodsToast:true,
        normstype:type,
        normsid:idx,
        toastShow:toastShow
      })
    }
    else{//套盒
      let suit_list = this.data.list[type][idx].suit_list;
      //循环判断已经选中的规格
      suit_list.forEach(function(suit,suitidx){
        let specs = suit.specs,item = suit.item;
        specs.forEach(function(specsinfo,specsidx){
          specsinfo.item.forEach(function(iteminfo,itemidx){
            if(iteminfo.item == item[specsidx]){
              specsinfo.searchidx = itemidx;
            }
          })
        })
      })
      let toastShow={
        is_suit:this.data.list[type][idx].is_suit,
        price:this.data.list[type][idx].price,
        goods_sn:this.data.list[type][idx].goods_sn,
        market_price:this.data.list[type][idx].market_price,
        image:this.data.list[type][idx].image,
        goods_id:this.data.list[type][idx].goods_id,
        suit_list:suit_list,
      };
      
      this.setData({
        goodsToast:true,
        normstype:type,
        normsid:idx,
        toastShow:toastShow
      })
    }
  },
  //规格弹窗-更改弹窗显示规格
  specsSearch:function(e){
    let pidx = e.currentTarget.dataset.pidx,idx = e.currentTarget.dataset.idx,props ='',_this = this;
    // 单品
    if(this.data.toastShow.is_suit == 0){
      let specs = this.data.toastShow.specs,item = [];
      this.data.toastShow.specs[pidx].searchidx = idx;
      specs.forEach(function(info){
        item.push(info.item[info.searchidx].item);
        if(props == ''){props = info.item[info.searchidx].id;}
        else{props = props+','+info.item[info.searchidx].id;}
      })
      let postdata = {
        uid:app.globalData.userInfo.id,
        goods_id:this.data.toastShow.goods_id,
        specs_id:props,
        token:app.globalData.token
      };
      getRequest.post('index/cart/stock',postdata).then(function(res){
        let toastShow={
          is_suit:0,
          price:res.data.price,
          goods_sn:res.data.goods_sn,
          market_price:res.data.market_price,
          image:_this.data.toastShow.image,
          sku_id:res.data.sku_id,
          goods_id:res.data.goods_id,
          specs:_this.data.toastShow.specs,
          item:item
        };
        if(res.data.image != ''){toastShow.image = res.data.image;}
        _this.setData({toastShow:toastShow})
      }).catch(function(err){app.toastFun(err.msg);})
    }
    // 套盒
    else{
      let gidx = e.currentTarget.dataset.gidx;
      this.data.toastShow.suit_list[gidx].specs[pidx].searchidx = idx;
      this.setData({toastShow:this.data.toastShow})
    }


  },
  //规格弹窗-保存
  changeNorms:function(){
    let _this = this,listitem = this.data.list[this.data.normstype][this.data.normsid],toastShow = this.data.toastShow;
    let listspecs = "list["+this.data.normstype+"]["+this.data.normsid+"]";
    console.log(listitem)
    console.log(listspecs)
    let postdata={
      uid:app.globalData.userInfo.id,
      goods_id:toastShow.goods_id,
      cart_id:this.data.list[this.data.normstype][this.data.normsid].cart_id,
      token:app.globalData.token
    };
    if(toastShow.is_suit == 0){
      postdata.sku_id = toastShow.sku_id;
    }
    else{
      let suit_sku_ids={};
      toastShow.suit_list.forEach(function(suit){
        let sku = suit.sku,specs = suit.specs,props = '',item=[];
        specs.forEach(function(info){
          if(props == ''){props = info.item[info.searchidx].id;}
          else{props = props+','+info.item[info.searchidx].id;}
          item.push(info.item[info.searchidx].item);
        })
        suit.item = item;
        suit_sku_ids[suit.goods_id]=sku[props].sku_id;
      })
      postdata.suit_sku_ids = suit_sku_ids;
      
    }

    getRequest.post('index/cart/modifyCart',postdata).then(function(res){
      if(toastShow.is_suit == 0){
        listitem.sku_id = toastShow.sku_id;
        listitem.goods_id = toastShow.goods_id;
        listitem.goods_sn = toastShow.goods_sn;
        listitem.market_price = toastShow.market_price;
        listitem.price = toastShow.price;
        listitem.image = toastShow.image;
        listitem.item = toastShow.item;
      }
      else{
        listitem.suit_list = toastShow.suit_list;
      }
      _this.setData({[listspecs]:listitem})
      _this.closeToast();
    }).catch(function(err){app.toastFun(err.msg);})
  },
  //规格弹窗-关闭
  closeToast:function(){
    this.setData({goodsToast:false})
  },
  // ------------------------------规格-end------------------------------
  //删除商品
  delCart:function(e){
    let idx = e.currentTarget.dataset.idx,type = e.currentTarget.dataset.type,state = e.currentTarget.dataset.state,cart_id = [],_this = this,modelall = [false,false,false],list = this.data.list;
    if(state == 'list'){
      cart_id.push(this.data.list[type][idx].cart_id);
      this.setData({modeltype:'none',sumprice:0,searchList:[],modelall:modelall})
    }
    else{
      this.data.cancel.forEach(function(e){
        cart_id.push(e.cart_id);
      })
    }

    let postdata = {
      uid:app.globalData.userInfo.id,
      cart_id:cart_id,
      token:app.globalData.token
    };
    getRequest.post('index/cart/del',postdata).then(function(res){
      if(state == 'list'){
        list[type].splice(idx,1);
        list[type].forEach(function(info){info.checked = false;})
        _this.setData({list:list})
      }
      else{
        _this.setData({cancel:[]})
      }
      app.toastFun('删除成功');
      // cartNum.sum().catch();
    }).catch(function(err){app.toastFun(err.msg);})
  },
  //去结算
  goPayment:function(){
    if(this.data.sumprice == 0){
      app.toastFun('您还没有选择商品');
    }
    else{
      let list = this.data.list[this.data.modeltype],cart_id = [];
      this.data.searchList.forEach(function(e){
        cart_id.push(list[e].cart_id);
      })
      cart_id = JSON.stringify(cart_id);
      console.log(this.data.modeltype)
      wx.navigateTo({
        url: `../payment/payment?cart_id=${cart_id}&sku_id=&goods_id=&num=&is_jx_goods=0&is_cash=${this.data.modeltype == 3 ? 1 : 0}`
      })
    }
  },
  //跳转商品详情
  goGoodsInfo:function(e){
    let idx = e.currentTarget.dataset.idx,type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../goodsdetail/goodsdetail?goods_id='+this.data.list[type][idx].goods_id+'&props='+this.data.list[type][idx].props+'&live=false',
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    let _this = this;
    this.setData({
      list:[[],[],[]],
      cancel:[],
      modelall:[false,false,false],
      searchList:[],
      sumprice:0,
      //规格选择
      goodsToast:false,
      normstype:-1,
      normsid:-1,
      toastShow:{
        price:'',
        goods_sn:'',
        market_price:'',
        image:'',
        sku_id:'',
        goods_id:''
      },
      loadState:true
    })
    if(app.globalData.userInfo.id != ''){
      getRequest.post('index/cart/index', {uid:app.globalData.userInfo.id,token:app.globalData.token}).then(function(res){
        let list = [res.data.pick.store,res.data.pick.home,res.data.pick.home_store];
        console.log(list)
        _this.setData({
          list:list,
          cancel:res.data.cancel,
          loadState:true,
          modeltype:'none',
          modelall:[false,false,false],
          sumprice:0
        })
      }).catch(function(err){_this.setData({loadState:false,list:list})})
    }
    wx.stopPullDownRefresh();
  }
})