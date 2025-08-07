import request from '@/utils/request';

// 角色管理API
const roleManagementAPI = {
  // 获取所有角色列表
  getRoleList: () => {
    return request.get('/user-management/roles');
  },

  // 获取角色详情（包含权限信息）
  getRoleDetail: (roleId) => {
    return request.get(`/api/role-management/roles/${roleId}`);
  },

  // 更新角色权限
  updateRolePermissions: (roleId, permissions) => {
    return request.put(`/api/role-management/roles/${roleId}/permissions`, {
      FirstLevelNavigationID: permissions.firstLevel || [],
      SecondaryNavigationID: permissions.secondLevel || []
    });
  },

  // 获取所有导航数据
  getNavigationData: () => {
    return request.get('/api/role-management/navigations');
  },

  // 创建新角色
  createRole: (roleData) => {
    return request.post('/api/role-management/roles', roleData);
  },

  // 删除角色
  deleteRole: (roleId) => {
    return request.delete(`/api/role-management/roles/${roleId}`);
  }
};

export default roleManagementAPI;