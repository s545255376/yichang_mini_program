const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
const getRequest = require('../../../utils/getRequest');
Page({
  data: {
    title:'',
    desc:'',
    date:'',
    info:[],
    loadState:true
  },
  onLoad: function (options) {
    let _this = this,type = options.type;
    if(type == 0){//系统通知
      let postdata = {
        token:app.globalData.token,
        uid:app.globalData.userInfo.id,
        id:options.id
      };
      getRequest.post('index/message/info', postdata).then(function(res){
        let content = res.data.content;
        WxParse.wxParse('contentname', 'html', content, _this, 5);
        _this.setData({
          title:res.data.title,
          desc:res.data.desc,
          date:res.data.update_time,
          info:res.data
        })
      }).catch(function(err){_this.setData({loadState:false})})
    }
    else if(type == 1){//活动公告
      let noticeList = app.globalData.noticeList;
      
      let postdata = {
        token:app.globalData.token,
        uid:app.globalData.userInfo.id,
        notice_id:options.id
      };
      noticeList.forEach(function(e){
        if(e.id == options.id){
          _this.setData({
            title:e.title,
            desc:e.content,
            date:e.publish_time,
            info:e
          })
          if(e.is_read == 0){
            getRequest.post('index/notice/isRead', postdata).then(function(res){
              e.is_read = 1;
            }).catch(function(err){_this.setData({loadState:false})})
          }
        }
      })
      app.globalData.noticeList = noticeList;
    }
  },
})