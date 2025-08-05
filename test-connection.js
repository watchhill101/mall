// 测试前后端连接的简单脚本
const testAPI = async () => {
  console.log('🧪 测试AccountDetail页面后端连接...')

  try {
    // 使用前端的API配置
    const response = await fetch('http://localhost:3000/account-detail/test')
    const data = await response.json()

    if (data.code === 200) {
      console.log('✅ 后端连接成功!')
      console.log('📊 测试数据:', data)

      // 测试列表接口
      const listResponse = await fetch('http://localhost:3000/account-detail/list?page=1&pageSize=5')
      const listData = await listResponse.json()

      if (listData.code === 200) {
        console.log('✅ 账户明细列表接口正常!')
        console.log('📋 数据条数:', listData.data?.list?.length || 0)

        // 测试统计接口
        const statsResponse = await fetch('http://localhost:3000/account-detail/stats')
        const statsData = await statsResponse.json()

        if (statsData.code === 200) {
          console.log('✅ 统计信息接口正常!')
          console.log('💰 统计数据:', statsData.data)
          console.log('🎉 所有接口测试通过!')
        } else {
          console.log('❌ 统计接口异常:', statsData.message)
        }
      } else {
        console.log('❌ 列表接口异常:', listData.message)
      }
    } else {
      console.log('❌ 后端连接失败:', data.message)
    }
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message)
    console.log('💡 请确保后端服务已启动 (npm start)')
  }
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // Node.js环境
  const https = require('https')
  const http = require('http')

  global.fetch = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({
            ok: res.statusCode < 400,
            json: () => Promise.resolve(JSON.parse(data))
          })
        })
      })
      req.on('error', reject)
      if (options.body) req.write(options.body)
      req.end()
    })
  }
}

testAPI() 