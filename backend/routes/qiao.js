var express = require('express');
var router = express.Router();
require('../moudle/index'); // 确保用户模型被加载
var { Product } = require('../moudle/goods');
var {
  Order,
  AfterSales,
  TallyOrder,
  SortingOrder,
  PaymentRecord,
  AllocationOrder,
  WorkOrder,
  LogisticsOrder
} = require('../moudle/goodsOrder');

// ==================== 订单管理相关接口 ====================

// 获取订单列表
router.get('/orders', async function (req, res, next) {
  try {
    const { page = 1, pageSize = 10, orderNumber, shopLocation, status, paymentMethod } = req.query;
    
    let query = {};
    if (orderNumber) query.orderNumber = new RegExp(orderNumber, 'i');
    if (shopLocation) query.shopLocation = shopLocation;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
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
    res.status(500).json({ code: 500, message: '获取订单列表失败', error: error.message });
  }
});

// 获取订单详情
router.get('/orders/:id', async function (req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    res.json({ code: 200, data: order, message: '获取订单详情成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取订单详情失败', error: error.message });
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

// 获取商品列表
router.get('/products', async function (req, res, next) {
  try {
    const products = await Product.find({});
    res.json({
      code: 200,
      data: products,
      message: '获取商品列表成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取商品列表失败', error: error.message });
  }
});

module.exports = router;
