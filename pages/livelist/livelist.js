// const app = getApp();
// const getRequest = require('../../utils/getRequest');
// const util = require('../../utils/util.js');
// const getLiveStatusFun = require('../../utils/getLiveStatusFun.js');
// Page({
//     data: {
//         tabbarNum: 1,
//         loadState: true,
//         list: [],
//         last_page: 1,
//         pagenum: 1,
//         liveInterval: '',
//         shareCache: {},
//         // 进入直播输入密码相关
//         password: '',
//         passwordToast: false,
//         currentItem: {}, //弹出输入密码的时候暂存item
//         guideToast: false, //弹出新手引导
//     },
//     onShow() {
//         wx.setStorageSync('intomyxprevpage', 'livelist');

//         let _this = this;
//         this.setData({
//             list: [],
//             pagenum: 1,
//             tabbarNum: 1
//         })
//         clearInterval(_this.data.liveInterval);
//         this.init(1);
//     },
//     //直播间密码相关
//     //隐藏弹窗
//     closeToast: function (e) {
//         const {
//             detail
//         } = e
//         this.setData({
//             [detail]: false,
//         })
//     },
//     passwordOnChange(e) {
//         this.setData({
//             password: e.detail
//         })
//     },
//     confirmCheck() {
//         const {
//             password,
//             currentItem
//         } = this.data;
//         const {
//             userInfo
//         } = app.globalData
//         // 验证直播间密码
//         getRequest.post('/index/live/password', {
//             uid: userInfo.id,
//             store_id: userInfo.store_id,
//             room_id: currentItem.roomid,
//             password
//         }).then(res => {
//             if (res.code == 200) {
//                 this.getDotEnter(currentItem.roomid, currentItem.live_status);
//             }
//         }).catch(res => {
//             app.toastFun('直播间不可进');
//             // getRequest.errlogPost("直播列表输入密码错误", res, {
//             //     uid: userInfo.id,
//             //     store_id: userInfo.store_id,
//             //     room_id: roomid,
//             //     password,
//             //     mobile: app.globalData.userInfo.mobile
//             // }, {
//             //     methods: 'confirmCheck',
//             //     version: app.globalData.version
//             // });
//         })
//     },
//     //点击item进入直播间前判断条件
//     activeIntoBefore(e) {
//         const {
//             item
//         } = e.currentTarget.dataset;
//         const {
//             userInfo
//         } = app.globalData;

//         const needGetDot = userInfo.level_id == 3 || userInfo.level_id == 5 || userInfo.level_id == 6 ? true : false;
//         if (needGetDot) {
//             if (item.need_password == 1) {
//                 this.setData({
//                     currentItem: item,
//                     passwordToast: true
//                 })
//             } else {
//                 this.getDotEnter({
//                     roomid: item.roomid,
//                     live_status: item.live_status
//                 })
//             }
//         } else {
//             this.getDotEnter({
//                 roomid: item.roomid,
//                 live_status: item.live_status
//             })
//         }
//     },
//     //进入直播间前打点
//     getDotEnter(e) {
//         const {
//             roomid,
//             live_status
//         } = e;

//         const {
//             userInfo
//         } = app.globalData
//         const {
//             f
//         } = app.globalData.sharequery;

//         getRequest.noToastPost('index/live/operator_log', {
//             uid: userInfo.id,
//             store_id: userInfo.store_id,
//             room_id: roomid,
//             share_uid: f,
//             type: 1
//         }).then(res => {
//             if (res.code == 200) {
//                 this.intoRoom(roomid, live_status);
//             }
//         })
//     },
//     intoRoom(roomid, live_status) {
//         if (this.data.tabbarNum == 1) {
//             //修改直播间状态
//             getLiveStatusFun.get(roomid, live_status);
//             // 往后间隔5分钟或更慢的频率去轮询获取直播状态
//             this.data.liveInterval = setInterval(() => {
//                 console.log(roomid)
//                 getLiveStatusFun.get(roomid, live_status);
//             }, 300000)

//             let postdata = {
//                 uid: app.globalData.userInfo.id,
//                 room_id: roomid,
//                 token: app.globalData.token
//             }
//             getRequest.noToastPost('index/live/roomLog', postdata);
//         }

//         const param = encodeURIComponent(JSON.stringify({
//             f: app.globalData.userInfo.pid,
//             u: app.globalData.userInfo.id
//         }));

//         wx.navigateTo({
//             url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}&open_share_ticket=1&custom_params=${param}`
//         })
//     },
//     // 直播间长按或者点击关闭按钮激活的
//     popAcitve(e) {

//         const {
//             list,
//             tabbarNum
//         } = this.data;

