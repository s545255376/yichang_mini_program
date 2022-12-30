//字体加载
const app = getApp();
function getFont(){
  let promise = new Promise(function (resolve, reject) {
    if(app.globalData.loadFont == true){
      resolve(true);
    }
    else{
      wx.loadFontFace({
        global:true,
        family: 'SourceHanSans',
        source: 'url("'+app.globalData.url+'static/common/ttf/SourceHanSans-Regular.ttf")',
        success: function(res){
          app.globalData.loadFont = true;
          resolve(true);
        },
        fail: function(res){
          app.globalData.loadFont = false;
          reject(false);
        },
      })
    }
  });
  return promise;
  
}
module.exports = {
  get: getFont
}