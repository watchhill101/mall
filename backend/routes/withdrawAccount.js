const express = require('express');
const router = express.Router();
const { jwtAuth } = require('../utils/ejwt');
const WithdrawAccount = require('../moudle/merchant/withdrawAccount');
const Merchant = require('../moudle/merchant/merchant');
const mongoose = require('mongoose');

// 数据格式转换函数 - 将数据库模型转换为前端期望的格式
const transformWithdrawAccountData = (dbRecord) => {
  const accountTypeMap = {
    'unionpay': 'union',
    'wechat': 'wechat',
    'alipay': 'alipay'
  };

  const statusMap = {
    'normal': 'active',
    'disabled': 'disabled',
    'pending': 'disabled',
    'locked': 'disabled'
  };

  return {
    id: dbRecord._id.toString(),
    merchantName: dbRecord.merchantName || (dbRecord.merchant?.name || ''),
    accountType: accountTypeMap[dbRecord.accountType] || 'union',
    bankName: dbRecord.bankName || '',
    accountNumber: dbRecord.accountNumber,
    serviceFeeRate: Math.round(dbRecord.platformSettlementFee * 100), // 转换为百分比
    status: statusMap[dbRecord.status] || 'active',
    createTime: dbRecord.createdAt ? new Date(dbRecord.createdAt).toLocaleString('zh-CN') : '',
    updateTime: dbRecord.updatedAt ? new Date(dbRecord.updatedAt).toLocaleString('zh-CN') : '',
    // 保留原始数据以备需要
    _original: {
      accountName: dbRecord.accountName,
      bankCode: dbRecord.bankCode,
      branchName: dbRecord.branchName,
      dailyLimit: dbRecord.dailyLimit,
      monthlyLimit: dbRecord.monthlyLimit,
      singleLimit: dbRecord.singleLimit,
      totalWithdraws: dbRecord.totalWithdraws,
      totalAmount: dbRecord.totalAmount,
      isVerified: dbRecord.isVerified
    }
  };
};

// 前端格式转换为数据库格式
const transformToDbFormat = (frontendData) => {
  const accountTypeMap = {
    'union': 'unionpay',
    'wechat': 'wechat',
    'alipay': 'alipay',
    'bank': 'unionpay' // 银行卡归类为unionpay
  };

  const statusMap = {
    'active': 'normal',
    'disabled': 'disabled'
  };

  return {
    accountType: accountTypeMap[frontendData.accountType] || 'unionpay',
    accountNumber: frontendData.accountNumber,
    accountName: frontendData.merchantName || frontendData.accountNumber, // 如果没有账户名，使用商家名或账号
    bankName: frontendData.bankName || '',
    platformSettlementFee: (frontendData.serviceFeeRate || 5) / 100, // 转换为小数
    status: statusMap[frontendData.status] || 'normal'
  };
};

// 测试接口
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试WithdrawAccount接口被调用');
    const count = await WithdrawAccount.countDocuments();
    res.json({
      code: 200,
      message: 'WithdrawAccount API 正常运行',
      data: {
        withdrawAccountCount: count,
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

// 获取提现账号列表（分页查询）
router.get('/list', async (req, res) => {
  console.log('📋 获取提现账号列表请求:', req.query);
  try {
    const {
      page = 1,
      pageSize = 10,
      merchantName = '',
      status = ''
    } = req.query;

    // 构建查询条件
    let query = {};

    // 如果有商家名称筛选，需要先查询商家
    if (merchantName) {
      const merchants = await Merchant.find({
        name: { $regex: merchantName, $options: 'i' }
      }).select('_id');

      if (merchants.length > 0) {
        query.merchant = { $in: merchants.map(m => m._id) };
      } else {
        // 如果没有找到匹配的商家，返回空结果
        return res.json({
          code: 200,
          message: '获取提现账号列表成功',
          data: {
            list: [],
            pagination: {
              current: parseInt(page),
              pageSize: parseInt(pageSize),
              total: 0,
              totalPages: 0
            }
          }
        });
      }
    }

    // 状态筛选 - 需要转换前端状态到数据库状态
    if (status) {
      const dbStatus = status === 'active' ? 'normal' : 'disabled';
      query.status = dbStatus;
    }

    console.log('🔍 查询条件:', query);

    // 计算跳过的文档数
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // 执行分页查询
    const [withdrawAccounts, total] = await Promise.all([
      WithdrawAccount.find(query)
        .populate('merchant', 'name phone address')
        .populate('createdBy', 'userNickname')
        .skip(skip)
        .limit(parseInt(pageSize))
        .sort({ createdAt: -1 })
        .lean(),
      WithdrawAccount.countDocuments(query)
    ]);

    // 转换数据格式
    const transformedData = withdrawAccounts.map(account => {
      const transformed = transformWithdrawAccountData(account);
      // 如果数据库中没有merchantName，从关联的merchant中获取
      if (!transformed.merchantName && account.merchant) {
        transformed.merchantName = account.merchant.name || '';
      }
      return transformed;
    });

    console.log(`📊 查询结果: 找到 ${transformedData.length} 条提现账号记录，总计 ${total} 条`);

    res.json({
      code: 200,
      message: '获取提现账号列表成功',
      data: {
        list: transformedData,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取提现账号列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取提现账号列表失败: ' + error.message,
      data: null
    });
  }
});

// 获取提现账号详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账号ID',
        data: null
      });
    }

    const account = await WithdrawAccount.findById(id)
      .populate('merchant', 'name phone address')
      .populate('createdBy', 'userNickname')
      .lean();

    if (!account) {
      return res.status(404).json({
        code: 404,
        message: '提现账号不存在',
        data: null
      });
    }

    const transformedData = transformWithdrawAccountData(account);
    if (!transformedData.merchantName && account.merchant) {
      transformedData.merchantName = account.merchant.name || '';
    }

    res.json({
      code: 200,
      message: '获取提现账号详情成功',
      data: transformedData
    });
  } catch (error) {
    console.error('❌ 获取提现账号详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取提现账号详情失败: ' + error.message,
      data: null
    });
  }
});

