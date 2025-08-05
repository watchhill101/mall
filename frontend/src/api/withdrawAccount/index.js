import request from '@/utils/request';

/**
 * 提现账号管理 API 接口
 */
const withdrawAccountAPI = {
  /**
   * 获取提现账号列表（分页查询）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @param {string} params.merchantName - 商家名称搜索
   * @param {string} params.status - 状态筛选
   * @returns {Promise} 提现账号列表数据
   */
  getWithdrawAccountList: (params = {}) => {
    return request({
      url: '/withdraw-account/list',
      method: 'GET',
      params: {
        page: 1,
        pageSize: 10,
        ...params
      }
    });
  },

  /**
   * 获取提现账号详情
   * @param {string} id - 账号ID
   * @returns {Promise} 提现账号详情数据
   */
  getWithdrawAccountDetail: (id) => {
    return request({
      url: `/withdraw-account/detail/${id}`,
      method: 'GET'
    });
  },

  /**
   * 创建提现账号
   * @param {Object} data - 账号信息
   * @param {string} data.merchantName - 商家名称
   * @param {string} data.accountType - 账户类型 (union/wechat/alipay/bank)
   * @param {string} data.bankName - 所属银行
   * @param {string} data.accountNumber - 对公账号
   * @param {number} data.serviceFeeRate - 平台结算服务费率
   * @returns {Promise} 创建结果
   */
  createWithdrawAccount: (data) => {
    return request({
      url: '/withdraw-account/create',
      method: 'POST',
      data
    });
  },

  /**
   * 更新提现账号
   * @param {string} id - 账号ID
   * @param {Object} data - 更新的账号信息
   * @returns {Promise} 更新结果
   */
  updateWithdrawAccount: (id, data) => {
    return request({
      url: `/withdraw-account/update/${id}`,
      method: 'PUT',
      data
    });
  },

  /**
   * 删除提现账号
   * @param {string} id - 账号ID
   * @returns {Promise} 删除结果
   */
  deleteWithdrawAccount: (id) => {
    return request({
      url: `/withdraw-account/delete/${id}`,
      method: 'DELETE'
    });
  },

  /**
   * 更新账号状态
   * @param {string} id - 账号ID
   * @param {string} status - 新状态 (active/disabled)
   * @returns {Promise} 更新结果
   */
  updateWithdrawAccountStatus: (id, status) => {
    return request({
      url: `/withdraw-account/status/${id}`,
      method: 'PATCH',
      data: { status }
    });
  },

  /**
   * 获取商家列表（用于下拉选择）
   * @returns {Promise} 商家列表数据
   */
  getMerchantList: () => {
    return request({
      url: '/withdraw-account/merchants',
      method: 'GET'
    });
  },

  /**
   * 测试接口连接
   * @returns {Promise} 测试结果
   */
  testConnection: () => {
    return request({
      url: '/withdraw-account/test',
      method: 'GET'
    });
  }
};

// 账户类型枚举
export const ACCOUNT_TYPES = {
  UNION: 'union',           // 银联
  WECHAT: 'wechat',         // 微信
  ALIPAY: 'alipay',         // 支付宝
  BANK: 'bank'              // 银行卡
};

// 账户类型标签映射
export const ACCOUNT_TYPE_LABELS = {
  [ACCOUNT_TYPES.UNION]: '银联',
  [ACCOUNT_TYPES.WECHAT]: '微信',
  [ACCOUNT_TYPES.ALIPAY]: '支付宝',
  [ACCOUNT_TYPES.BANK]: '银行卡'
};

// 账号状态枚举
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',         // 正常
  DISABLED: 'disabled'      // 禁用
};

// 账号状态标签映射
export const ACCOUNT_STATUS_LABELS = {
  [ACCOUNT_STATUS.ACTIVE]: '正常',
  [ACCOUNT_STATUS.DISABLED]: '禁用'
};

// 账号状态颜色映射
export const ACCOUNT_STATUS_COLORS = {
  [ACCOUNT_STATUS.ACTIVE]: 'green',
  [ACCOUNT_STATUS.DISABLED]: 'red'
};

export default withdrawAccountAPI; 