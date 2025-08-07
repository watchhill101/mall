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
   * 更新用户角色
   * @param {string} id - 用户ID
   * @param {string} roleName - 角色名称
   * @returns {Promise} 更新结果
   */
  updateUserRole: (id, roleName) => {
    console.log('📤 API调用 - 更新用户角色:', {
      id,
      roleName,
      url: `/user-management/users/${id}/permissions`,
      data: { roleName }
    });
    
    return request({
      url: `/user-management/users/${id}/permissions`,
      method: 'PUT',
      data: { roleName }
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
  },

  /**
   * 获取角色列表
   * @returns {Promise} 角色列表数据
   */
  getRoleList: () => {
    return request({
      url: '/user-management/roles',
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
  SUPER_ADMIN: '超级管理员',    // 超级管理员
  ADMIN: '管理员',             // 管理员
  USER: '普通用户',            // 普通用户
  MERCHANT: '商户',            // 商户
  OPERATOR: '操作员'           // 操作员
};

// 用户角色标签映射
export const USER_ROLE_LABELS = {
  // 数据库中的实际角色名（主要）
  '超级管理员': '超级管理员',
  '普通管理员': '普通管理员',
  '商家管理员': '商家管理员',
  '普通商家': '普通商家',
  '审计员': '审计员',
  '普通员工': '普通员工',
  // 兼容旧的角色名
  '管理员': '普通管理员',
  '普通用户': '普通员工',
  '商户': '普通商家',
  '操作员': '普通员工',
  // 兼容英文角色名
  'super_admin': '超级管理员',
  'admin': '普通管理员',
  'user': '普通员工',
  'merchant': '普通商家',
  'operator': '普通员工'
};

export default userManagementAPI;
