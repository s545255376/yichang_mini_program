import util from '../../../utils/util';
const app = getApp();
const insRequest = require('../../utils/network');

Page({
    data: {
        now: '',
        todaydom: '',
        today: {
            today: '',
            lastweek: '',
            lastmonth: '',
        },
        dateNextBtn: false,

        datanum: 0,
        list: [],

        dateSearch: false,
        date: {
            year: '',
            month: '',
            date: '',
            day: ''
        },
        caleList: [],




        years: [],
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        days: [],
        dateValue: ['', '', ''],
        customShow: false,
        custom: {
            start: ['', '', ''],
            end: ['', '', '']
        }
    },

    onLoad: function (options) {
        // app.instrument.userInfo.id = 17;

        let date = new Date();
        let week = date.getDay();
        let lastweek = new Date(date.getTime() - 24 * 60 * 60 * 1000 * (week == 0 ? 6 : week - 1));
        let lastmonth = new Date(date.getFullYear() + '/' + (date.getMonth() + 1) + '/01');

        let caleList = this.getCalendar(date.getFullYear(), date.getMonth() + 1, date.getDate()).caleList;

        let today = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
        let getday = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: today,
            day: date.getDate()
        };
        let years = [],
            days = [];
        for (var i = date.getFullYear() - 20; i < date.getFullYear() + 20; i++) {
            years.push(i);
        }
        for (var i = 1; i < new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() + 1; i++) {
            days.push(i);
        }

        this.setData({
            years: years,
            days: days,
            // caleList:caleList,
            date: getday,
            now: util.dateShow(date),
            todaydom: today,
            today: {
                today: util.dateShow(date),
                lastweek: util.dateShow(lastweek),
                lastmonth: util.dateShow(lastmonth),
            },

        })

        // let _this = this;
        // setTimeout(() => {
        //   _this.setData({
        //     dateValue:[20,date.getMonth(),date.getDate()],
        //   })
        // }, 500);

        this.getToday(util.dateShow(date), util.dateShow(date));
    },
    goBack() {
        wx.navigateBack({
            delta: 1,
        })
    },
    dateChange(e) {
        let num = e.currentTarget.dataset.num;
        this.setData({
            datanum: e.currentTarget.dataset.num
        })
        if (num == 0) {
            this.getToday(this.data.date.date, this.data.date.date);
        } else if (num == 1) {
            this.getToday(this.data.today.lastweek, this.data.today.today);
        } else if (num == 2) {
            this.getToday(this.data.today.lastmonth, this.data.today.today);
        }
    },
    goCharts(e) {
        let position = e.currentTarget.dataset.position,
            type = e.currentTarget.dataset.type,
            daytype = '',
            stime = '',
            etime = '';
        if (this.data.datanum == 0) {
            daytype = 'day';
            stime = this.data.date.date, etime = this.data.date.date;
        } else if (this.data.datanum == 1) {
            daytype = 'week';
            stime = this.data.today.lastweek, etime = this.data.today.today;
        } else if (this.data.datanum == 2) {
            daytype = 'month';
            stime = this.data.today.lastmonth, etime = this.data.today.today;
        } else {
            daytype = 'custom';
            stime = this.data.custom.start[0] + '-' + this.data.custom.start[1] + '-' + this.data.custom.start[2], etime = this.data.custom.end[0] + '-' + this.data.custom.end[1] + '-' + this.data.custom.end[2];
        }

        wx.navigateTo({
            url: '../histinfo/histinfo?position=' + position + '&stime=' + stime + '&etime=' + etime + '&type=' + type,
        })

        // wx.navigateTo({
        //   url: '../histinfo/histinfo?position='+position+'&daytype='+daytype+'&type='+type,
        // })
    },
    getToday(stime, etime) {
        let _this = this,
            postdata = {
                uid: app.instrument.userInfo.id,
                stime: stime,
                etime: etime
                // stime:num == 0?this.data.today.today:num == 1?this.data.today.lastweek:this.data.today.lastmonth,
                // etime:this.data.today.today
            };
        insRequest.post('getTodayInfo', postdata).then(function (res) {
            _this.setData({
                list: res.data
            })
        }).catch(function (err) {
            console.log(err);
        })
    },






    //时间范围显示
    customChange() {
        let date = new Date();
        this.setData({
            customShow: true,
            datanum: 3,
            dateValue: [20, date.getMonth(), date.getDate()],
            custom: {
                start: ['', '', ''],
                end: ['', '', '']
            }
        })
    },
    customCancel() {
        let custom = this.data.custom,
            date = this.data.date;
        if (custom.start[0] == '') {
            this.setData({
                customShow: false,
                datanum: 3
            })
        } else if (custom.end[0] == '') {
            custom.start = ['', '', ''];
            this.setData({
                custom: custom
            })
        }
    },
    customConfirm() {
        let custom = this.data.custom,
            date = this.data.date;
        if (custom.start[0] == '') {
            custom.start = [date.year, date.month, date.day];
            this.setData({
                custom: custom
            })
        } else {
            if (new Date(custom.start[0] + '/' + custom.start[1] + '/' + custom.start[2]).getTime() <= new Date(date.year + '/' + date.month + '/' + date.day)) {
                custom.end = [date.year, date.month, date.day];
                this.setData({
                    custom: custom,
                    customShow: false
                })
                this.getToday(custom.start[0] + '/' + custom.start[1] + '/' + custom.start[2], date.year + '/' + date.month + '/' + date.day)
            } else {
                app.toastFun('开始时间不能小于结束时间');
            }
        }
    },
    bindChange(e) {
        let val = e.detail.value;
        this.data.date.year = this.data.years[val[0]];
        this.data.date.month = this.data.months[val[1]];
        this.data.date.day = this.data.days[val[2]];
        this.setData({
            date: this.data.date
        })
    },
    caleShow() {
        this.setData({
            dateSearch: !this.data.dateSearch
        })
    },
    // //时间筛选-开始
    // openTimeCheck(){
    //   this.setData({dateSearch:true})
    // },
    // //时间筛选-取消
    // timeCancel(){
    //   let datearr = this.data.showDate,_this = this,caleList = this.data.caleList;
    //   let date = {
    //     year:this.data.date.year,
    //     month:this.data.date.month,
    //     start:datearr.start,
    //     end:datearr.end,
    //   }
    //   this.setData({date:date})
    //   if(datearr.start != '' && datearr.end != ''){
    //     let start = new Date(datearr.start).getDate();
    //     let end = new Date(datearr.end).getDate();
    //     caleList.forEach(function(info,eidx){
    //       info.bg = _this.timeCheck(info.date);
    //       if(info.num == start && info.click == true){info.check = true;}
    //       else if(info.num == end && info.click == true){info.check = true;}
    //       else{info.check = false;}
    //     })
    //   }
    //   else{
    //     caleList.forEach(function(e){
    //       e.check = false;
    //       e.bg = false;
    //     })
    //   }
    //   this.setData({
    //     dateSearch:false,
    //     caleList:caleList
    //   })
    // },
    //时间筛选-确认
    searchConfirm() {
        this.data.pagenum = 1;
        this.setData({
            list: [],
            pagenum: 1,
            dateSearch: false,
            showDate: {
                start: this.data.date.start,
                end: this.data.date.end
            },
        })
        this.getList(this.data.shopnall[this.data.shopnnum].id);
    },
    changeDay(e) {
        let idx = e.currentTarget.dataset.idx,
            _this = this,
            clickday = this.data.caleList[idx].date;
        if (this.data.caleList[idx].click == true) {
            this.data.caleList.forEach(function (info, eidx) {
                info.check = false;
                if (_this.isSameWeek(info.date, clickday)) {
                    info.show = true;
                } else {
                    info.show = false;
                }
            })
            this.data.caleList[idx].check = true;

            this.data.date.date = clickday;

            this.setData({
                caleList: this.data.caleList,
                date: this.data.date
            })
            this.getToday(clickday, clickday);
        }
    },
    //更改月份
    monthChange(e) {
        let type = e.currentTarget.dataset.type,
            date = this.data.date,
            _this = this;
        if (type == 'lastmonth') {
            if (date.month == 1) {
                date.year = date.year - 1;
                date.month = 12;
            } else {
                date.month = date.month - 1;
            }
        } else {
            if (date.month == 12) {
                date.year = date.year + 1;
                date.month = 1;
            } else {
                date.month = date.month + 1;
            }
        }
        date.date = date.year + '/' + date.month + '/1';
        let caleList = this.getCalendar(date.year, date.month, 1);
        this.getToday(date.year + '/' + date.month + '/1');
        // if(date.start){
        //   let start =date.start.split('/'),end = date.end.split('/');
        //   caleList.caleList.forEach(function(info){
        //     if(start.length != 0){
        //       if(start[0] == date.year && start[1] == date.month){
        //         if(info.num == start[2] && info.click == true){info.bg = true;}
        //       }
        //     }
        //     if(end.length != 0){
        //       if(end[0] == date.year && end[1] == date.month){
        //         if(info.num == end[2] && info.click == true){info.bg = true;}
        //       }
        //     }
        //     info.bg = _this.timeCheck(info.date);
        //   })
        // }
        // console.log(caleList.caleList)
        this.setData({
            caleList: caleList.caleList,
            date: date
        })
    },
    timeCheck(date, start, end) {
        let starttime = new Date(start).getTime(),
            endtime = new Date(end).getTime(),
            checktime = new Date(date).getTime(),
            changedate = {
                start: false,
                end: false,
                bg: false
            },
            week = new Date(date).getDay();
        if (checktime <= endtime && starttime <= checktime) {
            changedate.bg = true;
            if (checktime == starttime) {
                changedate.start = true;
            }
            if (checktime == endtime) {
                changedate.end = true;
            }

            if (week == 0) {
                changedate.start = true;
            }
            if (week == 6) {
                changedate.end = true;
            }
        }
        return changedate;
        // let start = '',end = '',checktime = new Date(date).getTime();
        // // console.log(this.data.date)
        // if(this.data.date.start != ''){start = new Date(this.data.date.start).getTime();}
        // if(this.data.date.end != ''){end = new Date(this.data.date.end).getTime();}
        // if(start != '' && end != ''){
        //   if(start <= checktime && checktime <= end){return true;}
        //   else{return false;}
        // }
        // return false;
    },
    //日历方法
    IsRuiYear(aDate) {
        return (0 == aDate % 4 && (aDate % 100 != 0 || aDate % 400 == 0));
    },
    getMonthDay(m, y) {
        var mDay = 0;
        if (m == 0 || m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12) {
            mDay = 31;
        } else {
            if (m == 2) {
                var isRn = this.IsRuiYear(y);
                if (isRn == true) {
                    mDay = 29;
                } else {
                    mDay = 28;
                }
            } else {
                mDay = 30;
            }
        }
        return mDay;
    },
    getUseDay(yyyy, mm, caleList) {
        let _this = this,
            postdata = {
                uid: app.instrument.userInfo.id,
                month: yyyy + '-' + mm
            };
        //获取月历
        insRequest.post('getMonthUseDay', postdata).then(function (res) {
            let dateArr = [],
                length = res.data.length;
            console.log(res)
            res.data.forEach(function (e, idx) {
                dateArr.push(new Date(e.replace(/-/g, '/')).getTime());
                if (idx == length - 1) {
                    caleList.forEach(function (item) {
                        let timer = new Date(item.date).getTime();
                        if (item.click == true && dateArr.indexOf(timer) != -1) {
                            item.bg = true;
                        }
                    })
                    _this.setData({
                        caleList: caleList
                    })
                }
            })
        }).catch(function (err) {
            console.log(err);
        })
        return caleList;
    },

    getCalendar(yyyy, mm, clickday) {
        let caleList = [];
        var dd = new Date(parseInt(yyyy), parseInt(mm), 0);
        var daysCount = dd.getDate(); //本月天数
        var week = new Date(parseInt(yyyy) + "/" + parseInt(mm) + "/" + 1).getDay() - 1; //今天周几
        if (week == -1) {
            week = 6;
        }
        var lastMonth; //上一月天数
        var nextMounth //下一月天数
        lastMonth = this.getMonthDay(mm - 1, yyyy);
        if (parseInt(mm) == 12) {
            nextMounth = new Date(parseInt(yyyy) + 1, parseInt(1), 0).getDate();
        } else {
            nextMounth = new Date(parseInt(yyyy), parseInt(mm) + 1, 0).getDate();
        }


        for (var i = 0; i < daysCount; i++) {
            //计算上月空格数
            if (i % 7 == 0) {
                if (i < 7) {
                    for (var j = week; 0 < j; j--) {
                        if (mm == 1) {
                            if (this.isSameWeek((yyyy - 1) + '/12/' + (lastMonth - j + 1), yyyy + '/' + mm + '/' + clickday)) {
                                caleList.push({
                                    click: false,
                                    num: lastMonth - j + 1,
                                    check: false,
                                    date: (yyyy - 1) + '/12/' + (lastMonth - j + 1),
                                    bg: false,
                                    show: true,
                                });
                            } else {
                                caleList.push({
                                    click: false,
                                    num: lastMonth - j + 1,
                                    check: false,
                                    date: (yyyy - 1) + '/12/' + (lastMonth - j + 1),
                                    bg: false,
                                    show: false,
                                });
                            }
                        } else {
                            if (this.isSameWeek(yyyy + '/' + (mm - 1) + '/' + (lastMonth - j + 1), yyyy + '/' + mm + '/' + clickday)) {
                                caleList.push({
                                    click: false,
                                    num: lastMonth - j + 1,
                                    check: false,
                                    date: yyyy + '/' + (mm - 1) + '/' + (lastMonth - j + 1),
                                    bg: false,
                                    show: true,
                                });
                            } else {
                                caleList.push({
                                    click: false,
                                    num: lastMonth - j + 1,
                                    check: false,
                                    date: yyyy + '/' + (mm - 1) + '/' + (lastMonth - j + 1),
                                    bg: false,
                                    show: false,
                                });
                            }
                        }
                    }
                }
            }

            if (clickday == i + 1) {
                caleList.push({
                    click: true,
                    num: i + 1,
                    check: true,
                    date: yyyy + '/' + mm + '/' + (i + 1),
                    bg: false,
                    show: true,
                });
            } else if (this.isSameWeek(yyyy + '/' + mm + '/' + (i + 1), yyyy + '/' + mm + '/' + clickday)) {
                caleList.push({
                    click: true,
                    num: i + 1,
                    check: false,
                    date: yyyy + '/' + mm + '/' + (i + 1),
                    bg: false,
                    show: true,
                });
            } else {
                caleList.push({
                    click: true,
                    num: i + 1,
                    check: false,
                    date: yyyy + '/' + mm + '/' + (i + 1),
                    bg: false,
                    show: false,
                });
            }
        }
        //表格不等高，只补充末行不足单元格
        if (7 - (daysCount + week) % 7 < 7) {
            let repair = 7 - (daysCount + week) % 7;
            for (var k = 0; k < repair; k++) {
                if (mm == 12) {
                    caleList.push({
                        click: false,
                        num: k + 1,
                        check: false,
                        date: (yyyy + 1) + '/1/' + (k + 1),
                        bg: false,
                        show: false,
                    });
                } else {
                    caleList.push({
                        click: false,
                        num: k + 1,
                        check: false,
                        date: yyyy + '/' + (mm + 1) + '/' + (k + 1),
                        bg: false,
                        show: false,
                    });
                }
            }
        }
        // else if(daysCount + week == 35){
        //   let repair = 7;
        //   for (var k = 0; k < repair; k++) {
        //     if(mm == 12){
        //       caleList.push({
        //         click: false,
        //         num: k + 1,
        //         check:false,
        //         date:(yyyy+1)+'/1/'+(k + 1),
        //         bg:false,
        //         start:false,
        //         end:false,
        //       });
        //     }
        //     else{
        //       caleList.push({
        //         click: false,
        //         num: k + 1,
        //         check:false,
        //         date:yyyy+'/'+(mm+1)+'/'+(k + 1),
        //         bg:false,
        //         start:false,
        //         end:false,
        //       });
        //     }
        //   }
        // }
        // alert(this.searchData[2])
        let monthCale = this.getUseDay(yyyy, mm, caleList);

        // console.log(monthCale)
        return {
            caleList: monthCale,
            lastweek: week
        }
    },
    isSameWeek(timeStampA, timeStampB) {
        let A = new Date(timeStampA).setHours(0, 0, 0, 0);
        let B = new Date(timeStampB).setHours(0, 0, 0, 0);
        var oneDayTime = 1000 * 60 * 60 * 24;
        var old_count = parseInt(A / oneDayTime);
        var now_other = parseInt(B / oneDayTime);
        return parseInt((old_count + 4) / 7) == parseInt((now_other + 4) / 7);
    }

})