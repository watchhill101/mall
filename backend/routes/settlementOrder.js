const express = require('express');
const router = express.Router();
const SettlementOrder = require('../moudle/merchant/settlementOrder');
const Merchant = require('../moudle/merchant/merchant');
const mongoose = require('mongoose');

// 测试接口
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试SettlementOrder接口被调用');
    const count = await SettlementOrder.countDocuments();
    res.json({
      code: 200,
      message: 'SettlementOrder API 正常运行',
      data: {
        orderCount: count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ 测试接口错误:', error);
    res.status(500).json({
      code: 500,
      message: '测试接口错误: ' + error.message,
      data: null
    });
  }
});

// 获取结算订单列表（分页查询）
router.get('/list', async (req, res) => {
  console.log('📋 获取结算订单列表请求:', req.query);
  try {
    const {
      page = 1,
      pageSize = 10,
      merchantName = '',
      orderNo = '',
      productName = '',
      status = '',
      timeType = '',
      startDate = '',
      endDate = '',
      minAmount = '',
      maxAmount = '',
      minQuantity = '',
      maxQuantity = ''
    } = req.query;

    // 构建聚合查询管道
    const pipeline = [
      // 关联商家信息
      {
        $lookup: {
          from: 'merchant',
          localField: 'merchant',
          foreignField: '_id',
          as: 'merchantInfo'
        }
      },
      {
        $unwind: '$merchantInfo'
      }
    ];

    // 添加筛选条件
    const matchConditions = {};

    if (merchantName) {
      matchConditions['merchantInfo.name'] = { $regex: merchantName, $options: 'i' };
    }

    if (orderNo) {
      matchConditions.orderNumber = { $regex: orderNo, $options: 'i' };
    }

    if (productName) {
      matchConditions['productInfo.name'] = { $regex: productName, $options: 'i' };
    }

    if (status) {
      matchConditions.status = status;
    }

    // 根据时间类型添加日期筛选
    if (timeType && startDate && endDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate + ' 23:59:59');

      if (timeType === 'paymentTime') {
        matchConditions.paymentTime = {
          $gte: startDateTime,
          $lte: endDateTime
        };
      } else if (timeType === 'settlementTime') {
        matchConditions.settlementTime = {
          $gte: startDateTime,
          $lte: endDateTime
        };
      }
    }

    // 添加金额范围筛选
    if (minAmount !== '' || maxAmount !== '') {
      matchConditions.totalAmount = {};
      if (minAmount !== '') {
        matchConditions.totalAmount.$gte = parseFloat(minAmount);
      }
      if (maxAmount !== '') {
        matchConditions.totalAmount.$lte = parseFloat(maxAmount);
      }
    }

    // 添加数量范围筛选
    if (minQuantity !== '' || maxQuantity !== '') {
      matchConditions.quantity = {};
      if (minQuantity !== '') {
        matchConditions.quantity.$gte = parseInt(minQuantity);
      }
      if (maxQuantity !== '') {
        matchConditions.quantity.$lte = parseInt(maxQuantity);
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // 添加计算字段和投影
    pipeline.push({
      $addFields: {
        orderNo: '$orderNumber',
        merchantName: '$merchantInfo.name',
        networkPoint: '$requiredOutlet',
        productName: '$specification', // 直接使用规格作为商品名称
        specifications: '$specification',
        supplyPrice: '$supplyPrice',
        quantity: '$quantity',
        totalPrice: '$totalAmount',
        settlementStatus: {
          $switch: {
            branches: [
              { case: { $in: ['$status', ['pending', 'confirmed', 'approved', 'shipped', 'delivered']] }, then: 'unsettled' },
              { case: { $eq: ['$status', 'completed'] }, then: 'settled' },
              { case: { $in: ['$status', ['rejected', 'cancelled']] }, then: 'failed' }
            ],
            default: 'unsettled'
          }
        }
      }
    });

    // 投影需要的字段
    pipeline.push({
      $project: {
        id: { $toString: '$_id' },
        orderNo: 1,
        merchantName: 1,
        networkPoint: 1,
        productName: 1,
        specifications: 1,
        supplyPrice: 1,
        quantity: 1,
        totalPrice: 1,
        settlementStatus: 1,
        paymentTime: 1,
        settlementTime: 1,
        createdAt: 1,
        updatedAt: 1
      }
    });

    // 排序
    pipeline.push({ $sort: { createdAt: -1 } });

    // 执行聚合查询获取总数
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await SettlementOrder.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // 添加分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(pageSize) });

    // 执行分页查询
    const orderList = await SettlementOrder.aggregate(pipeline);

    console.log(`📊 查询结果: 找到 ${orderList.length} 条结算订单，总计 ${total} 条`);

    // 输出搜索条件统计
    const searchConditions = [];
    if (merchantName) searchConditions.push(`商家: ${merchantName}`);
    if (orderNo) searchConditions.push(`订单号: ${orderNo}`);
    if (productName) searchConditions.push(`商品: ${productName}`);
    if (status) searchConditions.push(`状态: ${status}`);
    if (timeType && startDate && endDate) searchConditions.push(`${timeType === 'paymentTime' ? '支付' : '结算'}时间: ${startDate} ~ ${endDate}`);
    if (minAmount || maxAmount) searchConditions.push(`金额: ${minAmount || '0'} ~ ${maxAmount || '∞'}`);
    if (minQuantity || maxQuantity) searchConditions.push(`数量: ${minQuantity || '0'} ~ ${maxQuantity || '∞'}`);

    if (searchConditions.length > 0) {
      console.log('🔍 应用的搜索条件:', searchConditions.join(', '));
    }

    res.json({
      code: 200,
      message: '获取结算订单列表成功',
      data: {
        list: orderList.map((item, index) => ({
          ...item,
          key: item.id,
          paymentTime: item.paymentTime ? new Date(item.paymentTime).toLocaleString('zh-CN') : '',
          settlementTime: item.settlementTime ? new Date(item.settlementTime).toLocaleString('zh-CN') : ''
        })),
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        },
        searchConditions: searchConditions.length > 0 ? searchConditions : null
      }
    });
  } catch (error) {
    console.error('❌ 获取结算订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取结算订单列表失败: ' + error.message,
      data: null
    });
  }
});

