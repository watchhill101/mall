const mongoose = require('mongoose');
const PersonInCharge = require('../moudle/person/personInCharge');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/mall', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 初始化负责人数据（作为角色使用）
const initRoleData = async () => {
  try {
    console.log('🔄 开始初始化负责人数据...');

    // 检查是否已有数据
    const existingCount = await PersonInCharge.countDocuments();
    if (existingCount > 0) {
      console.log('✅ 已存在负责人数据，跳过初始化');
      return;
    }

    // 插入测试负责人数据
    const persons = [
      {
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        position: '超级管理员',
        department: '管理部',
        level: 'admin',
        status: 'active'
      },
      {
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        position: '部门经理',
        department: '运营部',
        level: 'manager',
        status: 'active'
      },
      {
        name: '王五',
        phone: '13800138003',
        email: 'wangwu@example.com',
        position: '操作员',
        department: '业务部',
        level: 'staff',
        status: 'active'
      },
      {
        name: '赵六',
        phone: '13800138004',
        email: 'zhaoliu@example.com',
        position: '财务专员',
        department: '财务部',
        level: 'staff',
        status: 'active'
      },
      {
        name: '孙七',
        phone: '13800138005',
        email: 'sunqi@example.com',
        position: '客服主管',
        department: '客服部',
        level: 'manager',
        status: 'active'
      }
    ];

    const savedPersons = await PersonInCharge.insertMany(persons);
    console.log('✅ 成功插入负责人数据:', savedPersons.length, '条');

    savedPersons.forEach(person => {
      console.log(`- ${person.name} (${person.position}) - ID: ${person._id}`);
    });

  } catch (error) {
    console.error('❌ 初始化负责人数据失败:', error);
  } finally {
    mongoose.disconnect();
    console.log('📡 数据库连接已关闭');
  }
};

initRoleData(); 