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
// 登录方法（简化版）
export const loginAsync = (payload) => async (dispatch) => {
  try {
    // 这里您可以实现自己的登录逻辑
    console.log('登录参数:', payload)
    
    // 模拟登录成功
    const mockLoginData = {
      token: 'your-token-here',
      refreshToken: 'your-refresh-token-here'
    }
    
    dispatch(login(mockLoginData))
    return mockLoginData
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

// 获取用户信息方法（简化版）
export const getUserInfoAsync = () => async (dispatch) => {
  try {
    // 这里您可以实现自己的获取用户信息逻辑
    const mockUserInfo = {
      username: 'Admin',
      email: 'admin@example.com',
      avatar: null
    }
    
    dispatch(setUserinfo(mockUserInfo))
    return mockUserInfo
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}
// 导出切片对象
export default userSlice
