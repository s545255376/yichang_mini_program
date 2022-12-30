import util from '../../../utils/util'
const app = getApp();
const insRequest = require('../../utils/network');
Page({
    data: {
        addpage: 1,
        head: '欢 迎 使 用 肌 肤 报 警 器',
        tips: '填写信息有助于检测的准确性',
        sexnum: 0,
        date: '',
        showDate: '',

        skinnum: 1,
        // ageArr:[]
    },
    onLoad() {
        // let birthday = '',ageArr = [];
        // if(app.instrument.userInfo.add_time != ''){
        //   let date = new Date(app.instrument.userInfo.add_time*1000);
        //   birthday = util.dateShow(date);
        // }
        // for(var i=0;i<100;i++){
        //   ageArr.push(i+1);
        // }
        this.setData({
            sexnum: app.instrument.userInfo.sex,
            date: app.instrument.userInfo.age == 0 ? '' : app.instrument.userInfo.age - 1,
            showDate: app.instrument.userInfo.age,
            skinnum: app.instrument.userInfo.skin_type == 0 ? 1 : app.instrument.userInfo.skin_type,
            // ageArr:ageArr
        })
    },
    // bindDateChange(e){
    //   this.setData({
    //     date:parseInt(e.detail.value),
    //     showDate:parseInt(e.detail.value)+1
    //   })
    // },
    // 输入年龄
    bindDateChange(e) {
        this.setData({
            showDate: e.detail.value
        })
    },
    // 切换个人信息第二页
    nextBtn() {
        if (this.data.showDate != '') { //未选择肤质
            this.setData({
                addpage: 2,
                head: '请选择你的肤质',
            })
        } else {
            app.toastFun('您还未选择出生日期');
        }
    },
    // 切换个人信息第一页
    lastBtn() {
        this.setData({
            addpage: 1,
            head: '欢 迎 使 用 魔 镜 测 肤',
        })
    },
    // 性别选择
    sexChange(e) {
        this.setData({
            sexnum: e.currentTarget.dataset.num
        })
    },
    // 肤质选择
    skinChange(e) {
        this.setData({
            skinnum: e.currentTarget.dataset.num
        })
    },
    // 跳转检测选择页面
    goNext() {
        let _this = this;
        let postdata = {
            uid: app.instrument.userInfo.id,
            sex: this.data.sexnum,
            skin_type: this.data.skinnum,
            age: this.data.showDate
        };
        insRequest.post('updUserInfo', postdata).then(function (res) {
            console.log(res)
            app.instrument.userInfo.sex = _this.data.sexnum;
            app.instrument.userInfo.skin_type = _this.data.skinnum;
            app.instrument.userInfo.age = _this.data.showDate;
            wx.redirectTo({
                url: '../position/position',
            })
        }).catch(function (err) {
            console.log(err);
        })
    },
})