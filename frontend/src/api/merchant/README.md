# Merchant 商户管理 API 使用说明

## 概述

Merchant模块提供完整的商户管理功能，包括商户的增删改查、状态管理和统计信息等。

## API 接口列表

### 1. 商户列表查询
```javascript
import merchantAPI from '@/api/merchant';

// 获取商户列表（支持分页和筛选）
const response = await merchantAPI.getMerchantList({
  page: 1,           // 页码
  pageSize: 10,      // 每页数量
  searchText: '张三', // 搜索关键字
  status: 'active',  // 状态筛选
  merchantType: 'retail' // 商户类型筛选
});
```

### 2. 商户详情查询
```javascript
// 获取单个商户详情
const response = await merchantAPI.getMerchantDetail(merchantId);
```

### 3. 创建商户
```javascript
// 创建新商户
const merchantData = {
  name: '测试商户',
  merchantType: 'retail',
  isSelfOperated: false,
  phone: '13800138001',
  address: '测试地址',
  logoUrl: 'https://example.com/logo.png',
  personInCharge: '负责人ID',
  role: '角色ID',
  serviceCharge: 0.1,
  businessLicense: '营业执照号',
  taxNumber: '税号'
};

const response = await merchantAPI.createMerchant(merchantData);
```

### 4. 更新商户
```javascript
// 更新商户信息
const updateData = {
  name: '新的商户名称',
  address: '新的地址'
};

const response = await merchantAPI.updateMerchant(merchantId, updateData);
```

### 5. 删除商户
```javascript
// 删除单个商户
const response = await merchantAPI.deleteMerchant(merchantId);

// 批量删除商户
const response = await merchantAPI.batchDeleteMerchants([id1, id2, id3]);
```

### 6. 状态管理
```javascript
// 更新商户状态
const response = await merchantAPI.updateMerchantStatus(
  merchantId, 
  'active',    // 新状态
  approvedBy   // 审核人ID（可选）
);
```

### 7. 统计信息
```javascript
// 获取商户统计信息
const response = await merchantAPI.getMerchantStats();
```

## 常量定义

### 商户状态
```javascript
import { MERCHANT_STATUS, MERCHANT_STATUS_LABELS, MERCHANT_STATUS_COLORS } from '@/api/merchant';

// 状态值
MERCHANT_STATUS.ACTIVE      // 'active' - 正常
MERCHANT_STATUS.INACTIVE    // 'inactive' - 未激活
MERCHANT_STATUS.IN_REVIEW   // 'inReview' - 审核中
MERCHANT_STATUS.SUSPENDED   // 'suspended' - 已暂停

// 状态标签
MERCHANT_STATUS_LABELS[status] // 返回中文标签

// 状态颜色（用于Tag组件）
MERCHANT_STATUS_COLORS[status] // 返回对应颜色
```

### 商户类型
```javascript
import { MERCHANT_TYPES, MERCHANT_TYPE_LABELS } from '@/api/merchant';

// 类型值
MERCHANT_TYPES.RETAIL        // 'retail' - 零售商
MERCHANT_TYPES.WHOLESALE     // 'wholesale' - 批发商
MERCHANT_TYPES.MANUFACTURER  // 'manufacturer' - 制造商
MERCHANT_TYPES.DISTRIBUTOR   // 'distributor' - 分销商

// 类型标签
MERCHANT_TYPE_LABELS[type] // 返回中文标签
```

## 数据结构

### 商户数据模型
```javascript
{
  _id: "商户ID",
  name: "商户名称",
  merchantType: "商户类型",
  isSelfOperated: false,
  phone: "联系电话",
  address: "商户地址",
  logoUrl: "Logo URL",
  personInCharge: {
    _id: "负责人ID",
    name: "负责人姓名",
    phone: "负责人电话",
    email: "负责人邮箱"
  },
  role: {
    _id: "角色ID",
    name: "角色名称",
    permissions: ["权限列表"]
  },
  serviceCharge: 0.1,
  status: "商户状态",
  totalOrders: 0,
  totalRevenue: 0,
  businessLicense: "营业执照",
  taxNumber: "税号",
  approvedBy: "审核人信息",
  approvedAt: "审核时间",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### API 响应格式
```javascript
{
  code: 200,
  message: "操作成功",
  data: {
    list: [...],      // 列表数据
    pagination: {     // 分页信息
      current: 1,
      pageSize: 10,
      total: 100,
      totalPages: 10
    }
  }
}
```

## 错误处理

所有API调用都应该包含错误处理：

```javascript
try {
  const response = await merchantAPI.getMerchantList();
  // 处理成功响应
} catch (error) {
  console.error('API调用失败:', error);
  
  if (error.response) {
    // 服务器返回错误
    const { status, data } = error.response;
    switch (status) {
      case 400:
        message.error('请求参数错误');
        break;
      case 401:
        message.error('未授权，请重新登录');
        break;
      case 403:
        message.error('权限不足');
        break;
      default:
        message.error('操作失败');
    }
  } else {
    // 网络错误
    message.error('网络连接失败');
  }
}
```

## 使用示例

### 在组件中使用
```javascript
import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import merchantAPI, { MERCHANT_STATUS_LABELS, MERCHANT_STATUS_COLORS } from '@/api/merchant';

const MerchantList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await merchantAPI.getMerchantList({
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (response.code === 200) {
        setData(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: '商户名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={MERCHANT_STATUS_COLORS[status]}>
          {MERCHANT_STATUS_LABELS[status]}
        </Tag>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        ...pagination,
        onChange: (page, pageSize) => {
          setPagination(prev => ({
            ...prev,
            current: page,
            pageSize
          }));
        }
      }}
    />
  );
};
```

## 注意事项

1. **认证要求**: 所有API接口都需要有效的JWT Token
2. **分页处理**: 使用后端分页，前端不需要处理数据筛选
3. **错误处理**: 必须处理API调用可能出现的各种错误
4. **数据更新**: 修改操作后需要重新加载数据
5. **权限控制**: 某些操作可能需要特定权限 