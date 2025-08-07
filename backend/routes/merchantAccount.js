const express = require('express');
const router = express.Router();
const { jwtAuth } = require('../utils/ejwt');
const MerchantAccount = require('../moudle/merchant/merchantAccount');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // 用于密码加密

// 测试接口 - 无需认证
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试MerchantAccount接口被调用');
    const count = await MerchantAccount.countDocuments();
    res.json({
      code: 200,
      message: 'MerchantAccount API 正常运行',
      data: {
        accountCount: count,
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

// 获取商户账号列表（分页查询） - 临时移除JWT认证用于调试
router.get('/list', async (req, res) => {
  console.log('📋 获取商户账号列表请求:', req.query);
  try {
    const {
      page = 1,
      pageSize = 10,
      merchantId = '',
      contactPhone = '',
      merchant = '',
      status = ''
    } = req.query;

    // 构建查询条件
    const query = {};

    if (merchantId) {
      // merchantId 参数用于搜索登录账号
      query.loginAccount = { $regex: merchantId, $options: 'i' };
    }

    if (contactPhone) {
      query.contactPhone = { $regex: contactPhone, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    console.log('🔍 查询条件:', query);

    // 计算跳过的文档数
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // 执行分页查询
    const [accounts, total] = await Promise.all([
      MerchantAccount.find(query)
        .populate('merchant', 'name phone address')

        .populate('personInCharge', 'name phone email')
        .skip(skip)
        .limit(parseInt(pageSize))
        .sort({ createdAt: -1 })
        .lean(),
      MerchantAccount.countDocuments(query)
    ]);

    // 如果需要按商户名称搜索，在内存中进一步过滤
    let filteredAccounts = accounts;
    if (merchant) {
      filteredAccounts = accounts.filter(account =>
        account.merchant && account.merchant.name &&
        account.merchant.name.toLowerCase().includes(merchant.toLowerCase())
      );
    }

    console.log(`📊 查询结果: 找到 ${filteredAccounts.length} 条账号记录，总计 ${total} 条`);

    res.json({
      code: 200,
      message: '获取商户账号列表成功',
      data: {
        list: filteredAccounts,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total: merchant ? filteredAccounts.length : total,
          totalPages: Math.ceil((merchant ? filteredAccounts.length : total) / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('❌ 获取商户账号列表失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      code: 500,
      message: '获取商户账号列表失败: ' + error.message,
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 获取商户账号详情
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

    const account = await MerchantAccount.findById(id)
      .populate('merchant', 'name phone address')
      .populate('personInCharge', 'name phone email')
      .lean();

    if (!account) {
      return res.status(404).json({
        code: 404,
        message: '商户账号不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取商户账号详情成功',
      data: account
    });
  } catch (error) {
    console.error('获取商户账号详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商户账号详情失败',
      data: null
    });
  }
});

// 创建商户账号
router.post('/create', async (req, res) => {
  console.log('📝 创建商户账号请求:', req.body);
  try {
    const { loginAccount, userNickname, contactPhone, password, role, merchant, personInCharge } = req.body;

    // 验证必填字段
    if (!loginAccount || !userNickname || !contactPhone || !password || !role || !merchant || !personInCharge) {
      return res.status(400).json({
        code: 400,
        message: '请填写所有必填字段',
        data: {
          required: ['loginAccount', 'userNickname', 'contactPhone', 'password', 'role', 'merchant', 'personInCharge'],
          missing: Object.keys({ loginAccount, userNickname, contactPhone, password, role, merchant, personInCharge })
            .filter(key => !req.body[key])
        }
      });
    }

    // 验证数据格式
    if (loginAccount.length < 3) {
      return res.status(400).json({
        code: 400,
        message: '登录账号至少需要3个字符',
        data: null
      });
    }

    if (!/^1[3-9]\d{9}$/.test(contactPhone)) {
      return res.status(400).json({
        code: 400,
        message: '请输入正确的手机号码',
        data: null
      });
    }

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(role)) {
      return res.status(400).json({
        code: 400,
        message: '无效的角色ID',
        data: null
      });
    }

    if (!mongoose.Types.ObjectId.isValid(merchant)) {
      return res.status(400).json({
        code: 400,
        message: '无效的商户ID',
        data: null
      });
    }

    if (!mongoose.Types.ObjectId.isValid(personInCharge)) {
      return res.status(400).json({
        code: 400,
        message: '无效的负责人ID',
        data: null
      });
    }

    // 检查登录账号是否已存在
    const existingAccount = await MerchantAccount.findOne({ loginAccount });
    if (existingAccount) {
      return res.status(400).json({
        code: 400,
        message: '登录账号已存在',
        data: { conflictField: 'loginAccount', value: loginAccount }
      });
    }

    // 检查联系电话是否已存在
    const existingPhone = await MerchantAccount.findOne({ contactPhone });
    if (existingPhone) {
      return res.status(400).json({
        code: 400,
        message: '联系电话已被使用',
        data: { conflictField: 'contactPhone', value: contactPhone }
      });
    }

    // 验证关联数据是否存在
    try {
      const Merchant = require('../moudle/merchant/merchant');
      const Role = require('../moudle/role/role');
      const PersonInCharge = require('../moudle/person/personInCharge');

      const [merchantExists, roleExists, personExists] = await Promise.all([
        Merchant.findById(merchant).select('_id name'),
        Role.findById(role).select('_id name'),
        PersonInCharge.findById(personInCharge).select('_id name')
      ]);

      if (!merchantExists) {
        return res.status(400).json({
          code: 400,
          message: '指定的商户不存在',
          data: { field: 'merchant', value: merchant }
        });
      }

      if (!roleExists) {
        return res.status(400).json({
          code: 400,
          message: '指定的角色不存在',
          data: { field: 'role', value: role }
        });
      }

      if (!personExists) {
        return res.status(400).json({
          code: 400,
          message: '指定的负责人不存在',
          data: { field: 'personInCharge', value: personInCharge }
        });
      }

      console.log('✅ 关联数据验证通过:', {
        merchant: merchantExists.name,
        role: roleExists.name,
        person: personExists.name
      });
    } catch (modelError) {
      console.error('❌ 验证关联数据时出错:', modelError);
      return res.status(500).json({
        code: 500,
        message: '验证关联数据失败',
        data: { error: modelError.message }
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新账号
    const newAccount = new MerchantAccount({
      loginAccount: loginAccount.trim(),
      userNickname: userNickname.trim(),
      contactPhone: contactPhone.trim(),
      password: hashedPassword,
      role,
      merchant,
      personInCharge,
      status: 'active'
    });

    const savedAccount = await newAccount.save();
    console.log('✅ 商户账号创建成功:', savedAccount._id);

    // 返回创建的账号（不包含密码）
    const populatedAccount = await MerchantAccount.findById(savedAccount._id)
      .populate('merchant', 'name phone address')
      .populate('personInCharge', 'name phone email')
      .select('-password')
      .lean();

    res.status(201).json({
      code: 201,
      message: '创建商户账号成功',
      data: populatedAccount
    });
  } catch (error) {
    console.error('❌ 创建商户账号失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    if (error.code === 11000) {
      // 处理重复键错误
      const duplicateField = Object.keys(error.keyPattern)[0];
      const duplicateValue = error.keyValue[duplicateField];

      res.status(400).json({
        code: 400,
        message: `${duplicateField === 'loginAccount' ? '登录账号' : '联系电话'}已存在`,
        data: {
          conflictField: duplicateField,
          value: duplicateValue,
          error: 'DUPLICATE_KEY'
        }
      });
    } else if (error.name === 'ValidationError') {
      // 处理数据验证错误
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));

      res.status(400).json({
        code: 400,
        message: '数据验证失败',
        data: {
          validationErrors,
          error: 'VALIDATION_ERROR'
        }
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '创建商户账号失败: ' + error.message,
        data: {
          error: error.name,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    }
  }
});

// 更新商户账号
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { loginAccount, userNickname, contactPhone, role, merchant, personInCharge } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账号ID',
        data: null
      });
    }

    // 检查账号是否存在
    const existingAccount = await MerchantAccount.findById(id);
    if (!existingAccount) {
      return res.status(404).json({
        code: 404,
        message: '商户账号不存在',
        data: null
      });
    }

    // 如果更新登录账号，检查是否与其他账号冲突
    if (loginAccount && loginAccount !== existingAccount.loginAccount) {
      const duplicateAccount = await MerchantAccount.findOne({
        loginAccount,
        _id: { $ne: id }
      });
      if (duplicateAccount) {
        return res.status(400).json({
          code: 400,
          message: '登录账号已存在',
          data: null
        });
      }
    }

    // 更新账号信息
    const updateData = {
      ...(loginAccount && { loginAccount }),
      ...(userNickname && { userNickname }),
      ...(contactPhone && { contactPhone }),
      ...(role && { role }),
      ...(merchant && { merchant }),
      ...(personInCharge && { personInCharge })
    };

    const updatedAccount = await MerchantAccount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('merchant', 'name phone address')
      .populate('personInCharge', 'name phone email')
      .select('-password')
      .lean();

    res.json({
      code: 200,
      message: '更新商户账号成功',
      data: updatedAccount
    });
  } catch (error) {
    console.error('更新商户账号失败:', error);

    if (error.code === 11000) {
      res.status(400).json({
        code: 400,
        message: '登录账号已存在',
        data: null
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '更新商户账号失败',
        data: null
      });
    }
  }
});

// 删除商户账号
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

    const deletedAccount = await MerchantAccount.findByIdAndDelete(id);
    if (!deletedAccount) {
      return res.status(404).json({
        code: 404,
        message: '商户账号不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '删除商户账号成功',
      data: null
    });
  } catch (error) {
    console.error('删除商户账号失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除商户账号失败',
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

    if (!['active', 'disabled', 'locked', 'pending'].includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值',
        data: null
      });
    }

    const updatedAccount = await MerchantAccount.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('merchant', 'name phone address')
      .populate('personInCharge', 'name phone email')
      .select('-password')
      .lean();

    if (!updatedAccount) {
      return res.status(404).json({
        code: 404,
        message: '商户账号不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '更新账号状态成功',
      data: updatedAccount
    });
  } catch (error) {
    console.error('更新账号状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新账号状态失败',
      data: null
    });
  }
});

// 重置密码
router.post('/reset-password/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword = '123456' } = req.body; // 默认密码

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: '无效的账号ID',
        data: null
      });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedAccount = await MerchantAccount.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        loginAttempts: 0, // 重置登录尝试次数
        lockUntil: undefined // 解除锁定
      },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({
        code: 404,
        message: '商户账号不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '重置密码成功',
      data: {
        newPassword: newPassword // 在实际生产环境中，应该通过短信或邮件发送
      }
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      code: 500,
      message: '重置密码失败',
      data: null
    });
  }
});

// 获取账号统计信息
router.get('/stats', async (req, res) => {
  try {
    const [total, activeCount, disabledCount, lockedCount] = await Promise.all([
      MerchantAccount.countDocuments(),
      MerchantAccount.countDocuments({ status: 'active' }),
      MerchantAccount.countDocuments({ status: 'disabled' }),
      MerchantAccount.countDocuments({ status: 'locked' })
    ]);

    res.json({
      code: 200,
      message: '获取账号统计成功',
      data: {
        total,
        active: activeCount,
        disabled: disabledCount,
        locked: lockedCount,
        pending: total - activeCount - disabledCount - lockedCount
      }
    });
  } catch (error) {
    console.error('获取账号统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取账号统计失败',
      data: null
    });
  }
});

module.exports = router; 