import request from '../../utils/request'

// 商家申请API接口
const merchantApplicationAPI = {
  // 测试接口
  test: () => {
    return request.get('/merchant-application/test')
  },

  // 获取商家申请列表
  getList: (params = {}) => {
    return request.get('/merchant-application/list', { params })
  },

  // 获取申请详情
  getDetail: (id) => {
    return request.get(`/merchant-application/detail/${id}`)
  },

  // 审核申请
  audit: (id, data) => {
    return request.patch(`/merchant-application/audit/${id}`, data)
  },

  // 创建申请
  create: (data) => {
    return request.post('/merchant-application/create', data)
  },

  // 获取申请统计信息
  getStats: () => {
    return request.get('/merchant-application/stats')
  }
}

export default merchantApplicationAPI 