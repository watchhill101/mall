var express = require('express');
var router = express.Router();
require('../moudle/index'); // 确保用户模型被加载
var { Product, ProductAudit, ProductRecycleBin, ProductCategory } = require('../moudle/goods');
var Merchant = require('../moudle/merchant/merchant');
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
    
    // 订单ID或订单号搜索
    if (orderId) query.orderId = new RegExp(orderId, 'i');
    if (orderNumber) query.orderId = new RegExp(orderNumber, 'i'); // orderNumber映射到orderId
    
    // 订单状态筛选
    if (orderStatus) query.orderStatus = orderStatus;
    
    // 订单类型筛选
    if (orderType) query.orderType = orderType;
    
    // 支付方式筛选
    if (paymentMethod) query['payment.paymentMethod'] = paymentMethod;
    
    // 支付状态筛选
    if (paymentStatus) query['payment.paymentStatus'] = paymentStatus;
    
    // 客户信息筛选
    if (customerName) query['customer.customerName'] = new RegExp(customerName, 'i');
    if (customerPhone) query['customer.customerPhone'] = new RegExp(customerPhone, 'i');
    
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
    const { page = 1, pageSize = 10, salesOrderNumber, orderNumber, status } = req.query;
    
    let query = {};
    if (salesOrderNumber) query.salesOrderNumber = new RegExp(salesOrderNumber, 'i');
    if (orderNumber) query.orderNumber = new RegExp(orderNumber, 'i');
    if (status) query.status = status;

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
    res.status(500).json({ code: 500, message: '获取售后列表失败', error: error.message });
  }
});

// ==================== 理货单相关接口 ====================

// 获取理货单列表
router.get('/tally-orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, tallyOrderNumber, status } = req.query;
    
    let query = {};
    if (tallyOrderNumber) query.tallyOrderNumber = new RegExp(tallyOrderNumber, 'i');
    if (status) query.status = status;

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

// ==================== 分拣单相关接口 ====================

// 获取分拣单列表
router.get('/sorting-orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, sortingOrderNumber, status, servicePoint } = req.query;
    
    let query = {};
    if (sortingOrderNumber) query.sortingOrderNumber = new RegExp(sortingOrderNumber, 'i');
    if (status) query.status = status;
    if (servicePoint) query.servicePoint = servicePoint;

    const total = await SortingOrder.countDocuments(query);
    const sortingOrders = await SortingOrder.find(query)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });

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