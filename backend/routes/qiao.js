var express = require('express');
var router = express.Router();
var ExcelJS = require('exceljs');
require('../moudle/index'); // 确保用户模型被加载
var { Product, ProductAudit, ProductRecycleBin, ProductCategory } = require('../moudle/goods');
var Merchant = require('../moudle/merchant/merchant');
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
    const pendingOrders = await Order.countDocuments({...dateFilter, orderStatus: 'pending'});
    const unpaidOrders = await Order.countDocuments({...dateFilter, 'payment.paymentStatus': 'unpaid'});
    
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
    const { page = 1, pageSize = 10, orderNumber, thirdPartyNumber, shopLocation, businessType } = req.query;
    
    let query = {};
    if (orderNumber) query.orderNumber = new RegExp(orderNumber, 'i');
    if (thirdPartyNumber) query.thirdPartyNumber = new RegExp(thirdPartyNumber, 'i');
    if (shopLocation) query.shopLocation = shopLocation;
    if (businessType) query.businessType = businessType;

    const total = await PaymentRecord.countDocuments(query);
    const paymentRecords = await PaymentRecord.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      data: {
        list: paymentRecords,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取收款记录列表成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取收款记录列表失败', error: error.message });
  }
});

// ==================== 配货单相关接口 ====================

// 获取配货单列表
router.get('/allocation-orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, allocationNumber, fromWarehouse, toWarehouse, status } = req.query;
    
    let query = {};
    if (allocationNumber) query.allocationNumber = new RegExp(allocationNumber, 'i');
    if (fromWarehouse) query.fromWarehouse = fromWarehouse;
    if (toWarehouse) query.toWarehouse = toWarehouse;
    if (status) query.status = status;

    const total = await AllocationOrder.countDocuments(query);
    const allocationOrders = await AllocationOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      data: {
        list: allocationOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取配货单列表成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取配货单列表失败', error: error.message });
  }
});

// 获取配货单详情
router.get('/allocation-orders/:id', async function (req, res, next) {
  try {
    const allocationOrder = await AllocationOrder.findById(req.params.id);
    if (!allocationOrder) {
      return res.status(404).json({ code: 404, message: '配货单不存在' });
    }
    res.json({ code: 200, data: allocationOrder, message: '获取配货单详情成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取配货单详情失败', error: error.message });
  }
});

// ==================== 作业单相关接口 ====================

// 获取作业单列表
router.get('/work-orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, workOrderNumber, warehouse, status } = req.query;
    
    let query = {};
    if (workOrderNumber) query.workOrderNumber = new RegExp(workOrderNumber, 'i');
    if (warehouse) query.warehouse = warehouse;
    if (status) query.status = status;

    const total = await WorkOrder.countDocuments(query);
    const workOrders = await WorkOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      data: {
        list: workOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取作业单列表成功'
    });
  } catch (error) {
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

// ==================== 物流单相关接口 ====================

// 获取物流单列表
router.get('/logistics-orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, logisticsNumber, carrier, status } = req.query;
    
    let query = {};
    if (logisticsNumber) query.logisticsNumber = new RegExp(logisticsNumber, 'i');
    if (carrier) query.carrier = carrier;
    if (status) query.status = status;

    const total = await LogisticsOrder.countDocuments(query);
    const logisticsOrders = await LogisticsOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

    res.json({
      code: 200,
      data: {
        list: logisticsOrders,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      message: '获取物流单列表成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取物流单列表失败', error: error.message });
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