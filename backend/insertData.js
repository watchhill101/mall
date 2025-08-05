const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("./config");

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log("✅ MongoDB 连接成功");
  } catch (error) {
    console.error("❌ MongoDB 连接失败:", error);
    process.exit(1);
  }
}

// 直接插入数据到 MongoDB
async function insertData() {
  try {
    console.log("🚀 开始插入数据到 MongoDB...\n");

    await connectDB();

    const db = mongoose.connection.db;

    // 1. 插入角色数据
    console.log("🔧 插入角色数据...");
    const roles = [
      { name: "超级管理员" },
      { name: "系统管理员" },
      { name: "商品管理员" },
      { name: "订单管理员" },
      { name: "商家管理员" },
      { name: "财务管理员" },
      { name: "客服专员" },
      { name: "仓库管理员" },
    ];

    await db.collection("role").deleteMany({}); // 清空现有数据
    const roleResult = await db.collection("role").insertMany(roles);
    console.log(`  ✅ 插入 ${roleResult.insertedCount} 个角色`);

    // 2. 插入二级导航数据
    console.log("🧭 插入二级导航数据...");
    const secondaryNavigations = [
      // 系统管理
      { name: "用户管理", url: "/system/users" },
      { name: "角色管理", url: "/system/roles" },
      { name: "权限管理", url: "/system/permissions" },
      { name: "系统设置", url: "/system/settings" },
      { name: "操作日志", url: "/system/logs" },

      // 商品管理
      { name: "商品列表", url: "/goods/products" },
      { name: "商品分类", url: "/goods/categories" },
      { name: "商品审核", url: "/goods/audit" },
      { name: "库存管理", url: "/goods/inventory" },
      { name: "库存明细", url: "/goods/inventory-detail" },
      { name: "入库管理", url: "/goods/inbound" },
      { name: "出库管理", url: "/goods/outbound" },
      { name: "盘点管理", url: "/goods/stocktaking" },
      { name: "外部商品", url: "/goods/external" },
      { name: "商品回收站", url: "/goods/recycle" },

      // 订单管理
      { name: "订单列表", url: "/orders/list" },
      { name: "售后管理", url: "/orders/after-sales" },
      { name: "理货单", url: "/orders/tally" },
      { name: "分拣单", url: "/orders/sorting" },
      { name: "配货单", url: "/orders/allocation" },
      { name: "作业单", url: "/orders/work" },
      { name: "物流单", url: "/orders/logistics" },
      { name: "收款记录", url: "/orders/payment" },

      // 商家管理
      { name: "商家列表", url: "/merchants/list" },
      { name: "商家申请", url: "/merchants/applications" },
      { name: "商家账户", url: "/merchants/accounts" },
      { name: "账户明细", url: "/merchants/account-details" },
      { name: "提现管理", url: "/merchants/withdraws" },
      { name: "提现账户", url: "/merchants/withdraw-accounts" },
      { name: "结算订单", url: "/merchants/settlements" },
      { name: "账单管理", url: "/merchants/bills" },

      // 财务管理
      { name: "收支明细", url: "/finance/transactions" },
      { name: "对账管理", url: "/finance/reconciliation" },
      { name: "财务报表", url: "/finance/reports" },
      { name: "退款管理", url: "/finance/refunds" },

      // 数据统计
      { name: "销售统计", url: "/statistics/sales" },
      { name: "商品统计", url: "/statistics/products" },
      { name: "用户统计", url: "/statistics/users" },
      { name: "财务统计", url: "/statistics/finance" },
      { name: "运营报表", url: "/statistics/operations" },

      // 内容管理
      { name: "轮播图管理", url: "/content/banners" },
      { name: "公告管理", url: "/content/notices" },
      { name: "帮助中心", url: "/content/help" },
      { name: "页面配置", url: "/content/pages" },

      // 营销管理
      { name: "优惠券管理", url: "/marketing/coupons" },
      { name: "促销活动", url: "/marketing/promotions" },
      { name: "积分管理", url: "/marketing/points" },
      { name: "会员管理", url: "/marketing/members" },
    ];

    await db.collection("secondaryNavigation").deleteMany({});
    const secondaryResult = await db
      .collection("secondaryNavigation")
      .insertMany(secondaryNavigations);
    console.log(`  ✅ 插入 ${secondaryResult.insertedCount} 个二级导航`);

    // 获取插入的二级导航ID，用于关联一级导航
    const insertedSecondary = await db
      .collection("secondaryNavigation")
      .find({})
      .toArray();

    // 3. 插入一级导航数据（包含二级导航关联）
    console.log("📁 插入一级导航数据...");

    // 按模块分组二级导航
    const getSecondaryIds = (urls) => {
      return insertedSecondary
        .filter((item) => urls.includes(item.url))
        .map((item) => item._id);
    };

    const firstLevelNavigations = [
      {
        title: "系统管理",
        icon: "SettingOutlined",
        url: "/system",
        subTitle: "系统配置",
        subText: "用户、角色、权限管理",
        SecondaryNavigationID: getSecondaryIds([
          "/system/users",
          "/system/roles",
          "/system/permissions",
          "/system/settings",
          "/system/logs",
        ]),
      },
      {
        title: "商品管理",
        icon: "ShoppingOutlined",
        url: "/goods",
        subTitle: "商品中心",
        subText: "商品、分类、库存管理",
        SecondaryNavigationID: getSecondaryIds([
          "/goods/products",
          "/goods/categories",
          "/goods/audit",
          "/goods/inventory",
          "/goods/inventory-detail",
          "/goods/inbound",
          "/goods/outbound",
          "/goods/stocktaking",
          "/goods/external",
          "/goods/recycle",
        ]),
      },
      {
        title: "订单管理",
        icon: "FileTextOutlined",
        url: "/orders",
        subTitle: "订单中心",
        subText: "订单处理、售后服务",
        SecondaryNavigationID: getSecondaryIds([
          "/orders/list",
          "/orders/after-sales",
          "/orders/tally",
          "/orders/sorting",
          "/orders/allocation",
          "/orders/work",
          "/orders/logistics",
          "/orders/payment",
        ]),
      },
      {
        title: "商家管理",
        icon: "ShopOutlined",
        url: "/merchants",
        subTitle: "商家中心",
        subText: "商家信息、账户管理",
        SecondaryNavigationID: getSecondaryIds([
          "/merchants/list",
          "/merchants/applications",
          "/merchants/accounts",
          "/merchants/account-details",
          "/merchants/withdraws",
          "/merchants/withdraw-accounts",
          "/merchants/settlements",
          "/merchants/bills",
        ]),
      },
      {
        title: "财务管理",
        icon: "AccountBookOutlined",
        url: "/finance",
        subTitle: "财务中心",
        subText: "资金流水、对账管理",
        SecondaryNavigationID: getSecondaryIds([
          "/finance/transactions",
          "/finance/reconciliation",
          "/finance/reports",
          "/finance/refunds",
        ]),
      },
      {
        title: "数据统计",
        icon: "BarChartOutlined",
        url: "/statistics",
        subTitle: "数据中心",
        subText: "业务数据、统计分析",
        SecondaryNavigationID: getSecondaryIds([
          "/statistics/sales",
          "/statistics/products",
          "/statistics/users",
          "/statistics/finance",
          "/statistics/operations",
        ]),
      },
      {
        title: "内容管理",
        icon: "FileOutlined",
        url: "/content",
        subTitle: "内容中心",
        subText: "页面内容、广告管理",
        SecondaryNavigationID: getSecondaryIds([
          "/content/banners",
          "/content/notices",
          "/content/help",
          "/content/pages",
        ]),
      },
      {
        title: "营销管理",
        icon: "GiftOutlined",
        url: "/marketing",
        subTitle: "营销中心",
        subText: "促销活动、优惠券管理",
        SecondaryNavigationID: getSecondaryIds([
          "/marketing/coupons",
          "/marketing/promotions",
          "/marketing/points",
          "/marketing/members",
        ]),
      },
    ];

    await db.collection("firstLevelNavigation").deleteMany({});
    const firstLevelResult = await db
      .collection("firstLevelNavigation")
      .insertMany(firstLevelNavigations);
    console.log(`  ✅ 插入 ${firstLevelResult.insertedCount} 个一级导航`);

    // 4. 更新二级导航的一级导航关联
    console.log("🔗 更新二级导航关联...");
    const insertedFirstLevel = await db
      .collection("firstLevelNavigation")
      .find({})
      .toArray();

    for (const firstLevel of insertedFirstLevel) {
      for (const secondaryId of firstLevel.SecondaryNavigationID) {
        await db
          .collection("secondaryNavigation")
          .updateOne(
            { _id: secondaryId },
            { $set: { firstLevelNavigationID: firstLevel._id } }
          );
      }
    }
    console.log("  ✅ 二级导航关联更新完成");

    // 5. 插入超级管理员用户
    console.log("👤 插入超级管理员用户...");

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123456", salt);

    const allFirstLevelIds = insertedFirstLevel.map((item) => item._id);

    const superAdmin = {
      loginAccount: "superadmin",
      password: hashedPassword,
      email: "superadmin@mall.com",
      FirstLevelNavigationID: allFirstLevelIds,
    };

    await db.collection("user").deleteMany({ loginAccount: "superadmin" });
    const userResult = await db.collection("user").insertOne(superAdmin);
    console.log("  ✅ 超级管理员创建成功");

    // 6. 显示统计信息
    console.log("\n📊 数据插入完成统计:");
    console.log(`   角色数量: ${roleResult.insertedCount}`);
    console.log(`   一级导航: ${firstLevelResult.insertedCount}`);
    console.log(`   二级导航: ${secondaryResult.insertedCount}`);
    console.log(`   用户数量: 1`);

    console.log("\n🔐 超级管理员登录信息:");
    console.log("   账号: superadmin");
    console.log("   密码: admin123456");
    console.log("   邮箱: superadmin@mall.com");
    console.log(`   权限: 所有模块 (${allFirstLevelIds.length}个一级导航)`);

    console.log("\n🎉 数据插入完成！");
  } catch (error) {
    console.error("❌ 数据插入失败:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📴 数据库连接已关闭");
    process.exit(0);
  }
}

// 运行脚本
insertData();
