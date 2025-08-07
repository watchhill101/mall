import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api/qiao', // 根据后端路由配置，指向qiao.js的路由
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 这里可以添加token等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// ==================== 订单管理相关API ====================

// 获取订单列表
export const getOrdersList = (params) => {
  return api.get('/orders', { params });
};

// 获取订单详情
export const getOrderDetail = (id) => {
  return api.get(`/orders/${id}`);
};

// 更新订单状态
export const updateOrderStatus = (id, data) => {
  return api.put(`/orders/${id}/status`, data);
};

// 更新支付状态
export const updatePaymentStatus = (id, data) => {
  return api.put(`/orders/${id}/payment`, data);
};

// 批量操作订单
export const batchOperateOrders = (data) => {
  return api.post('/orders/batch', data);
};

// 获取订单统计信息
export const getOrderStatistics = (params) => {
  return api.get('/orders/statistics', { params });
};

// ==================== 售后管理相关API ====================

// 获取售后列表
export const getAfterSalesList = (params) => {
  return api.get('/aftersales', { params });
};

// 获取售后详情
export const getAfterSalesDetail = (id) => {
  return api.get(`/aftersales/${id}`);
};

// 更新售后状态
export const updateAfterSalesStatus = (id, data) => {
  return api.put(`/aftersales/${id}/status`, data);
};

// 处理售后申请
export const processAfterSales = (id, data) => {
  return api.put(`/aftersales/${id}/process`, data);
};

// ==================== 理货单相关API ====================

// 获取理货单列表
export const getTallyOrdersList = (params) => {
  return api.get('/tally-orders', { params });
};

// 获取理货单详情
export const getTallyOrderDetail = (id) => {
  return api.get(`/tally-orders/${id}`);
};

// ==================== 分拣单相关API ====================

// 获取分拣单列表
export const getSortingOrdersList = (params) => {
  return api.get('/sorting-orders', { params });
};

// 获取分拣单详情
export const getSortingOrderDetail = (id) => {
  return api.get(`/sorting-orders/${id}`);
};

// ==================== 收款记录相关API ====================

// 获取收款记录列表
export const getPaymentRecordsList = (params) => {
  return api.get('/payment-records', { params });
};

// 获取收款记录详情
export const getPaymentRecordDetail = (id) => {
  return api.get(`/payment-records/${id}`);
};

// 创建收款记录
export const createPaymentRecord = (data) => {
  return api.post('/payment-records', data);
};

// 更新收款记录状态
export const updatePaymentRecordStatus = (id, data) => {
  return api.put(`/payment-records/${id}/status`, data);
};

// 处理退款
export const processRefund = (id, data) => {
  return api.put(`/payment-records/${id}/refund`, data);
};

// 批量操作收款记录
export const batchOperatePaymentRecords = (data) => {
  return api.post('/payment-records/batch', data);
};

// 生成测试数据
export const generatePaymentTestData = (data) => {
  return api.post('/payment-records/generate-test-data', data);
};

// 清空测试数据
export const clearPaymentTestData = () => {
  return api.delete('/payment-records/clear-test-data');
};

// ==================== 配货单相关API ====================

// 获取配货单列表
export const getAllocationOrdersList = (params) => {
  return api.get('/allocation-orders', { params });
};

// 获取配货单详情
export const getAllocationOrderDetail = (id) => {
  return api.get(`/allocation-orders/${id}`);
};

// 生成配货单测试数据
export const generateAllocationTestData = (data) => {
  return api.post('/allocation-orders/generate-test-data', data);
};

// 清空配货单测试数据
export const clearAllocationTestData = () => {
  return api.delete('/allocation-orders/clear-test-data');
};

// ==================== 作业单相关API ====================

// 获取作业单列表
export const getWorkOrdersList = (params) => {
  return api.get('/work-orders', { params });
};

// 获取作业单详情
export const getWorkOrderDetail = (id) => {
  return api.get(`/work-orders/${id}`);
};

// 生成作业单测试数据
export const generateWorkOrderTestData = (data) => {
  return api.post('/work-orders/generate-test-data', data);
};

// 清空作业单测试数据
export const clearWorkOrderTestData = () => {
  return api.delete('/work-orders/clear-test-data');
};

// ==================== 物流单相关API ====================

// 获取物流单列表
export const getLogisticsOrdersList = (params) => {
  return api.get('/logistics-orders', { params });
};

// 获取物流单详情
export const getLogisticsOrderDetail = (id) => {
  return api.get(`/logistics-orders/${id}`);
};

// 生成物流单测试数据
export const generateLogisticsTestData = (data) => {
  return api.post('/logistics-orders/generate-test-data', data);
};

// 清空物流单测试数据
export const clearLogisticsTestData = () => {
  return api.delete('/logistics-orders/clear-test-data');
};

// ==================== 订单导出API ====================

// 导出订单数据为Excel
export const exportOrdersData = (params) => {
  return axios.post('/api/qiao/orders/export', params, {
    responseType: 'blob', // 重要：设置响应类型为blob以处理二进制数据
    timeout: 30000, // 导出可能需要更长时间
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export default api;
