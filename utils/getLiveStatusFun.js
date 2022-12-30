//获取并更新直播状态
const livePlayer = requirePlugin('live-player-plugin');
const app = getApp();
function getLiveStatusFun(roomid, live_status) {
    livePlayer.getLiveStatus({ room_id: roomid })
        .then(res => {
            // 101: 直播中, 102: 未开始, 103: 已结束, 104: 禁播, 105: 暂停中, 106: 异常，107：已过期 
            let liveStatus = res.liveStatus
            console.log('get live status', liveStatus)
            if (liveStatus != live_status) {
                wx.request({
                    url: app.globalData.url + 'index/live/status',
                    data: { room_id: roomid, token: app.globalData.token, status: liveStatus },
                    method: 'POST',
                    success: function (res) {
                    }
                })
            }
        })
        .catch(err => {
            console.log('get live status', err);
        })
}
module.exports = {
    get: getLiveStatusFun
}