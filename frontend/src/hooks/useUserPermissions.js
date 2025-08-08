import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import userManagementAPI from '@/api/userManagement';

/**
 * 用户权限管理Hook
 * 获取当前用户的角色权限信息
 */
export const useUserPermissions = () => {
  const [userPermissions, setUserPermissions] = useState({
    FirstLevelNavigationID: [],
    SecondaryNavigationID: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 从Redux获取当前用户信息
  const userInfo = useSelector(state => state.user.userinfo);

  // 获取用户详细信息（包含权限）
  const fetchUserPermissions = async () => {
    if (!userInfo || !userInfo._id) {
      console.log('⚠️ 用户信息不完整，无法获取权限');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 正在获取用户权限信息...', userInfo._id);
      
      // 获取用户详细信息
      const response = await userManagementAPI.getUserDetail(userInfo._id);
      
      if (response.code === 200 && response.data) {
        const userData = response.data;
        console.log('✅ 获取用户详细信息成功:', userData);

        // 提取角色权限信息
        if (userData.role && typeof userData.role === 'object') {
          const rolePermissions = {
            FirstLevelNavigationID: userData.role.FirstLevelNavigationID || [],
            SecondaryNavigationID: userData.role.SecondaryNavigationID || []
          };
          
          console.log('✅ 用户权限信息:', rolePermissions);
          setUserPermissions(rolePermissions);
        } else {
          console.log('⚠️ 用户角色信息不完整:', userData.role);
          // 如果没有角色权限，设置为空数组
          setUserPermissions({
            FirstLevelNavigationID: [],
            SecondaryNavigationID: []
          });
        }
      } else {
        throw new Error(response.message || '获取用户信息失败');
      }
    } catch (err) {
      console.error('❌ 获取用户权限失败:', err);
      setError(err.message);
      // 发生错误时，设置为空权限
      setUserPermissions({
        FirstLevelNavigationID: [],
        SecondaryNavigationID: []
      });
    } finally {
      setLoading(false);
    }
  };

  // 当用户信息变化时重新获取权限
  useEffect(() => {
    fetchUserPermissions();
  }, [userInfo._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 检查是否有特定导航的权限
  const hasNavigationPermission = (navigationId, isSecondary = false) => {
    if (!navigationId) return false;
    
    const targetArray = isSecondary ? 
      userPermissions.SecondaryNavigationID : 
      userPermissions.FirstLevelNavigationID;
      
    return targetArray.some(nav => 
      (typeof nav === 'object' ? nav._id : nav) === navigationId
    );
  };

  // 检查是否是超级管理员（拥有所有权限）
  const isSuperAdmin = () => {
    return userInfo?.role?.name === '超级管理员';
  };

  return {
    userPermissions,
    loading,
    error,
    fetchUserPermissions,
    hasNavigationPermission,
    isSuperAdmin
  };
};
