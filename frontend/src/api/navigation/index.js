import request from '@/utils/request'

const apiMap = {
  // 导航相关
  navigation: {
    getAll: getAllNavigationAPI,
    getFirstLevel: getFirstLevelNavigationAPI,
    getSecondary: getSecondaryNavigationAPI
  }
}

export default apiMap

// 获取所有导航数据
function getAllNavigationAPI() {
  return request({
    url: '/api/navigation',
    method: 'GET'
  })
}

// 获取一级导航
function getFirstLevelNavigationAPI() {
  return request({
    url: '/api/navigation/first-level',
    method: 'GET'
  })
}

// 获取二级导航
function getSecondaryNavigationAPI(firstLevelId) {
  return request({
    url: `/api/navigation/secondary/${firstLevelId || ''}`,
    method: 'GET'
  })
}
