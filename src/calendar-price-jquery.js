/**
 * Created by Capricorncd on 2017/6/11.
 */
'use strict';

(function ($) {

    // 系统当前时间对象
    var TODAY = new Date();
    
    var today = formatDate(TODAY, 'yyyy-MM-dd');

    // 一天毫秒数
    var ONE_DAY_MSEC = 86400000;

    var tomorrow = formatDate(new Date(Date.parse(TODAY) + ONE_DAY_MSEC), 'yyyy-MM-dd');

    /**
     * 日历价格设置jQ插件
     * @param options
     * @constructor
     */
    function CalendarPrice(opts) {

        // 日历显示容器
        if (!opts.el) {
            opts.error && opts.error({
                code: 1,
                msg: '请配置日历显示的容器!'
            })
        }

        this.opts = $.extend({}, CalendarPrice.DEFAULTS, opts);

        // 开始日期对象
        this.startDate = this._getStartDate();
        // 结束日期对象
        this.endDate = this._getEndDate();
        // 日期价格数据
        this.data = this._getOptionsData();

        // 当前显示月份
        this.month = this._formatThisMonth(this.opts.month);

        // 初始化
        this.Initialization();

        // 单日详情设置窗口
        this.setupDayDetailWindow();

    };

    var fn = CalendarPrice.prototype;

    // 默认配置项
    CalendarPrice.DEFAULTS = {
    	data: [],
        // 日历显示月份，不能小于系统当前月份
        month: formatDate(TODAY, 'yyyy/MM'),
        // 开始日期，未设置则默认为当前系统时间
        startDate: formatDate(TODAY, 'yyyy/MM/dd'),
        // 日历结束月份，
        endDate: null,
        // 取消执行函数
        cancel: null,
        // 所有范围月份内的设置数据回调
        callback: null,
        // 异常/错误回调
        error: null,
        style: {
            bgColor: '#fff'
        }
    };

    /**
     * 格式化月份
     * @param month
     * @returns {string}
     * @private
     */
    fn._formatThisMonth = function (month) {

        var thisMonthObj = null;

        if (/^(\d{4})[-\.\/](\d{1,2})/.test(month)) {
            thisMonthObj = this.dateToObject(RegExp.$1 + '/' + RegExp.$2);
        } else {
            thisMonthObj = this.dateToObject(formatDate(TODAY, 'yyyy/MM'));
        }

        // 是否在开始日期/结束日期内
        if (thisMonthObj <= this.endDate && thisMonthObj >= this.startDate) {
            return thisMonthObj;
        } else {
            return this.dateToObject(formatDate(this.startDate, 'yyyy/MM'));
        }
    };

    /**
     * 初始化日历
     * @constructor
     */
    fn.Initialization = function () {
        // 创建this.month日历
        this.createCalendar();

        var me = this;

        // 上一月
        $(this.opts.el).on('click', '.prev-month', function () {
            me._prevMonth();
        });

        // 下一月
        $(this.opts.el).on('click', '.next-month', function () {
            me._nextMonth();
        });
		
		// 设置价格库存
		this.setupPriceAndStock();
		
		// 重置
		$(this.opts.el).on('click', '.btn-reset', function () {
            me.data = me._getOptionsData();
            console.log('reset completed!');
        });
		
		// 确定
		$(this.opts.el).on('click', '.btn-submit', function () {
            me.opts.callback && me.opts.callback(me.data);
        });
		
		// 取消
		$(this.opts.el).on('click', '.btn-cancel', function () {
            me.opts.cancel && me.opts.cancel();
        });
    };

    /**
     * Prev Month
     * @private
     */
    fn._prevMonth = function () {
        var y = toNumber(formatDate(this.month, 'yyyy'));
        var m = toNumber(formatDate(this.month, 'MM'));
        if (m === 1) {
            this.month = this.dateToObject((y - 1) + '/12');
        } else {
            this.month = this.dateToObject(y + '/' + (m - 1));
        }
        this.createCalendar();
    };

    /**
     * Next Month
     * @private
     */
    fn._nextMonth = function () {
        var y = toNumber(formatDate(this.month, 'yyyy'));
        var m = toNumber(formatDate(this.month, 'MM'));
        if (m === 12) {
            this.month = this.dateToObject((y + 1) + '/01');
        } else {
            this.month = this.dateToObject(y + '/' + (m + 1));
        }
        this.createCalendar();
    };

    /**
     * 获取开始日期
     * @return 开始日期 >= 今天
     * @private
     */
    fn._getStartDate = function () {
        var startDate = this.dateToObject(this.opts.startDate);
        if (startDate && startDate >= TODAY) {
            return startDate;
        } else {
            return TODAY;
        }
    };

    /**
     * 获取结束日期
     * @private
     */
    fn._getEndDate = function () {
        var endDate = this.opts.endDate;
        var y = null, m = null, d = null;
        // 结束日期为0000-00，则转为0000-00-月末日期
        if (/^(\d{4})[-\.\/](\d{1,2})/.test(endDate)) {
            y = RegExp.$1;
            m = toNumber(RegExp.$2);
        }

        // 取结束日期为1年后的今天
        if (!y || !m) {
            y = toNumber(formatDate(TODAY, 'yyyy')) + 1;
            m = toNumber(formatDate(TODAY, 'MM'));
        }

        if (/^\d{4}[-\.\/]\d{1,2}[-\.\/](\d{1,2})/.test(endDate)) {
            d = RegExp.$1;
        }
        // 取当月最后一天
        else {
            d = new Date(Date.parse(new Date(y, m)) - ONE_DAY_MSEC).getDate();
        };

        return this.dateToObject(y + '/' + m + '/' + d);
    };

    /**
     * 将日期字符串转换为Date()对象
     * @param date
     */
    fn.dateToObject = function (date) {
        var newDate = '';
        // 年月
        var reg = /(\d{4})[-\/\.](\d{1,2})[-\/\.]?/;
        if(reg.test(date)) {
            newDate += RegExp.$1 + '/' + RegExp.$2;
        };

        // 是否有day日
        if (/[-\/\.]\d{1,2}[-\/\.](\d{1,2})/.test(date)) {
            newDate += '/' + RegExp.$1;
        } else {
        	newDate += '/' + '01';
        }
        
        if (/\d{4}\/\d{1,2}\/\d{1,2}/.test(newDate)) {
            // newDate 为字符串
            return new Date(newDate);
        } else {
        	this.opts.error && this.opts.error({
                code: 1,
                msg: date + ': 日期格式不合法!'
            })
            return false;
        }

    };

    /**
     * 创建日历
     */
    fn.createCalendar = function () {

        var showPrevBtn = true;
        var showNextBtn = true;

        var thisMonthYM = formatDate(this.month, 'yyyyMM');

        // // 当前系统月份
        // var systemMonth = formatDate(TODAY, 'yyyyMM');
        // 开始日期
        var setStartMonth = formatDate(this.startDate, 'yyyyMM');
        // 系统月份大于等于当前月份时候，不显示上一月按钮
        if (setStartMonth >= thisMonthYM) {
            showPrevBtn = false;
        }

        // 结束月份
        var setEndMonth = formatDate(this.endDate, 'yyyyMM');
        // 当前月大于等于endDate结束日期，则不显示下一月按钮
        if (setEndMonth <= thisMonthYM) {
            showNextBtn = false;
        }

        var html = '';

        // 创建html DOM结构
        html += '<div class="capricorncd-calendar-container">';
        html += '	<div class="calendar-head-wrapper">';

        // 上一月按钮
        if (showPrevBtn)
        html += '       <a class="prev-month" title="上一月"></a>';
        // 标题
        html += '		<div class="calendar-month-title">'+ formatDate(this.month, 'yyyy年MM月') +'</div>';
        // 下一月按钮
        if (showNextBtn)
        html += '       <a class="next-month" title="下一月"></a>';

        html += '	</div>';
        html += '	<div class="calendar-table-wrapper">';
        html += '  	    <table cellpadding="4" cellspacing="0">';
        html += '		    <thead><tr class="week"><th class="weekend">日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th class="weekend">六</th></tr></thead>';
        html += '		    <tbody>'+ this._createTbody() +'</tbody>';
        html += '	    </table>';
        html += '    </div>';
        html += '    <div class="calendar-foot-wrapper">';
        html += '        <button class="btn btn-reset">重置</button>';
        html += '        <button class="btn btn-submit">确定</button>';
        html += '        <button class="btn btn-cancel">取消</button>';
        html += '    </div>';
        html += '</div>';

        $(this.opts.el).html(html);

        // 渲染数据到表格
        this.renderDataToTalbe();
    };

    /**
     * 创建日历表格(日期部分)
     * @returns {string}
     * @private
     */
    fn._createTbody = function () {

        // 当月天数
        var thisMonthDays = this._getMonthDays();
        //这个月的第一天是星期几
        var firstDayIsWeek = this.month.getDay();

        // 日历中显示日期
        var d = 0;

        // tr 行数
        var rows = Math.ceil((thisMonthDays + firstDayIsWeek)/7);

        // td id
        var tdId = '';

        var html = '';

        // 创建日期表格
        for(var i = 0; i < rows; i++){

            html += '<tr>';

            for(var k = 1; k <= 7; k++){

                d = i*7 + k - firstDayIsWeek;

                if(d > 0 && d <= thisMonthDays){
                    tdId = formatDate(this.month, 'yyyy-MM-') + formatNumber(d);
                    
                    if (today == tdId) {
                    	d = '今天';
                    }
                    
                    if (tomorrow == tdId) {
                    	d = '明天';
                    }
                    
                    // 今天及之后的日期，显示价格、库存
                    if(tdId >= formatDate(this.startDate, 'yyyy-MM-dd')){
                        html += '<td class="valid-hook" data-week="' + (k - 1) + '" data-id="' + tdId + '"><b>' + d + '</b><div class="data-hook"></div></td>';
                    } else {
                        html += '<td class="disabled"><b>' + d + '</b></td>';
                    }
                } else {
                    html += '<td>&nbsp;</td>';
                }

            } // for k End

            html += '</tr>';
        } // for j End

        return html;
    };


    /**
     * 渲染数据到表格
     */
    fn.renderDataToTalbe = function () {
    	var me = this;

		var $thisMonthDate = $(this.opts.el).find('.valid-hook');
		
		var dayData = null;
		// 日期内显示的数据
		
		$thisMonthDate.each(function () {
			dayData = me._getDateData($(this).data('id'));

            var html = me.dayComplate().toString();

			if (dayData) {

			    for (var key in dayData) {
                    html = html.replace('{'+ key +'}', dayData[key]);
                }
				
				$(this).data('data', JSON.stringify(dayData)).find('.data-hook').html(html);
			} else {
				$(this).data('data', '{}');
			}
		});
    };
    
    /**
     * 获取day设置数据
     * @param {String} day_id 日期0000-00-00
     */
    fn._getDateData = function (day_id) {
    	var arr = this.data;
    	for (var i = 0; i < arr.length; i++) {
    		if (day_id == arr[i].date) {
    			return arr[i];
    			break;
    		}
    	}
    	return null;
    };

    /**
     * 获取当前月份最大天数
     * @returns {number} 当月天数
     * @private
     */
    fn._getMonthDays = function () {
        var month = this.month;
        // 第几月
        var y = formatDate(month, 'yyyy');
        var m = formatDate(month, 'MM');
        if (m == 12) {
            return 31;
        } else {
            // month的下个月第一天，减去一天则为该月的最后一天
            return (new Date(Date.parse(new Date(y, m, 1)) - ONE_DAY_MSEC)).getDate();
        }
    };

    /**
     * 日详细设置
     */
    fn.setupDayDetailWindow = function () {
        var html = '';

        // capricorncd-date-detailed-settings-window: cddsw

        html += '<div class="cddsw-container">';
        html += '   <div class="cddsw-head-wrapper">';
        html += '       <div class="cddsw-title">0000-00-00</div>';
        html += '       <a class="cddsw-close"><i></i></a>';
        html += '   </div>';
        html += '   <ul class="cddsw-form-wrapper clearfix">';
        html +=         this._createDaySetupInputGroup();
        html += '   </ul>';
        html += '   <fieldset class="cddsw-batch-settings clearfix">';
        html += '       <legend class="bs-title"><b>批量设置</b></legend>';
        html += '       <div class="bs-content">';
        html += '           <lable class="bs-lable">日期范围</lable>';
        html += '           <div class="bs-options-wrapper">';
        html += '               <input class="itext" name="startDay" type="text">';
        html += '               <span class="white-space">-</span>';
        html += '               <input class="itext" name="endDay" type="text">';
        html += '               <label class="drw-enable"><input name="enableDateRange" type="checkbox"> 启用</label>';
        html += '           </div>';
        html += '       </div>';
        html += '       <div class="bs-content bs-week-chekbox">';
        html += '           <lable class="bs-lable">设置星期</lable>';
        html += '           <div class="bs-options-wrapper">';
        html += '               <label><input name="setWeek" type="checkbox" value="1"> 周一</label>';
        html += '               <label><input name="setWeek" type="checkbox" value="2"> 周二</label>';
        html += '               <label><input name="setWeek" type="checkbox" value="3"> 周三</label>';
        html += '               <label><input name="setWeek" type="checkbox" value="4"> 周四</label>';
        html += '               <label><input name="setWeek" type="checkbox" value="5"> 周五</label>';
        html += '               <label><input name="setWeek" type="checkbox" value="6"> 周六</label>';
        html += '               <label><input name="setWeek" type="checkbox" value="0"> 周日</label>';
        html += '           </div>';
        html += '       </div>';
        html += '   </fieldset>';
        html += '   <div class="cddsw-foot-wrapper">';
        html += '       <button class="btn-submit">启用本设置</button>';
        html += '       <button class="btn-cancel">取消</button>';
        html += '   </div>';
        html += '</div>';

        $('body').append('<div class="capricorncd-date-detailed-settings" style="display: none">' + html + '</div>');
        // $('body').append('<div class="capricorncd-date-detailed-settings">' + html + '</div>');
    };

    /**
     * 创建单日设置input组
     * @returns {string}
     * @private
     */
    fn._createDaySetupInputGroup = function () {
        var html = '';
        var config = this.opts.config;
        for (var i = 0; i < config.length; i++) {
            var val = config[i];
            html += '<li>';
            html += '   <label>'+ val.name +'</label>';
            html += '   <input name="'+ val.key +'" type="text">';
            html += '</li>';
        }
        return html;
    };

    /**
     * 创建日期显示模板
     * @returns {string}
     * @private
     */
    fn.dayComplate = function () {
        var arr = this.opts.show;
        var html = '';
        if (arr && arr instanceof Array) {
            for (var i = 0; i < arr.length; i++) {
                var val = arr[i];
                html += '<p>'+ val.name +'{'+ val.key +'}</p>'
            }
        }
        return html;
    };

    /**
     * 设置日期价格库存
     */
    fn.setupPriceAndStock = function () {

        var me = this;

        // 获取点击日期数据
        // 渲染设置框内容
        // 显示设置窗口
        $(this.opts.el).on('click', '.valid-hook', function () {

            var $setContainer = $('.capricorncd-date-detailed-settings');
            // 初始化input[value]
            $setContainer.find('.cddsw-form-wrapper [type="text"]').val('');
            $setContainer.find('[name="enableDateRange"]').prop('checked', false);
            $setContainer.find('[name="setWeek"]').prop('checked', false);

            // 当天日期
            var thisDate = $(this).data('id');
            // 当前日的数据
            var data = $(this).data('data');

            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }

            // 用户传入字段
            $.each(data, function (key, val) {
                $setContainer.find('[name="'+ key +'"]').val(val);
            });

            // 栏目标题
            $setContainer.find('.cddsw-title').html(thisDate);
            $setContainer.find('[name="startDay"], [name="endDay"]').val(thisDate);

            $setContainer.show();
        });

        // 关闭设置框
        $('body').on('click', '.capricorncd-date-detailed-settings .cddsw-close, .capricorncd-date-detailed-settings .btn-cancel', function () {
            $(this).closest('.capricorncd-date-detailed-settings').hide();
        });

        // 保存设置
        $('body').on('click', '.capricorncd-date-detailed-settings .btn-submit', function () {
            var $dateSetWrapper = $(this).closest('.cddsw-container');

            // 当前显示的设置日期
            var thisDate = $dateSetWrapper.find('.cddsw-title').text();

            // 设置参数
            var setData = {};
            $dateSetWrapper.find('.cddsw-form-wrapper [name]').each(function () {
                var key = $(this).attr('name');
                var val = $(this).val();
                setData[key] = val;
                // console.log(key + ' => ' + val);
            });

            setData.date = thisDate;

            console.log(setData);

            // 批量设置$对象
            var $batch = $('.cddsw-batch-settings');
            // 日期范围
            var startDay = $batch.find('[name="startDay"]').val();
            var endDay = $batch.find('[name="endDay"]').val();
            // 是否启用日期范围
            var IS_ENABLE = $batch.find('[name="enableDateRange"]').prop('checked');

            // 周设置
            var $week = $batch.find('[name="setWeek"]:checked');
            var week = [];
            $week.each(function () {
                week.push($(this).val());
            });

            // 设置的日期范围数组
            var setDateRangeArr = [];

            // 有设置日期范围
            if (IS_ENABLE) {
                var HSDRD = me.handleSetDateRangeData(startDay, endDay);
                if (!HSDRD) {
                    return;
                }
                setDateRangeArr = HSDRD;
                // 周n未设置，直接处理日期范围数据
                if (week.length === 0) {
                    // 处理数据，并退出
                    me.handleThisData(setData, setDateRangeArr);
                    return;
                }
            } else {
                // 周n未设置，直接处理当天数据
                if (week.length === 0) {
                    // 处理数据，并退出
                    me.handleThisData(setData);
                    return;
                } else {
                    // 获取范围数据，初始化的开始-结束日期
                    setDateRangeArr = me.handleSetDateRangeData(
                        formatDate(me.startDate, 'yyyy-MM-dd'),
                        formatDate(me.endDate, 'yyyy-MM-dd')
                    );
                }
            }; // end if IS_ENABLE

            // 处理与周n设置的交集
            me.handleSetWeekData(week, setDateRangeArr, function (res) {
                if (res.data.length > 0) {
                    me.handleThisData(setData, res.data);
                } else {
                    me.opts.error && me.opts.error({
                        code: 1,
                        msg: '设置的日期范围或初始化的日期范围，与设置的周' + week.join(',') + '没有交集'
                    });
                }
            });


        });
    };

    // 设置的日期范围数据处理
    fn.handleSetDateRangeData = function (startDay, endDay) {

        var me = this;

        var arr = [];

        var sd = IS_VALID(startDay);
        var ed = IS_VALID(endDay);

        if (!sd) {
            this.opts.error && this.opts.error({
                code: 1,
                msg: '开始日期格式错误'
            });
            return false;
        } else if (sd < today) {
            this.opts.error && this.opts.error({
                code: 1,
                msg: '开始日期不能小于今天'
            });
            return false;
        }

        if (!ed) {
            this.opts.error && this.opts.error({
                code: 1,
                msg: '结束日期格式错误'
            });
            return false;
        } else if (ed < sd) {
            this.opts.error && this.opts.error({
                code: 1,
                msg: '结束日期不能小于开始日期'
            });
            return false;
        }

        // 开始结束日期均合法
        if (sd == ed) {
            arr.push(formatDate(this.dateToObject(sd), 'yyyy-MM-dd'));
        } else {
            arr = createDateRangeArr(sd, ed);
        }

        // 计算出开始日期至结束日期间的date[0000-00-00]
        function createDateRangeArr (sd, ed) {
            var dates = [];

            var sdMsec = Date.parse(me.dateToObject(sd));
            var edMsec = Date.parse(me.dateToObject(ed));
            var days = Math.floor((edMsec - sdMsec)/ONE_DAY_MSEC) + 1;

            for (var i = 0; i < days; i++) {
                var date = new Date(sdMsec + ONE_DAY_MSEC*i);
                dates.push(formatDate(date, 'yyyy-MM-dd'));
            }
            return dates;
        }

        // 判断日期是否合法
        function IS_VALID (date) {
            if (/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/.test(date)) {
                return RegExp.$1 + '/' + formatNumber(RegExp.$2) + '/' + formatNumber(RegExp.$3);
            }
            return false;
        };

        return arr;
    };

    //周设置数据处理
    /**
     * 设置了周n的数据处理
     * @param week 设置的周n数组
     * @param setDateRangeArr 设置的日期范围或初始的日期范围
     * @param callback 日期范围与周n的交集
     */
    fn.handleSetWeekData = function (week, setDateRangeArr, callback) {

        var me = this;

        var weekString = week.join(',');

        var arr = [];

        $.each(setDateRangeArr, function (key, val) {
            var weekNum = me.dateToObject(val).getDay();
            if (weekString.indexOf(weekNum) > -1) {
                arr.push(val);
            }
        });

        callback && callback({
            code: 0,
            msg: 'completed',
            data: arr
        });
    };

    /**
     * 处理设置的数据，并更新this.data
     * @param obj 设置的数据
     * @param dateArr
     */
    fn.handleThisData = function (setData, dateArr) {

        var arr = dateArr || [];
        var len = arr.length;

        console.log(arr);

        if (len === 0 ) {
            this._updateThisData(setData);
        } else {
            for (var i = 0; i < len; i++) {
                // 更新this.data
                this._updateThisData(setData, arr[i]);
            }
        };

        // 处理新生成的数据
        this.data = this.sort(this.rmRepeat(this.data, 'date'));

        // 渲染数据到表格
        this.renderDataToTalbe();

        // 隐藏设置窗口
        $('.capricorncd-date-detailed-settings').hide();

    };

    // 更新或现在this.data数据
    fn._updateThisData = function (setData, dateString) {
        var me = this;

        // this.data中是否含有dateString的数据
        var is_existence = false;

        var data = {};

        if (dateString) {
            data.date = dateString;
        } else {
            data.date = setData.date;
        }

        // 获取设置的参数及其值
        $.each(setData, function (key, val) {
            if (key != 'date') {
                data[key] = val;
            }
        });

        $.each(this.data, function (key, val) {
            if (data.date === val.date) {
                is_existence = true;
                me.data[key] = data;
                return false;
            }
        });

        if (!is_existence) {
            this.data.push(data);
        }

    };

    /**
     * 获取初始this.data配置
     * 获取初始数据中大于开始日期的数据
     * 去重复、排序
     * @returns {Array}
     * @private
     */
    fn._getOptionsData = function () {
        // 获取开始日期
        var startDay = formatDate(this.startDate, 'yyyy-MM-dd');
        // 新空数组，用于存放筛选出来的数据
        var arr = [];
        // 初始配置的日期价格相关数据数组
        var dataArr = this.opts.data;

        if (dataArr && dataArr instanceof Array) {
            for (var i = 0; i < dataArr.length; i++) {
                if (dataArr[i].date >= startDay) {
                    arr.push(dataArr[i]);
                }
            }
        }
        // 去重复、排序操作
        return this.sort(this.rmRepeat(arr, 'date'));
    };

    /**
     * 日期格式化
     * @param date 日期对象 new Date()
     * @param fmt format 输出日期格式 yyyy-MM-dd hh:mm:ss
     */
    function formatDate (date, fmt) {
        if (/(y+)/i.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }

        var obj = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }

        for (var key in obj) {
            if (new RegExp('('+ key +')').test(fmt)) {
                var str = obj[key] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : formatNumber(str));
            }
        }

        return fmt;

    };

    /**
     * 数字格式化
     * @param n number
     */
    function formatNumber (n) {
        n = n.toString();
        return n[1] ? n : '0' + n;
    };

    /**
     * 转整数
     * @param n
     * @returns {*}
     */
    function toNumber (n) {
        n = parseInt(n);
        return isNaN(n) ? 0 : n;
    };

    /**
     * asc 按升序排列 desc 按降序排列
     * @param arr 需要排序的数组
     * @param field
     * @param sequence
     * @return {*}
     */
    fn.sort = function (arr) {

        if (!(arr instanceof Array)) {
            this.opts.error && this.opts.error({
                code: 1,
                msg: 'this.sort 传入的arr为非数组'
            });
            return arr;
        }

        if (arr.length < 1) {
            return arr;
        }

        var minIndex = 0;
        var fontObj = null;

        for (var i = 0; i < arr.length; i++) {
            minIndex = i;
            for (var j = i + 1; j < arr.length; j++) {
                if (arr[j].date < arr[minIndex].date) {
                    minIndex = j;
                    fontObj = arr[i];
                    arr.splice(i, 1, arr[j]);
                    arr.splice(j, 1, fontObj);
                }
            }
        }

        return arr;

    };

    /**
     * 数组去掉重复元素
     * @param {Array} arr
     * @param {String} key
     */
    fn.rmRepeat = function(arr, key) {
        var hash = {};
        var newArr = [];

        for(var i = 0; i < arr.length; i++) {
            var val = arr[i];
            // 数组元素为对象
            if(key) {
                try {
                    val = arr[i][key];
                } catch(e) {}
            }

            if(hash[val]) {
                continue;
            }
            newArr.push(arr[i]);
            hash[val] = true;
        }

        return newArr;
    };



    $.extend({
        CalendarPrice: function (opts) {
            new CalendarPrice(opts);
        }
    });

})(jQuery);