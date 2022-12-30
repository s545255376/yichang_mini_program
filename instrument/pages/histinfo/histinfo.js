import util from '../../../utils/util';
import * as echarts from '../../../ec-canvas/echarts';
const app = getApp();
const insRequest = require('../../utils/network');
var chart;
var option = {
  title:{
    text:'',
    left:10,
    textStyle:{
      color:'#231F20',
      fontSize:14,
      fontWeight:'lighter'
    }
  },
  color: ["#E6D8B8", "#D9C392"],
  legend: {
    data: [
      {name:'护理前',textStyle:{color:'#686868'},icon:'roundRect'},
      {name:'护理后',textStyle:{color:'#686868'},icon:'roundRect'}
    ],
    itemWidth:12,itemHeight:7,
    itemGap:80,
    orient: 'horizontal',
    left: 'center',
    top: 'top',
  },
  grid: {
    top: '40px',
    left: '15px',
    right: '15px',
    bottom: '0px',
    containLabel: true
  },
  tooltip: {
    show: true,
    trigger: 'axis',
  },
  dataZoom: [
    {
      show: false,
      realtime: true,
      start: 0,
      end: 100
    },
    {
      type: 'inside',
      realtime: true,
      start: 0,
      end: 100
    }
  ],
  xAxis: {
    axisLabel: { interval: 0, rotate: 0,color:'#A7A5A6' },
    type: 'category',
    data: [],
    boundaryGap: ['20%', '20%'],
    axisTick:{
      show:false
    },
    axisLine:{
      lineStyle:{color:'#E1DCD5'}
    },
    axisLabel: {
      inside: false,
      textStyle: {color: '#919191'}
    },
  },
  yAxis: {show: true,type: 'value',axisLabel: {color:'#A7A5A6' },},
  series: [
    {name: '护理前',type: 'bar'},
    {name: '护理后',type: 'bar'}
  ]
  // series: [
  //   {name: '护理前',type: 'bar', barMaxWidth:8,data: [],itemStyle:{borderRadius: 4}},
  //   {name: '护理后',type: 'bar', barMaxWidth:8, barGap:0.6, data: [],itemStyle:{borderRadius: 4}}
  // ]
  // series: [
  //   {
  //     name: '护理前',
  //     type: 'line',smooth: true,itemStyle: {color: '#D9C392',width:2},
  //     areaStyle: {
  //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1,[
  //         {offset: 0, color: 'rgba(230, 216, 184, 1)'},
  //         {offset: 1, color: 'rgba(230, 216, 184, 0)'}
  //     ]),opacity:1},
  //     lineStyle:{
  //       color: '#D9C392',width:2,
  //       shadowColor: '#F0DCB0',
  //       shadowBlur: 12,
  //       shadowOffsetY:12
  //     },
  //     data: []
  //   },
  //   {
  //     name: '护理后',
  //     type: 'line',smooth: true,itemStyle: {color: '#E6D8B8',width:2},
  //     areaStyle: {
  //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1,[
  //         {offset: 0, color: 'rgba(250, 245, 234, 1)'},
  //         {offset: 1, color: 'rgba(250, 245, 234, 0)'}
  //     ]),opacity:1},
  //     lineStyle:{
  //       color: '#E6D8B8',width:2,
  //       shadowColor: '#F0DCB0',
  //       shadowBlur: 12,
  //       shadowOffsetY:12
  //     },
  //     data: []
  //   }
  // ]
};
function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  chart.setOption(option);
  return chart;
}

