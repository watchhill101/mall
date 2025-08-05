import request from '@/utils/request';

/**
 * 商户账号管理 API 接口
 */
const merchantAccountAPI = {
  /**
   * 获取商户账号列表（分页查询）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @param {string} params.merchantId - 商户ID搜索
   * @param {string} params.contactPhone - 联系电话搜索
   * @param {string} params.merchant - 商户名称搜索
   * @param {string} params.status - 账号状态筛选
   * @returns {Promise} 商户账号列表数据
   */
  getMerchantAccountList: (params = {}) => {
    return request({
      url: '/merchant-account/list',
      method: 'GET',
      params: {
        page: 1,
        pageSize: 10,
        ...params
      }
    });
  },

  /**
   * 获取商户账号详情
   * @param {string} id - 账号ID
   * @returns {Promise} 商户账号详情数据
   */
  getMerchantAccountDetail: (id) => {
    return request({
      url: `/merchant-account/detail/${id}`,
      method: 'GET'
    });
  },

  /**
   * 创建商户账号
   * @param {Object} data - 账号信息
   * @param {string} data.loginAccount - 登录账号
   * @param {string} data.userNickname - 用户昵称
   * @param {string} data.contactPhone - 联系电话
   * @param {string} data.password - 密码
   * @param {string} data.role - 角色ID
   * @param {string} data.merchant - 商户ID
   * @param {string} data.personInCharge - 负责人ID
   * @returns {Promise} 创建结果
   */
  createMerchantAccount: (data) => {
    return request({
      url: '/merchant-account/create',
      method: 'POST',
      data
    });
  },

  /**
   * 更新商户账号
   * @param {string} id - 账号ID
   * @param {Object} data - 更新的账号信息
   * @returns {Promise} 更新结果
   */
  updateMerchantAccount: (id, data) => {
    return request({
      url: `/merchant-account/update/${id}`,
      method: 'PUT',
      data
    });
  },

  /**
   * 删除商户账号
   * @param {string} id - 账号ID
   * @returns {Promise} 删除结果
   */
  deleteMerchantAccount: (id) => {
    return request({
      url: `/merchant-account/delete/${id}`,
      method: 'DELETE'
    });
  },

  /**
   * 更新账号状态
   * @param {string} id - 账号ID
   * @param {string} status - 新状态 (active|disabled|locked|pending)
   * @returns {Promise} 更新结果
   */
  updateMerchantAccountStatus: (id, status) => {
    return request({
      url: `/merchant-account/status/${id}`,
      method: 'PATCH',
      data: { status }
    });
  },

  /**
   * 重置账号密码
   * @param {string} id - 账号ID
   * @param {string} newPassword - 新密码（可选，默认123456）
   * @returns {Promise} 重置结果
   */
  resetMerchantAccountPassword: (id, newPassword) => {
    return request({
      url: `/merchant-account/reset-password/${id}`,
      method: 'POST',
      data: { newPassword }
    });
  },

  /**
   * 获取账号统计信息
   * @returns {Promise} 统计数据
   */
  getMerchantAccountStats: () => {
    return request({
      url: '/merchant-account/stats',
      method: 'GET'
    });
  }
};

// 账号状态常量
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  LOCKED: 'locked',
  PENDING: 'pending'
};

// 账号状态标签
export const ACCOUNT_STATUS_LABELS = {
  [ACCOUNT_STATUS.ACTIVE]: '正常',
  [ACCOUNT_STATUS.DISABLED]: '禁用',
  [ACCOUNT_STATUS.LOCKED]: '锁定',
  [ACCOUNT_STATUS.PENDING]: '待审核'
};

// 账号状态颜色
export const ACCOUNT_STATUS_COLORS = {
  [ACCOUNT_STATUS.ACTIVE]: 'success',
  [ACCOUNT_STATUS.DISABLED]: 'error',
  [ACCOUNT_STATUS.LOCKED]: 'warning',
  [ACCOUNT_STATUS.PENDING]: 'processing'
};

export default merchantAccountAPI; 