var express = require('express');
var router = express.Router();
var ExcelJS = require('exceljs');
require('../moudle/index'); // 确保所有模型被加载
var { Product, ProductAudit, ProductRecycleBin, ProductCategory } = require('../moudle/goods');
var Merchant = require('../moudle/merchant/merchant'); // 直接导入merchant文件
var User = require('../moudle/user/user');
var {
  Order,
  AfterSales,
  TallyOrder,
  SortingOrder,
  PaymentRecord,
  AllocationOrder,
  WorkOrder,
  LogisticsOrder
} = require('../moudle/goodsOrder/index');
// ==================== 订单管理相关接口 ====================

// 获取订单列表
router.get('/orders', async function (req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderId,
      orderNumber,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderType,
      customerName,
      customerPhone,
      startDate,
      endDate
    } = req.query;

    let query = {};

    // 订单ID或订单号搜索（支持模糊搜索）
    if (orderId) query.orderId = new RegExp(orderId, 'i');
    if (orderNumber) query.orderId = new RegExp(orderNumber, 'i'); // orderNumber映射到orderId

    // 订单状态筛选（精确匹配）
    if (orderStatus) query.orderStatus = orderStatus;

    // 订单类型筛选（精确匹配）
    if (orderType) query.orderType = orderType;

    // 支付方式筛选（精确匹配）
    if (paymentMethod) query['payment.paymentMethod'] = paymentMethod;

    // 支付状态筛选（精确匹配）
    if (paymentStatus) query['payment.paymentStatus'] = paymentStatus;

    // 客户信息筛选（模糊搜索）
    if (customerName) query['customer.customerName'] = new RegExp(customerName, 'i');
    if (customerPhone) query['customer.customerPhone'] = new RegExp(customerPhone, 'i');

    // 商品名称搜索（在products数组中的productName字段）
    if (req.query.productName) {
      query['products.productName'] = new RegExp(req.query.productName, 'i');
    }

    // 金额范围筛选
    if (req.query.minAmount || req.query.maxAmount) {
      query['pricing.totalAmount'] = {};
      if (req.query.minAmount) query['pricing.totalAmount'].$gte = parseFloat(req.query.minAmount);
      if (req.query.maxAmount) query['pricing.totalAmount'].$lte = parseFloat(req.query.maxAmount);
    }

    // 时间范围筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + ' 23:59:59');
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      // 暂时移除populate，因为相关模型还未注册
      // .populate('merchant', 'name shopName') // 关联商家信息
      // .populate('createBy', 'loginAccount name') // 关联创建人信息
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      data: {
        list: orders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取订单列表成功'
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ code: 500, message: '获取订单列表失败', error: error.message });
  }
});

// 获取商品列表
router.get('/products', async function (req, res) {
  try {
    const products = await Product.find({});
    res.json({
      code: 200,
      data: products,
      message: '获取商品列表成功'
    });
  } catch (error) {
    console.log(error, '获取商品列表失败');
    res.status(500).json({ code: 500, message: '获取商品列表失败', error: error.message });
  }
});
// 修改商品状态接口
router.put('/updateProductStatus', async (req, res) => {
  try {
    const { productId, status } = req.body;

    // 基本参数验证
    if (!productId || !status) {
      return res.status(400).json({ success: false, message: '商品ID和状态不能为空' });
    }

    // 验证状态值
    if (!["pending", "approved", "rejected", "onSale", "offSale", "deleted"].includes(status)) {
      return res.status(400).json({ success: false, message: '状态值只能是0、1或2' });
    }

    // 更新商品状态
    const result = await Product.findOneAndUpdate(
      { productId },
      { status },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: '未找到该商品' });
    }

    res.json({ success: true, message: '商品状态更新成功', data: result });
  } catch (error) {
    console.error('修改商品状态失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取审核列表数据
router.get('/productAudit', async function (req, res) {
  try {
    // 关联查询 merchant、auditor 和 submitter 字段
    const productAudits = await ProductAudit.find({})
      .populate('merchant', 'name')  // 关联商家，只返回名称
      .populate('auditor', 'loginAccount');  // 关联审核人，只返回名称

    // 处理分类ID转名称
    // 提取所有分类ID
    const categoryIds = [...new Set(productAudits.map(item => item.productInfo.productCategory))];
    // 查询分类信息
    const categories = await ProductCategory.find({
      categoryId: { $in: categoryIds }
    }).select('categoryId categoryName');
    // 创建分类ID到名称的映射
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.categoryId] = category.categoryName;
    });

    // 替换分类ID为名称
    const result = productAudits.map(item => {
      const productInfo = { ...item.productInfo };
      if (productInfo.productCategory) {
        productInfo.productCategory = categoryMap[productInfo.productCategory] || productInfo.productCategory;
      }
      return {
        ...item._doc,
        productInfo
      };
    });

    console.log(result, '1');
    res.json({ success: true, data: result });
  } catch (err) {
    console.log(err, '2');
    res.status(500).json({ success: false, message: '获取审核列表失败', error: err.message });
  }
});

// 订单统计信息
router.get('/orders/statistics', async function (req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate + ' 23:59:59');
    }

    // 统计基本信息
    const totalOrders = await Order.countDocuments(dateFilter);
    const pendingOrders = await Order.countDocuments({ ...dateFilter, orderStatus: 'pending' });
    const unpaidOrders = await Order.countDocuments({ ...dateFilter, 'payment.paymentStatus': 'unpaid' });

    // 金额统计
    const amountStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalAmount' },
          totalPaidAmount: { $sum: '$pricing.paidAmount' },
          averageAmount: { $avg: '$pricing.totalAmount' }
        }
      }
    ]);

    res.json({
      code: 200,
      data: {
        totalOrders,
        pendingOrders,
        unpaidOrders,
        totalRevenue: amountStats[0]?.totalRevenue || 0,
        totalPaidAmount: amountStats[0]?.totalPaidAmount || 0,
        averageAmount: amountStats[0]?.averageAmount || 0
      },
      message: '获取订单统计成功'
    });
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({ code: 500, message: '获取订单统计失败', error: error.message });
  }
});
// 获取订单详情
router.get('/orders/:id', async function (req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    // 暂时移除populate，因为相关模型还未注册
    // .populate('merchant', 'name shopName contactInfo')
    // .populate('createBy', 'loginAccount name')
    // .populate('products.product', 'productName productCode category');

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, data: order, message: '获取订单详情成功' });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ code: 500, message: '获取订单详情失败', error: error.message });
  }
});

// 更新订单状态
router.put('/orders/:id/status', async function (req, res, next) {
  try {
    const { orderStatus, note } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ code: 400, message: '订单状态不能为空' });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ code: 400, message: '无效的订单状态' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus,
        $push: {
          statusHistory: {
            status: orderStatus,
            note: note || '',
            changedAt: new Date(),
            changedBy: req.user?.id || 'system'
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, data: order, message: '订单状态更新成功' });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ code: 500, message: '更新订单状态失败', error: error.message });
  }
});

// 更新支付状态
router.put('/orders/:id/payment', async function (req, res, next) {
  try {
    const { paymentStatus, paymentMethod, paidAmount, paymentNote } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ code: 400, message: '支付状态不能为空' });
    }

    const updateData = {
      'payment.paymentStatus': paymentStatus,
      updatedAt: new Date()
    };

    if (paymentMethod) updateData['payment.paymentMethod'] = paymentMethod;
    if (paidAmount !== undefined) updateData['pricing.paidAmount'] = paidAmount;
    if (paymentStatus === 'paid') updateData['payment.paymentTime'] = new Date();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, data: order, message: '支付状态更新成功' });
  } catch (error) {
    console.error('更新支付状态失败:', error);
    res.status(500).json({ code: 500, message: '更新支付状态失败', error: error.message });
  }
});

// 批量操作订单
router.post('/orders/batch', async function (req, res, next) {
  try {
    const { orderIds, action, data } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ code: 400, message: '订单ID列表不能为空' });
    }

    if (!action) {
      return res.status(400).json({ code: 400, message: '操作类型不能为空' });
    }

    let updateData = { updatedAt: new Date() };
    let message = '';

    switch (action) {
      case 'updateStatus':
        if (!data.orderStatus) {
          return res.status(400).json({ code: 400, message: '订单状态不能为空' });
        }
        updateData.orderStatus = data.orderStatus;
        message = '批量更新订单状态成功';
        break;

      case 'updatePaymentStatus':
        if (!data.paymentStatus) {
          return res.status(400).json({ code: 400, message: '支付状态不能为空' });
        }
        updateData['payment.paymentStatus'] = data.paymentStatus;
        if (data.paymentStatus === 'paid') {
          updateData['payment.paymentTime'] = new Date();
        }
        message = '批量更新支付状态成功';
        break;

      case 'delete':
        await Order.deleteMany({ _id: { $in: orderIds } });
        return res.json({ code: 200, message: '批量删除订单成功' });

      default:
        return res.status(400).json({ code: 400, message: '不支持的操作类型' });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      updateData
    );

    res.json({
      code: 200,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({ code: 500, message: '批量操作失败', error: error.message });
  }
});

// ==================== 售后管理相关接口 ====================

// 获取售后列表
router.get('/aftersales', async function (req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      afterSalesId,
      orderId,
      status,
      afterSalesType,
      customerName,
      customerPhone,
      startDate,
      endDate
    } = req.query;

    let query = {};

    // 售后单号搜索（模糊搜索）
    if (afterSalesId) query.afterSalesId = new RegExp(afterSalesId, 'i');

    // 原订单号搜索（需要根据订单ID查询）
    if (orderId) {
      // 这里需要先根据orderId查找对应的订单，然后用其_id查询售后
      const orders = await Order.find({ orderId: new RegExp(orderId, 'i') });
      const orderObjectIds = orders.map(order => order._id);
      if (orderObjectIds.length > 0) {
        query.order = { $in: orderObjectIds };
      } else {
        // 如果找不到对应订单，返回空结果
        return res.json({
          code: 200,
          data: { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) },
          message: '获取售后列表成功'
        });
      }
    }

    // 状态筛选
    if (status) query.status = status;

    // 售后类型筛选
    if (afterSalesType) query.afterSalesType = afterSalesType;

    // 客户信息筛选
    if (customerName) query['customer.customerName'] = new RegExp(customerName, 'i');
    if (customerPhone) query['customer.customerPhone'] = new RegExp(customerPhone, 'i');

    // 时间范围筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await AfterSales.countDocuments(query);
    const afterSales = await AfterSales.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      data: {
        list: afterSales,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取售后列表成功'
    });
  } catch (error) {
    console.error('获取售后列表失败:', error);
    res.status(500).json({ code: 500, message: '获取售后列表失败', error: error.message });
  }
});

// 获取售后详情
router.get('/aftersales/:id', async function (req, res, next) {
  try {
    const afterSales = await AfterSales.findById(req.params.id);
    if (!afterSales) {
      return res.status(404).json({ code: 404, message: '售后记录不存在' });
    }
    res.json({ code: 200, data: afterSales, message: '获取售后详情成功' });
  } catch (error) {
    console.error('获取售后详情失败:', error);
    res.status(500).json({ code: 500, message: '获取售后详情失败', error: error.message });
  }
});

// 更新售后状态
router.put('/aftersales/:id/status', async function (req, res, next) {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ code: 400, message: '状态不能为空' });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的状态值' });
    }

    const afterSales = await AfterSales.findByIdAndUpdate(
      req.params.id,
      {
        status,
        'processingInfo.processingNote': note || '',
        'processingInfo.processingTime': new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!afterSales) {
      return res.status(404).json({ code: 404, message: '售后记录不存在' });
    }

    res.json({ code: 200, data: afterSales, message: '售后状态更新成功' });
  } catch (error) {
    console.error('更新售后状态失败:', error);
    res.status(500).json({ code: 500, message: '更新售后状态失败', error: error.message });
  }
});

// 处理售后申请
router.put('/aftersales/:id/process', async function (req, res, next) {
  try {
    const { solution, refundAmount, refundMethod, processingNote } = req.body;

    const updateData = {
      'processingInfo.solution': solution,
      'processingInfo.processingNote': processingNote,
      'processingInfo.processingTime': new Date(),
      updatedAt: new Date()
    };

    // 如果有退款信息，更新退款相关字段
    if (refundAmount !== undefined) {
      updateData['refundInfo.refundAmount'] = refundAmount;
      updateData['refundInfo.refundMethod'] = refundMethod || 'original';
      updateData['refundInfo.refundTime'] = new Date();
      updateData['refundInfo.refundStatus'] = 'completed';
    }

    const afterSales = await AfterSales.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!afterSales) {
      return res.status(404).json({ code: 404, message: '售后记录不存在' });
    }

    res.json({ code: 200, data: afterSales, message: '售后处理成功' });
  } catch (error) {
    console.error('处理售后失败:', error);
    res.status(500).json({ code: 500, message: '处理售后失败', error: error.message });
  }
});

// ==================== 理货单相关接口 ====================

