const app = getApp();
const getRequest = require('../../utils/getRequest');
Page({
    data: {
        changeidx: '',
        list: [],
        checkedNum: -1
    },
    onLoad: function (options) {
        let giveid = options.giveid,
            checkedNum = -1;
        app.router.giveList.forEach(function (e, idx) {
            //判断是否之前选中过该赠品
            if (e.id == giveid) {
                checkedNum = idx;
            }
        })
        this.setData({
            list: app.router.giveList,
            checkedNum: checkedNum,
            changeidx: options.idx ? options.idx : ''
        })
    },
    //切换显示赠品列表
    normsSearch(e) {
        this.setData({
            checkedNum: e.detail.value
        })
    },
    checkedBtn() {
        if (this.data.checkedNum == -1) {
            app.toastFun('您还没有选择赠品');
        } else {
            if (this.data.changeidx == '') {
                app.router.giveChecked.push(this.data.list[this.data.checkedNum])
            } else {
                app.router.giveChecked[this.data.changeidx] = this.data.list[this.data.checkedNum];
            }
            wx.navigateBack({
                delta: 1,
            })
        }
    }
})