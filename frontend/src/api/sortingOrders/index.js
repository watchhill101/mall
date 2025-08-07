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
