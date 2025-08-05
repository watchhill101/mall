const express = require('express');
const router = express.Router();
const { jwtAuth } = require('../utils/ejwt');
const Merchant = require('../moudle/merchant/merchant');
const mongoose = require('mongoose');

// 测试接口 - 无需认证
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试merchant接口被调用');
    const count = await Merchant.countDocuments();
    res.json({
      code: 200,
      message: 'Merchant API 正常运行',
      data: {
        merchantCount: count,
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

// 获取商户列表（分页查询） - 临时移除JWT认证用于调试
router.get('/list', async (req, res) => {
  console.log('📋 获取商户列表请求:', req.query);
  try {


    const {
      page = 1,
      pageSize = 10,
      searchText = '',
      status = '',
      merchantType = ''
    } = req.query;

    // 构建查询条件
    const query = {};

    if (searchText) {
      query.$or = [
        { name: { $regex: searchText, $options: 'i' } },
        { phone: { $regex: searchText, $options: 'i' } },
        { address: { $regex: searchText, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (merchantType) {
      query.merchantType = merchantType;
    }

    console.log('🔍 查询条件:', query);

    // 计算跳过的文档数
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // 执行分页查询 - 修复populate引用
    const [merchants, total] = await Promise.all([
      Merchant.find(query)
        .populate('personInCharge', 'name phone email')
        .populate('role', 'name')
        .skip(skip)
        .limit(parseInt(pageSize))
        .sort({ createdAt: -1 })
        .lean(), // 添加lean()提高性能
      Merchant.countDocuments(query)
    ]);

    console.log(`📊 查询结果: 找到 ${merchants.length} 条商户记录，总计 ${total} 条`);

    res.json({
      code: 200,
      message: '获取商户列表成功',
      data: {
        list: merchants,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取商户列表失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      code: 500,
      message: '获取商户列表失败: ' + error.message,
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 获取商户详情
router.get('/detail/:id', jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的商户ID',
        data: null
      });
    }

    const merchant = await Merchant.findById(id)
      .populate('personInCharge', 'name phone email')
      .populate('role', 'name permissions')
      .populate('approvedBy', 'name');

    if (!merchant) {
      return res.status(404).json({
        code: 404,
        message: '商户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取商户详情成功',
      data: merchant
    });
  } catch (error) {
    console.error('获取商户详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商户详情失败',
      data: null
    });
  }
});

// 创建商户
router.post('/create', jwtAuth, async (req, res) => {
  try {
    const {
      name,
      merchantType,
      isSelfOperated = false,
      phone,
      address,
      logoUrl,
      personInCharge,
      role,
      serviceCharge = 0.1,
      businessLicense,
      taxNumber
    } = req.body;

    // 参数验证
    if (!name || !merchantType || !phone || !address || !logoUrl || !personInCharge || !role) {
      return res.status(400).json({
        code: 400,
        message: '请填写所有必填字段',
        data: {
          required: ['name', 'merchantType', 'phone', 'address', 'logoUrl', 'personInCharge', 'role']
        }
      });
    }

    // 检查手机号是否已存在
    const existingMerchant = await Merchant.findOne({ phone });
    if (existingMerchant) {
      return res.status(400).json({
        code: 400,
        message: '该手机号已被注册',
        data: null
      });
    }

    // 创建商户
    const merchant = new Merchant({
      name,
      merchantType,
      isSelfOperated,
      phone,
      address,
      logoUrl,
      personInCharge,
      role,
      serviceCharge,
      businessLicense,
      taxNumber,
      status: 'inReview'
    });

    await merchant.save();

    // 返回创建的商户信息（包含关联数据）
    const createdMerchant = await Merchant.findById(merchant._id)
      .populate('personInCharge', 'name phone email')
      .populate('role', 'name permissions');

    res.status(201).json({
      code: 201,
      message: '商户创建成功',
      data: createdMerchant
    });
  } catch (error) {
    console.error('创建商户失败:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        code: 400,
        message: '数据验证失败',
        data: {
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        }
      });
    }

    res.status(500).json({
      code: 500,
      message: '创建商户失败',
      data: null
    });
  }
});

// 更新商户信息
router.put('/update/:id', jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的商户ID',
        data: null
      });
    }

    // 如果更新手机号，检查是否重复
    if (updateData.phone) {
      const existingMerchant = await Merchant.findOne({
        phone: updateData.phone,
        _id: { $ne: id }
      });
      if (existingMerchant) {
        return res.status(400).json({
          code: 400,
          message: '该手机号已被其他商户使用',
          data: null
        });
      }
    }

    // 更新商户信息
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('personInCharge', 'name phone email')
      .populate('role', 'name permissions');

    if (!updatedMerchant) {
      return res.status(404).json({
        code: 404,
        message: '商户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '商户信息更新成功',
      data: updatedMerchant
    });
  } catch (error) {
    console.error('更新商户失败:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        code: 400,
        message: '数据验证失败',
        data: {
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        }
      });
    }

    res.status(500).json({
      code: 500,
      message: '更新商户失败',
      data: null
    });
  }
});

