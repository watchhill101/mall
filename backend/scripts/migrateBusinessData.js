const mongoose = require('mongoose');
const config = require('../config');

// 导入模型
const Product = require('../moudle/goods/product');
const ProductCategory = require('../moudle/goods/productCategory');
const Merchant = require('../moudle/merchant/merchant');
const PersonInCharge = require('../moudle/person/personInCharge');
const Role = require('../moudle/role/role');
const Order = require('../moudle/goodsOrder/order');
const AfterSales = require('../moudle/goodsOrder/afterSales');

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

// 模拟数据生成
function generateMockData() {
  // 商品分类数据
  const categories = [
    {
      categoryId: 'CAT001',
      categoryName: '电子产品',
      businessType: 'retail',
      categoryLevel: 1,
      parentCategory: null,
      categoryImages: {
        icon: 'https://dummyimage.com/100x100/50B347/FFF&text=电子',
        banner: 'https://dummyimage.com/200x200/50B347/FFF&text=电子产品'
      },
      sortOrder: 1
    },
    {
      categoryId: 'CAT002',
      categoryName: '数码配件',
      businessType: 'retail',
      categoryLevel: 1,
      parentCategory: null,
      categoryImages: {
        icon: 'https://dummyimage.com/100x100/50B347/FFF&text=数码',
        banner: 'https://dummyimage.com/200x200/50B347/FFF&text=数码配件'
      },
      sortOrder: 2
    },
    {
      categoryId: 'CAT003',
      categoryName: '家用电器',
      businessType: 'retail',
      categoryLevel: 1,
      parentCategory: null,
      categoryImages: {
        icon: 'https://dummyimage.com/100x100/50B347/FFF&text=家电',
        banner: 'https://dummyimage.com/200x200/50B347/FFF&text=家用电器'
      },
      sortOrder: 3
    }
  ];

  // 角色数据
  const roles = [
    {
      name: '商家管理员'
    },
    {
      name: '普通商家'
    }
  ];

  // 负责人数据
  const personInCharges = [
    {
      name: '张经理',
      phone: '13800138001',
      email: 'zhang@merchant1.com',
      position: '店长',
      idCard: '110101199001011234'
    },
    {
      name: '李经理',
      phone: '13800138002',
      email: 'li@merchant2.com',
      position: '运营经理',
      idCard: '110101199002021234'
    },
    {
      name: '王经理',
      phone: '13800138003',
      email: 'wang@merchant3.com',
      position: '店长',
      idCard: '110101199003031234'
    }
  ];

  // 商家数据
  const merchants = [
    {
      name: '科技数码专营店',
      merchantType: 'retail',
      isSelfOperated: false,
      phone: '010-12345678',
      address: '北京市朝阳区科技园区1号',
      logoUrl: 'https://dummyimage.com/100x100/50B347/FFF&text=科技',
      serviceCharge: 0.05,
      status: 'active',
      businessLicense: 'BL001234567890',
      taxNumber: 'TAX001234567890'
    },
    {
      name: '家电生活馆',
      merchantType: 'retail',
      isSelfOperated: false,
      phone: '010-12345679',
      address: '北京市海淀区中关村大街2号',
      logoUrl: 'https://dummyimage.com/100x100/50B347/FFF&text=家电',
      serviceCharge: 0.08,
      status: 'active',
      businessLicense: 'BL001234567891',
      taxNumber: 'TAX001234567891'
    },
    {
      name: '潮流配件店',
      merchantType: 'retail',
      isSelfOperated: true,
      phone: '010-12345680',
      address: '北京市西城区王府井大街3号',
      logoUrl: 'https://dummyimage.com/100x100/50B347/FFF&text=潮流',
      serviceCharge: 0.03,
      status: 'active',
      businessLicense: 'BL001234567892',
      taxNumber: 'TAX001234567892'
    }
  ];

  return { categories, roles, personInCharges, merchants };
}

