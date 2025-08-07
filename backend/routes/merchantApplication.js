const express = require('express');
const router = express.Router();
const { jwtAuth } = require('../utils/ejwt');
const MerchantApplication = require('../moudle/merchant/merchantApplication');
const mongoose = require('mongoose');

// 测试接口 - 无需认证
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试merchantApplication接口被调用');
    const count = await MerchantApplication.countDocuments();
    res.json({
      code: 200,
      message: 'MerchantApplication API 正常运行',
      data: {
        applicationCount: count,
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

// 获取商家申请列表（分页查询）
router.get('/list', async (req, res) => {
  console.log('📋 获取商家申请列表请求:', req.query);
  try {
    const {
      page = 1,
      pageSize = 10,
      contactPhone = '',
      status = '',
      auditTime = ''
    } = req.query;

    // 构建查询条件
    const query = {};

    if (contactPhone) {
      // 通过关联的商家信息查询联系电话
      query['merchant.phone'] = { $regex: contactPhone, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    // 审核时间范围查询
    if (auditTime) {
      try {
        const timeRange = JSON.parse(auditTime);
        if (timeRange && timeRange.length === 2) {
          query.reviewTime = {
            $gte: new Date(timeRange[0]),
            $lte: new Date(timeRange[1])
          };
        }
      } catch (e) {
        console.warn('审核时间参数解析失败:', e);
      }
    }

    console.log('🔍 查询条件:', query);

    // 计算跳过的文档数
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // 执行分页查询
    const [applications, total] = await Promise.all([
      MerchantApplication.find(query)
        .populate('merchant', 'name phone address merchantType')
        .populate('personInCharge', 'name phone')
        .populate('reviewer', 'name')
        .skip(skip)
        .limit(parseInt(pageSize))
        .sort({ applicationTime: -1 })
        .lean(),
      MerchantApplication.countDocuments(query)
    ]);

    // 转换数据格式以匹配前端需求
    const formattedApplications = applications.map(app => ({
      id: app._id,
      contactPerson: app.personInCharge?.name || '',
      contactPhone: app.merchant?.phone || '',
      merchantType: app.merchant?.merchantType || '',
      city: app.merchant?.address || '',
      remark1: app.remark || '',
      remark2: app.reviewResult || '',
      status: app.status,
      applicationTime: app.applicationTime ? new Date(app.applicationTime).toLocaleString() : '',
      auditor: app.reviewer?.name || '',
      auditTime: app.reviewTime ? new Date(app.reviewTime).toLocaleString() : ''
    }));

    console.log(`📊 查询结果: 找到 ${applications.length} 条申请记录，总计 ${total} 条`);

    res.json({
      code: 200,
      message: '获取商家申请列表成功',
      data: {
        list: formattedApplications,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取商家申请列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商家申请列表失败: ' + error.message,
      data: null
    });
  }
});

// 获取申请详情
router.get('/detail/:id', jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的申请ID',
        data: null
      });
    }

    const application = await MerchantApplication.findById(id)
      .populate('merchant', 'name phone address merchantType')
      .populate('personInCharge', 'name phone email')
      .populate('reviewer', 'name email');

    if (!application) {
      return res.status(404).json({
        code: 404,
        message: '申请不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取申请详情成功',
      data: application
    });
  } catch (error) {
    console.error('获取申请详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取申请详情失败',
      data: null
    });
  }
});

// 审核申请（通过/拒绝）
router.patch('/audit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reviewResult, rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的申请ID',
        data: null
      });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        code: 400,
        message: '无效的审核操作',
        data: { validActions: ['approve', 'reject'] }
      });
    }

    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewer: req.auth?.userId || new mongoose.Types.ObjectId(), // 从JWT中获取当前用户ID
      reviewTime: new Date(),
      reviewResult: reviewResult || (action === 'approve' ? '审核通过' : '审核拒绝')
    };

    if (action === 'reject' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // 添加状态变更历史
    const statusHistory = {
      status: updateData.status,
      changedBy: req.auth?.userId || new mongoose.Types.ObjectId(),
      changedAt: new Date(),
      comment: reviewResult || rejectionReason
    };

    const updatedApplication = await MerchantApplication.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $push: { statusHistory: statusHistory }
      },
      { new: true }
    ).populate('merchant', 'name phone address merchantType')
      .populate('personInCharge', 'name phone email')
      .populate('reviewer', 'name email');

    if (!updatedApplication) {
      return res.status(404).json({
        code: 404,
        message: '申请不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: `申请${action === 'approve' ? '通过' : '拒绝'}成功`,
      data: updatedApplication
    });
  } catch (error) {
    console.error('审核申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '审核申请失败',
      data: null
    });
  }
});

// 创建商家申请
router.post('/create', jwtAuth, async (req, res) => {
  try {
    const {
      merchant,
      personInCharge,
      applicationType,
      applicationData,
      remark,
      urgency = 'normal',
      expectedProcessTime,
      attachments = []
    } = req.body;

    // 参数验证
    if (!merchant || !personInCharge || !applicationType) {
      return res.status(400).json({
        code: 400,
        message: '请填写所有必填字段',
        data: {
          required: ['merchant', 'personInCharge', 'applicationType']
        }
      });
    }

    // 创建申请
    const application = new MerchantApplication({
      merchant,
      personInCharge,
      applicationType,
      applicationData,
      remark,
      urgency,
      expectedProcessTime,
      attachments,
      status: 'pending'
    });

    await application.save();

    // 返回创建的申请信息
    const createdApplication = await MerchantApplication.findById(application._id)
      .populate('merchant', 'name phone address merchantType')
      .populate('personInCharge', 'name phone email');

    res.status(201).json({
      code: 201,
      message: '申请创建成功',
      data: createdApplication
    });
  } catch (error) {
    console.error('创建申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建申请失败',
      data: null
    });
  }
});

// 获取申请统计信息
router.get('/stats', async (req, res) => {
  try {
    const [
      totalCount,
      pendingCount,
      reviewingCount,
      approvedCount,
      rejectedCount,
      cancelledCount,
      expiredCount
    ] = await Promise.all([
      MerchantApplication.countDocuments(),
      MerchantApplication.countDocuments({ status: 'pending' }),
      MerchantApplication.countDocuments({ status: 'reviewing' }),
      MerchantApplication.countDocuments({ status: 'approved' }),
      MerchantApplication.countDocuments({ status: 'rejected' }),
      MerchantApplication.countDocuments({ status: 'cancelled' }),
      MerchantApplication.countDocuments({ status: 'expired' })
    ]);

    const stats = {
      totalCount,
      statusStats: {
        pending: pendingCount,
        reviewing: reviewingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        cancelled: cancelledCount,
        expired: expiredCount
      }
    };

    res.json({
      code: 200,
      message: '获取申请统计信息成功',
      data: stats
    });
  } catch (error) {
    console.error('获取申请统计信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取申请统计信息失败',
      data: null
    });
  }
});

module.exports = router; 