const md5 = require('../utils/md5');

const formatTime = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return (
        [year, month, day].map(formatNumber).join('/') +
        ' ' + [hour, minute, second].map(formatNumber).join(':')
    )
}

const dateArr = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return [year, month, day]
}

const dateShow = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = (n) => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const timeStamp = (date) => {
    date = date.replace(/-/g, '/') + ' 0:0:0'
    const stamp = Date.parse(date)
    return stamp
}
// 直播时间计算
const liveDate = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return (
        [month, day].map(formatNumber).join('.') +
        ' ' + [hour, minute].map(formatNumber).join(':')
    )
}
// 首页直播时间计算
const liveHomeDate = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return [
        [month, day].map(formatNumber).join('月') + '日',
        [hour, minute].map(formatNumber).join(':'),
    ]
}

function objType(obj) {
    if (obj == null) return 'Null'
    if (obj == undefined) return 'Undefined'
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

function getSign(timestamp) {
  return md5.hex_md5(timestamp + "jkashd;as5456HJGHJ91");
}

class Queue {
    constructor() {
        this.dataStore = []
    }
    enqueue(e) { //进栈
        this.dataStore.push(e)
    }
    unshiftqueue(e) { //头部插栈，适用队列优先
        this.dataStore.unshift(e)
    }
    dequeue() { //出栈
        this.dataStore.shift()
    }
    front() { //找到最后入栈的
        return this.dataStore[0]
    }
    back() { //找到最先入栈的
        return this.dataStore[this.dataStore.length - 1]
    }
    isEmpty() {
        if (this.dataStore.length === 0) {
            return true
        }
        return false
    }
    clear() { //清栈
        this.dataStore.length = 0;
    }
    toOriginal() { //返回数组队列
        return this.dataStore
    }

    toString() { //返回string队列，没用
        return this.dataStore.join(',')
    }
}

/**
 * 处理图片URL，将HTTP转换为HTTPS
 * 如果图片服务器不支持HTTPS，此函数会尝试转换，但可能仍会失败
 * @param {string} url 图片URL
 * @returns {string} 处理后的图片URL
 */
function processImageUrl(url) {
    url = url.replace('http://images.luluhoo.cn', 'https://yichangimg.luluhoo.cn');
    return url;
}

module.exports = {
    formatTime: formatTime,
    dateArr: dateArr,
    dateShow: dateShow,
    formatNumber: formatNumber,
    timeStamp: timeStamp,
    liveDate: liveDate,
    liveHomeDate: liveHomeDate,
    objType: objType,
    getSign: getSign,
    Queue,
    processImageUrl: processImageUrl,
}