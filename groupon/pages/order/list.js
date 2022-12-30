// groupon/pages/order/list.js
const app = getApp();
const getRequest = require('../../../utils/getRequest');
Page({
    data: {
        tabbar: ['全部', '进行中', '拼团成功', '拼团失败'],
        tabbarNum: 0,
        list:[],
        pagenum:1,
        last_page: 1,
        loadState:true,
        userinfo: {},
        is_storeStaff: false, //是否是门店员工 包括店老板或美容师
        needAdapt: app.globalData.system.needAdapt,
    },
    onLoad() {
        wx.hideShareMenu();
        this.setData({
            userinfo: app.globalData.userInfo,
            is_storeStaff: app.globalData.userInfo.level_name == '店老板' || app.globalData.userInfo.level_name == '美容师'
        })
    },
    onShow() {
        this.setData({
            list:[],
            pagenum:1,
            last_page:1
        })
        this.getList(this.data.tabbarNum,1);
    },
    //切换列表
    tabbarChange: function (e) {
        const { idx } = e.currentTarget.dataset;
        this.setData({
            list:[],
            tabbarNum:idx,
            pagenum:1,
            last_page:1
        })
        this.getList(idx,1);
    },
    //订单列表
    getList(status, pagenum) {
        getRequest.post('index/collage/userOrderList', {
            token:app.globalData.token,
            uid:app.globalData.userInfo.id,
            status:status == 0 ? 100 : status - 1,
            page:pagenum
        }).then((res) => {
            let _list = this.data.list.concat(res.data.data);
            _list.map(key => {
                key.deadline = key.deadline * 1000 - Math.round(new Date()) > 0 ? key.deadline * 1000 - Math.round(new Date()) : null;
                key.pd_status == 1 ? key.deadline = null : '';
                key['progress'] = Math.round((key.success_order / key.pd_number)*100)
            })
            this.setData({
                list:_list,
                pagenum:res.data.current_page,
                last_page:res.data.last_page,
                loadState:true
            })
        }).catch((err) => {
            this.setData({ loadState: false })
        })
    },
    //跳转订单详情
    orderDetail: function (e) {
        /**
         * 跳转拼团详情也走首页
         * 通过存入的缓存来判断进入拼团详情要展示什么
         * is_frompayment 是否从支付页跳转
         * pd_oid 订单id
         */
        const { item } = e.currentTarget.dataset;
        const _cacheinfo = {
            is_frompayment: false
        }
        app.router.cache_groupon = { ..._cacheinfo }
        wx.navigateTo({
            url: `../tuaninfo/tuaninfo?pd_oid=${item.pd_order_id}`
        })
    },
    //加载更多
    onReachBottom: function () {
        if(this.data.pagenum < this.data.last_page){
            this.getList(this.data.tabbarNum,this.data.pagenum+1);
        }
        else{
            app.toastFun('我是有底线哒');
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        this.data.pagenum = 1;
        this.setData({
            list:[],
            pagenum:1,
        })
        this.getList(this.data.tabbarNum,this.data.pagenum);
        wx.stopPullDownRefresh();
    },
    // 分享
    onShareAppMessage: function (res) {
        const { gid, npdoid } = res.target.dataset;
        return {
            title: '2折拼团嗨购9款抗初老清洁盲盒，就差妳啦！',
            imageUrl: 'https://cmjx.chengmeijiangxuan.com/static/web/pt/share.jpg',
            path: `pages/login/login?u=${app.globalData.userInfo.id}&f=${app.globalData.userInfo.pid}&t=m&gid=${gid}&npdoid=${npdoid}`
        }
    }
})