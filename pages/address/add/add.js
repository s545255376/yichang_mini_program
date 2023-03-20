const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    address_id:'',
    type:'',
    regionList:[[],[],[]],
    regionArray:[[],[],[]],
    region: [0,0,0],
    regionInfo:'',
    defaultChecked:true,

    name:'',
    tel:'',
    address:'',

    editid:['','',''],
    needAdapt:app.globalData.system.needAdapt
  },
  onLoad: function (options) {
    let type = options.type,address_id = options.address_id;

    if(type == 'new'){
      this.setData({
        type:type
      })
    }
    else{
      //获取地址详情
      let _this = this;
      getRequest.post('index/address/edit', {uid:app.globalData.userInfo.id,address_id:address_id,token:app.globalData.token}).then(function(res){
        _this.setData({
          address_id:address_id,
          type:type,
          regionInfo:res.data.province_name+' '+res.data.city_name+' '+res.data.district_name,
          name:res.data.consignee,
          tel:res.data.mobile,
          address:res.data.address,
          defaultChecked:res.data.is_default==0?false:true,
          editid:[res.data.province,res.data.city,res.data.district]
        })
      }).catch(function(err){console.log(err);})
    }
    this.getAddress(0,'');
  },
  //获取省市区
  getAddress(type,code){
    let _this = this,area = [];
    let postdata = {uid:app.globalData.userInfo.id};
    if(type != 0){postdata.code = code;}
    
    getRequest.noToastPost('index/address/area',postdata).then(function(res){
      res.data.forEach(function(e,idx){
        if(_this.data.editid[type] != '' && _this.data.address_id != ''){
          if(e.id == _this.data.editid[type]){
            _this.data.region[type] = idx;
            _this.data.editid[type] = '';
          }
        }
        area.push(e.area_name);
      })
      
      _this.data.regionList[type] = res.data;
      _this.data.regionArray[type] = area;
      _this.setData({
        regionList:_this.data.regionList,
        regionArray:_this.data.regionArray,

        editid:_this.data.editid,
        region:_this.data.region,
      })
      //未到区级联动
      if(type < 2){
        _this.getAddress(type+1,res.data[_this.data.region[type]].area_code);
      }
    }).catch(function(err){console.log(err);});
  },
  //省市区切换-列切换
  pickerChange:function(e){
    let column = e.detail.column,idx = e.detail.value,region = this.data.region;
    this.data.region[column] = idx;
    if(column < 2){
      for(var i=0;i<region.length;i++){if(column < i){region[i] = 0;}}
      this.setData({region:region})
      this.getAddress(column+1,this.data.regionList[column][idx].area_code);
    }
  },
  //省市区切换-行切换
  areaSearch:function(){
    let region = this.data.region,regionArray = this.data.regionArray;
    this.setData({
      regionInfo:regionArray[0][region[0]]+' '+regionArray[1][region[1]]+' '+(regionArray[2].length == 0 ?'':regionArray[2][region[2]])
    })
  },
  //输入收货人、电话、详细地址
  inputChange(e){
    let type = e.currentTarget.dataset.type;
    this.setData({
      [type]:e.detail.value
    })
  },
  //是否是默认地址
  switchChange:function(e){
    this.setData({defaultChecked:e.detail.value})
  },
  //新建
  addNew:function(){
    let region = this.data.region,regionList = this.data.regionList,_this = this;
    if(this.data.name != '' && this.data.tel != '' && this.data.address != '' && this.data.regionInfo != ''){
      let postdata = {
        uid:app.globalData.userInfo.id,
        token:app.globalData.token,
        consignee:this.data.name,
        mobile:this.data.tel,
        address:this.data.address,
        is_default:this.data.defaultChecked?1:0,
        province:regionList[0][region[0]].id,
        city:regionList[1][region[1]].id,
        district:regionList[2][region[2]].id
      };
      getRequest.post('index/address/add',postdata).then(function(res){
        app.toastFun('添加成功');
          setTimeout(() => {
            wx.navigateBack({delta: 1})
        }, 1000);
      }).catch(function(err){
        app.toastFun(err.msg);
      });
    }
    else{
      app.toastFun('您还有未填项');
    }
  },
  //修改
  changeBtn:function(){
    let region = this.data.region,regionList = this.data.regionList,_this = this;
    if(this.data.name != '' && this.data.tel != '' && this.data.address != '' && this.data.regionInfo != ''){

      let postdata = {
        address_id:this.data.address_id,
        uid:app.globalData.userInfo.id,
        token:app.globalData.token,
        consignee:this.data.name,
        mobile:this.data.tel,
        address:this.data.address,
        is_default:this.data.defaultChecked?1:0,
        province:regionList[0][region[0]].id,
        city:regionList[1][region[1]].id,
        district:regionList[2].length == 0?'':regionList[2][region[2]].id
      };
      getRequest.post('index/address/save',postdata).then(function(res){
        app.toastFun('修改成功');
        setTimeout(() => {
          wx.navigateBack({delta: 1})
        }, 1000);
      }).catch(function(err){
        app.toastFun(err.msg);
      });
    }
    else{
      app.toastFun('您还有未填项');
    }
  },
  //删除
  delBtn:function(){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '是否确认删除该地址？',
      success: function (info) {
        if (info.cancel) {}
        else {
          getRequest.post('index/address/del', {uid:app.globalData.userInfo.id,address_id:_this.data.address_id,token:app.globalData.token}).then(function(res){
            app.toastFun('删除成功');
            setTimeout(() => {
              wx.navigateBack({delta: 1})
            }, 1000);
          }).catch(function(err){console.log(err);})
        }
      }
    })
  },
})