// 删除商户
router.delete('/delete/:id', jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的商户ID',
        data: null
      });
    }

    const deletedMerchant = await Merchant.findByIdAndDelete(id);

    if (!deletedMerchant) {
      return res.status(404).json({
        code: 404,
        message: '商户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '商户删除成功',
      data: { deletedId: id }
    });
  } catch (error) {
    console.error('删除商户失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除商户失败',
      data: null
    });
  }
});

// 批量删除商户
router.delete('/batch-delete', jwtAuth, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的商户ID列表',
        data: null
      });
    }

    // 验证所有ID格式
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '包含无效的商户ID',
        data: { invalidIds }
      });
    }

    const result = await Merchant.deleteMany({ _id: { $in: ids } });

    res.json({
      code: 200,
      message: `成功删除 ${result.deletedCount} 个商户`,
      data: {
        deletedCount: result.deletedCount,
        requestedCount: ids.length
      }
    });
  } catch (error) {
    console.error('批量删除商户失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除商户失败',
      data: null
    });
  }
});

// 更新商户状态
router.patch('/status/:id', jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的商户ID',
        data: null
      });
    }

    if (!status || !['active', 'inactive', 'inReview', 'suspended'].includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值',
        data: {
          validStatuses: ['active', 'inactive', 'inReview', 'suspended']
        }
      });
    }

    const updateData = { status };

    // 如果是审核通过，记录审核信息
    if (status === 'active' && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    }

    const updatedMerchant = await Merchant.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('personInCharge', 'name phone email')
      .populate('role', 'name permissions')
      .populate('approvedBy', 'name');

    if (!updatedMerchant) {
      return res.status(404).json({
        code: 404,
        message: '商户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '商户状态更新成功',
      data: updatedMerchant
    });
  } catch (error) {
    console.error('更新商户状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新商户状态失败',
      data: null
    });
  }
});

// 获取商户统计信息
router.get('/stats', jwtAuth, async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      inReviewCount,
      inactiveCount,
      suspendedCount,
      recentMerchants
    ] = await Promise.all([
      Merchant.countDocuments(),
      Merchant.countDocuments({ status: 'active' }),
      Merchant.countDocuments({ status: 'inReview' }),
      Merchant.countDocuments({ status: 'inactive' }),
      Merchant.countDocuments({ status: 'suspended' }),
      Merchant.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('personInCharge', 'name')
    ]);

    const stats = {
      totalCount,
      statusStats: {
        active: activeCount,
        inReview: inReviewCount,
        inactive: inactiveCount,
        suspended: suspendedCount
      },
      recentMerchants
    };

    res.json({
      code: 200,
      message: '获取商户统计信息成功',
      data: stats
    });
  } catch (error) {
    console.error('获取商户统计信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商户统计信息失败',
      data: null
    });
  }
});

module.exports = router; 