// 获取理货单列表
router.get('/tally-orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, tallyOrderId, status, tallyType, startDate, endDate } = req.query;

    let query = {};
    if (tallyOrderId) query.tallyOrderId = new RegExp(tallyOrderId, 'i');
    if (status) query.status = status;
    if (tallyType) query.tallyType = tallyType;

    // 时间范围筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + ' 23:59:59');
    }

    const total = await TallyOrder.countDocuments(query);
    const tallyOrders = await TallyOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      data: {
        list: tallyOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取理货单列表成功'
    });
  } catch (error) {
    console.error('获取理货单列表失败:', error);
    res.status(500).json({ code: 500, message: '获取理货单列表失败', error: error.message });
  }
});

// 获取理货单详情
router.get('/tally-orders/:id', async function (req, res, next) {
  try {
    const tallyOrder = await TallyOrder.findById(req.params.id);
    if (!tallyOrder) {
      return res.status(404).json({ code: 404, message: '理货单不存在' });
    }
    res.json({ code: 200, data: tallyOrder, message: '获取理货单详情成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取理货单详情失败', error: error.message });
  }
});

// 新建理货单
router.post('/tally-orders', async function (req, res, next) {
  try {
    const {
      tallyOrderId,
      tallyType,
      warehouse,
      products,
      operationInfo,
      notes
    } = req.body;

    // 基本参数验证
    if (!tallyOrderId || !tallyType || !products || products.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '理货单号、理货类型和商品清单不能为空'
      });
    }

    // 检查理货单号是否已存在
    const existingOrder = await TallyOrder.findOne({ tallyOrderId });
    if (existingOrder) {
      return res.status(400).json({
        code: 400,
        message: '理货单号已存在'
      });
    }

    // 计算汇总信息
    const totalPlannedItems = products.length;
    const totalPlannedQuantity = products.reduce((sum, item) => sum + (item.plannedQuantity || 0), 0);

    // 创建理货单
    const tallyOrder = new TallyOrder({
      tallyOrderId,
      tallyType,
      warehouse,
      status: 'pending',
      products: products.map(product => ({
        ...product,
        actualQuantity: 0,
        condition: product.condition || 'good'
      })),
      operationInfo: {
        ...operationInfo,
        planStartTime: operationInfo?.planStartTime ? new Date(operationInfo.planStartTime) : null,
        planEndTime: operationInfo?.planEndTime ? new Date(operationInfo.planEndTime) : null
      },
      summary: {
        totalPlannedItems,
        totalActualItems: 0,
        totalPlannedQuantity,
        totalActualQuantity: 0,
        differenceQuantity: 0
      },
      qualityCheck: {
        isQualityChecked: false
      },
      notes: notes || '',
      createBy: req.user?.id || null,
      lastUpdateBy: req.user?.id || null
    });

    await tallyOrder.save();

    res.json({
      code: 200,
      data: tallyOrder,
      message: '理货单创建成功'
    });
  } catch (error) {
    console.error('创建理货单失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建理货单失败',
      error: error.message
    });
  }
});

// ==================== 分拣单相关接口 ====================

// 获取分拣单列表
router.get('/sorting-orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, sortingOrderId, status, priority, sortingType, startDate, endDate } = req.query;

    let query = {};
    if (sortingOrderId) query.sortingOrderId = new RegExp(sortingOrderId, 'i');
    if (status) query.status = status;
    if (priority) query.priority = parseInt(priority);
    if (sortingType) query.sortingType = sortingType;

    // 时间范围筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + ' 23:59:59');
    }

    const total = await SortingOrder.countDocuments(query);
    const sortingOrders = await SortingOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ priority: -1, createdAt: -1 }); // 优先级高的排前面

    res.json({
      code: 200,
      data: {
        list: sortingOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取分拣单列表成功'
    });
  } catch (error) {
    console.error('获取分拣单列表失败:', error);
    res.status(500).json({ code: 500, message: '获取分拣单列表失败', error: error.message });
  }
});

// 获取分拣单详情
router.get('/sorting-orders/:id', async function (req, res, next) {
  try {
    const sortingOrder = await SortingOrder.findById(req.params.id);
    if (!sortingOrder) {
      return res.status(404).json({ code: 404, message: '分拣单不存在' });
    }
    res.json({ code: 200, data: sortingOrder, message: '获取分拣单详情成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取分拣单详情失败', error: error.message });
  }
});

// 新建分拣单
router.post('/sorting-orders', async function (req, res, next) {
  try {
    const {
      sortingOrderId,
      sortingType,
      priority,
      warehouse,
      sourceLocation,
      targetLocation,
      products,
      operationInfo,
      pickingRoute,
      notes
    } = req.body;

    // 基本参数验证
    if (!sortingOrderId || !sortingType || !products || products.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '分拣单号、分拣类型和商品清单不能为空'
      });
    }

    // 检查分拣单号是否已存在
    const existingOrder = await SortingOrder.findOne({ sortingOrderId });
    if (existingOrder) {
      return res.status(400).json({
        code: 400,
        message: '分拣单号已存在'
      });
    }

    // 计算汇总信息
    const totalItems = products.length;
    const totalRequiredQuantity = products.reduce((sum, item) => sum + (item.requiredQuantity || 0), 0);

    // 创建分拣单
    const sortingOrder = new SortingOrder({
      sortingOrderId,
      sortingType,
      priority: priority || 2, // 默认普通优先级
      warehouse,
      sourceLocation,
      targetLocation,
      status: 'pending',
      products: products.map((product, index) => ({
        ...product,
        pickedQuantity: 0,
        pickingOrder: product.pickingOrder || index + 1
      })),
      operationInfo: {
        ...operationInfo,
        planStartTime: operationInfo?.planStartTime ? new Date(operationInfo.planStartTime) : null,
        planEndTime: operationInfo?.planEndTime ? new Date(operationInfo.planEndTime) : null
      },
      pickingRoute: {
        ...pickingRoute,
        actualTime: null
      },
      qualityCheck: {
        isChecked: false,
        errorItems: []
      },
      summary: {
        totalItems,
        totalRequiredQuantity,
        totalPickedQuantity: 0,
        completionRate: 0,
        accuracy: 0
      },
      notes: notes || '',
      createBy: req.user?.id || null,
      lastUpdateBy: req.user?.id || null
    });

    await sortingOrder.save();

    res.json({
      code: 200,
      data: sortingOrder,
      message: '分拣单创建成功'
    });
  } catch (error) {
    console.error('创建分拣单失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建分拣单失败',
      error: error.message
    });
  }
});

// 更新理货单状态
router.put('/tally-orders/:id/status', async function (req, res, next) {
  try {
    const { status } = req.body;
    const tallyOrder = await TallyOrder.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'in_progress' && { 'operationInfo.actualStartTime': new Date() }),
        ...(status === 'completed' && { 'operationInfo.actualEndTime': new Date() })
      },
      { new: true }
    );

    if (!tallyOrder) {
      return res.status(404).json({ code: 404, message: '理货单不存在' });
    }

    res.json({ code: 200, data: tallyOrder, message: '理货单状态更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新理货单状态失败', error: error.message });
  }
});

// 完成理货
router.put('/tally-orders/:id/complete', async function (req, res, next) {
  try {
    const { completionNotes } = req.body;
    const tallyOrder = await TallyOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        'operationInfo.actualEndTime': new Date(),
        notes: completionNotes
      },
      { new: true }
    );

    if (!tallyOrder) {
      return res.status(404).json({ code: 404, message: '理货单不存在' });
    }

    res.json({ code: 200, data: tallyOrder, message: '理货完成' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '完成理货失败', error: error.message });
  }
});

// 更新分拣单状态
router.put('/sorting-orders/:id/status', async function (req, res, next) {
  try {
    const { status } = req.body;
    const sortingOrder = await SortingOrder.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'in_progress' && { 'operationInfo.actualStartTime': new Date() }),
        ...(status === 'completed' && { 'operationInfo.actualEndTime': new Date() })
      },
      { new: true }
    );

    if (!sortingOrder) {
      return res.status(404).json({ code: 404, message: '分拣单不存在' });
    }

    res.json({ code: 200, data: sortingOrder, message: '分拣单状态更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新分拣单状态失败', error: error.message });
  }
});

// 开始拣货
router.put('/sorting-orders/:id/start-picking', async function (req, res, next) {
  try {
    const sortingOrder = await SortingOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'in_progress',
        'operationInfo.actualStartTime': new Date()
      },
      { new: true }
    );

    if (!sortingOrder) {
      return res.status(404).json({ code: 404, message: '分拣单不存在' });
    }

    res.json({ code: 200, data: sortingOrder, message: '开始拣货' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '开始拣货失败', error: error.message });
  }
});

// 完成分拣
router.put('/sorting-orders/:id/complete', async function (req, res, next) {
  try {
    const { completionNotes } = req.body;
    const sortingOrder = await SortingOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        'operationInfo.actualEndTime': new Date(),
        notes: completionNotes
      },
      { new: true }
    );

    if (!sortingOrder) {
      return res.status(404).json({ code: 404, message: '分拣单不存在' });
    }

    res.json({ code: 200, data: sortingOrder, message: '分拣完成' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '完成分拣失败', error: error.message });
  }
});

// 更新拣货进度
router.put('/sorting-orders/:id/picking-progress', async function (req, res, next) {
  try {
    const { productUpdates } = req.body;

    if (!productUpdates || !Array.isArray(productUpdates)) {
      return res.status(400).json({ code: 400, message: '商品更新数据格式错误' });
    }

    const sortingOrder = await SortingOrder.findById(req.params.id);
    if (!sortingOrder) {
      return res.status(404).json({ code: 404, message: '分拣单不存在' });
    }

    // 更新商品拣货数量
    productUpdates.forEach(update => {
      const product = sortingOrder.products.find(p => p.productCode === update.productCode);
      if (product) {
        product.pickedQuantity = update.pickedQuantity;
      }
    });

    // 重新计算汇总信息
    const totalPickedQuantity = sortingOrder.products.reduce((sum, product) => sum + product.pickedQuantity, 0);
    const completionRate = Math.round((totalPickedQuantity / sortingOrder.summary.totalRequiredQuantity) * 100);

    sortingOrder.summary.totalPickedQuantity = totalPickedQuantity;
    sortingOrder.summary.completionRate = completionRate;

    await sortingOrder.save();

    res.json({ code: 200, data: sortingOrder, message: '拣货进度更新成功' });
  } catch (error) {
    console.error('更新拣货进度失败:', error);
    res.status(500).json({ code: 500, message: '更新拣货进度失败', error: error.message });
  }
});

// 开始理货
router.put('/tally-orders/:id/start', async function (req, res, next) {
  try {
    const tallyOrder = await TallyOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'in_progress',
        'operationInfo.actualStartTime': new Date()
      },
      { new: true }
    );

    if (!tallyOrder) {
      return res.status(404).json({ code: 404, message: '理货单不存在' });
    }

    res.json({ code: 200, data: tallyOrder, message: '开始理货' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '开始理货失败', error: error.message });
  }
});

// 更新理货进度
router.put('/tally-orders/:id/progress', async function (req, res, next) {
  try {
    const { productUpdates } = req.body;

    if (!productUpdates || !Array.isArray(productUpdates)) {
      return res.status(400).json({ code: 400, message: '商品更新数据格式错误' });
    }

    const tallyOrder = await TallyOrder.findById(req.params.id);
    if (!tallyOrder) {
      return res.status(404).json({ code: 404, message: '理货单不存在' });
    }

    // 更新商品实际数量
    productUpdates.forEach(update => {
      const product = tallyOrder.products.find(p => p.productCode === update.productCode);
      if (product) {
        product.actualQuantity = update.actualQuantity;
        if (update.condition) product.condition = update.condition;
        if (update.notes) product.notes = update.notes;
      }
    });

    // 重新计算汇总信息
    const totalActualQuantity = tallyOrder.products.reduce((sum, product) => sum + product.actualQuantity, 0);
    const totalActualItems = tallyOrder.products.filter(product => product.actualQuantity > 0).length;
    const differenceQuantity = totalActualQuantity - tallyOrder.summary.totalPlannedQuantity;

    tallyOrder.summary.totalActualQuantity = totalActualQuantity;
    tallyOrder.summary.totalActualItems = totalActualItems;
    tallyOrder.summary.differenceQuantity = differenceQuantity;

    await tallyOrder.save();

    res.json({ code: 200, data: tallyOrder, message: '理货进度更新成功' });
  } catch (error) {
    console.error('更新理货进度失败:', error);
    res.status(500).json({ code: 500, message: '更新理货进度失败', error: error.message });
  }
});

// 批量操作理货单
router.post('/tally-orders/batch', async function (req, res, next) {
  try {
    const { orderIds, action, data } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ code: 400, message: '理货单ID列表不能为空' });
    }

    if (!action) {
      return res.status(400).json({ code: 400, message: '操作类型不能为空' });
    }

    let updateData = { updatedAt: new Date() };
    let message = '';

    switch (action) {
      case 'updateStatus':
        if (!data.status) {
          return res.status(400).json({ code: 400, message: '状态不能为空' });
        }
        updateData.status = data.status;
        if (data.status === 'in_progress') {
          updateData['operationInfo.actualStartTime'] = new Date();
        } else if (data.status === 'completed') {
          updateData['operationInfo.actualEndTime'] = new Date();
        }
        message = '批量更新理货单状态成功';
        break;

      case 'delete':
        await TallyOrder.deleteMany({ _id: { $in: orderIds } });
        return res.json({ code: 200, message: '批量删除理货单成功' });

      default:
        return res.status(400).json({ code: 400, message: '不支持的操作类型' });
    }

    const result = await TallyOrder.updateMany(
      { _id: { $in: orderIds } },
      updateData
    );

    res.json({
      code: 200,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message
    });
  } catch (error) {
    console.error('批量操作理货单失败:', error);
    res.status(500).json({ code: 500, message: '批量操作理货单失败', error: error.message });
  }
});

