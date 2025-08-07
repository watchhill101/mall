# 收款记录API使用说明

## 概述
本文档描述了收款记录管理相关的API接口，包括数据的增删改查、搜索筛选、批量操作等功能。

## 基础信息
- **基础URL**: `/api/qiao`
- **数据格式**: JSON
- **编码**: UTF-8

## API接口列表

### 1. 获取收款记录列表
**GET** `/payment-records`

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| paymentId | string | 否 | 收款单号（模糊搜索） |
| orderId | string | 否 | 订单号（模糊搜索） |
| merchantName | string | 否 | 商家名称（模糊搜索） |
| paymentMethod | string | 否 | 支付方式 |
| paymentStatus | string | 否 | 支付状态 |
| customerPhone | string | 否 | 客户电话（模糊搜索） |
| paymentTime | array | 否 | 支付时间范围 [开始时间, 结束时间] |

#### 支付方式枚举
- `wechat`: 微信支付
- `alipay`: 支付宝
- `cash`: 现金
- `bank_card`: 银行卡
- `bank_transfer`: 银行转账
- `voucher`: 代金券

#### 支付状态枚举
- `pending`: 待支付
- `processing`: 处理中
- `success`: 已支付
- `failed`: 支付失败
- `cancelled`: 已取消
- `refunded`: 已退款

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "收款记录ID",
        "paymentId": "PAY1703123456001",
        "orderId": "ORD1703123456001",
        "merchantName": "清风便利店",
        "paymentMethod": "wechat",
        "paymentAmount": 128.50,
        "actualAmount": 128.50,
        "paymentStatus": "success",
        "paymentTime": "2024-01-01T12:00:00.000Z",
        "customerPhone": "13900000001",
        "transactionId": "TXN1703123456001",
        "remarks": "备注信息"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "message": "获取收款记录列表成功"
}
```

### 2. 获取收款记录详情
**GET** `/payment-records/:id`

#### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 收款记录ID |

#### 响应示例
```json
{
  "code": 200,
  "data": {
    "id": "收款记录ID",
    "paymentId": "PAY1703123456001",
    "orderId": "ORD1703123456001",
    "merchantName": "清风便利店",
    "paymentMethod": "wechat",
    "paymentAmount": 128.50,
    "actualAmount": 128.50,
    "paymentStatus": "success",
    "paymentTime": "2024-01-01T12:00:00.000Z",
    "customerPhone": "13900000001",
    "customerName": "张三",
    "transactionId": "TXN1703123456001",
    "remarks": "备注信息",
    "changeAmount": 0,
    "discountAmount": 8.50,
    "cashier": "收银员姓名",
    "terminal": "POS1",
    "location": "清风便利店-收银台1",
    "refundInfo": {
      "isRefunded": false,
      "refundAmount": 0
    }
  },
  "message": "获取收款记录详情成功"
}
```

### 3. 创建收款记录
**POST** `/payment-records`

#### 请求体
```json
{
  "orderId": "ORD1703123456001",
  "merchantId": "商家ID",
  "customerInfo": {
    "customerId": "CUST001",
    "customerName": "张三",
    "customerPhone": "13900000001"
  },
  "paymentInfo": {
    "paymentMethod": "wechat",
    "paymentAmount": 128.50,
    "receivedAmount": 128.50,
    "changeAmount": 0,
    "discountAmount": 8.50
  },
  "operatorInfo": {
    "cashier": "收银员ID",
    "terminal": "POS1",
    "location": "清风便利店-收银台1"
  },
  "notes": "备注信息"
}
```

### 4. 更新收款记录状态
**PUT** `/payment-records/:id/status`

#### 请求体
```json
{
  "paymentStatus": "processing",
  "notes": "状态更新备注"
}
```

### 5. 处理退款
**PUT** `/payment-records/:id/refund`

#### 请求体
```json
{
  "refundAmount": 100.00,
  "refundReason": "客户申请退款"
}
```

### 6. 批量操作收款记录
**POST** `/payment-records/batch`

#### 请求体
```json
{
  "recordIds": ["ID1", "ID2", "ID3"],
  "action": "updateStatus",
  "data": {
    "paymentStatus": "processing"
  }
}
```

#### 支持的批量操作
- `updateStatus`: 批量更新状态
- `reconcile`: 批量对账
- `delete`: 批量删除

### 7. 生成测试数据
**POST** `/payment-records/generate-test-data`

#### 请求体
```json
{
  "count": 50
}
```

### 8. 清空测试数据
**DELETE** `/payment-records/clear-test-data`

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### 前端调用示例（JavaScript）
```javascript
// 获取收款记录列表
const getPaymentRecords = async () => {
  try {
    const response = await fetch('/api/qiao/payment-records?page=1&pageSize=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('收款记录列表:', data.data.list);
  } catch (error) {
    console.error('获取失败:', error);
  }
};

// 生成测试数据
const generateTestData = async () => {
  try {
    const response = await fetch('/api/qiao/payment-records/generate-test-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ count: 20 })
    });
    const data = await response.json();
    console.log('生成结果:', data.message);
  } catch (error) {
    console.error('生成失败:', error);
  }
};
```

### 后端测试脚本
```bash
# 运行测试脚本
node test-payment-api.js

# 清空测试数据
node test-payment-api.js --clear
```

## 注意事项

1. **数据依赖**: 收款记录依赖订单和商家数据，确保相关数据存在
2. **时间格式**: 时间参数使用ISO 8601格式
3. **金额精度**: 金额使用数字类型，保留2位小数
4. **状态流转**: 支付状态有特定的流转规则，不能随意更改
5. **权限控制**: 实际使用中需要添加用户认证和权限检查

## 测试建议

1. 首先调用生成测试数据接口创建测试数据
2. 测试各种搜索和筛选条件
3. 验证分页功能
4. 测试状态更新和批量操作
5. 测试完成后清空测试数据

## 技术支持

如有问题，请查看：
1. 后端日志输出
2. 数据库连接状态
3. 网络请求响应状态
4. API响应错误信息 