Page({
  data: {
    tabbaridx:0,
    now:'',
    today:{
      today:'',
      lastweek:'',
      lastmonth:'',
    },
    type:'',
    daytype:'',
    position:'',
    dateNextBtn:false,
    info:{
      list:[]
    },
    ec: {
      onInit: initChart
    },
    left:{
      moisture_content:0,
      oil_content:0,
      compactness:0
    }
  },
  onLoad(options) {
    let _this = this;

    wx.setNavigationBarTitle({
      title: parseInt(options.position) == 0?'手部':parseInt(options.position) == 1?'脸部':'眼部',
    })

    let date = new Date();
    let week = date.getDay();
    let lastweek = new Date(date.getTime()-24*60*60*1000*(week==0?6:week-1));
    let lastmonth = new Date(date.getFullYear()+'/'+(date.getMonth()+1)+'/01');

    let today = util.dateShow(date);
    lastweek = util.dateShow(lastweek);
    lastmonth = util.dateShow(lastmonth);
    this.setData({
      now:today,
      today:{
        today:today,
        lastweek:lastweek,
        lastmonth:lastmonth,
      },
      type:options.type,
      // daytype:options.daytype,
      position:parseInt(options.position),
    })


    // options.daytype = 'day';
    // options.position = 0;
    // app.instrument.userInfo.id = 4;



    let postdata = {
      uid:app.instrument.userInfo.id,
      stime:options.stime,
      etime:options.etime,
      position:parseInt(options.position)
    };
    
    this.getList(postdata);
  },
  getList(postdata){
    let _this = this,left = { moisture_content:0,oil_content:0,compactness:0},moisture_content=0,oil_content=0,compactness=0;
    insRequest.post('getHistoryRecord',postdata).then(function(res){
      console.log(res)
      if(_this.data.type == 0){
        moisture_content = parseFloat(res.data.before_moisture_content);
        oil_content=parseFloat(res.data.before_oil_content);
        compactness=parseFloat(res.data.before_compactness);
        // left.moisture_content = parseFloat(res.data.before_moisture_content)*100/60;
        // left.oil_content = parseFloat(res.data.before_oil_content)*100/51;
        // left.compactness = parseFloat(res.data.before_compactness)*100/0.55;
      }
      else{
        moisture_content = parseFloat(res.data.moisture_content);
        oil_content=parseFloat(res.data.oil_content);
        compactness=parseFloat(res.data.compactness);
        // left.moisture_content = parseFloat(res.data.moisture_content)*100/60;
        // left.oil_content = parseFloat(res.data.oil_content)*100/51;
        // left.compactness = parseFloat(res.data.compactness)*100/0.55;
      }
      // 水分
      // left.moisture_content = moisture_content*100/60;
      if(moisture_content < 15){
        left.moisture_content = (moisture_content - 0)*33.33/15;
      }
      else if(moisture_content < 25){
        left.moisture_content = (moisture_content - 15)*16.67/10+33.33;
      }
      else if(moisture_content < 35){
        left.moisture_content = (moisture_content - 25)*16.67/10+50;
      }
      else{
        left.moisture_content = (moisture_content - 35)*33.33/25+66.67;
      }
      // 油分
      if(oil_content < 25){
        left.oil_content = (oil_content-10)*25/15;
      }
      else if(oil_content < 34){
        left.oil_content = (oil_content-25)*50/9+25;
      }
      else{
        left.oil_content = (oil_content-34)*25/17+75;
      }
      // 弹性
      if(compactness < 0.2){
        left.compactness = compactness*25/0.2;
      }
      else if(compactness < 0.45){
        left.compactness = (compactness-0.2)*50/0.25+25;
      }
      else{
        left.compactness = (compactness-0.45)*25/0.1+75;
      }

      _this.setData({info:res.data,left:left})
      
      let data_x = [],data_num = [],data_length = [];
      res.data.list.forEach(function(e){
        data_x.push(e.date.slice(-5));
        data_num.push(e.before == 0?0:e.before.moisture_content);
        data_length.push(e.end == 0?0:e.end.moisture_content);
      })
      let per = data_x.length <7?100:parseInt(700/data_x.length);
      // console.log(per)
      let option = {
        dataZoom: {end: per},
        xAxis: {
          data: data_x
        },
        series: [
          {data: data_num,type: 'bar', barMaxWidth:8,itemStyle:{borderRadius: 4}},
          {data: data_length,type: 'bar', barMaxWidth:8,itemStyle:{borderRadius: 4}, barGap:0.6}
        ]
      };
      setTimeout(() => {
        chart.setOption(option);
      }, 500);

    }).catch(function(err){console.log(err);})

  },
  changeTab(e){
    let type = parseFloat(e.currentTarget.dataset.type),newoption = {};
    if(type != this.data.tabbaridx){
      chart.clear();

      if(type == 0){//柱状图
        let data_x = [],data_num = [],data_length = [];
        this.data.info.list.forEach(function(e){
          data_x.push(e.date.slice(-5));
          data_num.push(e.before.length == 0?0:e.before.moisture_content);
          data_length.push(e.end.length == 0?0:e.end.moisture_content);
        })
        let per = data_x.length <7?100:parseInt(700/data_x.length);
        newoption = {
          dataZoom: {end: per},
          xAxis: {
            data: data_x
          },
          series: [
            {data: data_num,type: 'bar', barMaxWidth:8,itemStyle:{borderRadius: 4}},
            {data: data_length,type: 'bar', barMaxWidth:8,itemStyle:{borderRadius: 4}, barGap:0.6}
          ]
        };
      }
      else{//折线图
        let data_x = [],data_num = [],data_length = [],x_length = this.data.info.list.length;
        this.data.info.list.forEach(function(e){
          data_x.push(e.date.slice(-5));
          data_num.push(e.before.length == 0?0:e.before.compactness);
          data_length.push(e.end.length == 0?0:e.end.compactness);
        })
        if(x_length == 1){
          data_x.push('');data_x.unshift('');
          data_num.push(0);data_num.unshift(0);
          data_length.push(0);data_length.unshift(0);
        }
        let per = data_x.length <7?100:parseInt(700/data_x.length);
        newoption = {
          dataZoom: {end: per},
          xAxis: {
            data: data_x,
            boundaryGap:x_length == 1?false:true
          },
          series: [
            {
              data: data_num,type: 'line',smooth: true,
              itemStyle: {color: '#D9C392',width:2},
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,[
                  {offset: 0, color: 'rgba(230, 216, 184, 1)'},
                  {offset: 1, color: 'rgba(230, 216, 184, 0)'}
              ]),opacity:1},
              lineStyle:{
                color: '#D9C392',width:2,
                shadowColor: '#F0DCB0',
                shadowBlur: 12,
                shadowOffsetY:12
              }
            },
            {
              data: data_length,type: 'line',smooth: true,
              itemStyle: {color: '#E6D8B8',width:2},
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1,[
                  {offset: 0, color: 'rgba(250, 245, 234, 1)'},
                  {offset: 1, color: 'rgba(250, 245, 234, 0)'}
              ]),opacity:1},
              lineStyle:{
                color: '#E6D8B8',width:2,
                shadowColor: '#F0DCB0',
                shadowBlur: 12,
                shadowOffsetY:12
              },
            }
          ]
        };
      }
   


      chart.setOption(option);
      chart.showLoading();
      setTimeout(() => {
        chart.hideLoading();
        
        chart.setOption(newoption);
      }, 500);
      this.setData({tabbaridx:type})
    }
  },
  lastDate(){
    let daytype = this.data.daytype,today = this.data.today.today,lastweek = this.data.today.lastweek,lastmonth = this.data.today.lastmonth;
    
    if(daytype == 'day'){
      let day = new Date(today).getTime()-24*60*60*1000;
      let start = util.dateShow(new Date(day));
      this.setData({
        'today.today': start,
        dateNextBtn:true
      })

      let postdata = {
        uid:app.instrument.userInfo.id,
        stime:start,
        etime:start,
        position:this.data.position
      };
      this.getList(postdata);
    }
    else if(daytype == 'week'){
      let start = new Date(lastweek).getTime()-24*60*60*1000*7;
      let end = new Date(lastweek).getTime()-24*60*60*1000;
      this.setData({
        'today.today': util.dateShow(new Date(end)),
        'today.lastweek': util.dateShow(new Date(start)),
        dateNextBtn:true
      })

      let postdata = {
        uid:app.instrument.userInfo.id,
        stime:util.dateShow(new Date(start)),
        etime:util.dateShow(new Date(end)),
        position:this.data.position
      };
      this.getList(postdata);
    }
    else if(daytype == 'month'){
      let date = new Date(lastmonth),start = '',end = '';
      let month = date.getMonth()+1
      let year = date.getFullYear();
      if(month == 1){
        start = (year-1)+'-12-01';
        end = (year-1)+'-12-'+new Date(year-1,12,0).getDate();
      }
      else{
        start = year+'-'+util.formatNumber(month-1)+'-01';
        end = year+'-'+util.formatNumber(month-1)+'-'+new Date(year,month-1,0).getDate();
      }
      this.setData({
        'today.today': util.dateShow(new Date(end)),
        'today.lastmonth': util.dateShow(new Date(start)),
        dateNextBtn:true
      })
      let postdata = {
        uid:app.instrument.userInfo.id,
        stime:util.dateShow(new Date(start)),
        etime:util.dateShow(new Date(end)),
        position:this.data.position
      };
      this.getList(postdata);
    }
  },
  nextDate(){
    let today = this.data.today,daytype = this.data.daytype;
    // options.daytype == 'day'?today:options.daytype == 'week'?lastweek:lastmonth,
    // if(daytype == 'day')
    if(this.data.dateNextBtn == false){
      app.toastFun('已经是最后一天啦');
    }
    else{
      let daytype = this.data.daytype,today = this.data.today.today,lastweek = this.data.today.lastweek,lastmonth = this.data.today.lastmonth;
      if(daytype == 'day'){
        let day = new Date(today).getTime()+24*60*60*1000;
        let start = util.dateShow(new Date(day));
        this.setData({
          'today.today': util.dateShow(new Date(day)),
          dateNextBtn:start == this.data.now?false:true
        })
        let postdata = {
          uid:app.instrument.userInfo.id,
          stime:util.dateShow(new Date(day)),
          etime:util.dateShow(new Date(day)),
          position:this.data.position
        };
        this.getList(postdata);
      }
      else if(daytype == 'week'){
        let start = new Date(lastweek).getTime()+24*60*60*1000*7;
        let end = new Date(today).getTime()+24*60*60*1000*7;
        let now = new Date(this.data.now).getTime();
        
        if(now <= end){
          end = now;
          this.setData({
            'today.today': util.dateShow(new Date(end)),
            'today.lastweek': util.dateShow(new Date(start)),
            dateNextBtn:false
          })
        }
        else{
          this.setData({
            'today.today': util.dateShow(new Date(end)),
            'today.lastweek': util.dateShow(new Date(start)),
            dateNextBtn:true
          })
        }

        let postdata = {
          uid:app.instrument.userInfo.id,
          stime:util.dateShow(new Date(start)),
          etime:util.dateShow(new Date(end)),
          position:this.data.position
        };
        this.getList(postdata);
      }
      else if(daytype == 'month'){
        let date = new Date(lastmonth),start = '',end = '';
        let month = date.getMonth()+1
        let year = date.getFullYear();
        if(month == 12){
          start = (year+1)+'-01-01';
          end = (year+1)+'-01-'+new Date(year+1,1,0).getDate();
        }
        else{
          start = year+'-'+util.formatNumber(month+1)+'-01';
          end = year+'-'+util.formatNumber(month+1)+'-'+new Date(year,month+1,0).getDate();
        }

        let endtime = new Date(end).getTime();
        let nowtime = new Date(this.data.now).getTime();
        if(nowtime <= endtime){
          end = this.data.now;
          this.setData({
            'today.today': util.dateShow(new Date(end)),
            'today.lastmonth': util.dateShow(new Date(start)),
            dateNextBtn:false
          })
        }
        else{
          this.setData({
            'today.today': util.dateShow(new Date(end)),
            'today.lastmonth': util.dateShow(new Date(start)),
            dateNextBtn:true
          })
        }

        let postdata = {
          uid:app.instrument.userInfo.id,
          stime:util.dateShow(new Date(start)),
          etime:util.dateShow(new Date(end)),
          position:this.data.position
        };
        this.getList(postdata);
      }
    }
  }
});