// 批量操作分拣单
router.post('/sorting-orders/batch', async function (req, res, next) {
  try {
    const { orderIds, action, data } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ code: 400, message: '分拣单ID列表不能为空' });
    }

    if (!action) {
      return res.status(400).json({ code: 400, message: '操作类型不能为空' });
    }

    let updateData = { updatedAt: new Date() };
    let message = '';

    switch (action) {
      case 'updateStatus':
        if (!data.status) {
          return res.status(400).json({ code: 400, message: '状态不能为空' });
        }
        updateData.status = data.status;
        if (data.status === 'in_progress') {
          updateData['operationInfo.actualStartTime'] = new Date();
        } else if (data.status === 'completed') {
          updateData['operationInfo.actualEndTime'] = new Date();
        }
        message = '批量更新分拣单状态成功';
        break;

      case 'updatePriority':
        if (!data.priority) {
          return res.status(400).json({ code: 400, message: '优先级不能为空' });
        }
        updateData.priority = parseInt(data.priority);
        message = '批量更新分拣单优先级成功';
        break;

      case 'delete':
        await SortingOrder.deleteMany({ _id: { $in: orderIds } });
        return res.json({ code: 200, message: '批量删除分拣单成功' });

      default:
        return res.status(400).json({ code: 400, message: '不支持的操作类型' });
    }

    const result = await SortingOrder.updateMany(
      { _id: { $in: orderIds } },
      updateData
    );

    res.json({
      code: 200,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message
    });
  } catch (error) {
    console.error('批量操作分拣单失败:', error);
    res.status(500).json({ code: 500, message: '批量操作分拣单失败', error: error.message });
  }
});

// ==================== 收款记录相关接口 ====================

// 获取收款记录列表
router.get('/payment-records', async function (req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      paymentId,
      orderId,
      merchantName,
      paymentMethod,
      paymentStatus,
      paymentTime,
      paymentTimeStart,
      paymentTimeEnd,
      customerPhone
    } = req.query;

    let query = {};

    // 收款单号搜索（模糊搜索）
    if (paymentId) query.paymentId = new RegExp(paymentId, 'i');

    // 订单号搜索（通过关联订单查找）
    if (orderId) {
      const orders = await Order.find({ orderId: new RegExp(orderId, 'i') });
      const orderObjectIds = orders.map(order => order._id);
      if (orderObjectIds.length > 0) {
        query.order = { $in: orderObjectIds };
      } else {
        // 如果找不到对应订单，返回空结果
        return res.json({
          code: 200,
          data: { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) },
          message: '获取收款记录列表成功'
        });
      }
    }

    // 商家名称搜索（通过关联商家查找）
    if (merchantName) {
      const merchants = await Merchant.find({ name: new RegExp(merchantName, 'i') });
      const merchantObjectIds = merchants.map(merchant => merchant._id);
      if (merchantObjectIds.length > 0) {
        query.merchant = { $in: merchantObjectIds };
      } else {
        return res.json({
          code: 200,
          data: { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) },
          message: '获取收款记录列表成功'
        });
      }
    }

    // 支付方式筛选（精确匹配）
    if (paymentMethod) query['paymentInfo.paymentMethod'] = paymentMethod;

    // 支付状态筛选（精确匹配）
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // 客户电话搜索（模糊搜索）
    if (customerPhone) query['customer.customerPhone'] = new RegExp(customerPhone, 'i');

    // 支付时间范围筛选
    if (paymentTime && Array.isArray(paymentTime) && paymentTime.length === 2) {
      query['transactionInfo.paymentTime'] = {
        $gte: new Date(paymentTime[0]),
        $lte: new Date(paymentTime[1] + ' 23:59:59')
      };
    } else if (paymentTimeStart || paymentTimeEnd) {
      // 支持单独的开始和结束时间参数
      const timeQuery = {};
      if (paymentTimeStart) {
        timeQuery.$gte = new Date(paymentTimeStart);
      }
      if (paymentTimeEnd) {
        timeQuery.$lte = new Date(paymentTimeEnd);
      }
      query['transactionInfo.paymentTime'] = timeQuery;
    }

    const total = await PaymentRecord.countDocuments(query);
    const paymentRecords = await PaymentRecord.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    // 手动查询关联数据，避免populate问题
    const processedRecords = [];
    for (const record of paymentRecords) {
      let orderId = 'N/A';
      let merchantName = '未知商家';

      try {
        // 手动查询订单信息
        if (record.order) {
          const order = await Order.findById(record.order).select('orderId');
          orderId = order?.orderId || 'N/A';
        }

        // 手动查询商家信息
        if (record.merchant) {
          const merchant = await Merchant.findById(record.merchant).select('name');
          merchantName = merchant?.name || '未知商家';
        }
      } catch (err) {
        console.error('查询关联数据失败:', err.message);
        // 继续处理，使用默认值
      }

      processedRecords.push({
        id: record._id,
        paymentId: record.paymentId,
        orderId: orderId,
        merchantName: merchantName,
        paymentMethod: record.paymentInfo.paymentMethod,
        paymentAmount: record.paymentInfo.paymentAmount,
        actualAmount: record.paymentInfo.receivedAmount,
        paymentStatus: record.paymentStatus,
        paymentTime: record.transactionInfo.paymentTime,
        customerPhone: record.customer.customerPhone,
        transactionId: record.transactionInfo.transactionId,
        remarks: record.notes
      });
    }

    res.json({
      code: 200,
      data: {
        list: processedRecords,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取收款记录列表成功'
    });
  } catch (error) {
    console.error('获取收款记录列表失败:', error);
    res.status(500).json({ code: 500, message: '获取收款记录列表失败', error: error.message });
  }
});

// 获取收款记录详情
router.get('/payment-records/:id', async function (req, res, next) {
  try {
    const paymentRecord = await PaymentRecord.findById(req.params.id)
      .populate('order', 'orderId')
      .populate('merchant', 'name')
      .populate('operatorInfo.cashier', 'loginAccount name');

    if (!paymentRecord) {
      return res.status(404).json({ code: 404, message: '收款记录不存在' });
    }

    // 处理返回数据格式
    const processedRecord = {
      id: paymentRecord._id,
      paymentId: paymentRecord.paymentId,
      orderId: paymentRecord.order?.orderId || 'N/A',
      merchantName: paymentRecord.merchant?.name || '未知商家',
      paymentMethod: paymentRecord.paymentInfo.paymentMethod,
      paymentAmount: paymentRecord.paymentInfo.paymentAmount,
      actualAmount: paymentRecord.paymentInfo.receivedAmount,
      paymentStatus: paymentRecord.paymentStatus,
      paymentTime: paymentRecord.transactionInfo.paymentTime,
      customerPhone: paymentRecord.customer.customerPhone,
      transactionId: paymentRecord.transactionInfo.transactionId,
      remarks: paymentRecord.notes,
      // 详情页额外信息
      customerName: paymentRecord.customer.customerName,
      changeAmount: paymentRecord.paymentInfo.changeAmount,
      discountAmount: paymentRecord.paymentInfo.discountAmount,
      cashier: paymentRecord.operatorInfo.cashier?.name || '未知',
      terminal: paymentRecord.operatorInfo.terminal,
      location: paymentRecord.operatorInfo.location,
      refundInfo: paymentRecord.refundInfo
    };

    res.json({ code: 200, data: processedRecord, message: '获取收款记录详情成功' });
  } catch (error) {
    console.error('获取收款记录详情失败:', error);
    res.status(500).json({ code: 500, message: '获取收款记录详情失败', error: error.message });
  }
});

// 创建收款记录
router.post('/payment-records', async function (req, res, next) {
  try {
    const {
      orderId,
      merchantId,
      customerInfo,
      paymentInfo,
      operatorInfo,
      notes
    } = req.body;

    // 生成收款单号
    const paymentId = 'PAY' + Date.now() + Math.floor(Math.random() * 1000);

    // 查找订单
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    // 创建收款记录
    const paymentRecord = new PaymentRecord({
      paymentId,
      order: order._id,
      merchant: merchantId,
      customer: customerInfo,
      paymentInfo,
      paymentStatus: 'success',
      transactionInfo: {
        transactionId: 'TXN' + Date.now(),
        paymentTime: new Date()
      },
      businessDetails: {
        businessType: 'retail',
        salesChannel: 'offline'
      },
      operatorInfo,
      notes,
      createBy: req.user?.id || null
    });

    await paymentRecord.save();

    res.json({
      code: 200,
      data: paymentRecord,
      message: '收款记录创建成功'
    });
  } catch (error) {
    console.error('创建收款记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建收款记录失败',
      error: error.message
    });
  }
});

// 更新收款记录状态
router.put('/payment-records/:id/status', async function (req, res, next) {
  try {
    const { paymentStatus, notes } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ code: 400, message: '支付状态不能为空' });
    }

    const validStatuses = ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ code: 400, message: '无效的支付状态' });
    }

    const paymentRecord = await PaymentRecord.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus,
        notes: notes || '',
        lastUpdateBy: req.user?.id || null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!paymentRecord) {
      return res.status(404).json({ code: 404, message: '收款记录不存在' });
    }

    res.json({ code: 200, data: paymentRecord, message: '收款记录状态更新成功' });
  } catch (error) {
    console.error('更新收款记录状态失败:', error);
    res.status(500).json({ code: 500, message: '更新收款记录状态失败', error: error.message });
  }
});

// 处理退款
router.put('/payment-records/:id/refund', async function (req, res, next) {
  try {
    const { refundAmount, refundReason } = req.body;

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({ code: 400, message: '退款金额必须大于0' });
    }

    const paymentRecord = await PaymentRecord.findById(req.params.id);
    if (!paymentRecord) {
      return res.status(404).json({ code: 404, message: '收款记录不存在' });
    }

    if (paymentRecord.paymentStatus !== 'success') {
      return res.status(400).json({ code: 400, message: '只有成功支付的记录才能退款' });
    }

    // 更新退款信息
    paymentRecord.refundInfo = {
      isRefunded: true,
      refundAmount,
      refundTime: new Date(),
      refundReason,
      refundTransactionId: 'REF' + Date.now()
    };
    paymentRecord.paymentStatus = 'refunded';
    paymentRecord.lastUpdateBy = req.user?.id || null;

    await paymentRecord.save();

    res.json({ code: 200, data: paymentRecord, message: '退款处理成功' });
  } catch (error) {
    console.error('处理退款失败:', error);
    res.status(500).json({ code: 500, message: '处理退款失败', error: error.message });
  }
});

// 批量操作收款记录
router.post('/payment-records/batch', async function (req, res, next) {
  try {
    const { recordIds, action, data } = req.body;

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({ code: 400, message: '收款记录ID列表不能为空' });
    }

    if (!action) {
      return res.status(400).json({ code: 400, message: '操作类型不能为空' });
    }

    let updateData = { updatedAt: new Date() };
    let message = '';

    switch (action) {
      case 'updateStatus':
        if (!data.paymentStatus) {
          return res.status(400).json({ code: 400, message: '支付状态不能为空' });
        }
        updateData.paymentStatus = data.paymentStatus;
        message = '批量更新收款记录状态成功';
        break;

      case 'reconcile':
        updateData['reconciliation.isReconciled'] = true;
        updateData['reconciliation.reconciledTime'] = new Date();
        updateData['reconciliation.batchNumber'] = data.batchNumber || 'BATCH' + Date.now();
        message = '批量对账成功';
        break;

      case 'delete':
        await PaymentRecord.deleteMany({ _id: { $in: recordIds } });
        return res.json({ code: 200, message: '批量删除收款记录成功' });

      default:
        return res.status(400).json({ code: 400, message: '不支持的操作类型' });
    }

    const result = await PaymentRecord.updateMany(
      { _id: { $in: recordIds } },
      updateData
    );

    res.json({
      code: 200,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      },
      message
    });
  } catch (error) {
    console.error('批量操作收款记录失败:', error);
    res.status(500).json({ code: 500, message: '批量操作收款记录失败', error: error.message });
  }
});

