const express = require('express');
const router = express.Router();
const MerchantWithdraw = require('../moudle/merchant/merchantWithdraw');
const Merchant = require('../moudle/merchant/merchant');
const WithdrawAccount = require('../moudle/merchant/withdrawAccount');
const mongoose = require('mongoose');

// 测试接口
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试MerchantWithdraw接口被调用');
    const count = await MerchantWithdraw.countDocuments();
    res.json({
      code: 200,
      message: 'MerchantWithdraw API 正常运行',
      data: {
        withdrawCount: count,
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

// 获取商家提现列表（分页查询）
router.get('/list', async (req, res) => {
  console.log('📋 获取商家提现列表请求:', req.query);
  try {
    const {
      page = 1,
      pageSize = 10,
      merchantName = '',
      contactPhone = '',
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
      },
      // 关联提现账号信息
      {
        $lookup: {
          from: 'withdrawAccount',
          localField: 'withdrawAccount',
          foreignField: '_id',
          as: 'withdrawAccountInfo'
        }
      },
      {
        $unwind: {
          path: '$withdrawAccountInfo',
          preserveNullAndEmptyArrays: true // 保留没有关联提现账号的记录
        }
      }
    ];

    // 添加筛选条件
    const matchConditions = {};

    if (merchantName) {
      matchConditions['merchantInfo.name'] = { $regex: merchantName, $options: 'i' };
    }

    if (contactPhone) {
      matchConditions['merchantInfo.phone'] = { $regex: contactPhone, $options: 'i' };
    }

    if (status) {
      matchConditions.status = status;
    }

    if (startDate && endDate) {
      matchConditions.applicationTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // 添加计算字段和投影
    pipeline.push({
      $addFields: {
        orderNo: '$orderNumber',
        merchantName: '$merchantInfo.name',
        contactPhone: '$merchantInfo.phone',
        accountType: {
          $ifNull: ['$withdrawAccountInfo.accountType', '未设置'] // 处理空的提现账号
        },
        serviceFeeRate: { $multiply: ['$serviceFeeRate', 100] }, // 转换为百分比
        receivedAmount: '$actualAmount'
      }
    });

    // 投影需要的字段
    pipeline.push({
      $project: {
        orderNo: 1,
        merchantName: 1,
        contactPhone: 1,
        accountType: 1,
        withdrawAmount: 1,
        serviceFeeRate: 1,
        receivedAmount: 1,
        status: 1,
        applicationTime: 1,
        reviewTime: 1,
        reviewAccount: '$reviewer',
        createdAt: 1,
        updatedAt: 1
      }
    });

    // 排序
    pipeline.push({ $sort: { applicationTime: -1 } });

    // 执行聚合查询获取总数
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await MerchantWithdraw.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // 添加分页
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(pageSize) });

    // 执行分页查询
    const withdrawList = await MerchantWithdraw.aggregate(pipeline);

    console.log(`📊 查询结果: 找到 ${withdrawList.length} 条提现记录，总计 ${total} 条`);

    res.json({
      code: 200,
      message: '获取商家提现列表成功',
      data: {
        list: withdrawList.map((item, index) => ({
          ...item,
          key: item._id.toString(),
          id: item._id.toString(),
          applicationTime: item.applicationTime ? new Date(item.applicationTime).toLocaleString('zh-CN') : '',
          reviewTime: item.reviewTime ? new Date(item.reviewTime).toLocaleString('zh-CN') : '',
          reviewAccount: item.reviewAccount || '财务'
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
    console.error('❌ 获取商家提现列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商家提现列表失败: ' + error.message,
      data: null
    });
  }
});

// 审核提现申请
router.post('/audit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remark = '' } = req.body; // action: 'approve' 或 'reject'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的提现申请ID',
        data: null
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        code: 400,
        message: '无效的审核操作',
        data: null
      });
    }

    const withdraw = await MerchantWithdraw.findById(id);
    if (!withdraw) {
      return res.status(404).json({
        code: 404,
        message: '提现申请不存在',
        data: null
      });
    }

    if (withdraw.status !== 'pending') {
      return res.status(400).json({
        code: 400,
        message: '该申请已处理，无法重复审核',
        data: null
      });
    }

    // 更新审核状态
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updatedWithdraw = await MerchantWithdraw.findByIdAndUpdate(
      id,
      {
        status: newStatus,
        reviewTime: new Date(),
        reviewRemark: remark,
        reviewer: null // 这里应该是当前登录用户ID
      },
      { new: true }
    );

    const actionText = action === 'approve' ? '通过' : '拒绝';
    console.log(`✅ 审核${actionText}提现申请: ${withdraw.orderNumber}`);

    res.json({
      code: 200,
      message: `审核${actionText}成功`,
      data: updatedWithdraw
    });
  } catch (error) {
    console.error('❌ 审核提现申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '审核提现申请失败: ' + error.message,
      data: null
    });
  }
});

// 获取提现申请详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的提现申请ID',
        data: null
      });
    }

    const withdraw = await MerchantWithdraw.findById(id)
      .populate('merchant', 'name phone address businessLicense')
      .populate('withdrawAccount', 'accountType accountNumber accountName')
      .lean();

    if (!withdraw) {
      return res.status(404).json({
        code: 404,
        message: '提现申请不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取提现申请详情成功',
      data: withdraw
    });
  } catch (error) {
    console.error('❌ 获取提现申请详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取提现申请详情失败: ' + error.message,
      data: null
    });
  }
});

module.exports = router; 