const express = require("express");
const router = express.Router();
const User = require("../moudle/user/user");
const JwtUtil = require("../utils/jwt");
const { jwtAuth, getCurrentUser } = require("../utils/ejwt");

/**
 * 用户登录
 */
router.post("/login", async (req, res) => {
  try {
    const { loginAccount, password } = req.body;

    // 查找用户
    const user = await User.findOne({ loginAccount });
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "用户名或密码错误",
        data: null,
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: "用户名或密码错误",
        data: null,
      });
    }

    // 生成token对
    const tokens = JwtUtil.generateTokenPair(user);

    res.json({
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
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      code: 500,
      message: "登录失败",
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