// 创建提现账号
router.post('/create', async (req, res) => {
  try {
    const frontendData = req.body;
    console.log('📝 创建提现账号请求:', frontendData);

    // 验证必填字段
    if (!frontendData.merchantName || !frontendData.accountNumber || !frontendData.accountType) {
      return res.status(400).json({
        code: 400,
        message: '请填写必填字段：商家名称、账号、账户类型',
        data: null
      });
    }

    // 查找商家
    const merchant = await Merchant.findOne({
      name: { $regex: frontendData.merchantName, $options: 'i' }
    });

    if (!merchant) {
      return res.status(400).json({
        code: 400,
        message: '未找到该商家，请确认商家名称',
        data: null
      });
    }

    // 检查账号是否已存在
    const existingAccount = await WithdrawAccount.findOne({
      accountNumber: frontendData.accountNumber,
      accountType: transformToDbFormat(frontendData).accountType
    });

    if (existingAccount) {
      return res.status(400).json({
        code: 400,
        message: '该账号已存在',
        data: null
      });
    }

    // 转换数据格式并创建
    const dbData = transformToDbFormat(frontendData);
    const newAccount = new WithdrawAccount({
      ...dbData,
      merchant: merchant._id,
      createdBy: merchant._id // 临时使用merchant._id作为创建人
    });

    const savedAccount = await newAccount.save();

    // 返回转换后的数据
    const populatedAccount = await WithdrawAccount.findById(savedAccount._id)
      .populate('merchant', 'name phone address')
      .lean();

    const transformedData = transformWithdrawAccountData(populatedAccount);
    transformedData.merchantName = merchant.name;

    res.status(201).json({
      code: 201,
      message: '创建提现账号成功',
      data: transformedData
    });
  } catch (error) {
    console.error('❌ 创建提现账号失败:', error);

    if (error.code === 11000) {
      res.status(400).json({
        code: 400,
        message: '账号已存在，请检查账号和账户类型',
        data: null
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '创建提现账号失败: ' + error.message,
        data: null
      });
    }
  }
});

// 更新提现账号
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const frontendData = req.body;
    console.log('📝 更新提现账号请求:', id, frontendData);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账号ID',
        data: null
      });
    }

    // 检查账号是否存在
    const existingAccount = await WithdrawAccount.findById(id);
    if (!existingAccount) {
      return res.status(404).json({
        code: 404,
        message: '提现账号不存在',
        data: null
      });
    }

    // 如果更新了商家名称，需要查找对应的商家
    let merchantId = existingAccount.merchant;
    if (frontendData.merchantName) {
      const merchant = await Merchant.findOne({
        name: { $regex: frontendData.merchantName, $options: 'i' }
      });
      if (merchant) {
        merchantId = merchant._id;
      }
    }

    // 转换数据格式
    const dbData = transformToDbFormat(frontendData);
    const updateData = {
      ...dbData,
      merchant: merchantId
    };

    const updatedAccount = await WithdrawAccount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('merchant', 'name phone address')
      .lean();

    const transformedData = transformWithdrawAccountData(updatedAccount);
    if (updatedAccount.merchant) {
      transformedData.merchantName = updatedAccount.merchant.name || '';
    }

    res.json({
      code: 200,
      message: '更新提现账号成功',
      data: transformedData
    });
  } catch (error) {
    console.error('❌ 更新提现账号失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新提现账号失败: ' + error.message,
      data: null
    });
  }
});

// 删除提现账号
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账号ID',
        data: null
      });
    }

    const deletedAccount = await WithdrawAccount.findByIdAndDelete(id);
    if (!deletedAccount) {
      return res.status(404).json({
        code: 404,
        message: '提现账号不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '删除提现账号成功',
      data: null
    });
  } catch (error) {
    console.error('❌ 删除提现账号失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除提现账号失败: ' + error.message,
      data: null
    });
  }
});

// 更新账号状态
router.patch('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账号ID',
        data: null
      });
    }

    // 转换状态
    const dbStatus = status === 'active' ? 'normal' : 'disabled';

    const updatedAccount = await WithdrawAccount.findByIdAndUpdate(
      id,
      { status: dbStatus },
      { new: true }
    )
      .populate('merchant', 'name phone address')
      .lean();

    if (!updatedAccount) {
      return res.status(404).json({
        code: 404,
        message: '提现账号不存在',
        data: null
      });
    }

    const transformedData = transformWithdrawAccountData(updatedAccount);
    if (updatedAccount.merchant) {
      transformedData.merchantName = updatedAccount.merchant.name || '';
    }

    res.json({
      code: 200,
      message: '更新账号状态成功',
      data: transformedData
    });
  } catch (error) {
    console.error('❌ 更新账号状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新账号状态失败: ' + error.message,
      data: null
    });
  }
});

// 获取商家列表（用于下拉选择）
router.get('/merchants', async (req, res) => {
  try {
    const merchants = await Merchant.find({ status: 'active' })
      .select('name phone')
      .sort({ name: 1 })
      .lean();

    res.json({
      code: 200,
      message: '获取商家列表成功',
      data: merchants.map(merchant => ({
        value: merchant.name,
        label: merchant.name,
        phone: merchant.phone
      }))
    });
  } catch (error) {
    console.error('❌ 获取商家列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商家列表失败: ' + error.message,
      data: null
    });
  }
});

module.exports = router; 