import request from '@/utils/request'

const apiMap = {
  // 认证相关
  login: loginAPI,
  logout: logoutAPI,
  refreshToken: refreshTokenAPI,
  getUserInfo: getUserInfoAPI
}

export default apiMap

// 登录接口
function loginAPI(data) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

// 退出登录
function logoutAPI() {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}

// 刷新token
function refreshTokenAPI(refreshToken) {
  return request({
    url: '/auth/refresh',
    method: 'POST',
    data: { refreshToken }
  })
}

// 获取用户信息
function getUserInfoAPI() {
  return request({
    url: '/auth/me',
    method: 'GET'
  })
}
