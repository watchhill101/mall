import request from '@/utils/request'

const apiMap = {
  // 首页数据
  dashboard: {
    getStats: getDashboardStats,
    getCharts: getDashboardCharts
  }
}

export default apiMap

// 获取仪表板统计数据
function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'GET'
  })
}

// 获取图表数据
function getDashboardCharts() {
  return request({
    url: '/dashboard/charts',
    method: 'GET'
  })
}
