import request from '@/utils/request';

/**
 * 用户管理 API 接口
 */
const userManagementAPI = {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @param {string} params.searchText - 搜索关键字
   * @param {string} params.status - 用户状态筛选
   * @returns {Promise} 用户列表数据
   */
  getUserList: (params = {}) => {
    return request({
      url: '/user-management/users',
      method: 'GET',
      params: {
        page: 1,
        pageSize: 10,
        ...params
      }
    });
  },

  /**
   * 获取用户详情
   * @param {string} id - 用户ID
   * @returns {Promise} 用户详情数据
   */
  getUserDetail: (id) => {
    return request({
      url: `/user-management/users/${id}`,
      method: 'GET'
    });
  },

  /**
   * 创建用户
   * @param {Object} data - 用户数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @param {string} data.email - 邮箱
   * @param {string} data.phone - 手机号
   * @param {string} data.role - 角色
   * @param {Array} data.permissions - 权限列表
   * @returns {Promise} 创建结果
   */
  createUser: (data) => {
    return request({
      url: '/user-management/users',
      method: 'POST',
      data
    });
  },

  /**
   * 更新用户信息
   * @param {string} id - 用户ID
   * @param {Object} data - 更新的用户数据
   * @returns {Promise} 更新结果
   */
  updateUser: (id, data) => {
    return request({
      url: `/user-management/users/${id}`,
      method: 'PUT',
      data
    });
  },

  /**
   * 删除用户
   * @param {string} id - 用户ID
   * @returns {Promise} 删除结果
   */
  deleteUser: (id) => {
    return request({
      url: `/user-management/users/${id}`,
      method: 'DELETE'
    });
  },

  /**
   * 批量删除用户
   * @param {Array<string>} ids - 用户ID数组
   * @returns {Promise} 删除结果
   */
  batchDeleteUsers: (ids) => {
    return request({
      url: '/user-management/users/batch-delete',
      method: 'DELETE',
      data: { ids }
    });
  },

  /**
   * 更新用户权限
   * @param {string} id - 用户ID
   * @param {Array} permissions - 权限列表
   * @returns {Promise} 更新结果
   */
  updateUserPermissions: (id, permissions) => {
    return request({
      url: `/user-management/users/${id}/permissions`,
      method: 'PUT',
      data: { permissions }
    });
  },

  /**
   * 重置用户密码
   * @param {string} id - 用户ID
   * @param {string} newPassword - 新密码
   * @returns {Promise} 重置结果
   */
  resetUserPassword: (id, newPassword) => {
    return request({
      url: `/user-management/users/${id}/reset-password`,
      method: 'PUT',
      data: { newPassword }
    });
  },

  /**
   * 获取用户统计信息
   * @returns {Promise} 统计数据
   */
  getUserStats: () => {
    return request({
      url: '/user-management/stats',
      method: 'GET'
    });
  }
};

// 用户状态枚举
export const USER_STATUS = {
  ACTIVE: 'active',      // 激活
  INACTIVE: 'inactive',  // 未激活
  SUSPENDED: 'suspended', // 暂停
  DELETED: 'deleted'     // 已删除
};

// 用户状态标签映射
export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.INACTIVE]: '未激活',
  [USER_STATUS.SUSPENDED]: '已暂停',
  [USER_STATUS.DELETED]: '已删除'
};

// 用户状态颜色映射
export const USER_STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'success',
  [USER_STATUS.INACTIVE]: 'default',
  [USER_STATUS.SUSPENDED]: 'warning',
  [USER_STATUS.DELETED]: 'error'
};

// 用户角色枚举
export const USER_ROLES = {
  ADMIN: 'admin',           // 管理员
  USER: 'user',             // 普通用户
  MERCHANT: 'merchant',     // 商户
  OPERATOR: 'operator'      // 操作员
};

// 用户角色标签映射
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.USER]: '普通用户',
  [USER_ROLES.MERCHANT]: '商户',
  [USER_ROLES.OPERATOR]: '操作员'
};

export default userManagementAPI;