// 生成收款记录测试数据
router.post('/payment-records/generate-test-data', async function (req, res, next) {
  try {
    const { count = 50 } = req.body;

    console.log(`开始生成 ${count} 条收款记录测试数据...`);

    // 支付方式选项
    const paymentMethods = ['wechat', 'alipay', 'cash', 'bank_card', 'bank_transfer'];
    const paymentStatuses = ['success', 'pending', 'failed', 'refunded'];
    const merchantNames = ['清风便利店', '星期八超市', '百货大楼', '社区小店', '连锁超市'];
    const customerNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];

    const createdRecords = [];

    // 首先确保有一些基础的订单和商家数据
    let merchants = await Merchant.find().limit(5);
    if (merchants.length === 0) {
      console.log('创建测试商家数据...');
      const merchantsData = merchantNames.map((name, index) => ({
        merchantId: `MERCHANT${Date.now()}${index}`,
        name,
        contactInfo: {
          phone: `138${String(index).padStart(8, '0')}`,
          email: `${name}@example.com`
        },
        businessType: 'retail',
        status: 'active'
      }));

      merchants = await Merchant.insertMany(merchantsData);
      console.log(`创建了 ${merchants.length} 个测试商家`);
    }

    // 创建一些测试订单（如果不存在）
    let orders = await Order.find().limit(20);
    if (orders.length < 10) {
      console.log('创建测试订单数据...');

      // 获取一些产品用于关联
      let products = await Product.find().limit(10);
      if (products.length === 0) {
        console.log('创建测试产品数据...');
        const productsData = [];
        for (let j = 0; j < 10; j++) {
          productsData.push({
            productId: `PROD${Date.now()}${String(j).padStart(3, '0')}`,
            productName: `测试商品${j + 1}`,
            category: '测试分类',
            specification: '标准规格',
            price: Math.floor(Math.random() * 100) + 10,
            status: 'active'
          });
        }
        products = await Product.insertMany(productsData);
        console.log(`创建了 ${products.length} 个测试产品`);
      }

      // 创建一个默认用户用于createBy字段
      let defaultUser = await User.findOne();
      if (!defaultUser) {
        console.log('创建默认用户...');
        defaultUser = await User.create({
          username: 'testuser',
          email: 'test@example.com',
          password: '123456',
          role: 'admin'
        });
        console.log('创建了默认用户');
      }

      const ordersData = [];
      for (let i = 0; i < 20; i++) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = Math.floor(Math.random() * 100) + 10;
        const totalPrice = quantity * unitPrice;
        const subtotal = totalPrice;
        const totalAmount = subtotal;

        ordersData.push({
          orderId: `ORD${Date.now()}${String(i).padStart(3, '0')}`,
          orderType: 'retail', // 必需字段
          orderStatus: 'completed',
          customer: {
            customerName: customerNames[i % customerNames.length],
            customerPhone: `139${String(i).padStart(8, '0')}`
          },
          products: [{
            product: products[i % products.length]._id, // 必需字段
            productName: `商品${i + 1}`,
            quantity: quantity,
            unitPrice: unitPrice, // 必需字段
            totalPrice: totalPrice // 必需字段
          }],
          pricing: {
            subtotal: subtotal, // 必需字段
            totalAmount: totalAmount,
            paidAmount: 0
          },
          payment: {
            paymentMethod: 'cash',
            paymentStatus: 'unpaid'
          },
          merchant: merchants[i % merchants.length]._id,
          createBy: defaultUser._id // 必需字段
        });
      }
      orders = await Order.insertMany(ordersData);
      console.log(`创建了 ${orders.length} 个测试订单`);
    }

    // 获取默认用户用于createBy和cashier字段
    let defaultUser = await User.findOne();
    if (!defaultUser) {
      console.log('创建默认用户...');
      defaultUser = await User.create({
        username: 'cashier',
        email: 'cashier@example.com',
        password: '123456',
        role: 'cashier'
      });
      console.log('创建了默认收银员用户');
    }

    // 生成收款记录
    for (let i = 0; i < count; i++) {
      const randomOrder = orders[Math.floor(Math.random() * orders.length)];
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const paymentAmount = Math.floor(Math.random() * 500) + 50;
      const receivedAmount = paymentStatus === 'success' ? paymentAmount : 0;

      // 生成时间（最近30天内的随机时间）
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      const paymentRecord = new PaymentRecord({
        paymentId: `PAY${Date.now()}${String(i).padStart(4, '0')}`,
        order: randomOrder._id,
        merchant: randomMerchant._id,
        customer: {
          customerId: `CUST${i + 1}`,
          customerName: customerNames[i % customerNames.length],
          customerPhone: `139${String(i).padStart(8, '0')}`
        },
        paymentInfo: {
          paymentMethod,
          paymentAmount,
          receivedAmount,
          changeAmount: Math.max(0, receivedAmount - paymentAmount),
          discountAmount: Math.floor(Math.random() * 20),
          currency: 'CNY'
        },
        paymentStatus,
        transactionInfo: {
          transactionId: `TXN${Date.now()}${String(i).padStart(4, '0')}`,
          thirdPartyOrderId: paymentMethod !== 'cash' ? `3RD${Date.now()}${i}` : null,
          paymentTime: randomDate,
          confirmTime: paymentStatus === 'success' ? randomDate : null
        },
        refundInfo: paymentStatus === 'refunded' ? {
          isRefunded: true,
          refundAmount: paymentAmount * 0.8,
          refundTime: new Date(randomDate.getTime() + 24 * 60 * 60 * 1000),
          refundReason: '客户申请退款',
          refundTransactionId: `REF${Date.now()}${i}`
        } : {
          isRefunded: false,
          refundAmount: 0
        },
        businessDetails: {
          businessType: 'retail',
          salesChannel: Math.random() > 0.5 ? 'offline' : 'online'
        },
        operatorInfo: {
          cashier: defaultUser._id, // 使用默认用户
          terminal: `POS${Math.floor(Math.random() * 10) + 1}`,
          location: `${randomMerchant.name}-收银台${Math.floor(Math.random() * 3) + 1}`
        },
        reconciliation: {
          isReconciled: Math.random() > 0.3,
          reconciledTime: Math.random() > 0.3 ? new Date(randomDate.getTime() + 60 * 60 * 1000) : null,
          batchNumber: `BATCH${Math.floor(randomDate.getTime() / 1000)}`
        },
        notes: i % 5 === 0 ? `测试备注信息${i + 1}` : '',
        createBy: defaultUser._id, // 使用默认用户
        createdAt: randomDate,
        updatedAt: randomDate
      });

      const savedRecord = await paymentRecord.save();
      createdRecords.push(savedRecord);

      // 每10条记录输出一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`已创建 ${i + 1}/${count} 条收款记录`);
      }
    }

    console.log(`成功生成 ${createdRecords.length} 条收款记录测试数据`);

    res.json({
      code: 200,
      data: {
        count: createdRecords.length,
        records: createdRecords.slice(0, 5) // 只返回前5条作为示例
      },
      message: `成功生成 ${createdRecords.length} 条收款记录测试数据`
    });
  } catch (error) {
    console.error('生成收款记录测试数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '生成测试数据失败',
      error: error.message
    });
  }
});

// 清空收款记录测试数据
router.delete('/payment-records/clear-test-data', async function (req, res, next) {
  try {
    const result = await PaymentRecord.deleteMany({});

    res.json({
      code: 200,
      data: {
        deletedCount: result.deletedCount
      },
      message: `成功清空 ${result.deletedCount} 条收款记录`
    });
  } catch (error) {
    console.error('清空收款记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '清空收款记录失败',
      error: error.message
    });
  }
});

// ==================== 配货单相关接口 ====================

// 获取配货单列表
router.get('/allocation-orders', async function (req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      allocationId,
      merchantName,
      allocationType,
      status,
      priority,
      createTimeStart,
      createTimeEnd
    } = req.query;

    let query = {};

    // 配货单号搜索（模糊搜索）
    if (allocationId) query.allocationOrderId = new RegExp(allocationId, 'i');

    // 商家名称搜索（通过关联商家查找）
    if (merchantName) {
      const merchants = await Merchant.find({ name: new RegExp(merchantName, 'i') });
      const merchantObjectIds = merchants.map(merchant => merchant._id);
      if (merchantObjectIds.length > 0) {
        query.merchant = { $in: merchantObjectIds };
      } else {
        return res.json({
          code: 200,
          data: { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) },
          message: '获取配货单列表成功'
        });
      }
    }

    // 配货类型筛选（精确匹配）
    if (allocationType) query.allocationType = allocationType;

    // 状态筛选（精确匹配）
    if (status) query.status = status;

    // 优先级筛选（通过紧急程度）
    if (priority) query['urgentInfo.urgentLevel'] = priority;

    // 创建时间范围筛选
    if (createTimeStart || createTimeEnd) {
      const timeQuery = {};
      if (createTimeStart) {
        timeQuery.$gte = new Date(createTimeStart);
      }
      if (createTimeEnd) {
        timeQuery.$lte = new Date(createTimeEnd);
      }
      query.createdAt = timeQuery;
    }

    const total = await AllocationOrder.countDocuments(query);
    const allocationOrders = await AllocationOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    // 处理返回数据格式，匹配前端需求，手动获取关联数据
    const processedOrders = await Promise.all(allocationOrders.map(async (order) => {
      // 手动获取商家名称
      let merchantName = '未知商家';
      if (order.merchant) {
        try {
          const merchant = await Merchant.findById(order.merchant);
          merchantName = merchant?.name || '未知商家';
        } catch (error) {
          console.error('获取商家信息失败:', error);
        }
      }

      // 手动获取关联订单ID
      let orderIds = [];
      if (order.relatedOrders && order.relatedOrders.length > 0) {
        try {
          const orders = await Order.find({ _id: { $in: order.relatedOrders } });
          orderIds = orders.map(o => o.orderId);
        } catch (error) {
          console.error('获取关联订单失败:', error);
        }
      }

      return {
        id: order._id,
        allocationId: order.allocationOrderId,
        orderIds,
        merchantName,
        allocationType: order.allocationType,
        status: order.status,
        priority: order.urgentInfo?.urgentLevel || 3,
        allocationRate: order.summary?.allocationRate || 0,
        allocatedQuantity: order.summary?.totalAllocatedQuantity || 0,
        plannedQuantity: order.summary?.totalRequiredQuantity || 0,
        allocator: '配货员',
        totalAmount: order.summary?.totalAmount || 0,
        createTime: order.createdAt,
        planStartTime: order.allocationInfo?.allocationDate,
        planEndTime: order.allocationInfo?.expectedDeliveryDate,
        actualStartTime: order.allocationInfo?.allocationDate,
        actualEndTime: order.status === 'confirmed' ? order.allocationInfo?.expectedDeliveryDate : null,
        remarks: order.notes
      };
    }));

    res.json({
      code: 200,
      data: {
        list: processedOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取配货单列表成功'
    });
  } catch (error) {
    console.error('获取配货单列表失败:', error);
    res.status(500).json({ code: 500, message: '获取配货单列表失败', error: error.message });
  }
});

// 获取配货单详情
router.get('/allocation-orders/:id', async function (req, res, next) {
  try {
    const allocationOrder = await AllocationOrder.findById(req.params.id)
      .populate('merchant', 'name')
      .populate('relatedOrders', 'orderId')
      .populate('products.product', 'productName productCode');

    if (!allocationOrder) {
      return res.status(404).json({ code: 404, message: '配货单不存在' });
    }

    res.json({ code: 200, data: allocationOrder, message: '获取配货单详情成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取配货单详情失败', error: error.message });
  }
});

