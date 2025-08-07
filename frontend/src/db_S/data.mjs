// import Mock from "mockjs"  // 临时注释，使用静态数据替代

// 商品列表静态数据
export const data = {
  list: [
    {
      id: 1,
      ProductID: "PROD-001",
      src: "/1.jpg",
      ProductName: "示例商品1",
      ProductCategory: "电子产品",
      SellingPrice: 299,
      StockCommodities: 100,
      TotalInventory: 100,
      status: "在售",
      LastUpdateTime: "2025-08-06 14:52:00",
      MarketPrice: 399,
      isDeleted: false
    },
    {
      id: 2,
      ProductID: "PROD-002",
      src: "/2.jpg",
      ProductName: "示例商品2",
      ProductCategory: "服装",
      SellingPrice: 199,
      StockCommodities: 50,
      TotalInventory: 50,
      status: "在售",
      LastUpdateTime: "2025-08-06 14:52:00",
      MarketPrice: 299,
      isDeleted: false
    },
    {
      id: 3,
      ProductID: "PROD-003",
      src: "/3.jpg",
      ProductName: "示例商品3",
      ProductCategory: "家居用品",
      SellingPrice: 159,
      StockCommodities: 75,
      TotalInventory: 75,
      status: "在售",
      LastUpdateTime: "2025-08-06 14:52:00",
      MarketPrice: 199,
      isDeleted: false
    }
  ]
};

// 售后订单数据
export const afterSaleOrder = {
  list: [
    {
      id: 1,
      orderNumber: "AS-001",
      productName: "示例商品1",
      customerName: "张三",
      status: "处理中",
      createTime: "2025-08-06 14:52:00",
      reason: "质量问题"
    },
    {
      id: 2,
      orderNumber: "AS-002",
      productName: "示例商品2",
      customerName: "李四",
      status: "已完成",
      createTime: "2025-08-06 14:52:00",
      reason: "退换货"
    }
  ]
};

// 分拣订单列表
export const sortingOrderList = {
  list: [
    {
      id: 1,
      orderNumber: "SO-001",
      status: "待分拣",
      createTime: "2025-08-06 14:52:00",
      items: 5
    },
    {
      id: 2,
      orderNumber: "SO-002",
      status: "已分拣",
      createTime: "2025-08-06 14:52:00",
      items: 3
    }
  ]
};

// 订单数据
export const OrderData = {
  list: [
    {
      id: 1,
      OrderNumber: "ORD-001",
      CreationTime: "2025-08-06 14:52:00",
      PaymentTime: "2025-08-06 15:20:00",
      PaymentMethod: "微信",
      Remarks: "请尽快发货",
      ProductInformation: [
        {
          id: 1,
          ProductName: "示例商品1",
          Specification: "红色",
          price: 299,
          quantity: 2
        }
      ],
      CustomerInformation: [
        {
          id: 1,
          CustomerName: "张三",
          ContactInformation: "13800138000"
        }
      ],
      Commission: 29.9,
      StoreName: "示例店铺1",
      OutletName: "示例网点1",
      OrderStatus: 1
    },
    {
      id: 2,
      OrderNumber: "ORD-002",
      CreationTime: "2025-08-06 13:30:00",
      PaymentTime: "2025-08-06 14:00:00",
      PaymentMethod: "支付宝",
      Remarks: "",
      ProductInformation: [
        {
          id: 2,
          ProductName: "示例商品2",
          Specification: "蓝色",
          price: 199,
          quantity: 1
        }
      ],
      CustomerInformation: [
        {
          id: 2,
          CustomerName: "李四",
          ContactInformation: "13900139000"
        }
      ],
      Commission: 19.9,
      StoreName: "示例店铺2",
      OutletName: "示例网点2",
      OrderStatus: 2
    },
    {
      id: 3,
      OrderNumber: "ORD-003",
      CreationTime: "2025-08-06 12:15:00",
      PaymentTime: "2025-08-06 12:45:00",
      PaymentMethod: "余额",
      Remarks: "送货上门",
      ProductInformation: [
        {
          id: 3,
          ProductName: "示例商品3",
          Specification: "绿色",
          price: 159,
          quantity: 3
        }
      ],
      CustomerInformation: [
        {
          id: 3,
          CustomerName: "王五",
          ContactInformation: "13700137000"
        }
      ],
      Commission: 47.7,
      StoreName: "示例店铺3",
      OutletName: "示例网点3",
      OrderStatus: 3
    }
  ]
};

// 回收站数据
export const TrashData = {
  list: [
    {
      id: 1,
      ProductID: "PROD-DEL-001",
      ProductName: "已删除商品1",
      deleteTime: "2025-08-06 14:52:00",
      reason: "下架处理"
    },
    {
      id: 2,
      ProductID: "PROD-DEL-002",
      ProductName: "已删除商品2",
      deleteTime: "2025-08-06 14:52:00",
      reason: "库存清零"
    }
  ]
};

// 兼容性导出
export const mockData = data;
export default data;