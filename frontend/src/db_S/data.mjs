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
        "MarketPrice": '@integer(100, 1000)',
        'isDeleted': '@boolean'
    }]
});
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
export const GoodsList = [
    {
        "list": [
            {
                "id": 1,
                "ProductID": "f91b9f3d-9f63-4a2a-aee3-c8c8b8bfa1c7",
                "src": "https://dummyimage.com/200x200/50B347/FFF&text=Mock.js",
                "ProductName": "智能手表",
                "ProductCategory": "电子产品",
                "SellingPrice": 876,
                "StockCommodities": 432,
                "TotalInventory": 983,
                "status": "在售",
                "LastUpdateTime": "2025-07-23 10:23:12",
                "isDeleted": false
            },
            {
                "id": 2,
                "ProductID": "14e3f88d-88c6-4e4c-b7fd-f2c4be8fd18c",
                "src": "https://dummyimage.com/200x200/50B347/FFF&text=Mock.js",
                "ProductName": "蓝牙耳机",
                "ProductCategory": "数码配件",
                "SellingPrice": 645,
                "StockCommodities": 285,
                "TotalInventory": 678,
                "status": "未售",
                "LastUpdateTime": "2025-06-15 14:12:55",
                "isDeleted": true
            },
            {
                "id": 3,
                "ProductID": "7a9e58db-32be-4a76-8e91-1fc452aa3c02",
                "src": "https://dummyimage.com/200x200/50B347/FFF&text=Mock.js",
                "ProductName": "空气净化器",
                "ProductCategory": "家用电器",
                "SellingPrice": 522,
                "StockCommodities": 769,
                "TotalInventory": 921,
                "status": "在售",
                "LastUpdateTime": "2025-08-03 09:03:44",
                "isDeleted": false
            }
        ]
    }

]
// 售后订单数据
export const afterSaleOrder = Mock.mock({
    "code": 200,
    "message": "success",
    "data|20": [ // 生成20条数据
        {
            "id|+1": 1,
            "After-salesOrder": "@guid",
            "OriginalOrder": "@guid",
            "After-salesSource": "@pick(['用户申请', '商家发起', '平台介入'])",
            "MemberInformation": "@cname (@integer(13000000000,13999999999))",
            "After-salesAmount": "@float(10, 1000, 2, 2)",
            "Status": "@pick(['待审核', '已完成', '已拒绝', '处理中'])",
            "RefundAmount": "@float(0, 1000, 2, 2)",
            "AfterSaleTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
            "Auditor": "@cname",
            "ProcessingTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
            "OrderSource": "@pick(['小程序', 'APP', '公众号', 'PC'])",
            "IP": "@ip",
            "HostAddress": "@domain",
            "MacAddress": "@string('hex', 2):@string('hex', 2):@string('hex', 2):@string('hex', 2):@string('hex', 2):@string('hex', 2)",
        }
    ]
});
// 理货单
export const sortingOrderList = {
    data: [
        {
            sortingOrderNo: 'WLD1232132213121212',
            sortingCount: 5,
            sortingStatus: '待理货',
            createTime: '2023-12-12 12:12:12',
            completeTime: '2023-12-12 12:12:12',
        },
        {
            sortingOrderNo: 'WLD1232132213121212',
            sortingCount: 5,
            sortingStatus: '已理货',
            createTime: '2023-12-12 12:12:12',
            completeTime: '2023-12-12 12:12:12',
        },
    ],
};