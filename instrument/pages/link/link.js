const app = getApp();
const insRequest = require('../../utils/network');
Page({
    data: {
        explainType: false, //使用说明弹窗
        userinfoReady: false, //是否正常获取了用户信息

        searchType: false,
        bluetoothOpen: false, //蓝牙模块是否已经初始化

        devices: [], //当前发现的符合条件的设备列表
        connected: false,
        deviceId: '',
        name: '',

        unbundType: false, //控制解绑弹窗
        unbundTips: false, //控制解绑时如未输入原因则提示容器
        unbundReason: '', //解绑原因

        instrument_info: '',
        devmac: ''
    },
    _discoveryStarted: false, //设备是否正在查找状态
    _connectedStarted: false, //蓝牙创建链接是否正在连接中，同一时刻只允许创建一个连接
    onLoad() {
        let instrument_sn = '';
        // 获取用户登录信息
        insRequest.post('getUserInfo', {
            phone: app.globalData.userInfo.mobile,
            type: 1
        }).then((res) => {
            app.instrument.userInfo = res.data;
            if (res.data.instrument_info.length == 0) {
                //首次登录
                instrument_sn = '';
                app.instrument.login = 'first';
            } else {
                instrument_sn = res.data.instrument_info.instrument_sn;
                //console.log('[onLoad]经过处理的设备编码', Object.values(eval('(' + this.reconvert(res.data.instrument_info.instrument_sn)) + ')')).join(':');
            }


            this.setData({
                userinfoReady: true,
                instrument_info: instrument_sn
            })
        })
    },
    // reconvert(str) { //转换Unicode
    //     str = str.replace(/(\\u)(\w{1,4})/gi, function ($0) {
    //         return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
    //     });
    //     str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
    //         return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
    //     });
    //     str = str.replace(/(&#)(\d{1,6});/gi, function ($0) {
    //         return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
    //     });
    //     return str;
    // },
    onShow: function () {
        this.initBluetooth().catch(() => {});
    },
    changeSearch() {
        //切换
        //成对使用，先关闭模块，再初始化模块
        this.closeBluetoothAdapter().then(() => {
            this.initBluetooth().then(() => {
                this.startSearch();
            })
        });
    },
    // 关闭蓝牙模块，修改蓝牙搜索状态， 与 wx.openBluetoothAdapter 成对调用
    closeBluetoothAdapter() {
        return new Promise((resolve, reject) => {
            this._discoveryStarted = false;
            wx.closeBluetoothAdapter().then(res => {
                if (res.errno == 0) {
                    console.log('关闭蓝牙模块成功');
                    resolve();
                } else {
                    console.trace('关闭蓝牙模块失败', res);
                    reject();
                    app.toastFun(res.errMsg);
                }
            }).catch(() => {
                console.trace('关闭蓝牙模块失败', res);
                reject();
                app.toastFun(res.errMsg);
            });
        })
    },
    // 判断该蓝牙是否有被监听到过
    inArray(arr, key, val) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][key] === val) {
                return i;
            }
        }
        return -1;
    },
    initBluetooth() {
        const _this = this;
        //初始化蓝牙模块
        return new Promise((resolve, reject) => {
            wx.openBluetoothAdapter({
                success: async () => {
                    console.log('初始化蓝牙模块成功')
                    _this._discoveryStarted = false;
                    _this.setData({
                        bluetoothOpen: true,
                        devices: [],
                        connected: false,
                        deviceId: '',
                        name: ''
                    })
                    resolve();
                },
                fail: (res) => {
                    console.trace('初始化蓝牙模块失败', res);
                    if (res.errCode === 10001) {
                        app.toastFun('请打开蓝牙以便查找并连接肌肤报警器。');
                        this.setData({
                            searchType: false,
                            bluetoothOpen: false
                        })
                    }
                    reject();
                }
            })
        })
    },
    offListenAfterConnection() {
        /**
         * 关闭所有蓝牙连接后的相关监听
         * 原本想promise all
         * 后来想想只要执行即可，不用拿到回调在resolve
         * 这个方法主要针对createBLEConnection写的
         * 所以off的执行顺序和createBLEConnection相反，从里往外执行
         */
        console.trace('[offListenAfterConnection]准备关闭所有建立蓝牙后创建的所有监听，用于初始化监听');
        return new Promise((resolve) => {
            console.log('1.移除蓝牙低功耗设备的特征值变化事件的监听函数')
            wx.offBLECharacteristicValueChange();
            console.log('2.移除蓝牙低功耗连接状态改变事件的监听函数')
            wx.offBLEConnectionStateChange();
            console.log('3.移除搜索到新设备的事件的监听函数');
            /**
             * 用来移除@function onBluetoothDeviceFound 这个函数创建的获取新设备监听
             */
            wx.offBluetoothDeviceFound();
            resolve();
        })
    },
    //开始搜索附近设备
    startSearch() {
        const {
            userinfoReady,
            bluetoothOpen
        } = this.data;
        if (!userinfoReady) {
            //用户数据是否正常获取到
            app.toastFun('用户信息获取失败，请返回上一页并重新进入！');
        } else if (!bluetoothOpen) {
            //蓝牙是否开启
            app.toastFun('请先开启手机蓝牙');
        } else {
            this.setData({
                searchType: true
            })
            this.startBluetoothDevicesDiscovery();
        }
    },
    //开始搜索附近设备
    startBluetoothDevicesDiscovery() {
        if (this._discoveryStarted) { //正在搜索过程中，停止重新开启搜索操作
            return
        }
        this._discoveryStarted = true;
        console.log("开始搜寻附近的蓝牙外围设备");
        wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: true,
            interval: 1000,
            refreshCache: false, //https://developers.weixin.qq.com/community/develop/doc/000000834183609a59fbfcd5f51800?_at=1661330716806
            success: () => {
                console.log('搜寻已打开，准备监听搜索新设备的事件');
                this.onBluetoothDeviceFound();
            },
            fail: (err) => {
                console.trace('[startBluetoothDevicesDiscovery]开启失败', err)
            }
        })
    },
    //监听搜索到新设备的事件
    onBluetoothDeviceFound() {
        wx.onBluetoothDeviceFound((res) => {
            console.log('[onBluetoothDeviceFound]搜索到新设备：', res);
            let _targetShow = false;
            res.devices.forEach(device => {
                if (!device.name && !device.localName) { //过滤不存在名称设备
                    return
                }
                const foundDevices = this.data.devices;
                if (device.name.indexOf("CHENGMEI") != -1) { //过滤名称不含有CHENGMEI的设备
                    _targetShow = true;
                    const idx = this.inArray(foundDevices, 'deviceId', device.deviceId);
                    let data = {};
                    if (idx === -1) { //设备列表新增
                        data[`devices[${foundDevices.length}]`] = device;
                    } else { //设备列表更新
                        data[`devices[${idx}]`] = device;
                    }
                    this.setData(data);
                    console.log('搜索到肌肤报警器，即将把设备展示在界面', foundDevices)
                }
            })
            if (!_targetShow) {
                this.setData({
                    devices: []
                });
            }
        })
    },
    //链接
    createBLEConnection(e) {
        if (this._connectedStarted) {
            app.toastFun('设备正在连接中...');
            return
        }
        const _this = this;
        const {
            deviceid: deviceId,
            name
        } = e.currentTarget.dataset;
        console.log('[createBLEConnection]本次链接设备deviceId：', deviceId);
        this._connectedStarted = true;
        if (app.globalData.icloading == false) {
            wx.showLoading({
                title: '加载中'
            })
            app.globalData.icloading = true;
        }

        wx.createBLEConnection({ //链接蓝牙设备
            deviceId,
            success: (res) => {
                console.log('[wx.createBLEConnection]链接蓝牙成功!', res);
                wx.onBLEConnectionStateChange(function (res) {
                    console.log('[wx.onBLEConnectionStateChange]开始监听蓝牙低功耗连接状态改变事件', res);
                    /**
                     * 这里开始还是有点问题，在连接成功后，即刻断开所有链接。
                     * 此时并没有和设备进行任何交互，只是单纯获取设备的deviceId用来记录进缓存
                     * 那为什么不获取到deviceId后就停止呢？
                     * 是尝试设备能否正常链接上然后可以正常的监听到设备的特征值变化?，如果是这样这一点倒是说得通。
                     * 因为这个页面链接成功后到了instrument页面是断开状态的需要重连的
                     * 这个页面的wx.onBLEConnectionStateChange这个方法也没利用起来
                     */
                    let serviceId = '';
                    wx.getBLEDeviceServices({
                        deviceId,
                        success: function (e) {
                            _this.setData({
                                services: e.services
                            });
                            // 获取链接设备serviceId
                            for (var t = 0; t < e.services.length; t++) {
                                if (e.services[t].uuid.indexOf("6E40") != -1) {
                                    serviceId = e.services[t].uuid;
                                }
                            }
                            console.log("[wx.getBLEDeviceServices]获取到设备的serviceId:", serviceId);
                            // 获取链接设备characteristicId
                            wx.getBLEDeviceCharacteristics({
                                deviceId,
                                serviceId,
                                success: function (e) {
                                    for (var t = 0; t < e.characteristics.length; t++) {
                                        if (e.characteristics[t].uuid.indexOf("6E400003") != -1 && e.characteristics[t].properties.notify) {
                                            console.log('[wx.getBLEDeviceCharacteristics]获取并过滤到有用的链接设备characteristicId: ', e.characteristics[t].uuid);
                                            // 启用设备特征值监听
                                            wx.notifyBLECharacteristicValueChange({
                                                deviceId,
                                                serviceId,
                                                characteristicId: e.characteristics[t].uuid,
                                                state: true,
                                                success: function (e) {
                                                    console.log('[wx.notifyBLECharacteristicValueChange]启用设备特征值监听成功', e)
                                                    // 监听设备特征值变化
                                                    wx.onBLECharacteristicValueChange(function (msg) {
                                                        console.log('[wx.onBLECharacteristicValueChange]监听设备特征值变化', msg)
                                                        var a = new Uint8Array(msg.value);
                                                        if (a.length == 6) { //设备唯一值
                                                            // _this.data.devmac = JSON.stringify(a);
                                                            _this.data.devmac = a.join(':');
                                                        } else { //获取设备开头六位唯一值
                                                            //_this.data.devmac = JSON.stringify(a.slice(-6));
                                                            _this.data.devmac = a.slice(-6).join(':');
                                                        }

                                                        console.log('设备连接成功，准备移除相关监听');
                                                        console.log('1.关闭特征值、低功耗链接状态、搜索新设备三种监听');
                                                        _this.offListenAfterConnection();
                                                        console.log('2.关闭蓝牙低功耗连接')
                                                        wx.closeBLEConnection({
                                                            deviceId
                                                        })
                                                        console.log('3.关闭蓝牙')
                                                        _this.closeBluetoothAdapter();
                                                        _this._connectedStarted = false;
                                                        console.log('准备记录用户链接设备信息');
                                                        _this.linkBlueTooth(name, deviceId);
                                                    });
                                                },
                                                fail: function (e) {
                                                    console.trace('[ wx.notifyBLECharacteristicValueChange]调用失败', e);
                                                }
                                            })
                                        }
                                    }
                                },
                                fail: function (err) {
                                    console.trace('[wx.getBLEDeviceCharacteristics]调用失败', err);
                                }
                            });
                        },
                        fail: function (err) {
                            console.trace('[wx.getBLEDeviceServices]调用失败', err)
                        }
                    });
                })
                console.log('[wx.createBLEConnection]链接蓝牙成功回调以后不论后续如何操作，关闭本次蓝牙搜索');
                wx.stopBluetoothDevicesDiscovery();
            },
            fail: (res) => {
                if (app.globalData.icloading == true) {
                    wx.hideLoading();
                    app.globalData.icloading = false;
                }
                if (res.errCode == 10003) {
                    app.toastFun('连接失败，请重试');
                } else if (res.errCode == 10012) {
                    app.toastFun('连接超时，请查看设备是否开启');
                } else {
                    app.toastFun('连接失败，请重试');
                }
                console.trace('[wx.createBLEConnection]链接失败', res);
                wx.closeBLEConnection({
                    deviceId
                })
                this._connectedStarted = false;
            }
        })
    },
    // 记录用户连接设备
    linkBlueTooth(name, deviceId) {
        let _this = this
        insRequest.post('userBindInstrument', {
            uid: app.instrument.userInfo.id,
            instrument_sn: this.data.devmac,
            type: 1
        }).then(function (res) {
            console.log('[linkBlueTooth]记录用户连接设备成功', res)
            if (app.globalData.icloading == true) {
                wx.hideLoading()
                app.globalData.icloading = false;
            }
            _this.setData({
                searchType: true,
                connected: true,
                deviceId: deviceId,
                instrument_info: _this.data.devmac,
                name: name
            })
            app.instrument.devmac = _this.data.devmac;
            //缓存
            wx.setStorage({
                key: "deviceid",
                data: {
                    devmac: _this.data.devmac,
                    deviceId: deviceId,
                    name: name
                }
            })
        })
    },
    // 跳转检测页/个人信息填写页
    goNext() {
        if (app.instrument.userInfo.information == 0) { //未填写过个人信息
            wx.navigateTo({
                url: '../state/state',
            })
        } else {
            wx.navigateTo({
                url: '../position/position',
            })
        }
    },
    // 跳转历史记录
    goHist() {
        wx.navigateTo({
            url: '../hist/hist',
        })
    },
    //解绑
    Unbundling() {
        wx.showModal({
            title: '操作提示',
            content: '是否确认解绑原设备，连接此设备？',
            cancelColor: '#A7A5A6',
            cancelText: '取消',
            confirmColor: '#D9C392',
            confirmText: '确认解绑',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        unbundType: true
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    // 填写解绑原因
    addReason(e) {
        this.setData({
            unbundReason: e.detail.value
        })
    },
    // 取消解绑操作
    unbundCancel() {
        this.setData({
            unbundType: false
        })
    },
    // 确认解绑
    unbundConfirm() {
        if (this.data.unbundReason == '') {
            this.setData({
                unbundTips: true
            })
        } else {
            let _this = this;
            insRequest.post('relieveBindInstrument', {
                uid: app.instrument.userInfo.id,
                reason: _this.data.unbundReason,
                type: 1
            })
            this.setData({
                deviceId: '',
                unbundTips: false,
                unbundType: false
            })
        }
    },
    //使用说明
    showExplain() {
        this.setData({
            explainType: true
        })
    },
    // 关闭使用说明
    closeExplain() {
        this.setData({
            explainType: false
        })
    },
    // 页面隐藏停止蓝牙监听与链接
    onHide: function () {
        console.log('onhide 页面隐藏');
        this.setData({
            searchType: false
        })
        wx.stopBluetoothDevicesDiscovery().catch(() => {});
        this.offListenAfterConnection();
        /**
         * 这里是防止BLEConnection创建后没有被成功销毁
         * 正常走到这里的都已主动断开，留这个是防止意外
         */
        wx.closeBLEConnection({
            deviceId: this.data.deviceId,
        }).catch(() => {});
        this._connectedStarted = false;
        this.closeBluetoothAdapter();
    },
    // 页面销毁停止蓝牙监听与链接
    onUnload: function () {
        console.log('onUnload 页面销毁');
        wx.stopBluetoothDevicesDiscovery().catch(() => {});
        this.offListenAfterConnection();
        /**
         * 这里是防止BLEConnection创建后没有被成功销毁
         * 正常走到这里的都已主动断开，留这个是防止意外
         */
        wx.closeBLEConnection({
            deviceId: this.data.deviceId,
        }).catch(() => {});
        this._connectedStarted = false;
        this.closeBluetoothAdapter();
    },

})