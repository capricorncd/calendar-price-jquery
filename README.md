calendar-price-jquery
====
Commodity calendar, price, inventory and other settings of jQuery plug-in

基于Jquery的日历价格、库存等设置插件。

Create by capricorncd / 2017-06-11

## 使用方法

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Capricorncd Calendar-Price-jQuery</title>
    <!-- 引入日历样式文件 -->
    <link rel="stylesheet" href="../build/calendar-price-jquery.css">
</head>
<body>

<!-- 日历显示的容器 -->
<div class="container"></div>

<!-- 引入jQuery.js文件 -->
<script src="jquery-1.12.4.min.js"></script>
<!-- 引入日历价格设置插件js文件 -->
<script src="../src/calendar-price-jquery.js"></script>
<script>
$(function () {
	
	// JSON数据，一般情况送后端获取
	// 以下是模拟数据
	// 对象中'date'字段必须，且格式一定要为0000-00-00
    var data = [
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

	// 插件使用
    $.CalendarPrice({
        el: '.container',
		//month: '2017.12.21',
        startDate: '2017-08-02',
        endDate: '2017-09',
        data: data,
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
        		abbreviate: '分:￥',
        		value: null
        	},
        	{
                key: 'priceSettlement',
        		abbreviate: '采:￥',
        		value: null
        	},
        	{
                key: 'stock',
        		abbreviate: '库:',
        		value: null
        	}
        ],
        callback: function (res) {
            console.log('callback ....');
            console.log(res);
        },
        cancel: function () {
        	console.log('取消设置 ....');
        	// 取消设置
        	// 这里可以触发关闭设置窗口
        	// ...
        },
        error: function (err) {
            console.error(err.msg);
        }
    });

});

</script>

</body>
</html>

```


## 使用效果图

![github](http://img.mukewang.com/594695990001a32d10320836.png "github")


## Options 参数

* 改天完善...