// 生成商品数据
function generateProducts(categories, merchants) {
  const products = [
    {
      productId: 'PROD001',
      productName: '智能手表',
      businessType: 'retail',
      productInfo: {
        description: '高端智能手表，支持健康监测',
        specifications: '42mm 不锈钢表盘',
        brand: 'TechWatch',
        model: 'TW-001',
        unit: '只',
        images: ['https://dummyimage.com/200x200/50B347/FFF&text=手表']
      },
      pricing: {
        salePrice: { min: 876, max: 876 },
        marketPrice: 1000,
        cost: 600
      },
      inventory: {
        currentStock: 432,
        totalStock: 983,
        reservedStock: 0
      },
      status: 'onSale',
      isExternal: false,
      salesData: {
        totalSales: 120,
        monthlyStock: 432
      }
    },
    {
      productId: 'PROD002',
      productName: '蓝牙耳机',
      businessType: 'retail',
      productInfo: {
        description: '无线蓝牙耳机，降噪功能',
        specifications: '入耳式 降噪',
        brand: 'SoundMax',
        model: 'SM-BT200',
        unit: '副',
        images: ['https://dummyimage.com/200x200/50B347/FFF&text=耳机']
      },
      pricing: {
        salePrice: { min: 645, max: 645 },
        marketPrice: 799,
        cost: 400
      },
      inventory: {
        currentStock: 285,
        totalStock: 678,
        reservedStock: 15
      },
      status: 'offSale',
      isExternal: false,
      salesData: {
        totalSales: 89,
        monthlyStock: 285
      }
    },
    {
      productId: 'PROD003',
      productName: '空气净化器',
      businessType: 'retail',
      productInfo: {
        description: '家用空气净化器，除甲醛PM2.5',
        specifications: '适用面积30-50㎡',
        brand: 'CleanAir',
        model: 'CA-300',
        unit: '台',
        images: ['https://dummyimage.com/200x200/50B347/FFF&text=净化器']
      },
      pricing: {
        salePrice: { min: 522, max: 522 },
        marketPrice: 699,
        cost: 350
      },
      inventory: {
        currentStock: 769,
        totalStock: 921,
        reservedStock: 25
      },
      status: 'onSale',
      isExternal: false,
      salesData: {
        totalSales: 156,
        monthlyStock: 769
      }
    }
  ];

  return products;
}

// 生成订单数据
function generateOrders(products, merchants) {
  const orders = [
    {
      orderId: 'ORD20250806001',
      orderType: 'retail',
      orderStatus: 'completed',
      customer: {
        customerId: 'CUST001',
        customerName: '张三',
        customerPhone: '13800138001',
        customerAddress: '北京市朝阳区某某小区1号楼'
      },
      products: [
        {
          productName: '智能手表',
          productCode: 'PROD001',
          specifications: '42mm 不锈钢表盘',
          quantity: 1,
          unitPrice: 876,
          totalPrice: 876,
          discount: 0,
          unit: '只'
        }
      ],
      pricing: {
        subtotal: 876,
        discountAmount: 0,
        shippingFee: 15,
        totalAmount: 891
      },
      payment: {
        paymentMethod: 'wechat',
        paymentStatus: 'paid',
        paidAmount: 891,
        paymentTime: new Date('2025-08-06T10:30:00')
      },
      shipping: {
        shippingMethod: 'express',
        shippingAddress: '北京市朝阳区某某小区1号楼',
        recipientName: '张三',
        recipientPhone: '13800138001'
      },
      timeline: {
        orderTime: new Date('2025-08-06T10:00:00'),
        confirmTime: new Date('2025-08-06T10:05:00'),
        paymentTime: new Date('2025-08-06T10:30:00'),
        shipTime: new Date('2025-08-06T14:00:00'),
        deliveryTime: new Date('2025-08-07T16:00:00')
      }
    },
    {
      orderId: 'ORD20250806002',
      orderType: 'retail',
      orderStatus: 'shipped',
      customer: {
        customerId: 'CUST002',
        customerName: '李四',
        customerPhone: '13800138002',
        customerAddress: '北京市海淀区某某大厦2层'
      },
      products: [
        {
          productName: '蓝牙耳机',
          productCode: 'PROD002',
          specifications: '入耳式 降噪',
          quantity: 2,
          unitPrice: 645,
          totalPrice: 1290,
          discount: 50,
          unit: '副'
        }
      ],
      pricing: {
        subtotal: 1290,
        discountAmount: 50,
        shippingFee: 20,
        totalAmount: 1260
      },
      payment: {
        paymentMethod: 'alipay',
        paymentStatus: 'paid',
        paidAmount: 1260,
        paymentTime: new Date('2025-08-06T11:45:00')
      },
      shipping: {
        shippingMethod: 'express',
        shippingAddress: '北京市海淀区某某大厦2层',
        recipientName: '李四',
        recipientPhone: '13800138002'
      },
      timeline: {
        orderTime: new Date('2025-08-06T11:00:00'),
        confirmTime: new Date('2025-08-06T11:10:00'),
        paymentTime: new Date('2025-08-06T11:45:00'),
        shipTime: new Date('2025-08-06T15:30:00')
      }
    }
  ];

  return orders;
}

// 生成售后数据
function generateAfterSales(orders) {
  const afterSales = [
    {
      afterSalesId: 'AS20250806001',
      afterSalesType: 'refund',
      status: 'completed',
      customer: {
        customerId: 'CUST001',
        customerName: '张三',
        customerPhone: '13800138001'
      },
      products: [
        {
          productName: '智能手表',
          quantity: 1,
          unitPrice: 876,
          totalAmount: 876,
          reason: '商品质量问题'
        }
      ],
      applicationInfo: {
        applicationTime: new Date('2025-08-06T15:00:00'),
        applicationReason: '商品质量问题',
        description: '收到商品后发现屏幕有划痕，申请退款',
        images: ['https://example.com/image1.jpg']
      },
      processingInfo: {
        processingTime: new Date('2025-08-06T18:00:00'),
        processingNote: '质量问题确认，同意退款',
        solution: '全额退款'
      },
      refundInfo: {
        refundAmount: 876,
        refundMethod: 'original',
        refundTime: new Date('2025-08-06T19:00:00'),
        refundStatus: 'completed'
      },
      notes: '质量问题，客户满意处理结果'
    }
  ];

  return afterSales;
}

