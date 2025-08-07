// import,request from '@/utils/request'

const apiMap = {
  // 字典数据查询
  query: queryDictAPI,
  getByType: getDictByTypeAPI
}

export default apiMap

// 查询字典数据
function queryDictAPI(params) {
  // 暂时返回模拟数据，保证项目可以正常运行
  return Promise.resolve({
    data: []
  })
}

// 根据类型获取字典数据
function getDictByTypeAPI(type) {
  // 模拟一些常用的字典数据
  const mockDict = {
    'hidden': [
      { label: '显示', value: '0' },
      { label: '隐藏', value: '1' }
    ],
    'authType': [
      { label: '菜单', value: 'M' },
      { label: '页面', value: 'C' },
      { label: '按钮', value: 'B' }
    ],
    'status': [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' }
    ]
  }

  return Promise.resolve({
    data: mockDict[type] || []
  })
}
