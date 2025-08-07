import request from '../../utils/request';

// 获取分拣单列表
export const getSortingOrdersList = (params) => {
  return request({
    url: '/qiao/sorting-orders',
    method: 'get',
    params,
  });
};

// 获取分拣单详情
export const getSortingOrderDetail = (id) => {
  return request({
    url: `/qiao/sorting-orders/${id}`,
    method: 'get',
  });
};

// 创建分拣单
export const createSortingOrder = (data) => {
  return request({
    url: '/qiao/sorting-orders',
    method: 'post',
    data,
  });
};

// 更新分拣单
export const updateSortingOrder = (id, data) => {
  return request({
    url: `/qiao/sorting-orders/${id}`,
    method: 'put',
    data,
  });
};

// 删除分拣单
export const deleteSortingOrder = (id) => {
  return request({
    url: `/qiao/sorting-orders/${id}`,
    method: 'delete',
  });
};

// 更新分拣单状态
export const updateSortingOrderStatus = (id, status) => {
  return request({
    url: `/qiao/sorting-orders/${id}/status`,
    method: 'put',
    data: { status },
  });
};

// 完成分拣
export const completeSortingOrder = (id, data) => {
  return request({
    url: `/qiao/sorting-orders/${id}/complete`,
    method: 'put',
    data,
  });
};

// 开始拣货
export const startPicking = (id) => {
  return request({
    url: `/qiao/sorting-orders/${id}/start-picking`,
    method: 'put',
  });
};

// 更新拣货进度
export const updatePickingProgress = (id, productUpdates) => {
  return request({
    url: `/qiao/sorting-orders/${id}/picking-progress`,
    method: 'put',
    data: { productUpdates },
  });
};

// 批量操作分拣单
export const batchOperateSortingOrders = (orderIds, action, data) => {
  return request({
    url: '/qiao/sorting-orders/batch',
    method: 'post',
    data: { orderIds, action, data },
  });
};

// 导出分拣单详情
export const exportSortingOrderDetail = (id) => {
  return request({
    url: `/qiao/sorting-orders/${id}/export`,
    method: 'get',
    responseType: 'blob',
  });
};

// 批量导出分拣单
export const batchExportSortingOrders = (orderIds) => {
  return request({
    url: '/qiao/sorting-orders/batch-export',
    method: 'post',
    data: { orderIds },
    responseType: 'blob',
  });
};

// 获取分拣单统计信息
export const getSortingOrdersStats = (params) => {
  return request({
    url: '/qiao/sorting-orders/stats',
    method: 'get',
    params,
  });
};

// 获取拣货路线优化建议
export const getPickingRouteOptimization = (orderIds) => {
  return request({
    url: '/qiao/sorting-orders/route-optimization',
    method: 'post',
    data: { orderIds },
  });
};

// 暂停分拣单
export const pauseSortingOrder = (id, reason) => {
  return request({
    url: `/qiao/sorting-orders/${id}/pause`,
    method: 'put',
    data: { reason },
  });
};

// 恢复分拣单
export const resumeSortingOrder = (id) => {
  return request({
    url: `/qiao/sorting-orders/${id}/resume`,
    method: 'put',
  });
};

// 分配拣货员
export const assignPicker = (id, pickerId) => {
  return request({
    url: `/qiao/sorting-orders/${id}/assign-picker`,
    method: 'put',
    data: { pickerId },
  });
};

// 获取可用拣货员列表
export const getAvailablePickers = () => {
  return request({
    url: '/qiao/sorting-orders/available-pickers',
    method: 'get',
  });
};

// 质量检查
export const performQualityCheck = (id, checkData) => {
  return request({
    url: `/qiao/sorting-orders/${id}/quality-check`,
    method: 'put',
    data: checkData,
  });
};

// 生成拣货标签
export const generatePickingLabels = (orderIds) => {
  return request({
    url: '/qiao/sorting-orders/generate-labels',
    method: 'post',
    data: { orderIds },
    responseType: 'blob',
  });
};

// 获取分拣单历史记录
export const getSortingOrderHistory = (id) => {
  return request({
    url: `/qiao/sorting-orders/${id}/history`,
    method: 'get',
  });
};
