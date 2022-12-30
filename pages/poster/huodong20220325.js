// pages/poster/huodong20220325.js
const app = getApp()
Page({
    data: {
        store_id: 0,
        isDingzhi_3800xj: false, //下架
        isDingzhi_6800xj: false, //下架
        isDingzhi_9800xj: false, //下架
        isDingzhi_JK: false, //季卡定制
        isDingzhi_sichuan_0516: false, //四川101-277眉山典雅,101-124桐冰美容 独立定制
        isDingzhi_shanghai_0520: false, //上海羽茜161-171
        isDingzhi_liaoning_0520: false, //辽宁241-107,241-042
        isDingzhi_shanghai_0601: false, //上海161-296悦缇
        isDingzhi_heilongjiang_0608: false, //黑龙江141-120银色森林
        isDingzhi_sichuan_0608: false, //四川101-264简妃
        isDingzhi_liaoning_0608: false, //辽宁诚美媛241-097
        isDingzhi_sichuan_0616: false, //四川陈清美容101-082
        isDingzhi_zhenan_0616: false, //浙南021-140嫣红，021-157斐杨美业
        isDingzhi_hunan_0616: false, //湖南061-184西子
        isDingzhi_shanxi_0616: false, //陕西191-134纤纤坊美容221-022诚美美肌191-188米兰美容美发spa馆
        isDingzhi_shanxi_0629: false, //陕西191-116荣昌达美容
        isDingzhi_hebei_0629: false, //河北151-097杨杨美容
        isDingzhi_shanxi_0701: false, //陕西191-192焕颜时光
        isDingzhi_shanxi_0706: false, //陕西191-151亿合美容、191-058俏仙居
        isDingzhi_shanghai_0714: false, //161-292上海经正堂
        isDingzhi_shandong_0714: false, //071-174莎莎
        isDingzhi_hebei_0718: false, //151-101深洲市诚美美容美体
        isDingzhi_shanxi_0718: false, //191-078诚美媛美容
        isDingzhi_henan_0718: false, //193-157美丽妈妈
        isDingzhi_sichuan_0718: false, //101-148玉树
        isDingzhi_henan_0720: false, //193-137 河南泰福人
        isDingzhi_beijing_0720: false, //171-041 北京内蒙古锡林浩特东方
        isDingzhi_shanxi_0728: false, //陕西191-099美的世界
        isDingzhi_shanxi_0809: false, //陕西除以前定制外全市场
        isDingzhi_beijing_0909: false, //211-220北京世纪丽人
        isDingzhi_heilongjiang_1125: false, //141-001新东方
        isDingzhi_xinmeiyuan_1205: false, //191—084馨美源
        isNot: false,
    },
    goGoodsInfo(e) {
        wx.navigateTo({
            url: '../goodsdetail/goodsdetail?goods_id=' +
                e.currentTarget.dataset.goodsid +
                '&live=false',
        })
    },
    init() {
        const {
            store_id
        } = app.globalData.userInfo
        // console.log(store_id);
        const dz_jk = [1484, 418, 389, 29, 1656, 1657, 390] //季卡定制门店列表

        // 下架
        const dz_xj3800 = [109]
        const dz_xj6800 = [
            1484, 418, 389, 29, 1656, 1657, 1143, 446, 397, 411, 109, 1454, 1766, 1414, 247, 5055, 200, 376, 5014, 1260
        ]
        const dz_xj9800 = [109, 376]
        const dz_sichuan_0516 = [2072, 286] //四川101-277眉山典雅,101-124桐冰美容 独立定制
        const dz_shanghai_0520 = [550] //上海羽茜161-171
        const dz_liaoning_0520 = [401, 386] //辽宁241-107,241-042
        const dz_shanghai_0601 = [2012, 2011, 2004] //上海161-296悦缇
        const dz_heilongjiang_0608 = [423] //黑龙江141-120银色森林
        const dz_sichuan_0608 = [5037] //四川101-264简妃
        const dz_liaoning_0608 = [411] //辽宁诚美媛241-097
        const dz_sichuan_0616 = [301] //四川陈清美容101-082 
        const dz_zhenan_0616 = [1454, 1766] //浙南021-140嫣红，021-157斐杨美业
        const dz_hunan_0616 = [1414] //湖南061-184西子美容
        const dz_shanxi_0616 = [746, 449, 1485] //陕西191-134纤纤坊美容221-022诚美美肌191-188米兰美容美发spa馆
        const dz_shanxi_0629 = [261] //陕西191-116荣昌达美容
        const dz_hebei_0629 = [467] //河北151-097杨杨美容
        const dz_shanxi_0701 = [1798] //陕西191-192焕颜时光
        const dz_shanxi_0706 = [864, 1666] //陕西191-151亿合美容、191-058俏仙居
        const dz_shanghai_0714 = [5055] //161-292上海经正堂
        const dz_shandong_0714 = [200] //071-174莎莎
        const dz_hebei_0718 = [183] //151-101深洲市诚美美容美体
        const dz_shanxi_0718 = [607] //191-078诚美媛美容
        const dz_henan_0718 = [5014] //193-157美丽妈妈
        const dz_sichuan_0718 = [299] //101-148玉树
        const dz_henan_0720 = [220] //193-137 河南泰福人
        const dz_beijing_0720 = [299] //171-041 北京内蒙古锡林浩特东方
        const dz_shanxi_0728 = [477, 2005] //陕西191-099美的世界
        const dz_shanxi_0809 = [229, 450, 732, 930, 1101, 1304, 1419, 1421, 1692, 2032, 5060, 5062, 518] //陕西全市场
        const dz_beijing_0809 = [5070] //211-220北京世纪丽人
        const dz_heilongjiang_1125 = [420] //141-001新东方
        const dz_xinmeiyuan_1205 = [784] //191—084馨美源

        this.setData({
            isDingzhi_3800xj: dz_xj3800.includes(store_id),
            isDingzhi_6800xj: dz_xj6800.includes(store_id),
            isDingzhi_9800xj: dz_xj9800.includes(store_id),
            isDingzhi_JK: dz_jk.includes(store_id),
            isDingzhi_sichuan_0516: dz_sichuan_0516.includes(store_id),
            isDingzhi_shanghai_0520: dz_shanghai_0520.includes(store_id),
            isDingzhi_liaoning_0520: dz_liaoning_0520.includes(store_id),
            isDingzhi_shanghai_0601: dz_shanghai_0601.includes(store_id),
            isDingzhi_heilongjiang_0608: dz_heilongjiang_0608.includes(store_id),
            isDingzhi_heilongjiang_1125: dz_heilongjiang_1125.includes(store_id),
            isDingzhi_xinmeiyuan_1205: dz_xinmeiyuan_1205.includes(store_id),
            isDingzhi_sichuan_0608: dz_sichuan_0608.includes(store_id),
            isDingzhi_liaoning_0608: dz_liaoning_0608.includes(store_id),
            isDingzhi_sichuan_0616: dz_sichuan_0616.includes(store_id),
            isDingzhi_zhenan_0616: dz_zhenan_0616.includes(store_id),
            isDingzhi_hunan_0616: dz_hunan_0616.includes(store_id),
            isDingzhi_shanxi_0616: dz_shanxi_0616.includes(store_id),
            isDingzhi_shanxi_0629: dz_shanxi_0629.includes(store_id),
            isDingzhi_hebei_0629: dz_hebei_0629.includes(store_id),
            isDingzhi_shanxi_0701: dz_shanxi_0701.includes(store_id),
            isDingzhi_shanxi_0706: dz_shanxi_0706.includes(store_id),
            isDingzhi_shanghai_0714: dz_shanghai_0714.includes(store_id),
            isDingzhi_shandong_0714: dz_shandong_0714.includes(store_id),
            isDingzhi_hebei_0718: dz_hebei_0718.includes(store_id),
            isDingzhi_shanxi_0718: dz_shanxi_0718.includes(store_id),                                                                       
            isDingzhi_henan_0718: dz_henan_0718.includes(store_id),
            isDingzhi_sichuan_0718: dz_sichuan_0718.includes(store_id),
            isDingzhi_henan_0720: dz_henan_0720.includes(store_id),
            isDingzhi_beijing_0720: dz_beijing_0720.includes(store_id),
            isDingzhi_shanxi_0728: dz_shanxi_0728.includes(store_id),
            isDingzhi_shanxi_0809: dz_shanxi_0809.includes(store_id),
            isDingzhi_beijing_0909: dz_beijing_0809.includes(store_id),
            isNot: dz_xj3800.includes(store_id) &&
                dz_xj6800.includes(store_id) &&
                dz_xj9800.includes(store_id),
            store_id,
        })

        wx.reportEvent('cardwatch', {})
    },
    onLoad: function (options) {
        this.init()
    },
})