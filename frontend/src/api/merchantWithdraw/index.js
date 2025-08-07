import request from '@/utils/request';

/**
 * 商家提现管理 API 接口
 */
const merchantWithdrawAPI = {
  /**
   * 获取商家提现列表（分页查询）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @param {string} params.merchantName - 商家名称搜索
   * @param {string} params.contactPhone - 联系电话搜索
   * @param {string} params.status - 状态筛选
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 商家提现列表数据
   */
  getMerchantWithdrawList: (params = {}) => {
    return request({
      url: '/merchant-withdraw/list',
      method: 'GET',
      params: {
        page: 1,
        pageSize: 10,
        ...params
      }
    });
  },

  /**
   * 审核提现申请
   * @param {string} id - 提现申请ID
   * @param {Object} data - 审核数据
   * @param {string} data.action - 审核操作：'approve' 或 'reject'
   * @param {string} data.remark - 审核备注
   * @returns {Promise} 审核结果
   */
  auditWithdrawApplication: (id, data) => {
    return request({
      url: `/merchant-withdraw/audit/${id}`,
      method: 'POST',
      data
    });
  },

  /**
   * 获取提现申请详情
   * @param {string} id - 提现申请ID
   * @returns {Promise} 提现申请详情数据
   */
  getMerchantWithdrawDetail: (id) => {
    return request({
      url: `/merchant-withdraw/detail/${id}`,
      method: 'GET'
    });
  },

  /**
   * 测试接口连接
   * @returns {Promise} 测试结果
   */
  testConnection: () => {
    return request({
      url: '/merchant-withdraw/test',
      method: 'GET'
    });
  }
};

// 提现状态枚举
export const WITHDRAW_STATUS = {
  PENDING: 'pending',        // 待审核
  REVIEWING: 'reviewing',    // 审核中
  REJECTED: 'rejected',      // 已拒绝
  CANCELLED: 'cancelled',    // 已撤销
  APPROVED: 'approved',      // 已通过
  PROCESSING: 'processing',  // 处理中
  COMPLETED: 'completed',    // 已完成
  FAILED: 'failed'          // 失败
};

// 提现状态标签映射
export const WITHDRAW_STATUS_LABELS = {
  [WITHDRAW_STATUS.PENDING]: '待审核',
  [WITHDRAW_STATUS.REVIEWING]: '审核中',
  [WITHDRAW_STATUS.REJECTED]: '已拒绝',
  [WITHDRAW_STATUS.CANCELLED]: '已撤销',
  [WITHDRAW_STATUS.APPROVED]: '已通过',
  [WITHDRAW_STATUS.PROCESSING]: '处理中',
  [WITHDRAW_STATUS.COMPLETED]: '已完成',
  [WITHDRAW_STATUS.FAILED]: '失败'
};

export default merchantWithdrawAPI; 