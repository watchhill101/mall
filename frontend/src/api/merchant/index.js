import request from '@/utils/request';

/**
 * 商户管理 API 接口
 */
const merchantAPI = {
  /**
   * 获取商户列表（分页查询）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @param {string} params.searchText - 搜索关键字
   * @param {string} params.status - 商户状态筛选
   * @param {string} params.merchantType - 商户类型筛选
   * @returns {Promise} 商户列表数据
   */
  getMerchantList: (params = {}) => {
    return request({
      url: '/merchant/list',
      method: 'GET',
      params: {
        page: 1,
        pageSize: 10,
        ...params
      }
    });
  },

  /**
   * 获取商户详情
   * @param {string} id - 商户ID
   * @returns {Promise} 商户详情数据
   */
  getMerchantDetail: (id) => {
    return request({
      url: `/merchant/detail/${id}`,
      method: 'GET'
    });
  },

  /**
   * 创建商户
   * @param {Object} data - 商户数据
   * @param {string} data.name - 商户名称
   * @param {string} data.merchantType - 商户类型 (retail/wholesale/manufacturer/distributor)
   * @param {boolean} data.isSelfOperated - 是否自营
   * @param {string} data.phone - 手机号
   * @param {string} data.address - 地址
   * @param {string} data.logoUrl - Logo URL
   * @param {string} data.personInCharge - 负责人ID
   * @param {string} data.role - 角色ID
   * @param {number} data.serviceCharge - 服务费率
   * @param {string} data.businessLicense - 营业执照
   * @param {string} data.taxNumber - 税号
   * @returns {Promise} 创建结果
   */
  createMerchant: (data) => {
    return request({
      url: '/merchant/create',
      method: 'POST',
      data
    });
  },

  /**
   * 更新商户信息
   * @param {string} id - 商户ID
   * @param {Object} data - 更新的商户数据
   * @returns {Promise} 更新结果
   */
  updateMerchant: (id, data) => {
    return request({
      url: `/merchant/update/${id}`,
      method: 'PUT',
      data
    });
  },

  /**
   * 删除商户
   * @param {string} id - 商户ID
   * @returns {Promise} 删除结果
   */
  deleteMerchant: (id) => {
    return request({
      url: `/merchant/delete/${id}`,
      method: 'DELETE'
    });
  },

  /**
   * 批量删除商户
   * @param {Array<string>} ids - 商户ID数组
   * @returns {Promise} 删除结果
   */
  batchDeleteMerchants: (ids) => {
    return request({
      url: '/merchant/batch-delete',
      method: 'DELETE',
      data: { ids }
    });
  },

  /**
   * 更新商户状态
   * @param {string} id - 商户ID
   * @param {string} status - 新状态 (active/inactive/inReview/suspended)
   * @param {string} approvedBy - 审核人ID（可选）
   * @returns {Promise} 更新结果
   */
  updateMerchantStatus: (id, status, approvedBy = null) => {
    return request({
      url: `/merchant/status/${id}`,
      method: 'PATCH',
      data: { status, approvedBy }
    });
  },

  /**
   * 获取商户统计信息
   * @returns {Promise} 统计数据
   */
  getMerchantStats: () => {
    return request({
      url: '/merchant/stats',
      method: 'GET'
    });
  }
};

// 商户状态枚举
export const MERCHANT_STATUS = {
  ACTIVE: 'active',        // 激活
  INACTIVE: 'inactive',    // 未激活
  IN_REVIEW: 'inReview',   // 审核中
  SUSPENDED: 'suspended'   // 暂停
};

// 商户状态标签映射
export const MERCHANT_STATUS_LABELS = {
  [MERCHANT_STATUS.ACTIVE]: '正常',
  [MERCHANT_STATUS.INACTIVE]: '未激活',
  [MERCHANT_STATUS.IN_REVIEW]: '审核中',
  [MERCHANT_STATUS.SUSPENDED]: '已暂停'
};

// 商户状态颜色映射
export const MERCHANT_STATUS_COLORS = {
  [MERCHANT_STATUS.ACTIVE]: 'success',
  [MERCHANT_STATUS.INACTIVE]: 'default',
  [MERCHANT_STATUS.IN_REVIEW]: 'processing',
  [MERCHANT_STATUS.SUSPENDED]: 'error'
};

// 商户类型枚举
export const MERCHANT_TYPES = {
  RETAIL: 'retail',           // 零售
  WHOLESALE: 'wholesale',     // 批发
  MANUFACTURER: 'manufacturer', // 制造商
  DISTRIBUTOR: 'distributor'  // 分销商
};

// 商户类型标签映射
export const MERCHANT_TYPE_LABELS = {
  [MERCHANT_TYPES.RETAIL]: '零售商',
  [MERCHANT_TYPES.WHOLESALE]: '批发商',
  [MERCHANT_TYPES.MANUFACTURER]: '制造商',
  [MERCHANT_TYPES.DISTRIBUTOR]: '分销商'
};

export default merchantAPI; 