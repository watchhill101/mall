const { expressjwt: jwt } = require("express-jwt");
const config = require("../config");
const JwtUtil = require("./jwt");

/**
 * JWT 验证中间件配置
 */
const jwtAuth = jwt({
  secret: config.jwtSecretKey, // 使用配置中的 JWT 密钥
  algorithms: ["HS256"], // 指定算法
  userProperty: "auth", // 将解码后的用户信息存储到 req.auth 中
  credentialsRequired: true, // 必须提供 token，否则返回 401 错误
  getToken: function fromHeaderOrQuerystring(req) {
    // 从请求头中获取 token
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } // 也可以从查询参数中获取
    else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null; // 如果没有 token，则返回 null
  },
});

/**
 * 可选的 JWT 验证中间件配置
 * 如果不需要强制验证，可以使用此配置
 */
const optionalJwtAuth = jwt({
  secret: config.jwtSecretKey,
  algorithms: ["HS256"],
  userProperty: "auth",
  credentialsRequired: false, // 不强制要求提供 token
  getToken: function fromHeaderOrQuerystring(req) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },
});

/**
 * 自定义错误处理中间件（支持无感刷新）
 */
const jwtErrorHandler = async (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    // 检查是否有refresh token
    const refreshToken = req.headers["x-refresh-token"];

    if (refreshToken) {
      try {
        // 尝试刷新token
        const newTokens = await JwtUtil.refreshAccessToken(refreshToken);

        // 在响应头中返回新的token
        res.setHeader("x-new-access-token", newTokens.accessToken);
        res.setHeader("x-token-refreshed", "true");

        // 重新解析新的token并继续请求
        const decoded = JwtUtil.verifyAccessToken(newTokens.accessToken);
        req.auth = decoded;

        return next();
      } catch (refreshError) {
        return res.status(401).json({
          code: 401,
          message: "Token已过期且刷新失败，请重新登录",
          data: null,
        });
      }
    }

    return res.status(401).json({
      code: 401,
      message: "Token 验证失败",
      data: null,
    });
  }
  next(err);
};

/**
 * 验证token类型的中间件
 */
const verifyTokenType = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({
      code: 401,
      message: "Token 不存在",
      data: null,
    });
  }

  // 验证 token 类型
  if (req.auth.type !== "access") {
    return res.status(401).json({
      code: 401,
      message: "Token 类型错误",
      data: null,
    });
  }

  next();
};

/**
 * 获取当前用户信息的中间件
 */
const getCurrentUser = async (req, res, next) => {
  try {
    if (req.auth && req.auth.userId) {
      const User = require("../moudle/user/user");
      const user = await User.findById(req.auth.userId).select("-password");
      req.currentUser = user;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  jwtAuth,
  optionalJwtAuth,
  jwtErrorHandler,
  verifyTokenType,
  getCurrentUser,
};
