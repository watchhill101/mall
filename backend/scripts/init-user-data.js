const mongoose = require('mongoose');
const User = require('../moudle/user/user');
const config = require('../config/index');

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 初始化用户数据
async function initUserData() {
  try {
    console.log('🚀 开始初始化用户数据...');

    // 清空现有用户数据（谨慎操作）
    // await User.deleteMany({});
    // console.log('🗑️ 已清空现有用户数据');

    // 创建测试用户数据
    const testUsers = [
      {
        username: 'admin',
        loginAccount: 'admin', // 添加 loginAccount 以兼容现有索引
        password: '123456',
        email: 'admin@mall.com',
        phone: '13800138000',
        role: 'admin',
        status: 'active',
        nickname: '系统管理员',
        isVip: true,
        FirstLevelNavigationID: []
      },
      {
        username: 'merchant1',
        loginAccount: 'merchant1',
        password: '123456',
        email: 'merchant1@mall.com',
        phone: '13800138001',
        role: 'merchant',
        status: 'active',
        nickname: '商户001',
        isVip: false,
        FirstLevelNavigationID: []
      },
      {
        username: 'user1',
        loginAccount: 'user1',
        password: '123456',
        email: 'user1@mall.com',
        phone: '13800138002',
        role: 'user',
        status: 'active',
        nickname: '普通用户001',
        isVip: false,
        FirstLevelNavigationID: []
      },
      {
        username: 'operator1',
        loginAccount: 'operator1',
        password: '123456',
        email: 'operator1@mall.com',
        phone: '13800138003',
        role: 'operator',
        status: 'active',
        nickname: '操作员001',
        isVip: false,
        FirstLevelNavigationID: []
      },
      {
        username: 'user2',
        loginAccount: 'user2',
        password: '123456',
        email: 'user2@mall.com',
        phone: '13800138004',
        role: 'user',
        status: 'inactive',
        nickname: '普通用户002',
        isVip: false,
        FirstLevelNavigationID: []
      }
    ];

    // 检查用户是否已存在，如果不存在则创建
    for (const userData of testUsers) {
      const existingUser = await User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ 创建用户: ${userData.username} (${userData.email})`);
      } else {
        console.log(`⚠️ 用户已存在: ${userData.username} (${userData.email})`);
      }
    }

    console.log('🎉 用户数据初始化完成！');
    
    // 显示统计信息
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const merchantUsers = await User.countDocuments({ role: 'merchant' });
    
    console.log('\n📊 用户统计信息:');
    console.log(`- 总用户数: ${totalUsers}`);
    console.log(`- 激活用户: ${activeUsers}`);
    console.log(`- 管理员: ${adminUsers}`);
    console.log(`- 商户: ${merchantUsers}`);

  } catch (error) {
    console.error('❌ 初始化用户数据失败:', error);
  }
}

// 主函数
async function main() {
  await connectDB();
  await initUserData();
  
  // 关闭数据库连接
  await mongoose.connection.close();
  console.log('👋 数据库连接已关闭');
  process.exit(0);
}

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { initUserData };
