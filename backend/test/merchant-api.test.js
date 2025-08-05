const axios = require('axios');

const baseURL = 'http://localhost:3001';
const api = axios.create({ baseURL });

// 测试用的认证Token（需要先登录获取）
let authToken = '';

async function testMerchantAPI() {
  try {
    console.log('🧪 开始测试Merchant模块前后端连接...');

    // 1. 先测试登录获取Token
    console.log('\n1️⃣ 测试登录获取Token...');

    // 生成验证码
    const captchaResponse = await api.get('/captcha/generate');
    const sessionId = captchaResponse.data.data.sessionId;
    console.log('✅ 验证码生成成功');

    // 登录
    const loginResponse = await api.post('/auth/login', {
      loginAccount: 'admin',
      password: '123456',
      captcha: 'TEST', // 实际环境中需要真实验证码
      sessionId: sessionId
    });

    authToken = loginResponse.data.data.accessToken;
    console.log('✅ 登录成功，获取到Token');

    // 设置认证头
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // 2. 测试获取商户列表
    console.log('\n2️⃣ 测试获取商户列表...');
    const listResponse = await api.get('/merchant/list?page=1&pageSize=10');
    console.log('✅ 获取商户列表成功:', {
      总数: listResponse.data.data.pagination.total,
      当前页数据量: listResponse.data.data.list.length
    });

    // 3. 测试创建商户
    console.log('\n3️⃣ 测试创建商户...');
    const newMerchant = {
      name: '测试商户' + Date.now(),
      merchantType: 'retail',
      isSelfOperated: false,
      phone: '13800138' + String(Date.now()).slice(-3),
      address: '测试地址123号',
      logoUrl: 'https://via.placeholder.com/100',
      personInCharge: '507f1f77bcf86cd799439011', // 需要存在的负责人ID
      role: '507f1f77bcf86cd799439012', // 需要存在的角色ID
      serviceCharge: 0.1,
      businessLicense: 'TEST-LICENSE-001',
      taxNumber: '12345678901234567X'
    };

    const createResponse = await api.post('/merchant/create', newMerchant);
    const createdMerchantId = createResponse.data.data._id;
    console.log('✅ 创建商户成功:', {
      商户ID: createdMerchantId,
      商户名称: createResponse.data.data.name
    });

    // 4. 测试获取商户详情
    console.log('\n4️⃣ 测试获取商户详情...');
    const detailResponse = await api.get(`/merchant/detail/${createdMerchantId}`);
    console.log('✅ 获取商户详情成功:', detailResponse.data.data.name);

    // 5. 测试更新商户
    console.log('\n5️⃣ 测试更新商户...');
    const updateData = {
      name: '更新后的商户名称',
      address: '更新后的地址456号'
    };
    const updateResponse = await api.put(`/merchant/update/${createdMerchantId}`, updateData);
    console.log('✅ 更新商户成功:', updateResponse.data.data.name);

    // 6. 测试更新商户状态
    console.log('\n6️⃣ 测试更新商户状态...');
    const statusResponse = await api.patch(`/merchant/status/${createdMerchantId}`, {
      status: 'active'
    });
    console.log('✅ 更新商户状态成功:', statusResponse.data.data.status);

    // 7. 测试获取商户统计
    console.log('\n7️⃣ 测试获取商户统计...');
    const statsResponse = await api.get('/merchant/stats');
    console.log('✅ 获取商户统计成功:', {
      总商户数: statsResponse.data.data.totalCount,
      正常状态: statsResponse.data.data.statusStats.active,
      审核中: statsResponse.data.data.statusStats.inReview
    });

    // 8. 测试删除商户
    console.log('\n8️⃣ 测试删除商户...');
    const deleteResponse = await api.delete(`/merchant/delete/${createdMerchantId}`);
    console.log('✅ 删除商户成功');

    console.log('\n🎉 所有Merchant API测试通过！');

  } catch (error) {
    console.error('\n❌ 测试失败:', {
      状态码: error.response?.status,
      错误信息: error.response?.data?.message || error.message,
      详细数据: error.response?.data
    });
  }
}

// 运行测试
if (require.main === module) {
  testMerchantAPI();
}

module.exports = testMerchantAPI; 