// 生成配货单测试数据
router.post('/allocation-orders/generate-test-data', async function (req, res, next) {
  try {
    const { count = 10 } = req.body;

    console.log(`开始生成 ${count} 条配货单测试数据...`);

    // 配货类型选项
    const allocationTypes = ['order_allocation', 'stock_transfer', 'emergency_allocation', 'bulk_allocation'];
    const statuses = ['pending', 'allocated', 'confirmed', 'cancelled'];
    const merchantNames = ['清风便利店', '星期八超市', '百货大楼', '社区小店', '连锁超市'];
    const allocatorNames = ['张三', '李四', '王五', '赵六', '钱七'];

    const createdRecords = [];

    // 确保有基础的商家数据
    let merchants = await Merchant.find().limit(5);
    if (merchants.length === 0) {
      console.log('创建测试商家数据...');
      const merchantsData = merchantNames.map((name, index) => ({
        merchantId: `MERCHANT${Date.now()}${index}`,
        name,
        contactInfo: {
          phone: `138${String(index).padStart(8, '0')}`,
          email: `${name}@example.com`
        },
        businessType: 'retail',
        status: 'active'
      }));

      merchants = await Merchant.insertMany(merchantsData);
      console.log(`创建了 ${merchants.length} 个测试商家`);
    }

    // 获取一些产品用于关联
    let products = await Product.find().limit(10);
    if (products.length === 0) {
      console.log('创建测试产品数据...');
      const productsData = [];
      for (let j = 0; j < 10; j++) {
        productsData.push({
          productId: `PROD${Date.now()}${String(j).padStart(3, '0')}`,
          productName: `测试商品${j + 1}`,
          category: '测试分类',
          specification: '标准规格',
          price: Math.floor(Math.random() * 100) + 10,
          status: 'active'
        });
      }
      products = await Product.insertMany(productsData);
      console.log(`创建了 ${products.length} 个测试产品`);
    }

    // 创建一些测试订单
    let orders = await Order.find().limit(20);
    if (orders.length < 5) {
      console.log('创建测试订单数据...');
      const defaultUser = await User.findOne() || await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: '123456',
        role: 'admin'
      });

      const ordersData = [];
      for (let i = 0; i < 10; i++) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = Math.floor(Math.random() * 100) + 10;
        const totalPrice = quantity * unitPrice;

        ordersData.push({
          orderId: `ORD${Date.now()}${String(i).padStart(3, '0')}`,
          orderType: 'retail',
          orderStatus: 'confirmed',
          customer: {
            customerName: `客户${i + 1}`,
            customerPhone: `139${String(i).padStart(8, '0')}`
          },
          products: [{
            product: products[i % products.length]._id,
            productName: `商品${i + 1}`,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
          }],
          pricing: {
            subtotal: totalPrice,
            totalAmount: totalPrice,
            paidAmount: 0
          },
          payment: {
            paymentMethod: 'cash',
            paymentStatus: 'unpaid'
          },
          merchant: merchants[i % merchants.length]._id,
          createBy: defaultUser._id
        });
      }
      orders = await Order.insertMany(ordersData);
      console.log(`创建了 ${orders.length} 个测试订单`);
    }

    // 生成配货单
    for (let i = 0; i < count; i++) {
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      const allocationType = allocationTypes[Math.floor(Math.random() * allocationTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const allocator = allocatorNames[Math.floor(Math.random() * allocatorNames.length)];
      const priority = Math.floor(Math.random() * 5) + 1;

      // 生成时间（最近30天内的随机时间）
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      // 选择1-3个关联订单
      const numOrders = Math.floor(Math.random() * 3) + 1;
      const relatedOrders = [];
      for (let j = 0; j < numOrders; j++) {
        const randomOrder = orders[Math.floor(Math.random() * orders.length)];
        if (!relatedOrders.includes(randomOrder._id)) {
          relatedOrders.push(randomOrder._id);
        }
      }

      // 生成产品配货信息
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const productList = [];
      let totalAmount = 0;
      let totalRequired = 0;
      let totalAllocated = 0;

      for (let k = 0; k < numProducts; k++) {
        const product = products[k % products.length];
        const requiredQuantity = Math.floor(Math.random() * 10) + 1;
        const allocatedQuantity = status === 'pending' ? 0 : Math.floor(Math.random() * requiredQuantity);
        const unitPrice = Math.floor(Math.random() * 100) + 10;
        const amount = requiredQuantity * unitPrice;

        productList.push({
          product: product._id,
          productName: product.productName,
          productCode: product.productId,
          requiredQuantity,
          allocatedQuantity,
          availableQuantity: Math.floor(Math.random() * 50) + 10,
          unitPrice,
          totalAmount: amount,
          unit: '件',
          allocationStatus: allocatedQuantity >= requiredQuantity ? 'complete' : allocatedQuantity > 0 ? 'partial' : 'pending'
        });

        totalAmount += amount;
        totalRequired += requiredQuantity;
        totalAllocated += allocatedQuantity;
      }

      const completionRate = totalRequired > 0 ? Math.round((totalAllocated / totalRequired) * 100) : 0;

      // 确保有默认用户
      const defaultUser = await User.findOne() || await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: '123456',
        role: 'admin'
      });

      const allocationOrder = new AllocationOrder({
        allocationOrderId: `ALLOC${Date.now()}${String(i).padStart(4, '0')}`,
        relatedOrders,
        merchant: randomMerchant._id,
        allocationType,
        status,
        products: productList,
        allocationInfo: {
          allocationDate: randomDate,
          expectedDeliveryDate: new Date(randomDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          allocator: defaultUser._id
        },
        summary: {
          totalItems: productList.length,
          totalRequiredQuantity: totalRequired,
          totalAllocatedQuantity: totalAllocated,
          totalAmount,
          allocationRate: completionRate
        },
        urgentInfo: {
          isUrgent: priority >= 4,
          urgentLevel: priority >= 4 ? Math.min(priority - 2, 3) : 1,
          urgentReason: priority >= 4 ? '客户要求加急' : ''
        },
        notes: i % 5 === 0 ? `测试配货单备注${i + 1}` : '',
        createBy: defaultUser._id,
        lastUpdateBy: defaultUser._id,
        createdAt: randomDate,
        updatedAt: randomDate
      });

      const savedRecord = await allocationOrder.save();
      createdRecords.push(savedRecord);

      // 每10条记录输出一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`已创建 ${i + 1}/${count} 条配货单`);
      }
    }

    console.log(`成功生成 ${createdRecords.length} 条配货单测试数据`);

    res.json({
      code: 200,
      data: {
        count: createdRecords.length,
        records: createdRecords.slice(0, 3) // 返回前3条作为示例
      },
      message: `成功生成 ${createdRecords.length} 条配货单测试数据`
    });
  } catch (error) {
    console.error('生成配货单测试数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '生成测试数据失败',
      error: error.message
    });
  }
});

// 清空配货单测试数据
router.delete('/allocation-orders/clear-test-data', async function (req, res, next) {
  try {
    const result = await AllocationOrder.deleteMany({});
    console.log(`成功清空 ${result.deletedCount} 条配货单记录`);

    res.json({
      code: 200,
      data: {
        count: result.deletedCount
      },
      message: `成功清空 ${result.deletedCount} 条配货单`
    });
  } catch (error) {
    console.error('清空配货单数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '清空测试数据失败',
      error: error.message
    });
  }
});

// ==================== 作业单相关接口 ====================

// 获取作业单列表
router.get('/work-orders', async function (req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      workOrderId,
      merchantName,
      workType,
      status,
      priority,
      assignedWorker,
      createTimeStart,
      createTimeEnd
    } = req.query;

    let query = {};

    // 作业单号搜索（模糊搜索）
    if (workOrderId) query.workOrderId = new RegExp(workOrderId, 'i');

    // 商家名称搜索（通过关联商家查找）
    if (merchantName) {
      const merchants = await Merchant.find({ name: new RegExp(merchantName, 'i') });
      const merchantObjectIds = merchants.map(merchant => merchant._id);
      if (merchantObjectIds.length > 0) {
        query.merchant = { $in: merchantObjectIds };
      } else {
        return res.json({
          code: 200,
          data: { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) },
          message: '获取作业单列表成功'
        });
      }
    }

    // 作业类型筛选（精确匹配）
    if (workType) query.workType = workType;

    // 状态筛选（精确匹配）
    if (status) query.status = status;

    // 优先级筛选
    if (priority) query.priority = priority;

    // 分配工人搜索（通过执行人员查找）
    if (assignedWorker) {
      query['workExecution.workers.worker'] = { $exists: true };
    }

    // 创建时间范围筛选
    if (createTimeStart || createTimeEnd) {
      const timeQuery = {};
      if (createTimeStart) {
        timeQuery.$gte = new Date(createTimeStart);
      }
      if (createTimeEnd) {
        timeQuery.$lte = new Date(createTimeEnd);
      }
      query.createdAt = timeQuery;
    }

    const total = await WorkOrder.countDocuments(query);
    const workOrders = await WorkOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    // 处理返回数据格式，匹配前端需求，手动获取关联数据
    const processedOrders = await Promise.all(workOrders.map(async (order) => {
      // 手动获取商家名称
      let merchantName = '未知商家';
      if (order.merchant) {
        try {
          const merchant = await Merchant.findById(order.merchant);
          merchantName = merchant?.name || '未知商家';
        } catch (error) {
          console.error('获取商家信息失败:', error);
        }
      }

      // 手动获取关联订单ID
      let orderIds = [];
      if (order.relatedOrders && order.relatedOrders.length > 0) {
        try {
          const orders = await Order.find({ _id: { $in: order.relatedOrders } });
          orderIds = orders.map(o => o.orderId);
        } catch (error) {
          console.error('获取关联订单失败:', error);
        }
      }

      // 获取分配的工人信息
      let assignedWorker = '未分配';
      if (order.workExecution?.workers && order.workExecution.workers.length > 0) {
        const worker = order.workExecution.workers.find(w => w.role === 'leader') || order.workExecution.workers[0];
        if (worker && worker.worker) {
          try {
            const user = await User.findById(worker.worker);
            assignedWorker = user?.username || '未知工人';
          } catch (error) {
            console.error('获取工人信息失败:', error);
          }
        }
      }

      return {
        id: order._id,
        workOrderId: order.workOrderId,
        orderIds,
        merchantName,
        workType: order.workType,
        status: order.status,
        priority: order.priority || 3,
        assignedWorker,
        plannedStartTime: order.workPlan?.planStartTime,
        plannedEndTime: order.workPlan?.planEndTime,
        actualStartTime: order.workExecution?.actualStartTime,
        actualEndTime: order.workExecution?.actualEndTime,
        estimatedDuration: order.workPlan?.estimatedDuration || 0,
        actualDuration: order.workExecution?.actualDuration || 0,
        location: order.workLocation || '未指定',
        equipment: order.workExecution?.equipment?.[0] || '未指定',
        createTime: order.createdAt,
        remarks: order.notes
      };
    }));

    res.json({
      code: 200,
      data: {
        list: processedOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取作业单列表成功'
    });
  } catch (error) {
    console.error('获取作业单列表失败:', error);
    res.status(500).json({ code: 500, message: '获取作业单列表失败', error: error.message });
  }
});

// 获取作业单详情
router.get('/work-orders/:id', async function (req, res, next) {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ code: 404, message: '作业单不存在' });
    }
    res.json({ code: 200, data: workOrder, message: '获取作业单详情成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取作业单详情失败', error: error.message });
  }
});

