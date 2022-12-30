//版本号比较
// compareVersion('1.11.0', '1.9.9') // => 1 // 1表示 1.11.0比1.9.9要新
// compareVersion('1.11.0', '1.11.0') // => 0 // 0表示1.11.0和1.9.9是同一个版本
// compareVersion('1.11.0', '1.99.0') // => -1 // -1表示1.11.0比 1.99.0要老
const app = getApp();
function compareVersion(v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  var len = Math.max(v1.length, v2.length);
  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }
 
  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i]);
    var num2 = parseInt(v2[i]);
    if (app.globalData.system.system.indexOf('7.0.20') != -1 && app.globalData.system.system.indexOf('ios') != -1) {//ios 7.0.20 版本不可加载图片
      return -1;
    }
    else if(num2 < num1){
      return 1;
    }
    else if (num1 < num2) {
      return -1;
    }
  }
  return 0;
}
module.exports = {
  contrast: compareVersion
}