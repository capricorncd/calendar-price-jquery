/*!
 * Created by capricorncd on 2017/6/11.
 * https://github.com/capricorncd/calendar-price-jquery
 */
'use strict';

(function ($) {

  /**
   * 数字格式化
   * @param n number
   */
  var formatNumber = function (n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
  };

  /**
   * 转整数
   * @param n
   * @returns {*}
   */
  var toNumber = function (n) {
    n = parseInt(n);
    return isNaN(n) ? 0 : n;
  };

  // 判断日期是否合法
  var isValid = function (date) {
    if (/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/.test(date)) {
      return RegExp.$1 + '-' + formatNumber(RegExp.$2) + '-' + formatNumber(RegExp.$3);
    }
    return false;
  };

  /**
   * 日期格式化
   * @param date 日期对象 new Date()
   * @param fmt format 输出日期格式 yyyy-MM-dd hh:mm:ss
   */
  var formatDate = function (date, fmt) {
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

  // 小于或等于ie9
  // [计]LE; less-than-or-equal-to
  function isLeIE9 () {
    var nu = navigator.userAgent;
    var version = null;
    if (/MSIE (\d+)\./i.test(nu)) {
      version = RegExp.$1;
    }
    return version && +version <= 9;
  }

  // 自定义事件监听及通知
  var BC = (function() {
    var attachFunctionList = {};
    //事件通知
    var notify = function (notifyName) {
      var args = Array.prototype.slice.call(arguments, 1);
      attachFunctionList[notifyName].fun.apply(attachFunctionList[notifyName].scope, args);
      return this;
    }
    //事件监听
    var attach = function (notifyName, callback) {
      if(typeof notifyName === 'string' && typeof callback === 'function') {
        attachFunctionList[notifyName] = {
          fun:callback
        }
      }
      return this;
    }
    return {
      ev: attachFunctionList,
      $on: attach,
      $emit: notify
    }
  })();

  // 创建settingWindow dom
  function createSettingWindow () {
    var div = document.createElement('div');
    div.className = 'capricorncd-date-detailed-settings' + (isLeIE9() ? ' ie' : '');
    div.style.display = 'none';
    return $(div);
  }

  /**
   * 垂直居中设置窗口
   */
  function verticalCenter ($el) {
    if (isLeIE9()) {
      var h = $el.height();
      var wh = $(window).height();
      // console.log(h, wh)
      $el.css('top', (wh - h) / 2 + 'px');
    }
  }

  var CODES = {
    1: '参数错误(el: "selector"): 未配置日历显示的容器选择器!',
    2: '{{text}}: 日期格式不合法!',
    3: '设置的日期范围或初始化的日期范围，与设置的周{{text}}没有交集',
    4: '开始日期格式错误',
    5: '开始日期不能小于今天',
    6: '结束日期格式错误',
    7: '结束日期不能小于开始日期',
    8: 'sort(arg)方法的参数arg为非数组',
    9: 'update(data) 参数data必须为数组'
  }

  // 系统当前时间对象
  var TODAY = new Date();

  var today = formatDate(TODAY, 'yyyy-MM-dd');

  // 一天毫秒数
  var ONE_DAY_MSEC = 86400000;

  var tomorrow = formatDate(new Date(Date.parse(TODAY) + ONE_DAY_MSEC), 'yyyy-MM-dd');

  // 当月及每日数据
  var currentMonthData = {
    year: null,
    month: null,
    data: []
  };

  // 默认配置项
  var DEFAULTS = {
    data: [],
    // 日历显示月份，不能小于系统当前月份
    month: formatDate(TODAY, 'yyyy/MM'),
    // 开始日期，未设置则默认为当前系统时间
    startDate: formatDate(TODAY, 'yyyy/MM/dd'),
    // 日历结束月份，
    endDate: null,
    // 取消执行函数
    cancel: function () {},
    // 所有范围月份内的设置数据回调
    callback: function () {},
    // 重置所有设置
    reset: function () {
      // console.log('reset completed!');
    },
    // 月份切换
    monthChange: function () {},
    // 异常/错误回调
    error: function () {},
    hideFooterButton: false,
    style: {
      bgColor: '#fff'
    },
    // 禁用设置
    disableSetup: false
  };

  // 当前点击的日期0000-00-00
  var currentDay = null;

  function _err (num, msg) {
    return {
      code: num,
      msg: msg || CODES[num]
    }
  }

  /**
   * 日历价格设置jQ插件
   * @param opts
   * @constructor
   */
  function CalendarPrice (opts) {
    this.opts = $.extend({}, DEFAULTS, opts);
    this.ev = BC.ev;
    this.$on = BC.$on;
    this.$emit = BC.$emit;
    // 初始化
    this.init();
  }

  // prototype
  var fn = CalendarPrice.prototype;

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
   */
  fn.init = function () {
    // 日历显示容器
    if (!this.opts.el) {
      throw new Error(CODES[1]);
    }
    // 日历容器
    this.calendar = $(this.opts.el);
    // 日历单日设置窗口
    this.settingWindow = createSettingWindow();

    // 创建用户自定义样式
    this.createStyleCode();

    // 开始日期对象
    this.startDate = this._getStartDate();
    // 结束日期对象
    this.endDate = this._getEndDate();
    // 日期价格数据
    this.data = this._getOptionsData();

    // 当前显示月份
    this.month = this._formatThisMonth(this.opts.month);

    // 单日详情设置窗口
    this.initSettingWindow();

    // 创建this.month日历
    this.createCalendar();

    // 按钮点击处理
    this.handleClickEvent();

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
    }

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
    if (reg.test(date)) {
      newDate += RegExp.$1 + '/' + RegExp.$2;
    }

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
      var msg = CODES[2].replace('{{text}}', date);
      if (this.ev['error']) this.$emit('error', _err(2, msg));
      this.opts.error(_err(2, msg));
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

    // 是否显示按钮组
    if (!this.opts.hideFooterButton) {
      html += '    <div class="calendar-foot-wrapper">';
      html += '        <button class="btn bg-success btn-reset">重置</button>';
      // html += '        <button class="btn bg-success btn-batch">批量操作</button>';
      html += '        <button class="btn bg-primary btn-confirm">确定</button>';
      html += '        <button class="btn bg-white btn-cancel">取消</button>';
      html += '    </div>';
    }
    html += '</div>';

    this.calendar.html(html);

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
    // 设置的开始dete和结束date
    var startDay = formatDate(this.startDate, 'yyyy-MM-dd');
    var endDay = formatDate(this.endDate, 'yyyy-MM-dd');

    currentMonthData.lastDay = thisMonthDays;
    currentMonthData.year = this.month.getFullYear();
    currentMonthData.month = this.month.getMonth() + 1
    currentMonthData.data = []
    var dayOptions = {}

    // 创建日期表格
    for (var i = 0; i < rows; i++){

      html += '<tr>';

      for (var k = 1; k <= 7; k++){

        d = i * 7 + k - firstDayIsWeek;

        if (d > 0 && d <= thisMonthDays){
          // 存储当月数据
          dayOptions = {
            week: k - 1,
            day: d,
            disabled: false
          }
          tdId = formatDate(this.month, 'yyyy-MM-') + formatNumber(d);

          if (today === tdId) d = '今天';
          if (tomorrow === tdId) d = '明天';

          // 今天（开始日期）与设置的结束日期之间的日期
          // 为可操作，且显示价格、库存
          if (tdId >= startDay && tdId <= endDay) {
            html += '<td class="valid-hook" data-week="' + (k - 1) + '" data-id="' + tdId + '"><b>' + d + '</b><div class="data-hook"></div></td>';
          } else {
            html += '<td class="disabled"><b>' + d + '</b></td>';
            dayOptions.disabled = true
          }
          currentMonthData.data.push(dayOptions)
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
    var dayData = null;
    var html = '';
    // 可操作的日期td
    this.calendar.find('.valid-hook').each(function () {
      dayData = me._getDateData($(this).data('id'));
      html = me.dayTemplate().toString();
      if (dayData) {
        // console.log(dayData)
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
   * @param {String} dayId 日期0000-00-00
   */
  fn._getDateData = function (dayId) {
    var val
    for (var i = 0; i < this.data.length; i++) {
      val = this.data[i]
      if (dayId === val.date) {
        return val
      }
    }
    return null;
  }

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
    if (+m === 12) {
      return 31;
    } else {
      // month的下个月第一天，减去一天则为该月的最后一天
      return (new Date(Date.parse(new Date(y, m, 1)) - ONE_DAY_MSEC)).getDate();
    }
  }

  /**
   * 日详细设置
   */
  fn.initSettingWindow = function () {

    var html = '';
    // capricorncd-date-detailed-settings-window: cddsw
    html += '<div class="cddsw-container">';
    html += '   <div class="cddsw-head-wrapper">';
    html += '       <div class="cddsw-title">设置</div>';
    html += '       <a class="cddsw-close"><i></i></a>';
    html += '   </div>';
    html += '   <ul class="cddsw-form-wrapper clearfix">';
    html +=         this._createDaySetupInputGroup();
    html += '   </ul>';
    html += '   <fieldset class="cddsw-batch-settings clearfix">';
    html += '       <legend class="bs-title"><b>批量设置</b></legend>';
    html += '       <div class="bs-content">';
    html += '           <div class="bs-lable">日期范围</div>';
    html += '           <div class="bs-options-wrapper">';
    html += '               <input class="itext" name="startDay" type="date">';
    html += '               <span class="white-space">-</span>';
    html += '               <input class="itext" name="endDay" type="date">';
    // html += '               <label class="drw-enable"><input name="enableDateRange" type="checkbox"> 启用</label>';
    html += '           </div>';
    html += '       </div>';
    html += '       <div class="bs-content bs-week-chekbox">';
    html += '           <div class="bs-lable">设置星期</div>';
    html += '           <div class="bs-options-wrapper">';
    html += '               <i class="_checkbox" data-value="1">周一</i>';
    html += '               <i class="_checkbox" data-value="2">周二</i>';
    html += '               <i class="_checkbox" data-value="3">周三</i>';
    html += '               <i class="_checkbox" data-value="4">周四</i>';
    html += '               <i class="_checkbox" data-value="5">周五</i>';
    html += '               <i class="_checkbox" data-value="6">周六</i>';
    html += '               <i class="_checkbox" data-value="0">周日</i>';
    html += '           </div>';
    html += '       </div>';
    // 当前月份设置
    html += '       <div class="bs-content bs-days-select">';
    html += '           <div class="bs-lable">指定日期</div>';
    html += '           <div class="bs-options-wrapper">'+ _createDays() +'</div>';
    html += '       </div>';

    html += '   </fieldset>';
    html += '   <div class="cddsw-foot-wrapper">';
    html += '       <button class="btn-confirm">确定</button>';
    html += '       <button class="btn-cancel">关闭</button>';
    html += '   </div>';
    html += '</div>';

    this.settingWindow.html(html);

    $('body').append(this.settingWindow);
    // $('body').append('<div class="capricorncd-date-detailed-settings">' + html + '</div>');
  }

  // 创建days
  function _createDays () {
    var dayOptions = '';
    for (var i = 1; i <= 31; i++) {
      dayOptions += '<i class="_checkbox">' + formatNumber(i) + '</i>';
    }
    return dayOptions;
  }

  /**
   * 创建单日设置input组
   * @returns {string}
   * @private
   */
  fn._createDaySetupInputGroup = function () {
    var html = '';
    var config = this.opts.config;
    var disabled
    for (var i = 0; i < config.length; i++) {
      var val = config[i];
      console.log(val)
      // 判断是否需要编辑
      if (val.editable === false) continue;
      disabled = val.disabled ? 'disabled' : ''
      html += '<li>';
      html += '   <label>'+ val.name +'</label>';
      html += '   <input name="'+ val.key +'" placeholder="' + val.placeholder + '" type="' + (val.type || 'text') + '" ' + disabled + '>';
      html += '</li>';
    }
    return html;
  };

  /**
   * 创建日期显示模板
   * @returns {string}
   * @private
   */
  fn.dayTemplate = function () {
    var arr = this.opts.show;
    var html = '';
    if (arr && arr instanceof Array) {
      for (var i = 0; i < arr.length; i++) {
        var val = arr[i];
        html += '<p>'+ val.name +'{'+ val.key +'}</p>'
      }
    }
    return html;
  }

  // 日期设置容器
  var $dateSetContainer;

  /**
   * 按钮点击事件处理
   */
  fn.handleClickEvent = function () {
    var me = this;

    $dateSetContainer = this.settingWindow.find('.cddsw-container');

    // 单日选中外容器
    var $daySelectWrapper;
    // 日期范围被启用
    // var dateRangeOn = false;
    // 星期又被选中
    var weekRangeOn = false;

    // ** 日历容器内按钮点击事件 *******************************************

    // 上一月
    this.calendar.on('click', '.prev-month', function () {
      var monthData = me.getMonthData();
      if (me.ev['month-change']) me.$emit('month-change', monthData)
      me.opts.monthChange(monthData)
      me._prevMonth();
      // me.opts.monthChange(formatDate(me.month, 'yyyy-MM'))
    });

    // 下一月
    this.calendar.on('click', '.next-month', function () {
      var monthData = me.getMonthData();
      if (me.ev['month-change']) me.$emit('month-change', monthData);
      me.opts.monthChange(monthData);
      me._nextMonth();
      // me.opts.monthChange(formatDate(me.month, 'yyyy-MM'))
    });

    // 重置
    this.calendar.on('click', '.btn-reset', function () {
      if (me.ev['reset']) me.$emit('reset');
      me.data = me._getOptionsData();
      me.createCalendar();
      me.opts.reset();
    });

    // 确定
    this.calendar.on('click', '.btn-confirm', function () {
      if (me.ev['confirm']) me.$emit('confirm', me.data);
      me.opts.callback(me.data);
    });

    // 取消
    this.calendar.on('click', '.btn-cancel', function () {
      if (me.ev['cancel']) me.$emit('cancel');
      me.opts.cancel();
    });

    // 批量设置
    // this.calendar.on('click', '.btn-batch', function () {
    //
    //   me.settingWindow.show();
    //   verticalCenter(me.settingWindow.find('.cddsw-container'));
    //   initSettingWindow();
    // })

    // 获取点击日期数据
    // 渲染设置框内容
    // 显示设置窗口
    this.calendar.on('click', '.valid-hook', function () {
      // 禁用设置
      if (me.opts.disableSetup) return;
      // 当天日期
      currentDay = $(this).data('id');
      // 当前日的数据
      var data = $(this).data('data');

      try {
        data = JSON.parse(data);
      } catch (e) {
        data = {};
      }

      // 拦截弹出设置窗口，返回当天数据
      if (me.opts.everyday) {
        me.opts.everyday(data);
        return;
      }

      if (me.ev['valid-day']) {
        me.$emit('valid-day', currentDay, data, function () {
          handleClickValidDay(data, currentDay);
        });
      } else {
        handleClickValidDay(data, currentDay);
      }
    });

    // 处理点击有效日期
    function handleClickValidDay (data, currentDay) {
      // 初始化input[value]
      me.settingWindow.find('.cddsw-form-wrapper [type="text"]').val('');
      me.settingWindow.find('[name="enableDateRange"]').prop('checked', false);
      me.settingWindow.find('[name="setWeek"]').prop('checked', false);

      // 用户传入字段
      $.each(data, function (key, val) {
        me.settingWindow.find('[name="'+ key +'"]').val(val);
      });

      // 栏目标题
      // me.settingWindow.find('.cddsw-title').html(thisDate);
      me.settingWindow.find('[name="startDay"], [name="endDay"]').val(currentDay);

      // 当月日历
      $daySelectWrapper = me.settingWindow.find('.bs-days-select .bs-options-wrapper');
      me.settingWindow.show();
      verticalCenter(me.settingWindow.find('.cddsw-container'));
      _resetSettingWindow();
    }

    // 重置设置窗口
    function _resetSettingWindow () {
      weekRangeOn = false;
      $daySelectWrapper.removeClass('disabled-options');
      me.settingWindow.find('.bs-week-chekbox ._active').removeClass('_active');
    }

    // 周选中
    function weekChecked () {
      weekRangeOn = true;
      $daySelectWrapper.addClass('disabled-options');
    }

    // 星期被选中
    this.settingWindow.on('click', '.bs-week-chekbox ._checkbox', function () {
      var $this = $(this);
      if ($this.hasClass('_active')) {
        $this.removeClass('_active');
        var $checked = $this.siblings('._active');
        if ($checked.length) {
          weekChecked();
        } else {
          weekRangeOn = false;
          $daySelectWrapper.removeClass('disabled-options');
        }
      } else {
        $this.addClass('_active');
        weekChecked();
      }
      if (me.ev['setup-value-change']) me.$emit('setup-value-change', {
        $el: $this,
        name: 'weeks',
        value: _getSetWeeks()
      });
    });

    // 单日选择控制
    this.settingWindow.on('click', '.bs-days-select ._checkbox', function () {
      var $this = $(this);
      // 范围或周日被选中时，不做处理
      if (weekRangeOn || $this.hasClass('_disabled')) return;
      if ($this.hasClass('_active')) {
        $this.removeClass('_active')
      } else {
        $this.addClass('_active')
      }
      if (me.ev['setup-value-change']) me.$emit('setup-value-change', {
        $el: $this,
        name: 'days',
        value: _getSetDays()
      });
    })

    // 关闭设置框
    this.settingWindow.on('click', '.cddsw-close, .btn-cancel', function () {
      if (me.ev['setup-close']) me.$emit('setup-close');
      me.settingWindow.hide();
      // $(this).closest('.capricorncd-date-detailed-settings').hide();
    });

    // 保存设置
    this.settingWindow.on('click', '.btn-confirm', function () {
      // $dateSetContainer = $(this).closest('.cddsw-container');

      // 当前显示的设置日期
      // var thisDate = $dateSetContainer.find('.cddsw-title').text();

      // 表单数据
      var formData = {};
      $dateSetContainer.find('.cddsw-form-wrapper [name]').each(function () {
        var key = $(this).attr('name');
        var val = $(this).val();
        formData[key] = val;
        // console.log(key + ' => ' + val);
      })

      // 批量设置$对象
      var $batch = $('.cddsw-batch-settings');
      // 日期范围
      var startDay = $batch.find('[name="startDay"]').val();
      var endDay = $batch.find('[name="endDay"]').val();
      // 是否启用日期范围
      // var IS_ENABLE = $batch.find('[name="enableDateRange"]').is(':checked');

      // 周设置
      var weeks = _getSetWeeks();
      // 已选中的week checkbox

      // 单日多选项
      var daySelcetArr = _getSetDays();

      // 设置数据
      var data = {
        formData: formData,
        startDay: startDay,
        endDay: endDay,
        weeks: weeks,
        days: daySelcetArr
      }

      if (me.ev.hasOwnProperty('submit-form')) {
        me.$emit('submit-form', data, function () {
          _handeSetData(data)
        })
      } else {
        _handeSetData(data)
      }
    })

    // 获取单日选中数据
    function _getSetDays () {
      // 单日多选项
      var arr = [];
      $dateSetContainer.find('.bs-days-select ._active').each(function () {
        arr.push($(this).text())
      })
      return arr;
    }

    // 获取周选中数据
    function _getSetWeeks () {
      var arr = [];
      $dateSetContainer.find('.bs-week-chekbox ._active').each(function () {
        arr.push($(this).data('value'));
      });
      return arr;
    }

    // 处理设置数据
    function _handeSetData (data) {
      // 设置的日期范围数组
      var setDaysArray = [];
      // 日期范围
      var setRangeData = me.handleSetDateRangeData(data.startDay, data.endDay);

      if (setRangeData) {
        setDaysArray = setRangeData;
      }

      // 周n未设置，直接处理当天数据
      if (data.weeks.length > 0) {
        // 处理与周n设置的交集
        var intersectionDate = me.handleSetWeekData(data.weeks, setDaysArray);
        setDaysArray = setDaysArray.concat(intersectionDate);
      }
      // 单日处理
      else {
        // 日期范围与单日的交集
        var daysArr = me.handleSetDaysData(data.days, setDaysArray);
        setDaysArray = setDaysArray.concat(daysArr);
      }
      me.handleThisData(data.formData, setDaysArray);
    }

    // 监听当前设置内容变化onchange
    this.settingWindow.on('change', 'input', function () {
      var $this = $(this);
      var data = {
        name: $this.attr('name'),
        value: $this.val(),
        $el: $this
      }
      if (me.ev['setup-value-change']) me.$emit('setup-value-change', data);
    })
  }


  // 计算出开始日期至结束日期间的date[0000-00-00]
  fn._createDateRangeArr = function (sd, ed) {
    var dates = [];

    var sdMsec = Date.parse(this.dateToObject(sd));
    var edMsec = Date.parse(this.dateToObject(ed));
    var days = Math.floor((edMsec - sdMsec) / ONE_DAY_MSEC) + 1;

    for (var i = 0; i < days; i++) {
      var date = new Date(sdMsec + ONE_DAY_MSEC * i);
      dates.push(formatDate(date, 'yyyy-MM-dd'));
    }
    return dates;
  }

  // 设置的日期范围数据处理
  fn.handleSetDateRangeData = function (startDay, endDay) {

    var arr = [];
    var sd = isValid(startDay);
    var ed = isValid(endDay);

    if (!sd) {
      if (this.ev['error']) this.$emit('error', _err(4))
      this.opts.error(_err(4));
      return null;
    }

    if (!ed) {
      // 设置结束日期为开始日期
      // 及按开始日期与结束日期相同处理
      ed = sd;
      if (this.ev['error']) this.$emit('error', _err(6))
      this.opts.error(_err(6));
      // return null;
    }

    if (sd > ed) {
      if (this.ev['error']) this.$emit('error', _err(7))
      this.opts.error(_err(7));
      return null;
    }

    // 开始结束日期均合法
    if (sd === ed) {
      arr.push(sd);
    } else {
      arr = this._createDateRangeArr(sd, ed);
    }
    return arr;
  };

  // 获取初始化日期范围数组
  fn._getInitDaysRange = function () {
    var arr = [];
    var sMsec = this.startDate.getTime();
    var eMsec = this.endDate.getTime();
    // console.log(sMsec, eMsec)
    var days = (eMsec - sMsec) / ONE_DAY_MSEC + 1;
    var date;
    for (var i = 0; i < days; i++) {
      date = new Date(sMsec + i * ONE_DAY_MSEC);
      arr.push(formatDate(date, 'yyyy-MM-dd'));
    }
    return arr;
  }

  //周设置数据处理
  /**
   * 设置了周n的数据处理
   * @param week 设置的周n数组
   * @param setDaysArray 设置的日期范围或初始的日期范围
   */
  fn.handleSetWeekData = function (week, setDaysArray) {
    var me = this;
    var arr = [];
    // 日期范围长度
    var len = setDaysArray.length
    var resArr = len <= 1 ? this._getInitDaysRange() : setDaysArray;
    $.each(resArr, function (index, val) {
      var weekNum = me.dateToObject(val).getDay();
      // week为数组，不用join方法indexOf无效？
      if (week.join(',').indexOf(weekNum) > -1) {
        arr.push(val);
      }
    });
    return arr;
  };

  // 日期范围与单日的交集
  fn.handleSetDaysData = function (days, setDaysArray) {
    var result = [];
    var len = setDaysArray.length;
    var resArr = len <= 1 ? this._getInitDaysRange() : setDaysArray;
    // days数组字符串
    var daysArrStr = days.join(',');
    $.each(resArr, function (index, val) {
      var lastStr = val.substr(val.length - 2);
      if (daysArrStr.indexOf(lastStr) > -1) {
        result.push(val);
      }
    })
    return result;
  }

  /**
   * 处理设置的数据，并更新this.data
   * @param obj 设置的数据
   * @param dateArr
   */
  fn.handleThisData = function (setData, dateArr) {
    // log(dateArr)
    var arr = dateArr || [];
    var len = arr.length;

    if (len === 0 ) {
      setData.date = currentDay;
      this._updateThisData(setData);
    } else {
      for (var i = 0; i < len; i++) {
        // 更新this.data
        this._updateThisData(setData, arr[i]);
      }
    }

    // 处理新生成的数据
    this.data = this.sort(this.rmRepeat(this.data, 'date'));

    // 渲染数据到表格
    this.renderDataToTalbe();

    // 隐藏设置窗口
    this.settingWindow.hide();
    // $('.capricorncd-date-detailed-settings').hide();

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
    var endDay = formatDate(this.endDate, 'yyyy-MM-dd');
    // 新空数组，用于存放筛选出来的数据
    var arr = [];

    $.each(this.opts.data, function (key, val) {
      if (val.date >= startDay && val.date <= endDay) {
        arr.push(val);
      }
    })

    // 去重复、排序操作
    return this.sort(this.rmRepeat(arr, 'date'));
  };

  /**
   * 自定义样式处理
   */
  fn.createStyleCode = function () {

    var style = this.opts.style || {};
    // 判断style对象中是否有属性
    var count = 0;
    for (var key in style) {
      count++;
      if (count > 0) {
        break;
      }
    }

    if (!count) {
      return;
    }

    // 需要设置的样式
    var defaultStyle = {
      // 头部背景色
      headerBgColor: '#098cc2',
      // 头部文字颜色
      headerTextColor: '#fff',
      // 周一至周日背景色，及文字颜色
      weekBgColor: '#098cc2',
      weekTextColor: '#fff',
      // 周末背景色，及文字颜色
      weekendBgColor: '#098cc2',
      weekendTextColor: '#fff',
      // 有效日期颜色
      validDateTextColor: '#333',
      validDateBgColor: '#fff',
      validDateBorderColor: '#eee',
      // Hover
      validDateHoverBgColor: '#098cc2',
      validDateHoverTextColor: '#fff',
      // 无效日期颜色
      invalidDateTextColor: '#ccc',
      invalidDateBgColor: '#fff',
      invalidDateBorderColor: '#eee',
      // 底部背景颜色
      footerBgColor: '#fff',
      // 重置按钮颜色
      resetBtnBgColor: '#77c351',
      resetBtnTextColor: '#fff',
      resetBtnHoverBgColor: '#55b526',
      resetBtnHoverTextColor: '#fff',
      // 确定按钮
      confirmBtnBgColor: '#098cc2',
      confirmBtnTextColor: '#fff',
      confirmBtnHoverBgColor: '#00649a',
      confirmBtnHoverTextColor: '#fff',
      // 取消按钮
      cancelBtnBgColor: '#fff',
      cancelBtnBorderColor: '#bbb',
      cancelBtnTextColor: '#999',
      cancelBtnHoverBgColor: '#fff',
      cancelBtnHoverBorderColor: '#bbb',
      cancelBtnHoverTextColor: '#666'
    };

    var concatStyle = $.extend({}, defaultStyle, this.opts.style);

    var templateStyle = '.capricorncd-calendar-container .calendar-head-wrapper, .capricorncd-date-detailed-settings .cddsw-container .cddsw-head-wrapper{background-color: {headerBgColor}}'
      // 头部文字颜色
      + '.capricorncd-calendar-container .calendar-head-wrapper .calendar-month-title, .capricorncd-date-detailed-settings .cddsw-container .cddsw-head-wrapper .cddsw-title{color: {headerTextColor};}'
      // 周背景色、文字颜色
      + '.capricorncd-calendar-container .calendar-table-wrapper table .week{background-color:{weekBgColor};color:{weekTextColor}};'
      // 周末背景色、文字颜色
      + '.capricorncd-calendar-container .calendar-table-wrapper table .week th.weekend{background-color:{weekendBgColor};color:{weekendTextColor}}'
      // 日期背景色、文字颜色、边框颜色
      // 有效日期
      + '.capricorncd-calendar-container .calendar-table-wrapper table td{color:{validDateTextColor};background-color:{validDateBgColor};border-bottom: 1px solid {validDateBorderColor};border-right: 1px solid {validDateBorderColor};}'
      // Hover Bg
      + '.capricorncd-calendar-container .calendar-table-wrapper table td.valid-hook:hover{background-color:{validDateHoverBgColor};}'
      // Hover TextColor
      + '.capricorncd-calendar-container .calendar-table-wrapper table td.valid-hook:hover b, .capricorncd-calendar-container .calendar-table-wrapper table td.valid-hook:hover p{color: {validDateHoverTextColor}}'
      // 无效日期
      // invalidDate
      + '.capricorncd-calendar-container .calendar-table-wrapper table td.disabled{color:{invalidDateTextColor};background-color:{invalidDateBgColor}; border-bottom: 1px solid {invalidDateBorderColor};border-right: 1px solid {invalidDateBorderColor};}'
      // 底部背景色
      + '.capricorncd-calendar-container .calendar-foot-wrapper, .capricorncd-date-detailed-settings .cddsw-foot-wrapper{background-color:{footerBgColor}}'
      // 重置按钮颜色
      + '.capricorncd-calendar-container .calendar-foot-wrapper button.btn-reset{background-color: {resetBtnBgColor};border: 1px solid {resetBtnBgColor};color: {resetBtnTextColor}}.capricorncd-calendar-container .calendar-foot-wrapper button.btn-reset:hover{background-color: {resetBtnHoverBgColor};border: 1px solid {resetBtnHoverBgColor};color: {resetBtnHoverTextColor}}'
      // 确定按钮颜色
      + '.capricorncd-calendar-container .calendar-foot-wrapper button.btn-confirm, .capricorncd-date-detailed-settings .cddsw-foot-wrapper button.btn-confirm {background-color: {confirmBtnBgColor};border: 1px solid {confirmBtnBgColor};color: {confirmBtnTextColor}}'
      + '.capricorncd-calendar-container .calendar-foot-wrapper button.btn-confirm:hover, .capricorncd-date-detailed-settings .cddsw-foot-wrapper button.btn-confirm:hover {background-color: {confirmBtnHoverBgColor};border: 1px solid {confirmBtnHoverBgColor};color: {confirmBtnHoverTextColor}}'
      // 取消按钮颜色
      + '.capricorncd-calendar-container .calendar-foot-wrapper button.btn-cancel, .capricorncd-date-detailed-settings .cddsw-foot-wrapper button.btn-cancel {background-color: {cancelBtnBgColor};color:{cancelBtnTextColor};border: 1px solid {cancelBtnBorderColor};}'
      + '.capricorncd-calendar-container .calendar-foot-wrapper button.btn-cancel:hover, .capricorncd-date-detailed-settings .cddsw-foot-wrapper button.btn-cancel:hover {background-color: {cancelBtnHoverBgColor};border-color: {cancelBtnHoverBorderColor};color: {cancelBtnHoverTextColor}}';

    var reg = null;
    for (var key in concatStyle) {
      // reg = new RegExp('{'+ key +'}', 'g');
      reg = eval('/{' + key + '}/g');
      templateStyle = templateStyle.replace(reg, concatStyle[key]);
    }

    $('head').append('<style>'+ templateStyle +'</style>')
  };


  /**
   * asc 按升序排列 desc 按降序排列
   * @param arr 需要排序的数组
   * @return {*}
   */
  fn.sort = function (arr) {

    if (!(arr instanceof Array)) {
      if (this.ev['error']) this.$emit('error', _err(8))
      this.opts.error(_err(8));
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

    for (var i = 0; i < arr.length; i++) {
      var val = arr[i];
      // 数组元素为对象
      if (key) {
        try {
          val = arr[i][key];
        } catch(e) {}
      }

      if (hash[val]) {
        continue;
      }
      newArr.push(arr[i]);
      hash[val] = true;
    }

    return newArr;
  };

  // 获取当前月数据
  fn.getMonthData = function () {
    var mstr = formatDate(this.month, 'yyyy-MM')
    var reg = new RegExp('^' + mstr + '-\\d+')
    var i, val
    var arr = []
    for (i = 0; i < this.data.length; i++) {
      val = this.data[i]
      if (reg.test(val.date)) {
        // console.log(val)
        arr.push(val)
      }
    }
    return {
      month: mstr,
      data: arr
    }
  }

  // 更新数据
  fn.update = function (newArr) {
    if (!newArr || !(newArr instanceof Array)) {
      if (this.ev['error']) this.$emit('error', _err(9))
      this.opts.error(_err(9));
      return
    }
    var i, val, data, index
    data = this.rmRepeat(newArr, 'date')
    for (i = 0; i < data.length; i++) {
      val = data[i]
      val.stock *= 10
      // console.log(val)
      index = this._getArrIndex(val, this.data)
      if (index === null) {
        this.data.push(val)
      } else {
        this.data.splice(index, 1, val)
      }
    }
    this.renderDataToTalbe()
  }

  // 获取元素在数组中的索引值
  fn._getArrIndex = function (item, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (item.date == arr[i].date) {
        return i
      }
    }
    return null
  }

  function log () {
    for (var i = 0; i < arguments.length; i++) {
      console.log(arguments[i])
    }
  }

  $.extend({
    CalendarPrice: function (opts) {
      return new CalendarPrice(opts);
    }
  });

})(jQuery);
