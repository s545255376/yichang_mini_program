const app = getApp();
const getRequest = require('../../utils/getRequest');
Page({
  data: {
    pid:14,
    cate:[
      {id: 0,pid: 1,cate_name: "全部"}
    ],
    list:[],
    pagenum:1,
    last_page:1,
    loadState:true
  },
  onLoad: function () {
    wx.setNavigationBarTitle({title: '常见问题'})
    this.getList(1);
  },
  //获取列表
  getList(page){
    let postdata = {pid:14,page:page,cate_id:14},_this = this;
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
      url: '../skin/detail/detail?aid='+this.data.list[idx].id
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