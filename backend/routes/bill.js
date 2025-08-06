const express = require('express');
const router = express.Router();
const Bill = require('../moudle/merchant/bill');
const Merchant = require('../moudle/merchant/merchant');
const SettlementOrder = require('../moudle/merchant/settlementOrder');
const mongoose = require('mongoose');

// 测试接口
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试Bill接口被调用');
    const count = await Bill.countDocuments();
    res.json({
      code: 200,
      message: 'Bill API 正常运行',
      data: {
        billCount: count,
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

// 获取结算账单列表（分页查询）
router.get('/list', async (req, res) => {
  console.log('📋 获取结算账单列表请求:', req.query);
  try {
    const {
      page = 1,
      pageSize = 10,
      merchantName = '',
      status = '',
      startDate = '',
      endDate = ''
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

    // 构建匹配条件
    const matchConditions = {};

    // 商家名称筛选
    if (merchantName) {
      matchConditions['merchantInfo.name'] = {
        $regex: merchantName,
        $options: 'i'
      };
    }

    // 状态筛选
    if (status) {
      matchConditions.status = status;
    }

    // 日期范围筛选
    if (startDate || endDate) {
      matchConditions.billPeriodStart = {};
      if (startDate) {
        matchConditions.billPeriodStart.$gte = new Date(startDate);
      }
      if (endDate) {
        matchConditions.billPeriodEnd = {};
        matchConditions.billPeriodEnd.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // 添加计算字段
    pipeline.push({
      $addFields: {
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$billPeriodStart"
          }
        }
      }
    });

    // 排序
    pipeline.push({ $sort: { createdAt: -1 } });

    // 获取总数
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Bill.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // 分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(pageSize) });

    // 执行查询
    const bills = await Bill.aggregate(pipeline);

    // 格式化返回数据
    const formattedBills = bills.map(bill => ({
      id: bill._id,
      date: bill.date,
      merchantName: bill.merchantInfo.name,
      orderCount: bill.orderCount,
      orderAmount: bill.totalAmount,
      refundOrderCount: 0, // 这里需要根据实际业务逻辑计算
      refundAmount: 0, // 这里需要根据实际业务逻辑计算
      wechatSales: Math.floor(Math.random() * 10), // 模拟数据，实际应从相关表获取
      wechatSalesAmount: Math.floor(Math.random() * 100),
      wechatRefund: Math.floor(Math.random() * 5),
      wechatRefundAmount: Math.floor(Math.random() * 50),
      status: bill.status,
      totalAmount: bill.totalAmount,
      serviceFee: bill.serviceFee,
      actualAmount: bill.actualAmount,
      billNumber: bill.billNumber,
      billPeriodStart: bill.billPeriodStart,
      billPeriodEnd: bill.billPeriodEnd
    }));

    res.json({
      code: 200,
      message: '获取结算账单列表成功',
      data: {
        list: formattedBills,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total
        }
      }
    });

  } catch (error) {
    console.error('❌ 获取结算账单列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取结算账单列表失败: ' + error.message,
      data: null
    });
  }
});

// 获取账单统计数据
router.get('/stats', async (req, res) => {
  console.log('📊 获取账单统计数据请求:', req.query);
  try {
    const {
      merchantName = '',
      startDate = '',
      endDate = ''
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

    // 构建匹配条件
    const matchConditions = {};

    // 商家名称筛选
    if (merchantName) {
      matchConditions['merchantInfo.name'] = {
        $regex: merchantName,
        $options: 'i'
      };
    }

    // 日期范围筛选
    if (startDate || endDate) {
      matchConditions.billPeriodStart = {};
      if (startDate) {
        matchConditions.billPeriodStart.$gte = new Date(startDate);
      }
      if (endDate) {
        matchConditions.billPeriodEnd = {};
        matchConditions.billPeriodEnd.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // 统计聚合
    pipeline.push({
      $group: {
        _id: null,
        orderCount: { $sum: '$orderCount' },
        totalAmount: { $sum: '$totalAmount' },
        serviceFee: { $sum: '$serviceFee' },
        actualAmount: { $sum: '$actualAmount' },
        totalQuantity: { $sum: '$totalQuantity' },
        billCount: { $sum: 1 }
      }
    });

    const statsResult = await Bill.aggregate(pipeline);
    const stats = statsResult.length > 0 ? statsResult[0] : {
      orderCount: 0,
      totalAmount: 0,
      serviceFee: 0,
      actualAmount: 0,
      totalQuantity: 0,
      billCount: 0
    };

    // 模拟其他统计数据（实际应从相关表获取）
    const mockStats = {
      refundOrderCount: Math.floor(stats.orderCount * 0.1),
      refundAmount: Math.floor(stats.totalAmount * 0.05),
      rechargeAmount: stats.totalAmount,
      salesAmount: stats.totalAmount,
      salesCount: stats.orderCount,
      wechatSales: {
        amount: Math.floor(stats.totalAmount * 0.7),
        count: Math.floor(stats.orderCount * 0.7)
      },
      balanceSales: {
        amount: Math.floor(stats.totalAmount * 0.3),
        count: Math.floor(stats.orderCount * 0.3)
      },
      totalRefundAmount: Math.floor(stats.totalAmount * 0.05),
      totalRefundCount: Math.floor(stats.orderCount * 0.1),
      wechatRefund: {
        amount: Math.floor(stats.totalAmount * 0.03),
        count: Math.floor(stats.orderCount * 0.06)
      },
      balanceRefund: {
        amount: Math.floor(stats.totalAmount * 0.02),
        count: Math.floor(stats.orderCount * 0.04)
      }
    };

    res.json({
      code: 200,
      message: '获取账单统计数据成功',
      data: {
        ...stats,
        ...mockStats
      }
    });

  } catch (error) {
    console.error('❌ 获取账单统计数据错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取账单统计数据失败: ' + error.message,
      data: null
    });
  }
});

// 获取账单详情
router.get('/detail/:id', async (req, res) => {
  console.log('📄 获取账单详情请求:', req.params.id);
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账单ID',
        data: null
      });
    }

    const bill = await Bill.findById(id)
      .populate('merchant', 'merchantName contactPhone address')
      .populate('settlementOrders');

    if (!bill) {
      return res.status(404).json({
        code: 404,
        message: '账单不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取账单详情成功',
      data: bill
    });

  } catch (error) {
    console.error('❌ 获取账单详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取账单详情失败: ' + error.message,
      data: null
    });
  }
});

// 更新账单状态
router.put('/status/:id', async (req, res) => {
  console.log('📝 更新账单状态请求:', req.params.id, req.body);
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账单ID',
        data: null
      });
    }

    const updateData = { status };
    if (remark) {
      updateData.remark = remark;
    }

    // 根据状态更新相关时间戳
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    } else if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const bill = await Bill.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('merchant', 'merchantName');

    if (!bill) {
      return res.status(404).json({
        code: 404,
        message: '账单不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '更新账单状态成功',
      data: bill
    });

  } catch (error) {
    console.error('❌ 更新账单状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '更新账单状态失败: ' + error.message,
      data: null
    });
  }
});

module.exports = router; 