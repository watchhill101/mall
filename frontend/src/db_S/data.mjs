import Mock from "mockjs"
// 商品列表模拟数据
export const data = Mock.mock({
    // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
    'list|1-100': [{
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1,
        "ProductID": "@guid",
        "src": "@image('200x200', '#50B347', '#FFF', 'Mock.js')",
        'ProductName': '@ctitle',
        'ProductCategory': '@cname',
        'SellingPrice': '@integer(100, 1000)',
        'StockCommodities': '@integer(100, 1000)',
        'TotalInventory': '@integer(100, 1000)',
        'status': '@pick(["在售","未售"])',
        'LastUpdateTime': '@date("yyyy-MM-dd hh:mm:ss")',
    }]
})
// 商品分类模拟数据
export const ProductClassificationData = Mock.mock({
    'list|1-100': [{
        'id|+1': 1,
        'BusinessType': '@pick(["零售","家政"])',
        'ClassificationID': '@integer(100, 1000)',
        'CategoryName': "@cname",
        "ParentCategory": "@cname",
        "ClassificationRank": "@pick(['一级','二级'])",
        "ClassificationIcon": "@image('100x100', '#50B347', '#FFF', 'Mock.js')",
        "ClassificationImg": "@image('200x200', '#50B347', '#FFF', 'Mock.js')",
        "AfterSalesDays": "@integer(7, 14)",
        "ClassificationAndSorting": "@integer(1, 100)",
        "status": "@pick(['正常','禁用'])",
    }]

})
// 订单数据
export const OrderData = Mock.mock({
    'list|1-100': [{
        'id|+1': 1,
        "OrderNumber": "@integer(100, 1000)",
        "CreationTime": "@date('yyyy-MM-dd hh:mm:ss')",
        "PaymentTime": "@date('yyyy-MM-dd hh:mm:ss')",
        "PaymentMethod": "@pick(['微信','钱包','支付宝','余额'])",
        // 备注 有内容则红色显示
        "Remarks": "@cparagraph(1, 3)",
        'ProductInformation': [
            {

                "id": "@integer(100, 1000)",
                // 商品名称
                "ProductName": '@cname',
                // 规格
                "Specification": '@pick(["红色", "蓝色", "绿色"])',
                // 价格
                "price": "@integer(100, 1000)",
                // 数量
                quantity: "@integer(1, 10)",
            }
        ],
        "CustomerInformation": [
            {
                "id": "@integer(100, 1000)",
                "CustomerName": "@cname",
                "ContactInformation": "@integer(10000000000, 100000000000)"
            }

        ],
        // 佣金
        "Commission": "@integer(100, 1000)",
        // 店铺名称
        "StoreName": "@cname",
        // 网点名称
        "OutletName": "@cname",
        // 订单状态
        "OrderStatus": "@pick([0,1,2,3,4,5])])"
    }]
})
// 回收站数据
export const TrashData = Mock.mock({
    "data|10": [{
        // 商品ID
        "ProductID": "@integer(100, 1000)",
        // 商品名称
        "ProductName": "@cname",
        "src": "@image('20x20', '#4A7BF7', 'Goods')",
        "ProductCategory": "@pick(['电子产品','服装'])",
        "MarketPrice": "@integer(100, 1000)",
        "LastUpdateTime": "@datetime",

    }]
})



// 