async function migrateData() {
  try {
    await connectDB();

    console.log('🧹 清理现有数据...');
    await Promise.all([
      Product.deleteMany({}),
      ProductCategory.deleteMany({}),
      Merchant.deleteMany({}),
      PersonInCharge.deleteMany({}),
      Role.deleteMany({}),
      Order.deleteMany({}),
      AfterSales.deleteMany({})
    ]);

    // 生成基础数据
    const { categories, roles, personInCharges, merchants } = generateMockData();

    console.log('📦 插入角色数据...');
    const insertedRoles = await Role.insertMany(roles);
    console.log(`✅ 插入了 ${insertedRoles.length} 个角色`);

    console.log('👤 插入负责人数据...');
    const insertedPersonInCharges = await PersonInCharge.insertMany(personInCharges);
    console.log(`✅ 插入了 ${insertedPersonInCharges.length} 个负责人`);

    console.log('🏪 插入商家数据...');
    // 为商家关联负责人和角色
    const merchantsWithRefs = merchants.map((merchant, index) => ({
      ...merchant,
      personInCharge: insertedPersonInCharges[index]._id,
      role: insertedRoles[index % insertedRoles.length]._id
    }));
    const insertedMerchants = await Merchant.insertMany(merchantsWithRefs);
    console.log(`✅ 插入了 ${insertedMerchants.length} 个商家`);

    console.log('🏷️ 插入商品分类数据...');
    const categoriesWithRefs = categories.map(category => ({
      ...category,
      createBy: insertedPersonInCharges[0]._id // 使用第一个负责人作为创建人
    }));
    const insertedCategories = await ProductCategory.insertMany(categoriesWithRefs);
    console.log(`✅ 插入了 ${insertedCategories.length} 个商品分类`);

    console.log('📱 插入商品数据...');
    // 生成商品数据并关联分类和商家
    const products = generateProducts(insertedCategories, insertedMerchants);
    const productsWithRefs = products.map((product, index) => ({
      ...product,
      productCategory: insertedCategories[index % insertedCategories.length]._id,
      merchant: insertedMerchants[index % insertedMerchants.length]._id,
      createBy: insertedPersonInCharges[0]._id // 使用第一个负责人作为创建人
    }));
    const insertedProducts = await Product.insertMany(productsWithRefs);
    console.log(`✅ 插入了 ${insertedProducts.length} 个商品`);

    console.log('📋 插入订单数据...');
    // 生成订单数据并关联商品和商家
    const orders = generateOrders(insertedProducts, insertedMerchants);
    const ordersWithRefs = orders.map((order, index) => ({
      ...order,
      merchant: insertedMerchants[index % insertedMerchants.length]._id,
      createBy: insertedPersonInCharges[0]._id, // 添加创建人
      products: order.products.map(p => ({
        ...p,
        product: insertedProducts.find(prod => prod.productName === p.productName)?._id
      }))
    }));
    const insertedOrders = await Order.insertMany(ordersWithRefs);
    console.log(`✅ 插入了 ${insertedOrders.length} 个订单`);

    console.log('🔄 插入售后数据...');
    // 生成售后数据并关联订单
    const afterSales = generateAfterSales(insertedOrders);
    const afterSalesWithRefs = afterSales.map((as, index) => ({
      ...as,
      order: insertedOrders[index % insertedOrders.length]._id,
      merchant: insertedMerchants[index % insertedMerchants.length]._id,
      createBy: insertedPersonInCharges[0]._id // 添加创建人
    }));
    const insertedAfterSales = await AfterSales.insertMany(afterSalesWithRefs);
    console.log(`✅ 插入了 ${insertedAfterSales.length} 个售后记录`);

    console.log('\n🎉 数据迁移完成！');
    console.log('===============================');
    console.log(`👥 角色: ${insertedRoles.length} 个`);
    console.log(`👤 负责人: ${insertedPersonInCharges.length} 个`);
    console.log(`🏪 商家: ${insertedMerchants.length} 个`);
    console.log(`🏷️ 商品分类: ${insertedCategories.length} 个`);
    console.log(`📱 商品: ${insertedProducts.length} 个`);
    console.log(`📋 订单: ${insertedOrders.length} 个`);
    console.log(`🔄 售后: ${insertedAfterSales.length} 个`);
    console.log('===============================');

  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 执行迁移
geichumigrateData();
