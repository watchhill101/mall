import request from '@/utils/request'

// 结算账单API接口

/**
 * 测试接口
 */
export const testBillAPI = () => {
  return request({
    url: '/bill/test',
    method: 'get'
  })
}

/**
 * 获取结算账单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页大小
 * @param {string} params.merchantName - 商家名称
 * @param {string} params.status - 状态
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 */
export const getBillList = (params) => {
  return request({
    url: '/bill/list',
    method: 'get',
    params
  })
}

/**
 * 获取账单统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.merchantName - 商家名称
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 */
export const getBillStats = (params) => {
  return request({
    url: '/bill/stats',
    method: 'get',
    params
  })
}

/**
 * 获取账单详情
 * @param {string} id - 账单ID
 */
export const getBillDetail = (id) => {
  return request({
    url: `/bill/detail/${id}`,
    method: 'get'
  })
}

/**
 * 更新账单状态
 * @param {string} id - 账单ID
 * @param {Object} data - 更新数据
 * @param {string} data.status - 新状态
 * @param {string} data.remark - 备注
 */
export const updateBillStatus = (id, data) => {
  return request({
    url: `/bill/status/${id}`,
    method: 'put',
    data
  })
} 