const express = require('express');
const router = express.Router();
const { jwtAuth } = require('../utils/ejwt');
const AccountDetail = require('../moudle/merchant/accountDetail');
const Merchant = require('../moudle/merchant/merchant');
const mongoose = require('mongoose');

// 测试接口
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试AccountDetail接口被调用');
    const count = await AccountDetail.countDocuments();
    res.json({
      code: 200,
      message: 'AccountDetail API 正常运行',
      data: {
        accountDetailCount: count,
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

// 获取账户明细列表（分页查询）
router.get('/list', async (req, res) => {
  console.log('📋 获取账户明细列表请求:', req.query);
  try {
    const {
      page = 1,
      pageSize = 10,
      merchantType = '',
      merchantName = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // 构建聚合查询管道
    const pipeline = [
      // 关联商家信息
      {
        $lookup: {
          from: 'merchants',
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

    if (merchantType) {
      matchConditions['merchantInfo.merchantType'] = merchantType;
    }

    if (merchantName) {
      matchConditions['merchantInfo.name'] = { $regex: merchantName, $options: 'i' };
    }

    if (startDate && endDate) {
      matchConditions.updatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // 添加计算字段
    pipeline.push({
      $addFields: {
        createTime: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        // 计算未提现金额 = 账户余额 - 提现中金额
        unwithdraw: { $subtract: ["$accountBalance", "$withdrawingAmount"] }
      }
    });

    // 投影需要的字段
    pipeline.push({
      $project: {
        merchantType: '$merchantInfo.merchantType',
        merchantName: '$merchantInfo.name',
        contactPhone: '$merchantInfo.phone',
        businessLicense: '$merchantInfo.businessLicense',
        address: '$merchantInfo.address',
        accountBalance: 1,
        withdrawn: '$withdrawnAmount',
        unwithdraw: 1,
        withdrawing: '$withdrawingAmount',
        serviceFee: 1,
        createTime: 1,
        createdAt: 1,
        updatedAt: 1
      }
    });

    // 排序
    pipeline.push({ $sort: { updatedAt: -1 } });

    // 执行聚合查询获取总数
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await AccountDetail.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // 添加分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(pageSize) });

    // 执行分页查询
    const accountDetails = await AccountDetail.aggregate(pipeline);

    console.log(`📊 查询结果: 找到 ${accountDetails.length} 条账户明细记录，总计 ${total} 条`);

    res.json({
      code: 200,
      message: '获取账户明细列表成功',
      data: {
        list: accountDetails.map((item, index) => ({
          ...item,
          key: item._id.toString(),
          id: item._id.toString()
        })),
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取账户明细列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取账户明细列表失败: ' + error.message,
      data: null
    });
  }
});

// 获取账户统计信息
router.get('/stats', async (req, res) => {
  try {
    const {
      merchantType = '',
      merchantName = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // 构建聚合查询管道
    const pipeline = [
      // 关联商家信息
      {
        $lookup: {
          from: 'merchants',
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

    if (merchantType) {
      matchConditions['merchantInfo.merchantType'] = merchantType;
    }

    if (merchantName) {
      matchConditions['merchantInfo.name'] = { $regex: merchantName, $options: 'i' };
    }

    if (startDate && endDate) {
      matchConditions.updatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // 计算统计数据
    pipeline.push({
      $group: {
        _id: null,
        totalAmount: { $sum: "$accountBalance" },
        accountBalance: { $sum: "$accountBalance" },
        withdrawn: { $sum: "$withdrawnAmount" },
        unwithdraw: { $sum: { $subtract: ["$accountBalance", "$withdrawingAmount"] } },
        withdrawing: { $sum: "$withdrawingAmount" },
        serviceFee: { $sum: "$serviceFee" },
        count: { $sum: 1 }
      }
    });

    pipeline.push({
      $project: {
        _id: 0,
        totalAmount: 1,
        accountBalance: 1,
        withdrawn: 1,
        unwithdraw: 1,
        withdrawing: 1,
        serviceFee: 1,
        commission: { $multiply: ["$serviceFee", 0.8] }, // 分润佣金为服务费的80%
        count: 1
      }
    });

    const statsResult = await AccountDetail.aggregate(pipeline);
    const stats = statsResult.length > 0 ? statsResult[0] : {
      totalAmount: 0,
      accountBalance: 0,
      withdrawn: 0,
      unwithdraw: 0,
      withdrawing: 0,
      serviceFee: 0,
      commission: 0,
      count: 0
    };

    console.log('📊 统计数据:', stats);

    res.json({
      code: 200,
      message: '获取账户统计信息成功',
      data: stats
    });
  } catch (error) {
    console.error('❌ 获取账户统计信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取账户统计信息失败: ' + error.message,
      data: null
    });
  }
});

// 获取账户明细详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账户明细ID',
        data: null
      });
    }

    const accountDetail = await AccountDetail.findById(id)
      .populate('merchant', 'name merchantType phone address businessLicense')
      .lean();

    if (!accountDetail) {
      return res.status(404).json({
        code: 404,
        message: '账户明细不存在',
        data: null
      });
    }

    // 格式化数据
    const formattedDetail = {
      ...accountDetail,
      merchantType: accountDetail.merchant?.merchantType || '',
      merchantName: accountDetail.merchant?.name || '',
      contactPhone: accountDetail.merchant?.phone || '',
      businessLicense: accountDetail.merchant?.businessLicense || '',
      address: accountDetail.merchant?.address || '',
      createTime: accountDetail.createdAt ? new Date(accountDetail.createdAt).toISOString().split('T')[0] : '',
      withdrawn: accountDetail.withdrawnAmount || 0,
      unwithdraw: (accountDetail.accountBalance || 0) - (accountDetail.withdrawingAmount || 0),
      withdrawing: accountDetail.withdrawingAmount || 0
    };

    res.json({
      code: 200,
      message: '获取账户明细详情成功',
      data: formattedDetail
    });
  } catch (error) {
    console.error('❌ 获取账户明细详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取账户明细详情失败: ' + error.message,
      data: null
    });
  }
});

module.exports = router; 