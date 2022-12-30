const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    pid:'',
    cate:[
      {id: 0,pid: 1,cate_name: "全部"}
    ],
    cateNum:0,
    list:[],
    pagenum:1,
    last_page:1,
    loadState:true
  },
  onLoad: function (options) {
    let pid = options.pid,_this = this;
    //判断进入入口，展示不同信息与顶部标题
    if(pid == 1){
      wx.setNavigationBarTitle({title: '肌肤研究所'})
      getRequest.post('index/article/cate',{pid:pid}).then(function(res){
        _this.setData({
          cate:_this.data.cate.concat(res.data)
        })
      })
      this.getList(pid,0,1);
    }
    else{
      wx.setNavigationBarTitle({title: 'Ta们说'})
      this.getList(pid,2,1);
    }
    this.setData({pid:pid})
  },
  //切换列表
  cateChange(e){
    this.setData({
      cateNum:e.currentTarget.dataset.idx,
      pagenum:1,
      list:[],
      last_page:1
    })
    this.getList(this.data.pid,this.data.cate[e.currentTarget.dataset.idx].id,1);
  },
  //获取列表
  getList(pid,cate_id,page){
    let postdata = {pid:pid,page:page,cate_id:cate_id},_this = this;

    getRequest.post('index/article/index',postdata).then(function(res){
      _this.setData({
        list:_this.data.list.concat(res.data.data),
        pagenum:res.data.current_page,
        last_page:res.data.last_page,
        loadState:true
      })
    })
    .catch(function(err){
      app.toastFun('加载失败，请重新加载');
      _this.setData({loadState:false})
    })
  },
  //跳转详情
  goInfo:function(e){
    let idx = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../detail/detail?aid='+this.data.list[idx].id,
    })
  },
  //加载更多
  onReachBottom: function () {
    if(this.data.pagenum < this.data.last_page){
      this.getList(this.data.pid,this.data.cate[this.data.cateNum].id,this.data.pagenum+1);
    }
    else{
      app.toastFun('我是有底线哒');
    }
  },
})