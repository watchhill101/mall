# 商家模块 API 使用文档

## 概述

商家模块提供了完整的商家管理功能，包括商家基本信息管理、账户管理、申请处理、提现管理、结算订单和账单处理等核心功能。

## 模块结构

```
merchant/
├── index.js                    # 模块入口文件
├── accountDetail.js            # 账户明细管理
├── bill.js                     # 账单管理
├── merchant.js                 # 商家基本信息管理
├── merchantAccount.js          # 商家账户管理
├── merchantApplication.js      # 商家申请管理
├── merchantWithdraw.js         # 商家提现管理
├── settlementOrder.js          # 结算订单管理
├── withdrawAccount.js          # 提现账户管理
└── README.md                   # 本文档
```

## 各模块功能详解

### 1. 商家基本信息管理 (merchant.js)

管理商家的基础信息，包括注册、认证、状态管理等。

**主要功能：**
- 商家注册
- 商家信息查询
- 商家状态更新
- 商家认证管理

**使用示例：**
```javascript
const { Merchant } = require('./merchant');

// 创建新商家
const newMerchant = await Merchant.create({
  name: '示例商家',
  contactPerson: '张三',
  phone: '13800138000',
  email: 'merchant@example.com',
  address: '北京市朝阳区示例街道123号'
});

// 查询商家信息
const merchant = await Merchant.findById(merchantId);

// 更新商家状态
await Merchant.updateStatus(merchantId, 'active');
```

### 2. 商家账户管理 (merchantAccount.js)

处理商家的账户信息，包括余额管理、账户设置等。

**主要功能：**
- 账户创建
- 余额查询
- 账户冻结/解冻
- 账户信息更新

**使用示例：**
```javascript
const { MerchantAccount } = require('./merchantAccount');

// 创建商家账户
const account = await MerchantAccount.create({
  merchantId: 'merchant_123',
  accountType: 'business',
  balance: 0,
  status: 'active'
});

// 查询账户余额
const balance = await MerchantAccount.getBalance(merchantId);

// 账户充值
await MerchantAccount.deposit(merchantId, amount, 'recharge');
```

### 3. 商家申请管理 (merchantApplication.js)

处理商家的各类申请，如入驻申请、资质变更申请等。

**主要功能：**
- 申请提交
- 申请审核
- 申请状态查询
- 申请历史记录

**使用示例：**
```javascript
const { MerchantApplication } = require('./merchantApplication');

// 提交入驻申请
const application = await MerchantApplication.submit({
  merchantId: 'merchant_123',
  applicationType: 'settle_in',
  applicationData: {
    businessLicense: 'license_url',
    legalPerson: '法人姓名',
    businessScope: '经营范围'
  }
});

// 审核申请
await MerchantApplication.review(applicationId, 'approved', '审核通过');
```

### 4. 商家提现管理 (merchantWithdraw.js)

管理商家的提现申请和处理流程。

**主要功能：**
- 提现申请
- 提现审核
- 提现处理
- 提现记录查询

**使用示例：**
```javascript
const { MerchantWithdraw } = require('./merchantWithdraw');

// 申请提现
const withdrawal = await MerchantWithdraw.apply({
  merchantId: 'merchant_123',
  amount: 1000,
  withdrawAccount: 'account_456',
  remark: '提现备注'
});

// 审核提现申请
await MerchantWithdraw.approve(withdrawalId, 'approved');
```

### 5. 提现账户管理 (withdrawAccount.js)

管理商家的提现账户信息。

**主要功能：**
- 账户绑定
- 账户验证
- 账户信息更新
- 账户删除

**使用示例：**
```javascript
const { WithdrawAccount } = require('./withdrawAccount');

// 绑定提现账户
const account = await WithdrawAccount.bind({
  merchantId: 'merchant_123',
  accountType: 'bank',
  accountNumber: '6222000000000000',
  accountName: '商家名称',
  bankName: '中国银行'
});
```

### 6. 结算订单管理 (settlementOrder.js)

处理商家的订单结算相关功能。

**主要功能：**
- 结算订单生成
- 结算状态查询
- 结算确认
- 结算历史记录

**使用示例：**
```javascript
const { SettlementOrder } = require('./settlementOrder');

// 创建结算订单
const settlement = await SettlementOrder.create({
  merchantId: 'merchant_123',
  orderIds: ['order_1', 'order_2'],
  settlementAmount: 2000,
  settlementPeriod: '2024-01'
});
```

### 7. 账户明细管理 (accountDetail.js)

记录和查询商家账户的详细变动记录。

**主要功能：**
- 明细记录
- 明细查询
- 明细统计
- 明细导出

**使用示例：**
```javascript
const { AccountDetail } = require('./accountDetail');

// 记录账户变动
await AccountDetail.record({
  merchantId: 'merchant_123',
  type: 'income',
  amount: 500,
  description: '订单收入',
  relatedOrderId: 'order_123'
});

// 查询账户明细
const details = await AccountDetail.getByMerchant(merchantId, {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### 8. 账单管理 (bill.js)

生成和管理商家的账单信息。

**主要功能：**
- 账单生成
- 账单查询
- 账单统计
- 账单下载

**使用示例：**
```javascript
const { Bill } = require('./bill');

// 生成月度账单
const bill = await Bill.generate({
  merchantId: 'merchant_123',
  billPeriod: '2024-01',
  billType: 'monthly'
});

// 查询账单列表
const bills = await Bill.getByMerchant(merchantId, {
  year: 2024,
  month: 1
});
```

## 使用注意事项

### 1. 环境要求
- Node.js >= 14.0.0
- 支持 ES6+ 语法
- 需要配置相应的数据库连接

### 2. 权限控制
- 所有操作需要验证商家身份
- 敏感操作需要额外的权限验证
- 建议实施操作日志记录

### 3. 数据验证
- 入参需要进行严格的数据验证
- 金额相关操作需要精度控制
- 状态变更需要验证业务逻辑

### 4. 错误处理
```javascript
try {
  const result = await Merchant.create(merchantData);
  // 处理成功逻辑
} catch (error) {
  // 处理错误逻辑
  console.error('创建商家失败:', error.message);
}
```

### 5. 事务处理
对于涉及多个表操作的业务，建议使用数据库事务：

```javascript
const transaction = await sequelize.transaction();
try {
  await Merchant.create(merchantData, { transaction });
  await MerchantAccount.create(accountData, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## API 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "error": {
    "details": "详细错误信息"
  }
}
```

## 常见问题

### Q: 如何处理商家账户余额不足的情况？
A: 在执行扣款操作前，先调用 `MerchantAccount.getBalance()` 检查余额，如果不足则返回相应错误信息。

### Q: 商家提现申请如何处理？
A: 提现申请需要经过以下流程：申请 → 审核 → 处理 → 完成，每个步骤都会更新相应的状态。

### Q: 如何确保账户操作的原子性？
A: 使用数据库事务来确保多个相关操作的原子性，避免数据不一致问题。

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成基础的商家管理功能
- 支持账户、申请、提现等核心功能

---

**维护者：** 开发团队  
**最后更新：** 2025-08-04  
**版本：** v1.0.0
