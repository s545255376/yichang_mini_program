const app = getApp();
const insRequest = require('../../utils/network');
Page({
    data: {
        position: '', //检测部位
        type: '', //护理前/后
        model: '', //设备类型,是否为iPhone X或以上

        deviceId: "",
        serviceId: "",
        services: [],

        mask: true, //提示遮罩
        finish: '', //检测是否完成
        state: 0, //蓝牙连接状态
        testing: false, //蓝牙连接状态
        devmac: '', //设备唯一标识
    },
    _reconnectedTime: 0,
    _connectedStarted: false,
    _bluetoothOpen: false, //蓝牙模块是否已经初始化
    onLoad: function (options) {
        this.data.position = options.position;
        this.data.type = options.type;
    },
    onShow() {
        this.setData({
            mask: true,
            state: 0,
            testing: false
        })
        this.closeBluetoothAdapter().then(() => {
            this._connectedStarted = false;
            this._bluetoothOpen = false;
            this.initBluetooth()
        })
    },
    // 关闭蓝牙模块，修改蓝牙搜索状态， 与 wx.openBluetoothAdapter 成对调用
    closeBluetoothAdapter() {
        return new Promise((resolve, reject) => {
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
    initBluetooth() {
        const _this = this;
        //初始化蓝牙模块
        console.log('初始化蓝牙模块')
        return new Promise((resolve, reject) => {
            wx.openBluetoothAdapter({
                success: async () => {
                    _this._bluetoothOpen = true;
                    _this.setData({
                        deviceId: ''
                    })
                    resolve();
                },
                fail: (res) => {
                    console.trace('初始化蓝牙模块失败', res);
                    if (res.errCode === 10001) {
                        app.toastFun('请打开蓝牙以便查找并连接肌肤报警器。');
                        _this._bluetoothOpen = false;
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
            resolve();
        })
    },
    //隐藏操作提示
    hideMask() {
        //app.instrument.login == '';
        const {
            _bluetoothOpen
        } = this;
        if (_bluetoothOpen) {
            // 获取缓存的deviceId
            wx.getStorage({
                key: 'deviceid',
                success: (res) => {
                    if (res.data.deviceId) {
                        this.setData({
                            deviceId: res.data.deviceId,
                            mask: false,
                            finish: false,
                            model: app.globalData.system.model.indexOf('iPhone X')
                        })
                        this.createBLEConnection(res.data.deviceId);
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '检测到设备id不存在，请返回重新链接',
                            showCancel: false,
                            success: (res) => {
                                if (res.confirm) {
                                    wx.navigateBack({
                                        delta: 3
                                    })
                                }
                            }
                        })
                    }
                },
                fail: (res) => {
                    console.log(res);
                    wx.showModal({
                        title: '提示',
                        content: '蓝牙连接失败，请返回重新链接',
                        showCancel: false,
                        success: (res) => {
                            if (res.confirm) {
                                wx.navigateBack({
                                    delta: 3
                                })
                            }
                        }
                    })
                }
            })
        } else {
            app.toastFun('请打开蓝牙再点击下一步!');
        }
    },
    createBLEConnection(deviceId) {
        if (this._connectedStarted) {
            app.toastFun('设备重复连接，请稍后再试...');
            return
        }
        console.log('[createBLEConnection]本次链接设备deviceId：', deviceId);
        this._connectedStarted = true;
        wx.createBLEConnection({
            deviceId,
            success: (res) => {
                console.log('[wx.createBLEConnection]链接蓝牙成功!', res);
                wx.onBLEConnectionStateChange((s) => {
                    console.log('[wx.onBLEConnectionStateChange]开始监听蓝牙低功耗连接状态改变事件', s);
                    if (!s.connected) {
                        console.error('[wx.onBLEConnectionStateChange]监听到连接已断开')
                        console.warn('3秒后将进行重新连接');
                        this.setData({
                            state: 2,
                            testing: false
                        })
                        this._reconnectedTime += 1;
                        this._connectedStarted = false;
                        if (this._reconnectedTime > 5) {
                            wx.showModal({
                                title: '连接提示',
                                content: '多次连接尝试失败，点击确认返回个人中心',
                                showCancel: false,
                                success: (res) => {
                                    if (res.confirm) {
                                        Promise.all([this.offListenAfterConnection(), this.closeBluetoothAdapter()]).then(() => {
                                            wx.navigateBack({
                                                delta: 3
                                            })
                                        })
                                    }
                                }
                            })
                        } else {
                            setTimeout(() => {
                                this.offListenAfterConnection().then(() => {
                                    this.createBLEConnection(deviceId);
                                })
                            }, 3000)
                        }
                    }
                })
                console.log('监听蓝牙低功耗链接状态的同时准备获取蓝牙低功耗设备所有服务 (service)');
                wx.getBLEDeviceServices({
                    deviceId,
                    success: (e) => {
                        this.setData({
                            services: e.services
                        });
                        let serviceId = '';
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
                            success: (e) => {
                                for (var t = 0; t < e.characteristics.length; t++) {
                                    console.log(e.characteristics[t], '[wx.getBLEDeviceCharacteristics]获取到的数值循环出的item');
                                    if (e.characteristics[t].uuid.indexOf("6E400003") != -1 && e.characteristics[t].properties.notify) {
                                        console.log('[wx.getBLEDeviceCharacteristics]获取并过滤到有用的链接设备characteristicId: ', e.characteristics[t].uuid, );

                                        // 启用设备特征值监听
                                        wx.notifyBLECharacteristicValueChange({
                                            deviceId,
                                            serviceId,
                                            characteristicId: e.characteristics[t].uuid,
                                            state: true,
                                            success: (e) => {
                                                console.log('[wx.notifyBLECharacteristicValueChange]启用设备特征值监听成功', e)
                                                this.setData({
                                                    state: 1,
                                                    testing: true,
                                                });

                                                //模拟
                                                // wx.onBLECharacteristicValueChange(function (msg) {
                                                //     console.log('[wx.onBLECharacteristicValueChange]监听设备特征值变化', msg)
                                                // })
                                                // console.log('[10秒后模拟断开连接]')
                                                // setTimeout(() => {
                                                //     console.log('[倒计时结束，断开连接]')
                                                //     wx.closeBLEConnection({
                                                //         deviceId
                                                //     })
                                                // }, 10000)
                                                //数据调用
                                                wx.onBLECharacteristicValueChange(this.onCharacterChanged)
                                            },
                                            fail: function (e) {
                                                console.trace('[ wx.notifyBLECharacteristicValueChange]调用失败', e);
                                                this.onOpenAdapterFailed(e);
                                            }
                                        })
                                    }
                                }
                            },
                            fail: function (err) {
                                console.trace('[wx.getBLEDeviceCharacteristics]调用失败', err);
                                this.onOpenAdapterFailed(err);
                            }
                        })
                    },
                    fail: function (err) {
                        console.trace('[wx.getBLEDeviceServices]调用失败', err)
                        this.onOpenAdapterFailed(err);
                    }
                })
            },
            fail: (res) => {
                if (app.globalData.icloading == true) {
                    wx.hideLoading();
                    app.globalData.icloading = false;
                }
                this._connectedStarted = false;
                this.onOpenAdapterFailed(err);
                console.trace('[wx.createBLEConnection]链接失败', res);
                wx.closeBLEConnection({
                    deviceId
                })
            }
        })
    },
    // 报错缘由
    onOpenAdapterFailed: function (msg) {
        let _this = this;
        if (msg.errCode == 10000) {
            app.toastFun('未初始化蓝牙适配器');
        } else if (msg.errCode == 10001) {
            app.toastFun('当前蓝牙适配器不可用');
        } else if (msg.errCode == 10002) {
            app.toastFun('没有找到指定设备');
        } else if (msg.errCode == 10003) {
            app.toastFun('连接失败');
        } else if (msg.errCode == 10004) {
            app.toastFun('没有找到指定服务');
        } else if (msg.errCode == 10005) {
            app.toastFun('没有找到指定特征值');
        } else if (msg.errCode == 10006) {
            app.toastFun('当前连接已断开');
        } else if (msg.errCode == 10007) {
            app.toastFun('当前特征值不支持此操作');
        } else if (msg.errCode == 10008) {
            app.toastFun('其余所有系统上报的异常');
        } else if (msg.errCode == 10009) {
            app.toastFun('系统版本低于 4.3 不支持 BLE,请升级系统后重试');
        } else if (msg.errCode == 10012) {
            app.toastFun('连接超时');
        } else if (msg.errCode == 10013) {
            app.toastFun('连接 deviceId 为空或者是格式不正确');
        }

        _this.setData({
            // message: "蓝牙接口错误",
            state: 0,
            testing: false
        });
    },
    // 检测结果计算
    calculate: function (t, n, m) {
        if (t == 0) {
            if (n == m) {
                return 0;
            } else {
                console.log(m);
                return m > 179 ? 15 : m > 178 ? 15.1 : m > 177 ? 15.2 : m > 176 ? 15.3 : m > 175 ? 15.4 : m > 174 ? 15.5 : m > 173 ? 15.6 : m > 172 ? 15.7 : m > 171 ? 15.8 : m >
                    170 ? 15.9 : m > 169 ? 16.1 : m > 168 ? 16.5 : m > 167 ? 16.8 : m > 166 ? 17 : m > 165 ? 17.3 : m > 164 ? 17.9 : m > 163 ? 18.1 : m > 162 ? 18.4 : m > 161 ? 18.9 : m > 160 ? 19.1 : m > 159 ?
                    19.4 : m >= 158 ? 19.7 : m >= 157 ? 20 : m > 154 ? 21 : m > 146 ? 24 : m > 144 ? 28 : m > 141 ? 29 : m > 38 ? 30 : m > 135 ? 33 : m > 130 ? 36 : m > 120 ? 38 : m > 110 ? 39 :
                    m > 100 ? 40 : m > 90 ? 43 : m > 80 ? 45 : m > 70 ? 47 : m > 60 ? 50 : m > 50 ? 53 : m > 40 ? 55 : m > 30 ? 58 : 60;
            }
        } else {
            return t > 179 ? 15 : t > 178 ? 15.1 : t > 177 ? 15.2 : t > 176 ? 15.3 : t > 175 ? 15.4 : t > 174 ? 15.5 : t > 173 ? 15.6 : t > 172 ? 15.7 : t > 171 ? 15.8 : t >
                170 ? 15.9 : t > 169 ? 16.1 : t > 168 ? 16.5 : t > 167 ? 16.8 : t > 166 ? 17 : t > 165 ? 17.3 : t > 164 ? 17.9 : t > 163 ? 18.1 : t > 162 ? 18.4 : t > 161 ? 18.9 : t > 160 ? 19.1 : t > 159 ?
                19.4 : t >= 158 ? 19.7 : t >= 157 ? 20 : t > 154 ? 21 : t > 146 ? 24 : t > 144 ? 28 : t > 141 ? 29 : t > 38 ? 30 : t > 135 ? 33 : t > 130 ? 36 : t > 120 ? 38 : t > 110 ? 39 :
                t > 100 ? 40 : t > 90 ? 43 : t > 80 ? 45 : t > 70 ? 47 : t > 60 ? 50 : t > 50 ? 53 : t > 40 ? 55 : t > 30 ? 58 : 60;
        }
    },
    // 返回数值变化监听
    onCharacterChanged(s) {
        const a = new Uint8Array(s.value);
        const {
            deviceId
        } = this.data;
        if (a.length == 6) { //第一次返回，返回设备唯一标识
            //this.data.devmac = JSON.stringify(a);
            this.data.devmac = a.join(':');
        } else if (a[0] < 8) { //检测数值为无效数值，重新连接设备
            app.toastFun('请再靠近些设备不要移动');
            wx.closeBLEConnection({
                deviceId,
                fail: (e) => {
                    console.log('[onCharacterChanged]断开失败', e);
                    this.onOpenAdapterFailed(err);
                }
            })
        } else {
            let y = '',
                b = '';
            let o = this.calculate(a[0], a[2], a[3]);
            if (o == 0) { //检测数值为无效数值，重新连接设备
                app.toastFun('请再靠近些设备不要移动');
                wx.closeBLEConnection({
                    deviceId,
                    fail: (e) => {
                        console.log('[onCharacterChanged]断开失败', e);
                        this.onOpenAdapterFailed(err);
                    }
                })
            } else {
                // o:水分 m:油分 y:弹性
                if (this.data.devmac == '') {
                    //this.data.devmac = JSON.stringify(a.slice(-6));
                    this.data.devmac = a.slice(-6).join(':');
                }
                let m = parseInt(.85 * o);
                app.instrument.result.moisture = o;

                app.instrument.result.youfen = m;
                if (0 < o && o <= 20) {
                    b = .003 * o;
                    y = b.toFixed(2);
                } else if (20 < o && o <= 30) {
                    b = .013 * o - .2;
                    y = b.toFixed(2);
                } else if (30 < o && o <= 40) {
                    b = .024 * o - .52;
                    y = b.toFixed(2);
                } else if (40 < o && o <= 60) {
                    b = .005 * h + .25;
                    y = b.toFixed(2);
                };
                app.instrument.result.tanxing = y;
                this.postASk();
            }
        }
    },
    // 上传检测结果跳转结果页面
    postASk: function () {
        if (app.globalData.icloading == true) {
            wx.hideLoading();
            app.globalData.icloading = false;
        }
        wx.showLoading({
            title: '加载中'
        })
        app.globalData.icloading = true;
        const _postData = {
            //基础信息
            uid: app.instrument.userInfo.id,
            position: parseInt(this.data.position),
            type: parseInt(this.data.type),
            instrument_type: 1,
            system: app.globalData.system.system.indexOf('ios') != -1 ? 'ios' : app.globalData.system.system.indexOf('android') != -1 ? 'android' : 'other',
            instrument_sn: this.data.devmac == '' ? app.instrument.devmac : this.data.devmac,
            //捕捉结果
            oil_content: parseFloat(app.instrument.result.youfen), //滋润度
            compactness: parseFloat(app.instrument.result.tanxing), //角质
            moisture_content: parseFloat(app.instrument.result.moisture), //水分
        };
        console.log('[postASk]上传数据:', _postData)
        insRequest.post('reportResults', _postData).then((res) => {
            console.log('[postASk]上传结果:', res)
            this.setData({
                state: 3,
                finish: true
            })
            if (app.globalData.system.system.indexOf('ios') != -1) { //ios延迟2s跳转结果页
                setTimeout(() => {
                    wx.hideLoading();
                    wx.redirectTo({
                        url: '../result/result?id=' + res.data.id + '&type=' + this.data.type,
                    })
                }, 2000);
            } else { //Android延迟1s跳转结果页
                setTimeout(() => {
                    wx.hideLoading();
                    wx.redirectTo({
                        url: '../result/result?id=' + res.data.id + '&type=' + this.data.type,
                    })
                }, 1000);
            }

        }).finally(() => {
            wx.hideLoading();
        })
    },

    goNext() {
        wx.redirectTo({
            url: '../result/result',
        })
    },

    onHide: function () {
        const {
            deviceId
        } = this.data;
        //closeBLEConnection往往到这里结束时已经执行过几次，再执行一次是以防万一没有成功断开
        wx.closeBLEConnection({
            deviceId
        }).catch(() => {});
        this.offListenAfterConnection();
        this.closeBluetoothAdapter();
    },
    onUnload: function () {
        const {
            deviceId
        } = this.data;
        //closeBLEConnection往往到这里结束时已经执行过几次，再执行一次是以防万一没有成功断开
        wx.closeBLEConnection({
            deviceId
        }).catch(() => {});
        this.offListenAfterConnection();
        this.closeBluetoothAdapter();
    },
})