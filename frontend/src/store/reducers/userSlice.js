import { createSlice } from '@reduxjs/toolkit'
// 导入token、refreshToken操作方法
import { getRefreshToken, getToken, setRefreshToken, setToken, removeToken, removeRefreshToken } from '@/utils/auth'

/**
 * 创建一个用户状态切片
 */
const userSlice = createSlice({
  // 用来作为区分的模块名称
  name: 'user',
  // 状态初始值
  initialState: () => {
    // 如果localStorage中有从其中取，否则为null
    const token = getToken() || null
    const refreshToken = getRefreshToken() || null
    return {
      token,
      refreshToken,
      userinfo: { 
        avatar: null,
        username: '',
        email: ''
      }
    }
  },
  // 状态操作方法
  reducers: {
    login(state, action) {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      // 将数据持久化
      setToken(state.token)
      setRefreshToken(state.refreshToken)
    },
    setUserinfo(state, action) {
      const { payload } = action
      state.userinfo = payload
    },
    logout(state, action) {
      state.token = null
      state.refreshToken = null
      state.userinfo = { 
        avatar: null,
        username: '',
        email: ''
      }
      // 移除存储中的信息
      removeToken()
      removeRefreshToken()
    }
  }
})
// 导出经过redux包装的action对象
export const { login, setUserinfo, logout } = userSlice.actions
// 登录方法
export const loginAsync = (payload) => async (dispatch) => {
  try {
    console.log('🚀 发起登录请求:', payload);
    
    const authAPI = await import('@/api/auth')
    const response = await authAPI.default.login(payload)
    
    console.log('📡 登录响应:', response);
    
    if (response.code === 200) {
      const loginData = {
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken
      }
      
      console.log('💾 保存登录数据:', loginData);
      dispatch(login(loginData))
      
      // 同时获取用户信息
      if (response.data.user) {
        const userInfo = {
          username: response.data.user.loginAccount,
          email: response.data.user.email,
          avatar: null,
          userId: response.data.user._id
        };
        
        console.log('👤 保存用户信息:', userInfo);
        dispatch(setUserinfo(userInfo))
      }
      
      return loginData
    } else {
      throw new Error(response.message || '登录失败')
    }
  } catch (error) {
    console.error('❌ 登录失败:', error);
    
    // 如果是网络错误，提供更友好的错误信息
    if (error.code === 'ECONNABORTED') {
      throw new Error('请求超时，请检查网络连接');
    } else if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error('用户名或密码错误');
      } else if (status === 500) {
        throw new Error('服务器内部错误，请稍后重试');
      } else {
        throw new Error(`请求失败 (${status}): ${error.response.data?.message || '未知错误'}`);
      }
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('网络连接失败，请检查网络设置');
    }
  }
}

// 获取用户信息方法
export const getUserInfoAsync = () => async (dispatch) => {
  try {
    const authAPI = await import('@/api/auth')
    const response = await authAPI.default.getUserInfo()
    
    if (response.code === 200) {
      const userInfo = {
        username: response.data.loginAccount,
        email: response.data.email,
        avatar: null,
        userId: response.data._id
      }
      
      dispatch(setUserinfo(userInfo))
      return userInfo
    } else {
      throw new Error(response.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}
// 导出切片对象
export default userSlice
