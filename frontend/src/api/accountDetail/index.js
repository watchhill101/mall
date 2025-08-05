import request from '@/utils/request';

/**
 * 账户明细管理 API 接口
 */
const accountDetailAPI = {
  /**
   * 获取账户明细列表（分页查询）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @param {string} params.merchantType - 商家类型筛选
   * @param {string} params.merchantName - 商家名称搜索
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 账户明细列表数据
   */
  getAccountDetailList: (params = {}) => {
    return request({
      url: '/account-detail/list',
      method: 'GET',
      params: {
        page: 1,
        pageSize: 10,
        ...params
      }
    });
  },

  /**
   * 获取账户统计信息
   * @param {Object} params - 查询参数
   * @param {string} params.merchantType - 商家类型筛选
   * @param {string} params.merchantName - 商家名称搜索
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 统计数据
   */
  getAccountDetailStats: (params = {}) => {
    return request({
      url: '/account-detail/stats',
      method: 'GET',
      params
    });
  },

  /**
   * 获取账户明细详情
   * @param {string} id - 账户明细ID
   * @returns {Promise} 账户明细详情数据
   */
  getAccountDetailDetail: (id) => {
    return request({
      url: `/account-detail/detail/${id}`,
      method: 'GET'
    });
  },

  /**
   * 测试接口连接
   * @returns {Promise} 测试结果
   */
  testConnection: () => {
    return request({
      url: '/account-detail/test',
      method: 'GET'
    });
  }
};

// 商家类型枚举（与后端保持一致）
export const MERCHANT_TYPES = {
  RETAIL: 'retail',           // 零售
  WHOLESALE: 'wholesale',     // 批发
  MANUFACTURER: 'manufacturer', // 制造商
  DISTRIBUTOR: 'distributor',  // 分销商
  HOUSEKEEPING: '家政',       // 家政
  FOOD: '食品',              // 食品
  CLOTHING: '服装',          // 服装
  ELECTRONICS: '电子'        // 电子
};

// 商家类型标签映射
export const MERCHANT_TYPE_LABELS = {
  [MERCHANT_TYPES.RETAIL]: '零售商',
  [MERCHANT_TYPES.WHOLESALE]: '批发商',
  [MERCHANT_TYPES.MANUFACTURER]: '制造商',
  [MERCHANT_TYPES.DISTRIBUTOR]: '分销商',
  [MERCHANT_TYPES.HOUSEKEEPING]: '家政',
  [MERCHANT_TYPES.FOOD]: '食品',
  [MERCHANT_TYPES.CLOTHING]: '服装',
  [MERCHANT_TYPES.ELECTRONICS]: '电子'
};

export default accountDetailAPI; 