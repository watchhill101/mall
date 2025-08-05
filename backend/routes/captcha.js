const express = require('express');
const router = express.Router();
const CaptchaUtil = require('../utils/captcha');

/**
 * 生成图片验证码
 * GET /captcha/generate
 */
router.get('/generate', async (req, res) => {
  try {
    // 生成会话ID
    const sessionId = CaptchaUtil.generateSessionId();
    
    // 生成验证码
    const captchaData = await CaptchaUtil.generateCaptcha(sessionId);
    
    res.json({
      code: 200,
      message: '验证码生成成功',
      data: captchaData
    });
  } catch (error) {
    console.error('验证码生成失败:', error);
    res.status(500).json({
      code: 500,
      message: '验证码生成失败',
      data: null
    });
  }
});

/**
 * 验证图片验证码
 * POST /captcha/verify
 * Body: { sessionId, captcha }
 */
router.post('/verify', async (req, res) => {
  try {
    const { sessionId, captcha } = req.body;
    
    if (!sessionId || !captcha) {
      return res.status(400).json({
        code: 400,
        message: '请提供会话ID和验证码',
        data: null
      });
    }
    
    const isValid = await CaptchaUtil.verifyCaptcha(sessionId, captcha);
    
    if (isValid) {
      res.json({
        code: 200,
        message: '验证码验证成功',
        data: { valid: true }
      });
    } else {
      res.status(400).json({
        code: 400,
        message: '验证码错误或已过期',
        data: { valid: false }
      });
    }
  } catch (error) {
    console.error('验证码验证失败:', error);
    res.status(500).json({
      code: 500,
      message: '验证码验证失败',
      data: null
    });
  }
});

/**
 * 刷新验证码
 * POST /captcha/refresh
 * Body: { sessionId } (可选，如果不提供会生成新的sessionId)
 */
router.post('/refresh', async (req, res) => {
  try {
    let { sessionId } = req.body;
    
    // 如果提供了旧的sessionId，先清理
    if (sessionId) {
      await CaptchaUtil.clearCaptcha(sessionId);
    }
    
    // 生成新的会话ID和验证码
    const newSessionId = CaptchaUtil.generateSessionId();
    const captchaData = await CaptchaUtil.generateCaptcha(newSessionId);
    
    res.json({
      code: 200,
      message: '验证码刷新成功',
      data: captchaData
    });
  } catch (error) {
    console.error('验证码刷新失败:', error);
    res.status(500).json({
      code: 500,
      message: '验证码刷新失败',
      data: null
    });
  }
});

module.exports = router;