# Calendar-price-jquery

基于Jquery的日历价格、库存等设置插件，也可以作为前台显示日期、价格用。需要设置的参数(字段)需自定义，详见(demo)使用方法...

> 浏览器兼容：ie8+

#### 主要功能

* 自定义日历显示参数

* 自定义需要设置的参数

* 自定义插件的样式风格(颜色)

#### npm

```
npm install calendar-pirce-jquery --save-dev
```

## 使用方法

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Capricorncd Calendar-Price-jQuery</title>
  <!-- 引入日历样式文件 -->
  <link rel="stylesheet" href="../dist/css/calendar-price-jquery.min.css">
</head>
<body>

<!-- 日历显示的容器 -->
<div class="container"></div>

<!-- 引入jQuery.js文件 -->
<script src="jquery-1.12.4.min.js"></script>
<!-- 引入日历价格设置插件js文件 -->
<script src="../dist/js/calendar-price-jquery.min.js"></script>
<script>
  // 以下mockData是模拟JSON数据，一般情况是从后端(服务器端)获取
  // 对象中'date'字段必须，且格式一定要为0000-00-00
  // 除'date'以为的字段需自定义，然后必须在config:[]中配置
  // 需要在日历中显示参数，需在show:[]中配置
  var mockData = [
    {
      date: "2017-06-21",
      stock: "9000",
      buyNumMax: "50",
      buyNumMin: "1",
      price: "0.12",
      priceMarket: "100.00",
      priceSettlement: "90.00",
      priceRetail: "99.00"
    },{
      date: "2017-07-12",
      stock: "9000",
      buyNumMax: "50",
      buyNumMin: "1",
      price: "12.00",
      priceMarket: "100.00",
      priceSettlement: "90.00",
      priceRetail: "99.00"
    }
  ];

  // 使用插件
  $(function () {

    var zxCalendar = $.CalendarPrice({
      // 显示日历的容器
      el: '.container',
      // 设置开始日期
      // 可选参数，默认为系统当前日期
      startDate: '2017-08-02',
      // 可选参数，默认为开始日期相同的1年后的日期
      // 设置日历显示结束日期
      endDate: '2017-09',
      // 初始数据
      data: mockData,
      // 配置需要设置的字段名称，请与你传入的数据对象对应
      config: [
        {
          key: 'buyNumMax',
          name: '最多购买数'
        },
        {
          key: 'buyNumMin',
          name: '最少购买数'
        },
        {
          key: 'price',
          name: '分销售价'
        },
        {
          key: 'priceMarket',
          name: '景区挂牌价'
        },
        {
          key: 'priceSettlement',
          name: '分销结算价'
        },
        {
          key: 'priceRetail',
          name: '建议零售价'
        },
        {
          key: 'cashback',
          name: '返现'
        },
        {
          key: 'stock',
          name: '当天库存'
        }
      ],
      // 配置在日历中要显示的字段
      show: [
        {
          key: 'price',
          name: '分:￥'
        },
        {
          key: 'priceSettlement',
          name: '采:￥'
        },
        {
          key: 'stock',
          name: '库:'
        }
      ],
      // 点击'确定'按钮，返回设置完成的所有数据
      callback: function (data) {
        console.log('callback ....');
        console.log(data);
      },
      // 点击'取消'按钮的回调函数
      cancel: function () {
        console.log('取消设置 ....');
        // 取消设置
        // 这里可以触发关闭设置窗口等操作
        // ...
      },
      // 错误等提示信息回调函数
      error: function (err) {
        console.error(err.msg);
      },
      // 月份改变返回月份数据
      monthChange: function (month) {
        console.log('monthChange: ')
        console.log(month)
        // 新增模拟数据，或服务器异步请求的数据
        var newData = [{...}]
        // 更新日历数据
        zxCalendar.update(newData)
      },
      reset: function () {
        console.log('数据重置成功！');
      },
      // 自定义风格(颜色)
      style: {
        // 详见参数说明
        // ...
        // 头部背景色
        //headerBgColor: '#f00',
        // 头部文字颜色
        //headerTextColor: '#fff'
      }
    });

  });

</script>

</body>
</html>
```


## 使用效果图

PC端

![calendar-price-jquery](demo/preview-pc.png)

移动端

![calendar-price-jquery](demo/preview-mobile.png)

## Options 参数

* el: `.container` (必须)，显示日历的容器，jquery选择器均可(#id, \[属性], .classs等)。

* startDate: `2017-06-20` (可选)，开始日期。可设置数据的开始日期，该日期以前的月份将不能设置或操作，支持某月`2017-06`或某天。开始日期开始日期未配置或小于当前系统时间，则开始日期取今日。

* endDate: `2017-09-20` (可选)，结束日期。日历中可设置数据的结束日期，该日期以后的月份将不能显示或操作，同`startDate`，支持某月(默认去该月最后一天)或某天。若未配置此项，系统默认为1年后的今日，即日期范围为1年。

* data: `mockData` (可选)，初始时日历上显示的数据，详见使用方法。

* config: `array` (必须)，与data中的数据参数(属性)对应，该配置里的配置项，即可设置的参数字段，`key` 为需要设置的字段，`name`为输入框前面显示的名称。

* show: `array` (可选)， 日历中需要显示的参数(属性)，与data中的数据参数(属性)对应。`key` 为需要设置的字段名，`name`为显示在日历中的名称(简称)。

* callback: `function` (必须)， 点击`确定`按钮，返回设置完成的所有数据。

* cancel: `function` (可选)， 点击`取消`按钮的回调函数。

* error: `function` (可选)， 配置或操作中的错误、提示信息等回调函数。

* everyday: `function` (可选)， 点击有效的`某日`，返回当天的数据。注意：配置了此参数，设置窗口无效，即不能针对日期做参数设置。

* monthChange: `function(monthData)` (可选) 月份切换时，返回切换前日历数据

* hideFooterButton: `false` (可选)， 隐藏底部按钮（重置、确定、取消）。前台使用该插件时，则需要隐藏底部按钮，只做日历/价格显示。

* style: `自定义颜色`

```javascript
// 自定义颜色属性
{
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
}
```

## Method 方法

* update(newArrayData) 更新日历数据；参数为新的数据。

* getMonthData() 获取当前显示月份的数据

## Copyright and license

https://github.com/zx1984

Code and documentation copyright 2018. zx1984. Code released under the MIT License.
