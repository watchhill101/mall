import Mock from "mockjs"
// 商品列表模拟数据
export const data = Mock.mock({
    // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
    'list|1-100': [{
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1,
        'ProductName': '@ctitle',
        'ProductCategory': '@cname',
        'SellingPrice': '@integer(100, 1000)',
        'StockCommodities': '@integer(100, 1000)',
        'TotalInventory': '@integer(100, 1000)',
        'status': '@pick(["在售","未售"])',
        'LastUpdateTime': '@date("yyyy-MM-dd hh:mm:ss")',
    }]
})




