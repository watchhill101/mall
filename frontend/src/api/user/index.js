import request from '@/utils/request'

const apiMap = {
  // 登录相关
  login: {
    login: loginAPI,
    get: getVerifyCodeAPI
  },
  // 用户中心
  center: {
    get: getUserInfoAPI,
    update: updateUserInfoAPI,
    uploadAvatar: uploadAvatarAPI
  },
  // 用户管理
  manage: {
    reset: resetPasswordAPI,
    query: queryUsersAPI,
    add: addUserAPI,
    update: updateUserAPI,
    delete: deleteUserAPI
  }
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

// 获取验证码
function getVerifyCodeAPI(uuid) {
  return request({
    url: `/auth/verify-code/${uuid || ''}`,
    method: 'GET'
  })
}

// 获取用户信息
function getUserInfoAPI(userId) {
  return request({
    url: `/auth/userinfo${userId ? `/${userId}` : ''}`,
    method: 'GET'
  })
}

// 更新用户信息
function updateUserInfoAPI(data) {
  return request({
    url: '/auth/update-profile',
    method: 'PUT',
    data
  })
}

// 上传头像
function uploadAvatarAPI(formData) {
  return request({
    url: '/auth/upload-avatar',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 重置密码
function resetPasswordAPI(data) {
  return request({
    url: '/auth/reset-password',
    method: 'POST',
    data
  })
}

// 查询用户列表（管理功能，暂时返回空数据）
function queryUsersAPI(params) {
  return Promise.resolve({
    data: {
      list: [],
      total: 0
    }
  })
}

// 添加用户（管理功能，暂时返回成功）
function addUserAPI(data) {
  return Promise.resolve({
    data: { success: true }
  })
}

// 更新用户（管理功能，暂时返回成功）
function updateUserAPI(data) {
  return Promise.resolve({
    data: { success: true }
  })
}

// 删除用户（管理功能，暂时返回成功）
function deleteUserAPI(id) {
  return Promise.resolve({
    data: { success: true }
  })
}
