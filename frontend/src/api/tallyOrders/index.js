import request from '../../utils/request';

// 获取理货单列表
export const getTallyOrdersList = (params) => {
  return request({
    url: '/qiao/tally-orders',
    method: 'get',
    params,
  });
};

// 获取理货单详情
export const getTallyOrderDetail = (id) => {
  return request({
    url: `/qiao/tally-orders/${id}`,
    method: 'get',
  });
};

// 创建理货单
export const createTallyOrder = (data) => {
  return request({
    url: '/qiao/tally-orders',
    method: 'post',
    data,
  });
};

// 更新理货单
export const updateTallyOrder = (id, data) => {
  return request({
    url: `/qiao/tally-orders/${id}`,
    method: 'put',
    data,
  });
};

// 删除理货单
export const deleteTallyOrder = (id) => {
  return request({
    url: `/qiao/tally-orders/${id}`,
    method: 'delete',
  });
};

// 更新理货单状态
export const updateTallyOrderStatus = (id, status) => {
  return request({
    url: `/qiao/tally-orders/${id}/status`,
    method: 'put',
    data: { status },
  });
};

// 开始理货
export const startTallyOrder = (id) => {
  return request({
    url: `/qiao/tally-orders/${id}/start`,
    method: 'put',
  });
};

// 更新理货进度
export const updateTallyProgress = (id, productUpdates) => {
  return request({
    url: `/qiao/tally-orders/${id}/progress`,
    method: 'put',
    data: { productUpdates },
  });
};

// 完成理货
export const completeTallyOrder = (id, data) => {
  return request({
    url: `/qiao/tally-orders/${id}/complete`,
    method: 'put',
    data,
  });
};

// 批量操作理货单
export const batchOperateTallyOrders = (orderIds, action, data) => {
  return request({
    url: '/qiao/tally-orders/batch',
    method: 'post',
    data: { orderIds, action, data },
  });
};