//         const {
//             userInfo
//         } = app.globalData
//         // //顾客需要记录打开次数
//         const needGetDot = userInfo.level_id == 3 || userInfo.level_id == 5 || userInfo.level_id == 6 ? true : false;
//         // //往期直播不显示分享
//         if (tabbarNum == 0) {
//             return
//         }

//         const {
//             item = {},
//                 popactive,
//                 index
//         } = e.currentTarget.dataset;
//         if (popactive == 'show') {
//             list.map(key => {
//                 key.shareshow = false
//             });
//             list[index].shareshow = true;
//             this.setData({
//                 shareCache: !needGetDot ? item : {}
//             })
//         } else if (popactive == 'hide') {
//             list[index].shareshow = false;
//             this.setData({
//                 shareCache: {}
//             })
//         }
//         this.setData({
//             list
//         })
//     },
//     //分享打点
//     share(e) {
//         const {
//             userInfo
//         } = app.globalData;
//         const {
//             item
//         } = e.currentTarget.dataset;
//         getRequest.noToastPost('index/live/seller_log', {
//             uid: userInfo.id,
//             store_id: userInfo.store_id,
//             room_id: item.roomid,
//         })
//     },
//     //切换搜索直播状态
//     onChange(e) {
//         this.setData({
//             tabbarNum: e.currentTarget.dataset.type,
//             pagenum: 1,
//             list: []
//         })
//         this.init(e.currentTarget.dataset.type);
//     },
//     //获取直播列表
//     init(type) {
//         let level_id = app.globalData.userInfo.level_id;
//         let _this = this,
//             postdata = {
//                 uid: app.globalData.userInfo.id,
//                 role_id: (level_id == 1 || level_id == 2) ? 1 : level_id == 3 ? 4 : level_id == 4 ? 2 : 3, //是 	int 	用户角色 1店老板 2美容师 3顾客 4匠选官
//                 type,
//                 page: this.data.pagenum,
//                 token: app.globalData.token
//             }
//         getRequest.post('index/live/lists', postdata).then(function (res) {
//             res.data.data.forEach(function (e) {
//                 e.start_time = util.liveDate(new Date(e.start_time * 1000));
//                 e['shareshow'] = false;
//                 e['zindex'] = 0;
//             })

//             _this.setData({
//                 list: _this.data.list.concat(res.data.data),
//                 pagenum: res.data.current_page,
//                 last_page: res.data.last_page,
//                 loadState: true
//             })

//             app.globalData.sharequery.t = '';

//             if (type == 1 && res.data.data.length > 0) {
//                 // 新手引导条件判断
//                 var guidelist = wx.getStorageSync('guide');
//                 if (!guidelist || !guidelist.livelist) {
//                     _this.noviceguide();
//                 }
//             }
//         }).catch(function (err) {
//             console.log(err);
//         })
//     },
//     //加载更多
//     onReachBottom: function () {
//         if (this.data.pagenum < this.data.last_page) {
//             this.setData({
//                 pagenum: this.data.pagenum + 1
//             })
//             this.init(this.data.tabbarNum);
//         } else {
//             app.toastFun('我是有底线哒');
//         }
//     },
//     onShareAppMessage: function () {
//         const {
//             shareCache
//         } = this.data;
//         if (Object.keys(shareCache).length > 0) {
//             const {
//                 id,
//                 pid
//             } = app.globalData.userInfo;
//             return {
//                 title: '邀妳一起即刻享受世界艺术',
//                 imageUrl: 'https://cmjx.chengmeijiangxuan.com/static/common/images/share.jpg',
//                 path: `pages/login/login?u=${id}&f=${pid}&t=pl&roomid=${shareCache.roomid}`
//             }
//         }
//         return {
//             title: '邀妳一起即刻激活权益，闺蜜同享水光护理',
//             imageUrl: 'https://cmjx.chengmeijiangxuan.com/static/common/images/share.jpg',
//             path: 'pages/login/login?u=' + app.globalData.userInfo.id + '&f=' + app.globalData.userInfo.pid + '&t=l'
//         }
//     },
//     //新手引导
//     noviceguide() {
//         const need = true;
//         if (need) {
//             const {
//                 list
//             } = this.data;
//             list[0].zindex = '9999';
//             this.setData({
//                 guideToast: true,
//                 list
//             })
//         }
//     },
//     guideConfirm() {
//         const {
//             list
//         } = this.data;
//         list[0].zindex = '0';
//         this.setData({
//             guideToast: false,
//             list
//         })
//         const guidelist = wx.getStorageSync('guide');
//         if (guidelist) {
//             wx.setStorageSync('guide', {
//                 ...guidelist,
//                 livelist: true
//             })
//         } else {
//             wx.setStorageSync('guide', {
//                 livelist: true
//             })
//         }
//     }
// })