const mongoose = require('mongoose');
const config = require('../config');
const FirstLevelNavigation = require('../moudle/navigation/firstLevelNavigation');
const SecondaryNavigation = require('../moudle/navigation/secondaryNavigation');

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}

async function insertNavigationData() {
  try {
    // 先连接数据库
    await connectDB();
    
    console.log('开始插入导航数据...');
    
    // 清空现有数据（可选）
    await FirstLevelNavigation.deleteMany({});
    await SecondaryNavigation.deleteMany({});
    console.log('已清空现有导航数据');

    // 1. 插入首页一级导航
    const homeNavigation = await FirstLevelNavigation.create({
      title: '首页',
      icon: 'HomeOutlined',
      url: '/home',
      subTitle: '系统首页',
      subText: '查看系统概览和数据统计',
      SecondaryNavigationID: []
    });
    console.log('首页导航插入成功');

    // 2. 创建商家相关的二级导航
    const tempId = new mongoose.Types.ObjectId();
    const merchantSecondaryNavs = await SecondaryNavigation.insertMany([
      { name: '商家管理', url: '/shops/merchants', firstLevelNavigationID: tempId },
      { name: '商家账号', url: '/shops/merchant-account', firstLevelNavigationID: tempId },
      { name: '提现账号', url: '/shops/withdraw-account', firstLevelNavigationID: tempId },
      { name: '账户明细', url: '/shops/account-detail', firstLevelNavigationID: tempId },
      { name: '商家提现', url: '/shops/merchant-withdraw', firstLevelNavigationID: tempId },
      { name: '结算订单', url: '/shops/settlement-order', firstLevelNavigationID: tempId },
      { name: '结账单', url: '/shops/settlement-bill', firstLevelNavigationID: tempId },
      { name: '商家申请', url: '/shops/merchant-application', firstLevelNavigationID: tempId },
      { name: '设备管理', url: '/shops/device-management', firstLevelNavigationID: tempId }
    ]);

    // 3. 插入商家一级导航
    const shopsNavigation = await FirstLevelNavigation.create({
      title: '商家',
      icon: 'ShopOutlined',
      url: '/shops',
      subTitle: '商家管理',
      subText: '管理商家信息、账户和设备',
      SecondaryNavigationID: merchantSecondaryNavs.map(nav => nav._id)
    });

    // 更新商家二级导航的一级导航ID
    await SecondaryNavigation.updateMany(
      { _id: { $in: merchantSecondaryNavs.map(nav => nav._id) } },
      { firstLevelNavigationID: shopsNavigation._id }
    );
    console.log('商家导航插入成功');

    // 4. 创建商品相关的二级导航
    const tempId2 = new mongoose.Types.ObjectId();
    const goodsSecondaryNavs = await SecondaryNavigation.insertMany([
      { name: '商品列表', url: '/goods/product-list', firstLevelNavigationID: tempId2 },
      { name: '审核列表', url: '/goods/audit-list', firstLevelNavigationID: tempId2 },
      { name: '回收站', url: '/goods/recycle-bin', firstLevelNavigationID: tempId2 },
      { name: '商品分类', url: '/goods/product-category', firstLevelNavigationID: tempId2 },
      { name: '外部商品库', url: '/goods/external-product', firstLevelNavigationID: tempId2 },
      { name: '当前库存', url: '/goods/inventory/current-stock', firstLevelNavigationID: tempId2 },
      { name: '入库', url: '/goods/inventory/stock-in', firstLevelNavigationID: tempId2 },
      { name: '出库', url: '/goods/inventory/stock-out', firstLevelNavigationID: tempId2 },
      { name: '盘点', url: '/goods/inventory/stocktake', firstLevelNavigationID: tempId2 },
      { name: '出入库明细', url: '/goods/inventory/stock-details', firstLevelNavigationID: tempId2 }
    ]);

    // 5. 插入商品一级导航
    const goodsNavigation = await FirstLevelNavigation.create({
      title: '商品',
      icon: 'GoodsOutlined',
      url: '/goods',
      subTitle: '商品管理',
      subText: '管理商品信息、分类和库存',
      SecondaryNavigationID: goodsSecondaryNavs.map(nav => nav._id)
    });

    // 更新商品二级导航的一级导航ID
    await SecondaryNavigation.updateMany(
      { _id: { $in: goodsSecondaryNavs.map(nav => nav._id) } },
      { firstLevelNavigationID: goodsNavigation._id }
    );
    console.log('商品导航插入成功');

    // 6. 创建订单相关的二级导航
    const tempId3 = new mongoose.Types.ObjectId();
    const ordersSecondaryNavs = await SecondaryNavigation.insertMany([
      { name: '订单', url: '/orders/orders-list', firstLevelNavigationID: tempId3 },
      { name: '售后', url: '/orders/afterSales', firstLevelNavigationID: tempId3 },
      { name: '理货单', url: '/orders/tallySheet', firstLevelNavigationID: tempId3 },
      { name: '分拣单', url: '/orders/SortingList', firstLevelNavigationID: tempId3 },
      { name: '收款记录', url: '/orders/payment-record', firstLevelNavigationID: tempId3 },
      { name: '配货单', url: '/orders/allocation-order', firstLevelNavigationID: tempId3 },
      { name: '作业单', url: '/orders/work-order', firstLevelNavigationID: tempId3 },
      { name: '物流单', url: '/orders/logistics-order', firstLevelNavigationID: tempId3 }
    ]);

    // 7. 插入订单一级导航
    const ordersNavigation = await FirstLevelNavigation.create({
      title: '订单',
      icon: 'OrdersOutlined',
      url: '/orders',
      subTitle: '订单管理',
      subText: '处理订单、售后和物流相关业务',
      SecondaryNavigationID: ordersSecondaryNavs.map(nav => nav._id)
    });

    // 更新订单二级导航的一级导航ID
    await SecondaryNavigation.updateMany(
      { _id: { $in: ordersSecondaryNavs.map(nav => nav._id) } },
      { firstLevelNavigationID: ordersNavigation._id }
    );
    console.log('订单导航插入成功');

    // 8. 创建系统设置相关的二级导航
    const tempId4 = new mongoose.Types.ObjectId();
    const systemSecondaryNavs = await SecondaryNavigation.insertMany([
      { name: '用户', url: '/system/users', firstLevelNavigationID: tempId4 },
      { name: '轮播图', url: '/system/carousel', firstLevelNavigationID: tempId4 },
      { name: '用户权限', url: '/system/user-permissions', firstLevelNavigationID: tempId4 }
    ]);

    // 9. 插入系统设置一级导航
    const systemNavigation = await FirstLevelNavigation.create({
      title: '系统设置',
      icon: 'SettingOutlined',
      url: '/system',
      subTitle: '系统设置',
      subText: '管理用户、轮播图和权限配置',
      SecondaryNavigationID: systemSecondaryNavs.map(nav => nav._id)
    });

    // 更新系统设置二级导航的一级导航ID
    await SecondaryNavigation.updateMany(
      { _id: { $in: systemSecondaryNavs.map(nav => nav._id) } },
      { firstLevelNavigationID: systemNavigation._id }
    );
    console.log('系统设置导航插入成功');

    console.log('\n=== 导航数据插入完成 ===');
    console.log('一级导航数量:', await FirstLevelNavigation.countDocuments());
    console.log('二级导航数量:', await SecondaryNavigation.countDocuments());

    // 输出插入的数据供验证
    const allFirstLevel = await FirstLevelNavigation.find({});
    console.log('\n插入的一级导航:');
    allFirstLevel.forEach(nav => {
      console.log(`- ${nav.title} (${nav.url}) - 二级导航: ${nav.SecondaryNavigationID.length}个`);
    });

  } catch (error) {
    console.error('插入导航数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 执行插入操作
insertNavigationData();
