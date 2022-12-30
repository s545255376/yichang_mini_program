const app = getApp();
const getRequest = require('../../../../utils/getRequest');
Page({
  data: {
    dateSearch:false,
    username:'',
    showDate:{
      start:'',
      end:'',
    },
    date:{
      year:'',
      month:'',
      start:'',
      end:'',
    },
    loadState:true,
    pagenum:1,
    last_page:1,
    list:[],
    is_boss:0,
    shopnall:[],
    shopnarr:[],
    shopnnum:0
  },
  onLoad: function (options) {
    // app.globalData.userInfo.id = 192;
    // // app.globalData.userInfo.id = 185;
    // app.globalData.userInfo.role_id = 2;
    // app.globalData.userInfo.store_id = 2;

    let _this = this,postdata = {
      uid:app.globalData.userInfo.id,
      role_id:app.globalData.userInfo.role_id
    };
    getRequest.post('index/boss/storeList', postdata).then(function(res){
      let shopnall = [{id: 0,sign: "",title: "全部"}],shopnarr = [];
      if(res.data.is_boss == 1){
        shopnall = shopnall.concat(res.data.store);
        shopnall.forEach(function(e){shopnarr.push(e.title);})
      }
      else{
        shopnall = res.data.store;
      }

      _this.setData({
        is_boss:res.data.is_boss,
        shopnall:shopnall,
        shopnarr:shopnarr
      })
      _this.getList(shopnall[0].id)
    }).catch(function(err){console.log(err);})

    let getday = new Date();
    let caleList = this.getCalendar(getday.getFullYear(),getday.getMonth()+1,0);
    let date = {
      year:getday.getFullYear(),
      month:getday.getMonth()+1,
      start:'',
      end:''
    };
    this.setData({
      caleList:caleList.caleList,
      date:date
    })
  },
  //更改门店
  shopnChange(e){
    this.data.pagenum = 1;
    this.setData({shopnnum:e.detail.value,pagenum:1,list:[]})
    this.getList(this.data.shopnall[e.detail.value].id)
  },
  //获取顾客列表
  getList(store_id){
    let _this = this,postdata = {
      uid:app.globalData.userInfo.id,
      role_id:app.globalData.userInfo.role_id,
      store_id:store_id,
      page:this.data.pagenum,
      username:this.data.username,
      begin_time:(this.data.date.start !='' && this.data.date.end != '')?this.data.date.start:'',
      end_time:(this.data.date.start !='' && this.data.date.end != '')?this.data.date.end:''
    },list = this.data.list,url = '';
    // if(this.data.date.start != '' && this.data.date.end != ''){
    //   postdata.begin_time = this.data.date.start;
    //   postdata.end_time = this.data.date.end;
    // }
    if(app.globalData.userInfo.role_id == 2){url = 'index/boss/customerOrder'}
    else{url = 'index/order/sellerUserOrderList'}
    
console.log(url)
    getRequest.post(url, postdata).then(function(res){
      list = list.concat(res.data.data);
      console.log(list)
      _this.setData({
        loadState:true,
        list:list,
        last_page:res.data.last_page,
        pagenum:res.data.current_page
      })
    }).catch(function(err){_this.setData({loadState:false,list:list})})
  },
  onReachBottom: function () {
    if(this.data.pagenum < this.data.last_page){
      this.data.pagenum = this.data.pagenum+1;
      this.getList(this.data.shopnall[this.data.shopnnum].id);
    }
    else{
      app.toastFun('我是有底线哒');
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.searchConfirm();
    wx.stopPullDownRefresh();
  },
  //时间筛选-开始
  openTimeCheck(){
    this.setData({dateSearch:true})
  },
  //时间筛选-取消
  timeCancel(){
    let datearr = this.data.showDate,_this = this,caleList = this.data.caleList;
    let date = {
      year:this.data.date.year,
      month:this.data.date.month,
      start:datearr.start,
      end:datearr.end,
    }
    this.setData({date:date})
    if(datearr.start != '' && datearr.end != ''){//已经选择过开始时间和结束时间
      let start = new Date(datearr.start).getDate();
      let end = new Date(datearr.end).getDate();
      caleList.forEach(function(info,eidx){
        info.bg = _this.timeCheck(info.date);
        if(info.num == start && info.click == true){info.check = true;}
        else if(info.num == end && info.click == true){info.check = true;}
        else{info.check = false;}
      })
    }
    else{
      caleList.forEach(function(e){
        e.check = false;
        e.bg = false;
      })
    }
    this.setData({
      dateSearch:false,
      caleList:caleList
    })
  },
  //时间筛选-确认
  searchConfirm(){
    this.data.pagenum = 1;
    this.setData({
      list:[],
      pagenum:1,
      dateSearch:false,
      showDate:{
        start:this.data.date.start,
        end:this.data.date.end
      },
    })
    // console.log(this.data.shopnall[this.data.shopnnum])
    this.getList(this.data.shopnall[this.data.shopnnum].id);
  },
  nameChange(e){
    this.setData({username:e.detail.value})
  },
  //选择时间
  changeDay(e){
    let num = e.currentTarget.dataset.num,idx = e.currentTarget.dataset.idx,date = this.data.date;
    if(this.data.caleList[idx].click == true){
      if(date.start != '' && date.end != ''){//已经选择过开始时间和结束时间(清空重新近路开始时间)
        this.data.caleList.forEach(function(info,eidx){
          if(eidx == idx){info.check = true;info.start = true;}
          else{info.check = false;info.start = false;}
          info.end = false;
          info.bg = false;
        })
        date.start = date.year+'/'+date.month+'/'+num;
        date.end = '';
      }
      else{
        this.data.caleList[idx].check = true;
        if(date.start != ''){//记录结束时间
          let adddate = date.year+'/'+date.month+'/'+num;
          let starttime = new Date(date.start).getTime();
          let endtime = new Date(adddate).getTime();
          if(starttime < endtime){//开始时间小于结束时间
            date.end = adddate;
            this.data.caleList[idx].end = true;
          }
          else{//开始时间大雨结束时间(开始结束时间置换)
            date.end = date.start;
            date.start = adddate;
            
            this.data.caleList.forEach(function(info,eidx){
              if(info.start == true){info.start = false;info.end = true;}
              else if(eidx == idx){info.start = true;}
            })
          }
        }
        else{//记录开始时间
          date.start = date.year+'/'+date.month+'/'+num;
          this.data.caleList[idx].start = true;
        }
        
        let _this = this;
        this.data.caleList.forEach(function(info,eidx){
          info.bg = _this.timeCheck(info.date);
        })

      }
      console.log(this.data.showDate)
      // console.log(date)
      this.setData({
        caleList:this.data.caleList,
        date:date
      })
      console.log(this.data.caleList)
    }
  },
  //更改月份
  monthChange(e){
    let type = e.currentTarget.dataset.type,date = this.data.date,_this = this;
    if(type == 'lastmonth'){
      if(date.month == 1){
        date.year = date.year - 1;
        date.month = 12;
      }
      else{
        date.month = date.month - 1;
      }
    }
    else{
      if(date.month == 12){
        date.year = date.year + 1;
        date.month = 1;
      }
      else{
        date.month = date.month + 1;
      }
    }
    let caleList = this.getCalendar(date.year,date.month,0);

    let start =date.start.split('/'),end = date.end.split('/');
    caleList.caleList.forEach(function(info){
      if(start.length != 0){
        if(start[0] == date.year && start[1] == date.month){
          if(info.num == start[2] && info.click == true){info.check = true;}
        }
      }
      if(end.length != 0){
        if(end[0] == date.year && end[1] == date.month){
          if(info.num == end[2] && info.click == true){info.check = true;}
        }
      }
      info.bg = _this.timeCheck(info.date);
    })
    // console.log(caleList.caleList)
    this.setData({
      caleList:caleList.caleList,
      date:date
    })
  },
  //日期选择
  timeCheck(date){
    let start = '',end = '',checktime = new Date(date).getTime();
    // console.log(this.data.date)
    if(this.data.date.start != ''){start = new Date(this.data.date.start).getTime();}
    if(this.data.date.end != ''){end = new Date(this.data.date.end).getTime();}
    if(start != '' && end != ''){
      if(start <= checktime && checktime <= end){return true;}
      else{return false;}
    }
    return false;
  },

  //日历方法
  IsRuiYear(aDate) {
    return (0 == aDate % 4 && (aDate % 100 != 0 || aDate % 400 == 0));
  },
  //获取当月天数
  getMonthDay(m,y){
    var mDay = 0;
    if (m == 0 || m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12) {mDay = 31;}
    else {
      if (m == 2) {
        var isRn = this.IsRuiYear(y);
        if (isRn == true) {mDay = 29;}
        else {mDay = 28;}
      }
      else {mDay = 30;}
    }
    return mDay;
  },
  //日历计算
  getCalendar(yyyy,mm,clickday){
    let caleList = [];
    var dd = new Date(parseInt(yyyy), parseInt(mm), 0);
    var daysCount = dd.getDate(); //本月天数
    var week = new Date(parseInt(yyyy) + "/" + parseInt(mm) + "/" + 1).getDay(); //今天周几
    var lastMonth; //上一月天数
    var nextMounth //下一月天数
    lastMonth = this.getMonthDay(mm - 1, yyyy);
    if (parseInt(mm) == 12) {
      nextMounth = new Date(parseInt(yyyy) + 1, parseInt(1), 0).getDate();
    } else {
      nextMounth = new Date(parseInt(yyyy), parseInt(mm) + 1, 0).getDate();
    }
    for (var i = 0; i < daysCount; i++) {
      //计算上月空格数
      if (i % 7 == 0) {
        if (i < 7) {
          for (var j = week; 0 < j; j--) {
            if(mm == 1){
              caleList.push({
                click: false,
                num: lastMonth - j + 1,
                check:false,
                date:(yyyy-1)+'/12/'+(lastMonth - j + 1),
                bg:false,
                start:false,
                end:false,
              });
            }
            else{
              caleList.push({
                click: false,
                num: lastMonth - j + 1,
                check:false,
                date:yyyy+'/'+(mm-1)+'/'+(lastMonth - j + 1),
                bg:false,
                start:false,
                end:false,
              });
            }
          }
        }
      }
      if(clickday == i + 1){
        caleList.push({
          click: true,
          num: i + 1,
          check:true,
          date:yyyy+'/'+mm+'/'+(i + 1),
          bg:false,
          start:false,
          end:false,
        });
      }
      else{
        caleList.push({
          click: true,
          num: i + 1,
          check:false,
          date:yyyy+'/'+mm+'/'+(i + 1),
          bg:false,
          start:false,
          end:false,
        });
      }
    }
    //表格不等高，只补充末行不足单元格
    if (7 - (daysCount + week) % 7 < 7) {
      for (var k = 0; k < 7 - (daysCount + week) % 7; k++) {
        if(mm == 12){
          caleList.push({
            click: false,
            num: k + 1,
            check:false,
            date:(yyyy+1)+'/1/'+(k + 1),
            bg:false,
            start:false,
            end:false,
          });
        }
        else{
          caleList.push({
            click: false,
            num: k + 1,
            check:false,
            date:yyyy+'/'+(mm+1)+'/'+(k + 1),
            bg:false,
            start:false,
            end:false,
          });
        }
      }
    }
    // console.log(caleList)
    // alert(this.searchData[2])
    return {caleList:caleList,lastweek:week}
  }


})