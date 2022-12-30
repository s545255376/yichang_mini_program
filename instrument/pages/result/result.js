const app = getApp();
const insRequest = require('../../utils/network');
Page({
  data: {
    type:'',
    info:{},
    left:{
      moisture_content:0,
      oil_content:0,
      compactness:0
    }
  },
  onLoad: function (options) {
    let _this = this,postdata = {
      uid:app.instrument.userInfo.id,
      id:parseInt(options.id)
    },left={
      moisture_content:0,
      oil_content:0,
      compactness:0
    };
    insRequest.post('getResultInfo',postdata).then(function(res){
      console.log(res)
      let moisture_content = parseFloat(res.data.moisture_content);
      let oil_content = parseFloat(res.data.oil_content);
      let compactness = parseFloat(res.data.compactness);
      // left.moisture_content = res.data.moisture_content*100/60;
      // left.oil_content = res.data.oil_content*100/51;
      // left.compactness = res.data.compactness*100/0.55;
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



      _this.setData({
        type:options.type,
        info:res.data,left:left
      })
    }).catch(function(err){console.log(err);})
  },

})