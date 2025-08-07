import request from '@/utils/request';

/**
 * 权限管理 API 接口
 */
const permissionAPI = {
  /**
   * 获取当前用户权限信息
   * @returns {Promise} 用户权限数据
   */
  getMyPermissions: () => {
    return request({
      url: '/api/permissions/my-permissions',
      method: 'GET'
    });
  },

  /**
   * 获取用户路由（基于权限）
   * @returns {Promise} 用户可访问的路由列表
   */
  getUserRoutes: () => {
    return request({
      url: '/api/permissions/user-routes',
      method: 'GET'
    });
  },

  /**
   * 获取所有权限模块（管理员权限）
   * @returns {Promise} 权限模块数据
   */
  getPermissionModules: () => {
    return request({
      url: '/api/permissions/modules',
      method: 'GET'
    });
  },

  /**
   * 获取角色权限模板（管理员权限）
   * @returns {Promise} 角色模板数据
   */
  getRoleTemplates: () => {
    return request({
      url: '/api/permissions/role-templates',
      method: 'GET'
    });
  },

  /**
   * 检查用户权限
   * @param {Array} permissions - 需要检查的权限列表
   * @returns {Promise} 权限检查结果
   */
  checkPermission: (permissions) => {
    return request({
      url: '/api/permissions/check-permission',
      method: 'POST',
      data: { permissions }
    });
  },

  /**
   * 获取权限统计信息（管理员权限）
   * @returns {Promise} 权限统计数据
   */
  getPermissionStats: () => {
    return request({
      url: '/api/permissions/stats',
      method: 'GET'
    });
  }
};

// 权限常量（与后端保持一致）
export const USER_ROLES = {
  ADMIN: 'admin',
  MERCHANT: 'merchant', 
  USER: 'user',
  OPERATOR: 'operator'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

// 权限模板映射
export const PERMISSION_TEMPLATES = {
  [USER_ROLES.ADMIN]: {
    name: '超级管理员',
    description: '拥有系统所有权限',
    color: '#f50'
  },
  [USER_ROLES.MERCHANT]: {
    name: '商户',
    description: '商户相关权限',
    color: '#2db7f5'
  },
  [USER_ROLES.OPERATOR]: {
    name: '操作员',
    description: '操作员权限',
    color: '#87d068'
  },
  [USER_ROLES.USER]: {
    name: '普通用户',
    description: '基础只读权限',
    color: '#108ee9'
  }
};

export default permissionAPI;
