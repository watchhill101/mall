import request from '@/utils/request'

// 结算订单API接口

/**
 * 测试接口
 */
export const testSettlementOrderAPI = () => {
  return request({
    url: '/settlement-order/test',
    method: 'get'
  })
}

/**
 * 获取结算订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页大小
 * @param {string} params.merchantName - 商家名称
 * @param {string} params.orderNo - 订单编号
 * @param {string} params.productName - 商品名称
 * @param {string} params.status - 状态
 * @param {string} params.timeType - 时间类型 paymentTime|settlementTime
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.minAmount - 最小金额
 * @param {number} params.maxAmount - 最大金额
 * @param {number} params.minQuantity - 最小数量
 * @param {number} params.maxQuantity - 最大数量
 */
export const getSettlementOrderList = (params) => {
  return request({
    url: '/settlement-order/list',
    method: 'get',
    params
  })
}

/**
 * 获取结算订单详情
 * @param {string} id - 订单ID
 */
export const getSettlementOrderDetail = (id) => {
  return request({
    url: `/settlement-order/detail/${id}`,
    method: 'get'
  })
}

/**
 * 更新结算订单状态
 * @param {string} id - 订单ID
 * @param {Object} data - 更新数据
 * @param {string} data.status - 新状态
 * @param {string} data.remark - 备注
 */
export const updateSettlementOrderStatus = (id, data) => {
  return request({
    url: `/settlement-order/status/${id}`,
    method: 'put',
    data
  })
} 