// 生成作业单测试数据
router.post('/work-orders/generate-test-data', async function (req, res, next) {
  try {
    const { count = 10 } = req.body;

    console.log(`开始生成 ${count} 条作业单测试数据...`);

    // 作业类型选项
    const workTypes = ['picking', 'packing', 'loading', 'unloading', 'inspection', 'maintenance', 'cleaning'];
    const statuses = ['pending', 'assigned', 'in_progress', 'completed', 'paused', 'cancelled'];
    const merchantNames = ['清风便利店', '星期八超市', '百货大楼', '社区小店', '连锁超市'];
    const workerNames = ['张三', '李四', '王五', '赵六', '钱七'];
    const locations = ['仓库A区', '包装区B', '装车区C', '质检区D', '维护区E'];
    const equipments = ['PDA001', '包装台002', '叉车003', '检测仪004', '清洁车005'];

    const createdRecords = [];

    // 确保有基础的商家数据
    let merchants = await Merchant.find().limit(5);
    if (merchants.length === 0) {
      console.log('创建测试商家数据...');
      const merchantsData = merchantNames.map((name, index) => ({
        merchantId: `MERCHANT${Date.now()}${index}`,
        name,
        contactInfo: {
          phone: `138${String(index).padStart(8, '0')}`,
          email: `${name}@example.com`
        },
        businessType: 'retail',
        status: 'active'
      }));

      merchants = await Merchant.insertMany(merchantsData);
      console.log(`创建了 ${merchants.length} 个测试商家`);
    }

    // 获取一些产品用于关联
    let products = await Product.find().limit(10);
    if (products.length === 0) {
      console.log('创建测试产品数据...');
      const productsData = [];
      for (let j = 0; j < 10; j++) {
        productsData.push({
          productId: `PROD${Date.now()}${String(j).padStart(3, '0')}`,
          productName: `测试商品${j + 1}`,
          category: '测试分类',
          specification: '标准规格',
          price: Math.floor(Math.random() * 100) + 10,
          status: 'active'
        });
      }
      products = await Product.insertMany(productsData);
      console.log(`创建了 ${products.length} 个测试产品`);
    }

    // 创建一些测试订单
    let orders = await Order.find().limit(20);
    if (orders.length < 5) {
      console.log('创建测试订单数据...');
      const defaultUser = await User.findOne() || await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: '123456',
        role: 'admin'
      });

      const ordersData = [];
      for (let i = 0; i < 10; i++) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = Math.floor(Math.random() * 100) + 10;
        const totalPrice = quantity * unitPrice;

        ordersData.push({
          orderId: `ORD${Date.now()}${String(i).padStart(3, '0')}`,
          orderType: 'retail',
          orderStatus: 'confirmed',
          customer: {
            customerName: `客户${i + 1}`,
            customerPhone: `139${String(i).padStart(8, '0')}`
          },
          products: [{
            product: products[i % products.length]._id,
            productName: `商品${i + 1}`,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
          }],
          pricing: {
            subtotal: totalPrice,
            totalAmount: totalPrice,
            paidAmount: 0
          },
          payment: {
            paymentMethod: 'cash',
            paymentStatus: 'unpaid'
          },
          merchant: merchants[i % merchants.length]._id,
          createBy: defaultUser._id
        });
      }
      orders = await Order.insertMany(ordersData);
      console.log(`创建了 ${orders.length} 个测试订单`);
    }

    // 确保有工人用户
    let workers = await User.find().limit(5);
    if (workers.length === 0) {
      console.log('创建测试工人数据...');
      const workersData = workerNames.map((name, index) => ({
        username: `worker${index + 1}`,
        email: `worker${index + 1}@example.com`,
        password: '123456',
        role: 'worker',
        profile: { name }
      }));
      workers = await User.insertMany(workersData);
      console.log(`创建了 ${workers.length} 个测试工人`);
    }

    // 生成作业单
    for (let i = 0; i < count; i++) {
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      const workType = workTypes[Math.floor(Math.random() * workTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = Math.floor(Math.random() * 5) + 1;
      const location = locations[Math.floor(Math.random() * locations.length)];
      const equipment = equipments[Math.floor(Math.random() * equipments.length)];

      // 生成时间（最近30天内的随机时间）
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      // 选择1-3个关联订单
      const numOrders = Math.floor(Math.random() * 3) + 1;
      const relatedOrders = [];
      for (let j = 0; j < numOrders; j++) {
        const randomOrder = orders[Math.floor(Math.random() * orders.length)];
        if (!relatedOrders.includes(randomOrder._id)) {
          relatedOrders.push(randomOrder._id);
        }
      }

      // 生成产品作业信息
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const productList = [];

      for (let k = 0; k < numProducts; k++) {
        const product = products[k % products.length];
        const plannedQuantity = Math.floor(Math.random() * 10) + 1;
        const actualQuantity = status === 'pending' ? 0 : Math.floor(Math.random() * plannedQuantity);
        const unitPrice = Math.floor(Math.random() * 100) + 10;

        productList.push({
          product: product._id,
          productName: product.productName,
          productCode: product.productId,
          plannedQuantity,
          actualQuantity,
          unit: '件',
          unitPrice,
          totalAmount: plannedQuantity * unitPrice,
          workStatus: actualQuantity >= plannedQuantity ? 'completed' : actualQuantity > 0 ? 'in_progress' : 'pending',
          quality: 'good'
        });
      }

      // 生成时间计划
      const estimatedDuration = Math.floor(Math.random() * 120) + 30; // 30-150分钟
      const planStartTime = new Date(randomDate.getTime() + Math.random() * 8 * 60 * 60 * 1000);
      const planEndTime = new Date(planStartTime.getTime() + estimatedDuration * 60 * 1000);

      // 根据状态生成实际执行信息
      let workExecution = {};
      if (status !== 'pending') {
        const actualStartTime = new Date(planStartTime.getTime() + (Math.random() - 0.5) * 30 * 60 * 1000);
        const actualDuration = estimatedDuration + Math.floor((Math.random() - 0.5) * 30);

        workExecution = {
          actualStartTime,
          actualDuration,
          workers: [{
            worker: workers[Math.floor(Math.random() * workers.length)]._id,
            role: 'leader',
            startTime: actualStartTime
          }],
          equipment: [{
            equipmentId: `EQ${Date.now()}${i}`,
            equipmentName: equipment,
            usageTime: actualDuration
          }]
        };

        if (status === 'completed') {
          workExecution.actualEndTime = new Date(actualStartTime.getTime() + actualDuration * 60 * 1000);
          workExecution.workers[0].endTime = workExecution.actualEndTime;
        }
      }

      const workOrder = new WorkOrder({
        workOrderId: `WO${Date.now()}${String(i).padStart(4, '0')}`,
        relatedOrders,
        merchant: randomMerchant._id,
        workType,
        status,
        priority,
        workLocation: location,
        products: productList,
        workPlan: {
          planStartTime,
          planEndTime,
          estimatedDuration,
          plannedWorkers: 1,
          requiredSkills: [workType],
          requiredEquipment: [equipment]
        },
        workExecution,
        notes: i % 5 === 0 ? `测试作业单备注${i + 1}` : '',
        createBy: workers[0]._id,
        lastUpdateBy: workers[0]._id,
        createdAt: randomDate,
        updatedAt: randomDate
      });

      const savedRecord = await workOrder.save();
      createdRecords.push(savedRecord);

      // 每10条记录输出一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`已创建 ${i + 1}/${count} 条作业单`);
      }
    }

    console.log(`成功生成 ${createdRecords.length} 条作业单测试数据`);

    res.json({
      code: 200,
      data: {
        count: createdRecords.length,
        records: createdRecords.slice(0, 3) // 返回前3条作为示例
      },
      message: `成功生成 ${createdRecords.length} 条作业单测试数据`
    });
  } catch (error) {
    console.error('生成作业单测试数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '生成测试数据失败',
      error: error.message
    });
  }
});

// 清空作业单测试数据
router.delete('/work-orders/clear-test-data', async function (req, res, next) {
  try {
    const result = await WorkOrder.deleteMany({});
    console.log(`成功清空 ${result.deletedCount} 条作业单记录`);

    res.json({
      code: 200,
      data: {
        count: result.deletedCount
      },
      message: `成功清空 ${result.deletedCount} 条作业单`
    });
  } catch (error) {
    console.error('清空作业单数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '清空测试数据失败',
      error: error.message
    });
  }
});

// ==================== 物流单相关接口 ====================

// 获取物流单列表
router.get('/logistics-orders', async function (req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      logisticsOrderId,
      trackingNumber,
      merchantName,
      logisticsType,
      status,
      logisticsCompany,
      createTimeStart,
      createTimeEnd
    } = req.query;

    let query = {};

    // 物流单号搜索（模糊搜索）
    if (logisticsOrderId) query.logisticsOrderId = new RegExp(logisticsOrderId, 'i');

    // 运单号搜索（模糊搜索）
    if (trackingNumber) query['logisticsCompany.trackingNumber'] = new RegExp(trackingNumber, 'i');

    // 商家名称搜索（通过关联商家查找）
    if (merchantName) {
      const merchants = await Merchant.find({ name: new RegExp(merchantName, 'i') });
      const merchantObjectIds = merchants.map(merchant => merchant._id);
      if (merchantObjectIds.length > 0) {
        query.merchant = { $in: merchantObjectIds };
      } else {
        return res.json({
          code: 200,
          data: { list: [], total: 0, page: parseInt(page), pageSize: parseInt(pageSize) },
          message: '获取物流单列表成功'
        });
      }
    }

    // 物流类型筛选（精确匹配）
    if (logisticsType) query.logisticsType = logisticsType;

    // 状态筛选（精确匹配）
    if (status) query.status = status;

    // 物流公司搜索（模糊搜索）
    if (logisticsCompany) query['logisticsCompany.companyName'] = new RegExp(logisticsCompany, 'i');

    // 创建时间范围筛选
    if (createTimeStart || createTimeEnd) {
      const timeQuery = {};
      if (createTimeStart) {
        timeQuery.$gte = new Date(createTimeStart);
      }
      if (createTimeEnd) {
        timeQuery.$lte = new Date(createTimeEnd);
      }
      query.createdAt = timeQuery;
    }

    const total = await LogisticsOrder.countDocuments(query);
    const logisticsOrders = await LogisticsOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    // 处理返回数据格式，匹配前端需求，手动获取关联数据
    const processedOrders = await Promise.all(logisticsOrders.map(async (order) => {
      // 手动获取商家名称
      let merchantName = '未知商家';
      if (order.merchant) {
        try {
          const merchant = await Merchant.findById(order.merchant);
          merchantName = merchant?.name || '未知商家';
        } catch (error) {
          console.error('获取商家信息失败:', error);
        }
      }

      // 手动获取关联订单ID
      let orderIds = [];
      if (order.relatedOrders && order.relatedOrders.length > 0) {
        try {
          const orders = await Order.find({ _id: { $in: order.relatedOrders } });
          orderIds = orders.map(o => o.orderId);
        } catch (error) {
          console.error('获取关联订单失败:', error);
        }
      }

      return {
        id: order._id,
        logisticsOrderId: order.logisticsOrderId,
        trackingNumber: order.logisticsCompany?.trackingNumber || '',
        orderIds,
        merchantName,
        logisticsType: order.logisticsType,
        status: order.status,
        logisticsCompany: order.logisticsCompany?.companyName || '',
        senderName: order.sender?.name || '',
        senderPhone: order.sender?.phone || '',
        senderAddress: order.sender?.address || '',
        receiverName: order.receiver?.name || '',
        receiverPhone: order.receiver?.phone || '',
        receiverAddress: order.receiver?.address || '',
        scheduledDeliveryTime: order.shipmentInfo?.scheduledDeliveryTime,
        actualDeliveryTime: order.shipmentInfo?.actualDeliveryTime,
        totalFee: order.pricing?.totalFee || 0,
        paymentStatus: order.payment?.paymentStatus || 'unpaid',
        signatory: order.delivery?.signatory || '',
        createTime: order.createdAt,
        remarks: order.notes
      };
    }));

    res.json({
      code: 200,
      data: {
        list: processedOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取物流单列表成功'
    });
  } catch (error) {
    console.error('获取物流单列表失败:', error);
    res.status(500).json({ code: 500, message: '获取物流单列表失败', error: error.message });
  }
});

// 获取物流单详情
router.get('/logistics-orders/:id', async function (req, res, next) {
  try {
    const logisticsOrder = await LogisticsOrder.findById(req.params.id);
    if (!logisticsOrder) {
      return res.status(404).json({ code: 404, message: '物流单不存在' });
    }
    res.json({ code: 200, data: logisticsOrder, message: '获取物流单详情成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取物流单详情失败', error: error.message });
  }
});

