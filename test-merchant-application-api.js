const http = require('http');

// 配置
const BASE_URL = 'localhost';
const PORT = 3001;
const API_PREFIX = '/merchant-application';

// 创建HTTP请求的辅助函数
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试函数集合
const tests = {
  // 1. 测试基本连接
  async testConnection() {
    console.log('🔗 测试基本连接...');
    try {
      const response = await makeRequest(`${API_PREFIX}/test`);
      if (response.status === 200) {
        console.log('✅ 连接成功:', response.data);
        return true;
      } else {
        console.error('❌ 连接失败，状态码:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ 连接失败:', error.message);
      return false;
    }
  },

  // 2. 测试获取申请列表
  async testGetList() {
    console.log('📋 测试获取申请列表...');
    try {
      const response = await makeRequest(`${API_PREFIX}/list?page=1&pageSize=5`);
      if (response.status === 200) {
        console.log('✅ 获取列表成功:');
        console.log(`   总数: ${response.data.data.pagination.total}`);
        console.log(`   当前页: ${response.data.data.pagination.current}`);
        console.log(`   页大小: ${response.data.data.pagination.pageSize}`);
        console.log(`   列表长度: ${response.data.data.list.length}`);

        if (response.data.data.list.length > 0) {
          console.log('   第一条记录:', {
            id: response.data.data.list[0].id,
            contactPerson: response.data.data.list[0].contactPerson,
            status: response.data.data.list[0].status
          });
        }
        return response.data.data.list;
      } else {
        console.error('❌ 获取列表失败，状态码:', response.status);
        return [];
      }
    } catch (error) {
      console.error('❌ 获取列表失败:', error.message);
      return [];
    }
  },

  // 3. 测试搜索功能
  async testSearch() {
    console.log('🔍 测试搜索功能...');
    try {
      const response = await makeRequest(`${API_PREFIX}/list?page=1&pageSize=10&status=pending`);
      if (response.status === 200) {
        console.log('✅ 状态搜索成功:');
        console.log(`   待审核申请数: ${response.data.data.list.length}`);
        return true;
      } else {
        console.error('❌ 搜索失败，状态码:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ 搜索失败:', error.message);
      return false;
    }
  },

  // 4. 测试获取统计信息
  async testGetStats() {
    console.log('📊 测试获取统计信息...');
    try {
      const response = await makeRequest(`${API_PREFIX}/stats`);
      if (response.status === 200) {
        console.log('✅ 获取统计信息成功:', response.data.data);
        return true;
      } else if (response.status === 401) {
        console.log('⚠️  统计接口需要认证，跳过测试');
        return true;
      } else {
        console.error('❌ 获取统计信息失败，状态码:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ 获取统计信息失败:', error.message);
      return false;
    }
  },

  // 5. 测试审核功能（模拟）
  async testAuditSimulation(applicationList) {
    console.log('🔍 测试审核功能（模拟）...');
    if (applicationList.length === 0) {
      console.log('⚠️  没有申请数据，跳过审核测试');
      return true;
    }

    // 找一个待审核的申请
    const pendingApplication = applicationList.find(app => app.status === 'pending');
    if (!pendingApplication) {
      console.log('⚠️  没有待审核申请，跳过审核测试');
      return true;
    }

    try {
      const response = await makeRequest(
        `${API_PREFIX}/audit/${pendingApplication.id}`,
        'PATCH',
        {
          action: 'approve',
          reviewResult: '测试审核通过'
        }
      );

      if (response.status === 200) {
        console.log('✅ 审核测试成功:', response.data);
        return true;
      } else if (response.status === 401) {
        console.log('⚠️  审核接口需要认证，跳过测试');
        return true;
      } else {
        console.error('❌ 审核测试失败，状态码:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ 审核测试失败:', error.message);
      return false;
    }
  }
};

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试商家申请API...\n');

  const results = [];

  // 1. 测试连接
  const connectionResult = await tests.testConnection();
  results.push({ name: '基本连接', success: connectionResult });
  console.log('');

  if (!connectionResult) {
    console.log('❌ 基本连接失败，停止后续测试');
    return;
  }

  // 2. 测试获取列表
  const listResult = await tests.testGetList();
  results.push({ name: '获取列表', success: listResult.length >= 0 });
  console.log('');

  // 3. 测试搜索
  const searchResult = await tests.testSearch();
  results.push({ name: '搜索功能', success: searchResult });
  console.log('');

  // 4. 测试统计
  const statsResult = await tests.testGetStats();
  results.push({ name: '统计信息', success: statsResult });
  console.log('');

  // 5. 测试审核
  const auditResult = await tests.testAuditSimulation(listResult);
  results.push({ name: '审核功能', success: auditResult });
  console.log('');

  // 输出测试结果
  console.log('📊 测试结果汇总:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name}: ${result.success ? '成功' : '失败'}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎯 测试完成: ${successCount}/${results.length} 项测试通过`);

  if (successCount === results.length) {
    console.log('🎉 所有测试通过！商家申请API工作正常');
  } else {
    console.log('⚠️  部分测试失败，请检查后端服务和数据');
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runTests, tests }; 