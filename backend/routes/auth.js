const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../moudle/user/user");
const Role = require("../moudle/role/role");
const JwtUtil = require("../utils/jwt");
const CaptchaUtil = require("../utils/captcha");
const { jwtAuth, getCurrentUser } = require("../utils/ejwt");

// 配置multer用于头像上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/uploads/avatars");
    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：用户ID + 时间戳 + 原始扩展名
    const ext = path.extname(file.originalname);
    const filename = `${req.auth.userId}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});
/**
 * 用户登录
 */
router.post("/login", async (req, res) => {
  console.log("🔐 收到登录请求:", req.body);
  // const userlist = await User.find();
  const userlist = await User.find({});
  console.log(userlist, "123456789");

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

    // 更新最后登录时间
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    // 查询角色
    const role = await Role.findById(user.role);

    const response = {
      code: 200,
      message: "登录成功",
      data: {
        user: {
          _id: user._id,
          username: user.username || user.loginAccount,
          loginAccount: user.loginAccount,
          nickname: user.nickname || "",
          email: user.email || "",
          phone: user.phone || "",
          avatar: user.avatar || null,
          role: role,
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
router.get("/userinfo", jwtAuth, getCurrentUser, (req, res) => {
  res.json({
    code: 200,
    message: "获取用户信息成功",
    data: req.currentUser,
  });
});

/**
 * 获取用户详细信息（通过用户ID）
 */
router.get("/userinfo/:userId", jwtAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // 查找用户
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null,
      });
    }

    res.json({
      code: 200,
      message: "获取用户信息成功",
      data: {
        username: user.username || user.loginAccount,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("❌ 获取用户信息错误:", error);
    res.status(500).json({
      code: 500,
      message: "获取用户信息失败: " + error.message,
      data: null,
    });
  }
});

/**
 * 更新用户个人信息
 */
router.put("/update-profile", jwtAuth, async (req, res) => {
  try {
    const { nickname, email, phone, role } = req.body;
    const userId = req.auth.userId;

    // 查找用户
    const user = await User.findById(userId);
    const Role = await Role.findOne({ name: role });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null,
      });
    }

    // 如果修改邮箱，检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: "该邮箱已被其他用户使用",
          data: null,
        });
      }
    }

    // 更新用户信息
    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (Role !== undefined) updateData.role = Role._id;
    updateData.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      select: "-password",
    });

    res.json({
      code: 200,
      message: "个人信息更新成功",
      data: {
        username: updatedUser.username || updatedUser.loginAccount,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("❌ 更新个人信息错误:", error);
    res.status(500).json({
      code: 500,
      message: "更新个人信息失败: " + error.message,
      data: null,
    });
  }
});

/**
 * 上传头像
 */
router.post(
  "/upload-avatar",
  jwtAuth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: "请选择要上传的图片",
          data: null,
        });
      }

      const userId = req.auth.userId;
      const avatarPath = `uploads/avatars/${req.file.filename}`;

      // 查找用户并删除旧头像
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在",
          data: null,
        });
      }

      // 删除旧头像文件
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, "../public", user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // 更新用户头像路径
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          avatar: avatarPath,
          updatedAt: new Date(),
        },
        { new: true, select: "-password" }
      );

      res.json({
        code: 200,
        message: "头像上传成功",
        data: {
          avatar: avatarPath,
          avatarUrl: `${req.protocol}://${req.get("host")}/${avatarPath}`,
        },
      });
    } catch (error) {
      console.error("❌ 头像上传错误:", error);
      res.status(500).json({
        code: 500,
        message: "头像上传失败: " + error.message,
        data: null,
      });
    }
  }
);

/**
 * 修改密码
 */
router.post("/reset-password", jwtAuth, async (req, res) => {
  const { old_password, repassword } = req.body;

  // 参数验证
  if (!old_password || !repassword) {
    return res.status(400).json({
      code: 400,
      message: "请提供旧密码和新密码",
      data: null,
    });
  }

  try {
    // 查找当前用户
    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null,
      });
    }

    // 验证旧密码
    const isOldPasswordValid = await user.comparePassword(old_password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: "旧密码错误",
        data: null,
      });
    }

    // 更新密码
    user.password = repassword;
    await user.save();

    res.json({
      code: 200,
      message: "密码修改成功",
      data: null,
    });
  } catch (error) {
    console.error("❌ 修改密码错误:", error);
    res.status(500).json({
      code: 500,
      message: "修改密码失败: " + error.message,
      data: null,
    });
  }
});

module.exports = router;