// 生成物流单测试数据
router.post('/logistics-orders/generate-test-data', async function (req, res, next) {
  try {
    const { count = 10 } = req.body;

    console.log(`开始生成 ${count} 条物流单测试数据...`);

    // 物流类型选项
    const logisticsTypes = ['delivery', 'pickup', 'transfer', 'return'];
    const statuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'returned', 'cancelled'];
    const merchantNames = ['清风便利店', '星期八超市', '百货大楼', '社区小店', '连锁超市'];
    const logisticsCompanies = ['顺丰速运', '中通快递', '圆通速递', '申通快递', '韵达快递'];
    const senderNames = ['张三', '李四', '王五', '赵六', '钱七'];
    const receiverNames = ['收件人A', '收件人B', '收件人C', '收件人D', '收件人E'];

    const createdRecords = [];

    // 确保有基础的商家数据
    let merchants = await Merchant.find().limit(5);
    if (merchants.length === 0) {
      console.log('创建测试商家数据...');
      const merchantsData = merchantNames.map((name, index) => ({
        merchantId: `MERCHANT${Date.now()}${index}`,
        name,
        contactInfo: {
          phone: `138${String(index).padStart(8, '0')}`,
          email: `${name}@example.com`
        },
        businessType: 'retail',
        status: 'active'
      }));

      merchants = await Merchant.insertMany(merchantsData);
      console.log(`创建了 ${merchants.length} 个测试商家`);
    }

    // 获取一些产品用于关联
    let products = await Product.find().limit(10);
    if (products.length === 0) {
      console.log('创建测试产品数据...');
      const productsData = [];
      for (let j = 0; j < 10; j++) {
        productsData.push({
          productId: `PROD${Date.now()}${String(j).padStart(3, '0')}`,
          productName: `测试商品${j + 1}`,
          category: '测试分类',
          specification: '标准规格',
          price: Math.floor(Math.random() * 100) + 10,
          status: 'active'
        });
      }
      products = await Product.insertMany(productsData);
      console.log(`创建了 ${products.length} 个测试产品`);
    }

    // 创建一些测试订单
    let orders = await Order.find().limit(20);
    if (orders.length < 5) {
      console.log('创建测试订单数据...');
      const defaultUser = await User.findOne() || await User.create({
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: '123456',
        role: 'admin'
      });

      const ordersData = [];
      for (let i = 0; i < 10; i++) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = Math.floor(Math.random() * 100) + 10;
        const totalPrice = quantity * unitPrice;

        ordersData.push({
          orderId: `ORD${Date.now()}${String(i).padStart(3, '0')}`,
          orderType: 'retail',
          orderStatus: 'confirmed',
          customer: {
            customerName: `客户${i + 1}`,
            customerPhone: `139${String(i).padStart(8, '0')}`
          },
          products: [{
            product: products[i % products.length]._id,
            productName: `商品${i + 1}`,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
          }],
          pricing: {
            subtotal: totalPrice,
            totalAmount: totalPrice,
            paidAmount: 0
          },
          payment: {
            paymentMethod: 'cash',
            paymentStatus: 'unpaid'
          },
          merchant: merchants[i % merchants.length]._id,
          createBy: defaultUser._id
        });
      }
      orders = await Order.insertMany(ordersData);
      console.log(`创建了 ${orders.length} 个测试订单`);
    }

    // 确保有用户数据
    let users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('创建测试用户数据...');
      const usersData = [];
      for (let i = 0; i < 5; i++) {
        usersData.push({
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: '123456',
          role: 'admin'
        });
      }
      users = await User.insertMany(usersData);
      console.log(`创建了 ${users.length} 个测试用户`);
    }

    // 生成物流单
    for (let i = 0; i < count; i++) {
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      const logisticsType = logisticsTypes[Math.floor(Math.random() * logisticsTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const companyName = logisticsCompanies[Math.floor(Math.random() * logisticsCompanies.length)];
      const senderName = senderNames[Math.floor(Math.random() * senderNames.length)];
      const receiverName = receiverNames[Math.floor(Math.random() * receiverNames.length)];

      // 生成时间（最近30天内的随机时间）
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      // 选择1-3个关联订单
      const numOrders = Math.floor(Math.random() * 3) + 1;
      const relatedOrders = [];
      for (let j = 0; j < numOrders; j++) {
        const randomOrder = orders[Math.floor(Math.random() * orders.length)];
        if (!relatedOrders.includes(randomOrder._id)) {
          relatedOrders.push(randomOrder._id);
        }
      }

      // 生成产品物流信息
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const productList = [];
      let totalWeight = 0;
      let totalValue = 0;

      for (let k = 0; k < numProducts; k++) {
        const product = products[k % products.length];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const weight = Math.random() * 5 + 0.5; // 0.5-5.5kg
        const value = Math.floor(Math.random() * 1000) + 50;

        productList.push({
          product: product._id,
          productName: product.productName,
          productCode: product.productId,
          quantity,
          unit: '件',
          weight,
          volume: Math.random() * 0.1 + 0.01, // 0.01-0.11m³
          value,
          packageType: 'box',
          isFragile: Math.random() > 0.8,
          isLiquid: Math.random() > 0.9
        });

        totalWeight += weight * quantity;
        totalValue += value * quantity;
      }

      // 生成时间计划
      const scheduledPickupTime = new Date(randomDate.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
      const scheduledDeliveryTime = new Date(scheduledPickupTime.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);

      // 根据状态生成实际时间
      let actualPickupTime, actualDeliveryTime;
      if (status !== 'pending' && status !== 'cancelled') {
        actualPickupTime = new Date(scheduledPickupTime.getTime() + (Math.random() - 0.5) * 4 * 60 * 60 * 1000);
      }
      if (status === 'delivered' || status === 'returned') {
        actualDeliveryTime = new Date(scheduledDeliveryTime.getTime() + (Math.random() - 0.5) * 6 * 60 * 60 * 1000);
      }

      const totalFee = Math.floor((totalWeight * 2 + Math.random() * 20) * 100) / 100;

      const logisticsOrder = new LogisticsOrder({
        logisticsOrderId: `LO${Date.now()}${String(i).padStart(4, '0')}`,
        relatedOrders,
        merchant: randomMerchant._id,
        logisticsType,
        status,
        logisticsCompany: {
          companyId: `COMP${i}`,
          companyName,
          trackingNumber: `${companyName.substring(0, 2).toUpperCase()}${Date.now()}${String(i).padStart(3, '0')}`,
          serviceType: Math.random() > 0.5 ? 'standard' : 'express',
          contactPhone: `400800${String(i).padStart(4, '0')}`
        },
        sender: {
          name: senderName,
          phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          address: `北京市朝阳区测试街道${i + 1}号`,
          detailAddress: `${i + 1}单元${i + 1}室`,
          postcode: '100000'
        },
        receiver: {
          name: receiverName,
          phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          address: `北京市海淀区收件地址${i + 1}号`,
          detailAddress: `${i + 1}号楼${i + 1}室`,
          postcode: '100001'
        },
        products: productList,
        shipmentInfo: {
          scheduledPickupTime,
          actualPickupTime,
          scheduledDeliveryTime,
          actualDeliveryTime,
          estimatedDeliveryTime: scheduledDeliveryTime,
          totalDistance: Math.floor(Math.random() * 500) + 10,
          totalWeight,
          totalVolume: productList.reduce((sum, p) => sum + p.volume * p.quantity, 0),
          packageCount: productList.length
        },
        pricing: {
          baseFee: Math.floor(totalFee * 0.7 * 100) / 100,
          weightFee: Math.floor(totalFee * 0.2 * 100) / 100,
          distanceFee: Math.floor(totalFee * 0.1 * 100) / 100,
          totalFee
        },
        payment: {
          paymentMethod: Math.random() > 0.5 ? 'online' : 'cash_on_delivery',
          paymentStatus: Math.random() > 0.3 ? 'paid' : 'unpaid',
          paymentTime: status === 'delivered' ? actualDeliveryTime : null
        },
        delivery: {
          signatory: status === 'delivered' ? receiverName : '',
          signatureTime: actualDeliveryTime,
          signatureImage: '',
          deliveryPhotos: []
        },
        notes: i % 5 === 0 ? `测试物流单备注${i + 1}` : '',
        createBy: users[0]._id,
        lastUpdateBy: users[0]._id,
        createdAt: randomDate,
        updatedAt: randomDate
      });

      const savedRecord = await logisticsOrder.save();
      createdRecords.push(savedRecord);

      // 每10条记录输出一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`已创建 ${i + 1}/${count} 条物流单`);
      }
    }

    console.log(`成功生成 ${createdRecords.length} 条物流单测试数据`);

    res.json({
      code: 200,
      data: {
        count: createdRecords.length,
        records: createdRecords.slice(0, 3) // 返回前3条作为示例
      },
      message: `成功生成 ${createdRecords.length} 条物流单测试数据`
    });
  } catch (error) {
    console.error('生成物流单测试数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '生成测试数据失败',
      error: error.message
    });
  }
});

// 清空物流单测试数据
router.delete('/logistics-orders/clear-test-data', async function (req, res, next) {
  try {
    const result = await LogisticsOrder.deleteMany({});
    console.log(`成功清空 ${result.deletedCount} 条物流单记录`);

    res.json({
      code: 200,
      data: {
        count: result.deletedCount
      },
      message: `成功清空 ${result.deletedCount} 条物流单`
    });
  } catch (error) {
    console.error('清空物流单数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '清空测试数据失败',
      error: error.message
    });
  }
});

// ==================== 商品相关接口（保留原有接口） ====================

// 商品列表接口已在上方定义，此处不重复