// 获取结算订单详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的订单ID',
        data: null
      });
    }

    const order = await SettlementOrder.findById(id)
      .populate('merchant', 'name phone address businessLicense')
      .populate('product', 'name description category brand')
      .populate('reviewer', 'name')
      .lean();

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '结算订单不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取结算订单详情成功',
      data: order
    });
  } catch (error) {
    console.error('❌ 获取结算订单详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取结算订单详情失败: ' + error.message,
      data: null
    });
  }
});

// 更新结算订单状态
router.put('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的订单ID',
        data: null
      });
    }

    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled', 'approved', 'shipped', 'delivered', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值',
        data: null
      });
    }

    const order = await SettlementOrder.findById(id);
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '结算订单不存在',
        data: null
      });
    }

    // 更新状态和相关时间字段
    const updateData = {
      status,
      reviewRemark: remark,
      reviewTime: new Date()
    };

    // 根据状态设置特定时间
    if (status === 'completed') {
      updateData.settlementTime = new Date();
      updateData.completedTime = new Date();
    } else if (status === 'shipped') {
      updateData.deliveryTime = new Date();
    }

    const updatedOrder = await SettlementOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    console.log(`✅ 更新结算订单状态: ${order.orderNumber} -> ${status}`);

    res.json({
      code: 200,
      message: '更新订单状态成功',
      data: updatedOrder
    });
  } catch (error) {
    console.error('❌ 更新结算订单状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新结算订单状态失败: ' + error.message,
      data: null
    });
  }
});

module.exports = router; 