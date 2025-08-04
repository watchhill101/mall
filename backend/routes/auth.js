const express = require("express");
const router = express.Router();
const User = require("../moudle/user/user");
const JwtUtil = require("../utils/jwt");
const CaptchaUtil = require("../utils/captcha");
const { jwtAuth, getCurrentUser } = require("../utils/ejwt");

/**
 * 用户登录
 */
router.post("/login", async (req, res) => {
  console.log("🔐 收到登录请求:", req.body);
  
  try {
    const { loginAccount, password, captcha, sessionId } = req.body;

    // 参数验证
    if (!loginAccount || !password) {
      console.log("❌ 缺少登录参数");
      return res.status(400).json({
        code: 400,
        message: "请提供用户名和密码",
        data: null,
      });
    }

    // 验证码验证
    if (!captcha || !sessionId) {
      console.log("❌ 缺少验证码参数");
      return res.status(400).json({
        code: 400,
        message: "请提供验证码",
        data: null,
      });
    }

    console.log("🔍 验证图片验证码:", sessionId, captcha);
    const isCaptchaValid = await CaptchaUtil.verifyCaptcha(sessionId, captcha);
    if (!isCaptchaValid) {
      console.log("❌ 验证码错误");
      return res.status(400).json({
        code: 400,
        message: "验证码错误或已过期",
        data: null,
      });
    }
    console.log("✅ 验证码验证通过");

    console.log("🔍 查找用户:", loginAccount);
    // 查找用户
    const user = await User.findOne({ loginAccount });
    if (!user) {
      console.log("❌ 用户不存在:", loginAccount);
      return res.status(401).json({
        code: 401,
        message: "用户名或密码错误",
        data: null,
      });
    }

    console.log("✅ 找到用户:", user.loginAccount);
    
    // 验证密码
    console.log("🔑 验证密码...");
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("❌ 密码错误");
      return res.status(401).json({
        code: 401,
        message: "用户名或密码错误",
        data: null,
      });
    }

    console.log("✅ 密码验证成功");

    // 生成token对
    console.log("🎫 生成Token...");
    const tokens = JwtUtil.generateTokenPair(user);
    console.log("✅ Token生成成功");

    const response = {
      code: 200,
      message: "登录成功",
      data: {
        user: {
          _id: user._id,
          loginAccount: user.loginAccount,
          email: user.email,
          FirstLevelNavigationID: user.FirstLevelNavigationID,
        },
        ...tokens,
      },
    };

    console.log("📤 发送登录响应");
    res.json(response);
  } catch (error) {
    console.error("❌ 登录错误:", error);
    res.status(500).json({
      code: 500,
      message: "登录失败: " + error.message,
      data: null,
    });
  }
});

/**
 * 刷新token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: "Refresh token is required",
        data: null,
      });
    }

    const newTokens = await JwtUtil.refreshAccessToken(refreshToken);

    res.json({
      code: 200,
      message: "Token刷新成功",
      data: newTokens,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      code: 401,
      message: "Token刷新失败",
      data: null,
    });
  }
});

/**
 * 用户登出
 */
router.post("/logout", jwtAuth, async (req, res) => {
  try {
    // 删除Redis中的refresh token
    await JwtUtil.deleteRefreshToken(req.auth.userId);

    res.json({
      code: 200,
      message: "登出成功",
      data: null,
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      code: 500,
      message: "登出失败",
      data: null,
    });
  }
});

/**
 * 获取当前用户信息
 */
router.get("/me", jwtAuth, getCurrentUser, (req, res) => {
  res.json({
    code: 200,
    message: "获取用户信息成功",
    data: req.currentUser,
  });
});

module.exports = router;