// 加入回收站
router.post('/addProductRecycleBin', async function (req, res) {
  try {
    const {
      originalProduct,
      merchant,
      productSnapshot,
      deleteReason,
      deleteReasonDetail,
      deletedBy,
      autoDeleteAt
    } = req.body;
    console.log(req.body, 'req.body')
    // 创建回收站记录
    const recycleBinItem = new ProductRecycleBin({
      originalProduct,
      merchant,
      productSnapshot,
      deleteReason,
      deleteReasonDetail,
      deletedBy,
      autoDeleteAt
    });

    await recycleBinItem.save();
    // 将原商品标记为已删除
    await Product.findByIdAndUpdate(originalProduct, { status: 'deleted' });

    res.send({ success: true, message: '商品已成功加入回收站' });
  } catch (error) {
    res.send(error)

  }
})
// 获取回收站数据
router.get('/getProductRecycleBin', async function (req, res) {
  try {
    const productRecycleBins = await ProductRecycleBin.find({}); // 获取全部商
    res.send({
      success: 200,
      data: productRecycleBins
    })
  } catch (err) {
    console.log(err, '2')
    res.send(err)
  }

});
// 新增商品审核记录
router.post('/addProductAudit', async function (req, res) {
  try {
    // console.log(req.body, 'req.body')
    const newProduct = new ProductAudit(req.body);
    await newProduct.save();
    res.send({
      success: 200,
      data: newProduct
    })
  } catch (err) {
    console.log(err, '1')
    res.send(err)
  }
});
// 从回收站中恢复商品
router.post('/restoreProductFromRecycleBin', async function (req, res) {
  try {
    // 1. 获取请求参数
    const { productId, restoredBy } = req.body;
    console.log(req.body, '恢复请求参数')

    // 2. 参数验证
    if (!productId) {
      return res.status(400).json({ success: false, message: '回收站原商品ID不能为空' });
    }

    // 3. 查找回收站记录
    const recycleItem = await ProductRecycleBin.findOne({ originalProduct: productId });
    if (!recycleItem) {
      return res.status(404).json({ success: false, message: '未找到该回收站记录' });
    }

    // 4. 获取原商品ID
    const originalProductId = recycleItem.originalProduct;
    if (!originalProductId) {
      return res.status(400).json({ success: false, message: '无法获取原商品ID' });
    }

    // 5. 恢复原商品
    const restoredProduct = await Product.findByIdAndUpdate(
      originalProductId,
      { status: 'pending' }, // 恢复后设为待审核状态
      { new: true }
    );

    if (!restoredProduct) {
      return res.status(404).json({ success: false, message: '未找到原商品' });
    }

    // 6. 删除回收站记录
    await ProductRecycleBin.findByIdAndDelete(recycleItem._id);

    // 7. 返回成功响应
    res.json({
      success: true,
      message: '商品恢复成功并已从回收站移除',
      data: {
        productId: restoredProduct._id,
        productName: restoredProduct.productName
      }
    });
  } catch (error) {
    console.error('恢复商品失败:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
});
// 更新审核状态接口
router.put('/updateAuditStatus', async (req, res) => {
  try {
    const {
      auditId,
      auditStatus,
      auditComments,
      auditTime,
      auditor
    } = req.body;

    // 基本参数验证
    if (!auditId || !auditStatus) {
      return res.status(400).json({ success: false, message: '审核ID和审核结果不能为空' });
    }

    // 验证状态值
    if (!['approved', 'rejected'].includes(auditStatus)) {
      return res.status(400).json({ success: false, message: '审核结果只能是通过或拒绝' });
    }

    // 更新审核记录
    const result = await ProductAudit.findOneAndUpdate(
      { auditId },
      {
        auditStatus,
        auditComments,
        auditTime,
        auditor
      },
      { new: true }
    ).populate('merchant', 'name')
      .populate('auditor', 'loginAccount')
      .populate('submitter', 'loginAccount');

    if (!result) {
      return res.status(404).json({ success: false, message: '未找到该审核记录' });
    }

    // 如果审核通过，更新商品状态
    if (auditStatus === 'approved' && result.product) {
      await Product.findByIdAndUpdate(
        result.product,
        { status: 'onSale' }, // 假设通过后状态为上架
        { new: true }
      );
    }

    res.json({ success: true, message: '审核更新成功', data: result });
  } catch (error) {
    console.error('更新审核状态失败:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
});


router.get('/searchProducts', async function (req, res) {
  try {
    const { name, category, status, inStock, page = 1, pageSize = 10 } = req.query;

    const query = {};

    // 商品名称模糊匹配
    if (name) {
      query.productName = { $regex: name, $options: 'i' };
    }

    // 分类精确匹配（后端字段是字符串，如 "A01"）
    if (category) {
      query.productCategory = category;
    }

    // 状态精确匹配
    if (status) {
      query.status = status;
    }

    // 是否有库存：判断 inventory.currentStock 字段
    if (inStock === '1') {
      query['inventory.currentStock'] = { $gt: 0 };
    } else if (inStock === '0') {
      query['inventory.currentStock'] = { $lte: 0 };
    }

    const skip = (page - 1) * pageSize;

    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(pageSize));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize),
      },
      message: '搜索成功',
    });
  } catch (error) {
    console.error('搜索商品失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
});
// 编辑商品列表
router.put('/updateProductInfo', async (req, res) => {
  try {
    const { productId, ...updateData } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '商品ID不能为空'
      });
    }

    // 查找商品
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '未找到该商品'
      });
    }

    // 更新商品信息
    const updatedProduct = await Product.findOneAndUpdate(
      { productId },
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedProduct,
      message: '商品信息更新成功'
    });
  } catch (error) {
    console.error('更新商品信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});
// 创建新商品API
router.post('/createProduct', async (req, res) => {
  try {
    const { productInfo, merchant, businessType, pricing, inventory, createBy } = req.body;

    // 基本参数验证
    // if (!productInfo || !productInfo.productName || !merchant || !businessType || !createBy) {
    //     return res.status(400).json({ success: false, message: '必要参数缺失' });
    // }

    // 生成商品ID（可以根据实际需求调整生成规则）
    const productId = 'PROD' + Date.now() + Math.floor(Math.random() * 1000);

    // 创建新商品
    const newProduct = new Product({
      productId,
      productName: productInfo.productName,
      productCategory: productInfo.productCategory,
      businessType,
      merchant,
      productInfo,
      pricing: pricing || {},
      inventory: inventory || { currentStock: 0, totalStock: 0, reservedStock: 0 },
      status: 'onSale', // 默认为上架状态
      createBy
    });

    await newProduct.save();
    res.json({ success: true, message: '商品创建成功', data: newProduct });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
});
// 从回收站中永久删除商品
router.delete('/deleteProductFromRecycleBin/:id', async function (req, res) {
  try {
    // 1. 获取请求参数
    const { id } = req.params;

    // 2. 参数验证
    if (!id) {
      return res.status(400).json({ success: false, message: '回收站记录ID不能为空' });
    }

    // 3. 查找并删除回收站记录
    const deletedItem = await ProductRecycleBin.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: '未找到该回收站记录' });
    }

    // 4. 返回成功响应
    res.json({
      success: true,
      message: '商品已从回收站永久删除',
      data: {
        productId: deletedItem.originalProduct,
        productName: deletedItem.productSnapshot?.productName
      }
    });
  } catch (error) {
    console.error('删除回收站商品失败:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
});

// 导出订单数据为Excel
router.post('/orders/export', async (req, res) => {
  try {
    const {
      orderId = '',
      orderStatus = '',
      customerName = '',
      customerPhone = '',
      startDate = '',
      endDate = '',
      paymentMethod = '',
      paymentStatus = '',
      orderType = '',
      productName = '',
      minAmount = '',
      maxAmount = '',
      excludeEmpty = true
    } = req.body;

    console.log('导出请求参数:', req.body);

    // 构建查询条件，与列表查询完全一致
    let query = {};

    // 订单ID搜索（模糊搜索）
    if (orderId) {
      query.orderId = new RegExp(orderId, 'i');
    }

    // 订单状态筛选（精确匹配）
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    // 订单类型筛选（精确匹配）
    if (orderType) {
      query.orderType = orderType;
    }

    // 支付方式筛选（精确匹配）
    if (paymentMethod) {
      query['payment.paymentMethod'] = paymentMethod;
    }

    // 支付状态筛选（精确匹配）
    if (paymentStatus) {
      query['payment.paymentStatus'] = paymentStatus;
    }

    // 客户信息筛选（模糊搜索）
    if (customerName) {
      query['customer.customerName'] = new RegExp(customerName, 'i');
    }

    if (customerPhone) {
      query['customer.customerPhone'] = new RegExp(customerPhone, 'i');
    }

    // 商品名称搜索（在products数组中的productName字段）
    if (productName) {
      query['products.productName'] = new RegExp(productName, 'i');
    }

    // 金额范围筛选
    if (minAmount || maxAmount) {
      query['pricing.totalAmount'] = {};
      if (minAmount) query['pricing.totalAmount'].$gte = parseFloat(minAmount);
      if (maxAmount) query['pricing.totalAmount'].$lte = parseFloat(maxAmount);
    }

    // 时间范围筛选
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + ' 23:59:59')
      };
    }

    // 如果需要排除空数据，添加基本数据完整性验证
    if (excludeEmpty) {
      query.$and = [
        { orderId: { $exists: true, $ne: null, $ne: '' } },
        { orderStatus: { $exists: true, $ne: null, $ne: '' } },
        { createdAt: { $exists: true, $ne: null } }
      ];
    }

    console.log('查询条件:', JSON.stringify(query, null, 2));

    // 查询订单数据
    const orders = await Order.find(query)
      .sort({ createdAt: -1 });

    console.log(`查询到 ${orders.length} 条订单数据`);

    // 过滤数据，确保只包含有效的订单
    const validOrders = orders.filter(order => {
      // 基本字段验证
      if (!order.orderId || !order.orderStatus || !order.createdAt) {
        return false;
      }

      // 如果启用排除空数据，进行更严格的验证
      if (excludeEmpty) {
        // 检查关键字段是否为空
        const hasValidCustomer = order.customer &&
          (order.customer.customerName || order.customer.customerPhone);
        const hasValidPricing = order.pricing &&
          (order.pricing.totalAmount !== undefined && order.pricing.totalAmount !== null);

        // 至少需要有客户信息或定价信息之一
        return hasValidCustomer || hasValidPricing;
      }

      return true;
    });

    console.log(`过滤后有效订单数据: ${validOrders.length} 条`);

    if (validOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有符合条件的订单数据可导出',
        code: 'NO_DATA'
      });
    }

    // 创建Excel工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('订单数据');

    // 设置列标题
    const columns = [
      { header: '订单编号', key: 'orderId', width: 20 },
      { header: '客户姓名', key: 'customerName', width: 15 },
      { header: '联系电话', key: 'customerPhone', width: 15 },
      { header: '订单金额', key: 'totalAmount', width: 12 },
      { header: '已支付金额', key: 'paidAmount', width: 12 },
      { header: '订单状态', key: 'orderStatus', width: 12 },
      { header: '支付状态', key: 'paymentStatus', width: 12 },
      { header: '支付方式', key: 'paymentMethod', width: 12 },
      { header: '订单类型', key: 'orderType', width: 12 },
      { header: '下单时间', key: 'createdAt', width: 20 },
      { header: '商品信息', key: 'products', width: 50 }
    ];

    worksheet.columns = columns;

    // 设置标题行样式
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // 状态映射
    const orderStatusMap = {
      'pending': '待处理',
      'confirmed': '已确认',
      'preparing': '备货中',
      'shipped': '已发货',
      'delivered': '已送达',
      'completed': '已完成',
      'cancelled': '已取消'
    };

    const paymentStatusMap = {
      'unpaid': '未支付',
      'paid': '已支付',
      'partial': '部分支付',
      'refunded': '已退款'
    };

    const orderTypeMap = {
      'normal': '普通订单',
      'presale': '预售订单',
      'group': '团购订单',
      'flash': '秒杀订单',
      'exchange': '换货订单'
    };

    // 添加数据行
    validOrders.forEach((order, index) => {
      // 处理商品信息
      let productsText = '无商品信息';
      if (order.products && Array.isArray(order.products) && order.products.length > 0) {
        productsText = order.products.map(product => {
          const name = product.productName || '未知商品';
          const quantity = product.quantity || 1;
          const price = product.price || 0;
          return `${name}(数量:${quantity}, 单价:¥${price.toFixed(2)})`;
        }).join('; ');
      }

      // 安全获取数据，避免空值
      const rowData = {
        orderId: order.orderId || `订单${index + 1}`,
        customerName: order.customer?.customerName || '未填写',
        customerPhone: order.customer?.customerPhone || '未填写',
        totalAmount: order.pricing?.totalAmount ? `¥${order.pricing.totalAmount.toFixed(2)}` : '¥0.00',
        // 对于已支付状态的订单，已支付金额应为订单总金额
        paidAmount: (() => {
          if (order.payment?.paymentStatus === 'paid') {
            // 已支付状态：已支付金额 = 订单总金额
            return order.pricing?.totalAmount ? `¥${order.pricing.totalAmount.toFixed(2)}` : '¥0.00';
          } else {
            // 其他状态：使用实际已支付金额
            return order.pricing?.paidAmount ? `¥${order.pricing.paidAmount.toFixed(2)}` : '¥0.00';
          }
        })(),
        orderStatus: orderStatusMap[order.orderStatus] || order.orderStatus || '未知状态',
        paymentStatus: paymentStatusMap[order.payment?.paymentStatus] || order.payment?.paymentStatus || '未知',
        paymentMethod: order.payment?.paymentMethod || '未设置',
        orderType: orderTypeMap[order.orderType] || order.orderType || '普通订单',
        createdAt: order.createdAt ? order.createdAt.toLocaleString('zh-CN') : '时间未知',
        products: productsText
      };

      const row = worksheet.addRow(rowData);

      // 设置数据行样式
      row.alignment = { vertical: 'middle', wrapText: true };
      row.height = 35;

      // 为重要数据添加颜色标识
      if (order.orderStatus === 'pending') {
        row.getCell('orderStatus').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2CC' }
        };
      }

      if (order.payment?.paymentStatus === 'unpaid') {
        row.getCell('paymentStatus').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFCCCB' }
        };
      }
    });

    // 设置边框
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // 添加数据统计信息
    const totalAmount = validOrders.reduce((sum, order) =>
      sum + (order.pricing?.totalAmount || 0), 0);

    // 计算实际已支付金额：对于已支付状态的订单，已支付金额=订单总金额
    const totalPaid = validOrders.reduce((sum, order) => {
      if (order.payment?.paymentStatus === 'paid') {
        // 已支付状态：已支付金额 = 订单总金额
        return sum + (order.pricing?.totalAmount || 0);
      } else {
        // 其他状态：使用实际已支付金额
        return sum + (order.pricing?.paidAmount || 0);
      }
    }, 0);

    // 在末尾添加统计行
    const summaryRow = worksheet.addRow({
      orderId: '统计汇总',
      customerName: `共${validOrders.length}个订单`,
      customerPhone: '',
      totalAmount: `¥${totalAmount.toFixed(2)}`,
      paidAmount: `¥${totalPaid.toFixed(2)}`,
      orderStatus: '',
      paymentStatus: '',
      paymentMethod: '',
      orderType: '',
      createdAt: new Date().toLocaleString('zh-CN'),
      products: `未付金额: ¥${(totalAmount - totalPaid).toFixed(2)}`
    });

    // 设置统计行样式
    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E6E6FA' }
    };

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filterInfo = [];
    if (orderId) filterInfo.push('订单号筛选');
    if (orderStatus) filterInfo.push('状态筛选');
    if (customerName) filterInfo.push('客户筛选');
    if (startDate && endDate) filterInfo.push('时间筛选');

    const filterSuffix = filterInfo.length > 0 ? `_${filterInfo.join('_')}` : '';
    const filename = `订单数据${filterSuffix}_${timestamp}.xlsx`;

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);

    // 写入响应
    await workbook.xlsx.write(res);
    res.end();

    console.log(`Excel文件已生成: ${filename}，包含 ${validOrders.length} 条有效记录`);

  } catch (error) {
    console.error('导出订单数据时发生错误:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

module.exports = router;
// 获取商品分类数据
router.get('/productCategories', async function (req, res) {
  try {
    // 获取查询参数
    const {
      businessType,
      categoryLevel,
      status,
      parentCategory,
      name,
      page = 1,
      pageSize = 10
    } = req.query;

    // 构建查询条件
    const query = {};

    // 业务类型过滤
    if (businessType) {
      query.businessType = businessType;
    }

    // 分类级别过滤
    if (categoryLevel) {
      query.categoryLevel = Number(categoryLevel);
    }

    // 状态过滤
    if (status) {
      query.status = status;
    }

    // 父分类过滤
    if (parentCategory) {
      query.parentCategory = parentCategory;
    } else if (parentCategory === 'null') {
      // 支持查询一级分类（无父分类）
      query.parentCategory = null;
    }

    // 分类名称模糊搜索
    if (name) {
      query.categoryName = { $regex: name, $options: 'i' };
    }

    // 计算分页参数
    const skip = (Number(page) - 1) * Number(pageSize);

    // 查询分类数据
    const categories = await ProductCategory.find(query)
      .skip(skip)
      .limit(Number(pageSize))
      .sort({ sortOrder: 1, createdAt: -1 }); // 按排序号和创建时间排序

    // 查询总数
    const total = await ProductCategory.countDocuments(query);

    // 对于二级分类，可能需要补充一级分类名称
    if (categories.length > 0) {
      // 提取所有一级分类ID
      const level1Ids = [...new Set(categories
        .filter(cat => cat.categoryLevel === 2 && cat.categoryLevel1)
        .map(cat => cat.categoryLevel1))];

      if (level1Ids.length > 0) {
        // 查询一级分类信息
        const level1Categories = await ProductCategory.find({
          categoryId: { $in: level1Ids }
        }).select('categoryId categoryName');

        // 创建一级分类ID到名称的映射
        const level1Map = {};
        level1Categories.forEach(cat => {
          level1Map[cat.categoryId] = cat.categoryName;
        });

        // 补充一级分类名称
        categories.forEach(cat => {
          if (cat.categoryLevel === 2 && cat.categoryLevel1) {
            cat.level1CategoryName = level1Map[cat.categoryLevel1] || cat.categoryLevel1;
          }
        });
      }
    }

    // 返回成功响应
    res.json({
      success: true,
      data: categories,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      },
      message: '获取分类数据成功'
    });
  } catch (error) {
    console.error('获取商品分类数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
})

// 增加商品分类接口
router.post('/productCategories', async function (req, res) {
  try {
    // 获取请求参数
    const {
      categoryName,
      businessType,
      parentCategory = null,
      sortOrder = 0,
      status = 'active',
      categoryImages = {}
    } = req.body;

    // 基本参数验证
    if (!categoryName || !businessType) {
      return res.status(400).json({
        success: false,
        message: '分类名称和业务类型不能为空'
      });
    }

    // 验证业务类型
    const validBusinessTypes = ['retail', 'wholesale', 'manufacturer', 'distributor'];
    if (!validBusinessTypes.includes(businessType)) {
      return res.status(400).json({
        success: false,
        message: '业务类型只能是retail、wholesale、manufacturer或distributor'
      });
    }

    // 验证状态
    const validStatuses = ['active', 'inactive', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '状态只能是active、inactive或deleted'
      });
    }

    // 确定分类级别和一级分类
    let categoryLevel = 1;
    let categoryLevel1 = null;

    if (parentCategory) {
      // 查找父分类
      const parentCat = await ProductCategory.findOne({
        categoryId: parentCategory
      });

      if (!parentCat) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的父分类'
        });
      }

      // 设置分类级别
      categoryLevel = parentCat.categoryLevel + 1;

      // 确保分类级别不超过2级
      if (categoryLevel > 2) {
        return res.status(400).json({
          success: false,
          message: '分类级别不能超过2级'
        });
      }

      // 设置一级分类
      categoryLevel1 = parentCat.categoryLevel === 1 ? parentCat.categoryId : parentCat.categoryLevel1;
    }

    // 生成分类ID
    const categoryId = 'CAT' + Date.now() + Math.floor(Math.random() * 1000);

    // 创建新分类
    const newCategory = new ProductCategory({
      categoryId,
      categoryName,
      businessType,
      categoryLevel,
      parentCategory: parentCategory || null,
      categoryLevel1,
      sortOrder,
      status,
      categoryImages,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newCategory.save();

    // 返回成功响应
    res.json({
      success: true,
      message: '商品分类创建成功',
      data: newCategory
    });
  } catch (error) {
    console.error('创建商品分类失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

module.exports = router;