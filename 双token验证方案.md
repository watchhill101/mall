# 双Token验证方案详解与对比

## 目录
- [概述](#概述)
- [方案一：自定义JWT验证](#方案一自定义jwt验证)
- [方案二：express-jwt验证](#方案二express-jwt验证)
- [方案对比](#方案对比)
- [最佳实践建议](#最佳实践建议)

## 概述

双Token验证方案是一种提升用户体验和安全性的认证机制，通过使用短期的Access Token和长期的Refresh Token来实现无感刷新，避免用户频繁登录。

### 核心概念
- **Access Token**: 短期有效（通常15分钟），用于API访问
- **Refresh Token**: 长期有效（通常7天），用于刷新Access Token
- **无感刷新**: 前端自动处理Token过期和刷新，用户无感知

## 方案一：自定义JWT验证

### 1. JWT工具类

```javascript
const jwt = require('jsonwebtoken');
const config = require('../config/index');
const redis = require('redis');

// Redis客户端
const redisClient = redis.createClient({
  host: config.url,
  port: config.port,
  password: config.password
});

redisClient.connect().catch(console.error);

class JwtUtil {
  /**
   * 生成访问token
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'access'
      },
      config.jwtSecretKey,
      { expiresIn: config.secretKeyExpire }
    );
  }

  /**
   * 生成刷新token
   */
  static generateRefreshToken(payload) {
    const refreshToken = jwt.sign(
      {
        ...payload,
        type: 'refresh'
      },
      config.jwtRefreshSecretKey,
      { expiresIn: config.refreshSecretKeyExpire }
    );

    // 将refresh token存储到Redis
    const key = `refresh_token:${payload.id}`;
    redisClient.setEx(key, config.refreshSecretKeyExpire, refreshToken);

    return refreshToken;
  }

  /**
   * 验证访问token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecretKey);
    } catch (error) {
      throw new Error('Access token invalid');
    }
  }

  /**
   * 验证刷新token
   */
  static async verifyRefreshToken(token, userId) {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecretKey);
      
      // 检查Redis中是否存在该token
      const key = `refresh_token:${userId}`;
      const storedToken = await redisClient.get(key);
      
      if (storedToken !== token) {
        throw new Error('Refresh token not found in store');
      }

      return decoded;
    } catch (error) {
      throw new Error('Refresh token invalid');
    }
  }

  /**
   * 刷新访问token
   */
  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecretKey);
      
      // 验证refresh token是否在Redis中
      await this.verifyRefreshToken(refreshToken, decoded.id);

      // 生成新的access token
      const newAccessToken = this.generateAccessToken({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      });

      return newAccessToken;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除刷新token
   */
  static async removeRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    await redisClient.del(key);
  }

  /**
   * 从token中提取用户信息
   */
  static extractUserFromToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JwtUtil;
```

### 2. 认证中间件

```javascript
const JwtUtil = require('../utils/jwt');

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: 'Access token required',
      data: null
    });
  }

  try {
    const decoded = JwtUtil.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'Token expired or invalid',
      data: null
    });
  }
};

// 可选的JWT认证中间件（允许无token访问）
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = JwtUtil.verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // 忽略错误，继续执行
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
```

### 3. 认证路由

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const JwtUtil = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');
const { MerchantAccount, User } = require('../moudle/index');

/**
 * 登录接口
 */
router.post('/login', async (req, res) => {
  try {
    const { loginAccount, password, userType = 'merchant' } = req.body;

    if (!loginAccount || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    let user;
    
    // 根据用户类型查找用户
    if (userType === 'merchant') {
      user = await MerchantAccount.findOne({ loginAccount })
        .populate('merchant')
        .populate('personInCharge')
        .populate('role');
    } else {
      user = await User.findOne({ username: loginAccount });
    }

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 检查账户状态
    if (user.status === 'disabled' || user.status === 'locked') {
      return res.status(403).json({
        code: 403,
        message: '账户已被禁用或锁定',
        data: null
      });
    }

    // 生成token载荷
    const payload = {
      id: user._id,
      username: user.loginAccount || user.username,
      userType,
      role: user.role,
      merchantId: user.merchant?._id
    };

    // 生成双token
    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    // 更新最后登录信息
    user.lastLoginTime = new Date();
    user.lastLoginIP = req.ip;
    user.loginAttempts = 0;
    await user.save();

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: require('../config/index').secretKeyExpire,
        user: {
          id: user._id,
          username: user.loginAccount || user.username,
          nickname: user.nickname,
          userType,
          merchant: user.merchant,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败',
      data: null
    });
  }
});

/**
 * 刷新token接口
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: 'Refresh token required',
        data: null
      });
    }

    // 解析refresh token获取用户信息
    const decoded = JwtUtil.extractUserFromToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        code: 401,
        message: 'Invalid refresh token',
        data: null
      });
    }

    // 验证refresh token
    await JwtUtil.verifyRefreshToken(refreshToken, decoded.id);

    // 生成新的access token
    const newAccessToken = await JwtUtil.refreshAccessToken(refreshToken);

    res.json({
      code: 200,
      message: 'Token刷新成功',
      data: {
        accessToken: newAccessToken,
        refreshToken, // refresh token保持不变
        tokenType: 'Bearer',
        expiresIn: require('../config/index').secretKeyExpire
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      code: 401,
      message: 'Refresh token无效或已过期',
      data: null
    });
  }
});

/**
 * 登出接口
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 删除Redis中的refresh token
    await JwtUtil.removeRefreshToken(userId);

    res.json({
      code: 200,
      message: '登出成功',
      data: null
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      code: 500,
      message: '登出失败',
      data: null
    });
  }
});

/**
 * 验证token接口
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    code: 200,
    message: 'Token有效',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
```

## 方案二：express-jwt验证

### 1. 安装依赖

```bash
npm install express-jwt jsonwebtoken
```

### 2. JWT工具类（简化版）

```javascript
const jwt = require('jsonwebtoken');
const config = require('../config/index');
const redis = require('redis');

// Redis客户端
const redisClient = redis.createClient({
  host: config.url,
  port: config.port,
  password: config.password
});

redisClient.connect().catch(console.error);

class JwtUtil {
  /**
   * 生成访问token
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'access'
      },
      config.jwtSecretKey,
      { expiresIn: config.secretKeyExpire }
    );
  }

  /**
   * 生成刷新token
   */
  static generateRefreshToken(payload) {
    const refreshToken = jwt.sign(
      {
        ...payload,
        type: 'refresh'
      },
      config.jwtRefreshSecretKey,
      { expiresIn: config.refreshSecretKeyExpire }
    );

    // 将refresh token存储到Redis
    const key = `refresh_token:${payload.id}`;
    redisClient.setEx(key, config.refreshSecretKeyExpire, refreshToken);

    return refreshToken;
  }

  /**
   * 验证刷新token
   */
  static async verifyRefreshToken(token, userId) {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecretKey);
      
      // 检查Redis中是否存在该token
      const key = `refresh_token:${userId}`;
      const storedToken = await redisClient.get(key);
      
      if (storedToken !== token) {
        throw new Error('Refresh token not found in store');
      }

      return decoded;
    } catch (error) {
      throw new Error('Refresh token invalid');
    }
  }

  /**
   * 刷新访问token
   */
  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecretKey);
      
      // 验证refresh token是否在Redis中
      await this.verifyRefreshToken(refreshToken, decoded.id);

      // 生成新的access token
      const newAccessToken = this.generateAccessToken({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        userType: decoded.userType,
        merchantId: decoded.merchantId
      });

      return newAccessToken;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除刷新token
   */
  static async removeRefreshToken(userId) {
    const key = `refresh_token:${userId}`;
    await redisClient.del(key);
  }
}

module.exports = JwtUtil;
```

### 3. express-jwt中间件配置

```javascript
const { expressjwt: jwt } = require('express-jwt');
const config = require('../config/index');

// JWT验证中间件
const jwtAuth = jwt({
  secret: config.jwtSecretKey,
  algorithms: ['HS256'],
  requestProperty: 'user', // 解析后的用户信息存储在req.user中
  credentialsRequired: true, // 是否必须提供token
  getToken: function fromHeaderOrQuerystring(req) {
    // 从Authorization header中提取token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    // 也可以从查询参数中获取
    else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
});

// 可选的JWT验证中间件（允许无token访问）
const optionalJwtAuth = jwt({
  secret: config.jwtSecretKey,
  algorithms: ['HS256'],
  requestProperty: 'user',
  credentialsRequired: false, // 不强制要求token
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
});

// 自定义错误处理中间件
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: 'Token无效或已过期',
      data: null
    });
  }
  next(err);
};

// 验证token类型的中间件
const verifyTokenType = (req, res, next) => {
  if (req.user && req.user.type !== 'access') {
    return res.status(401).json({
      code: 401,
      message: '无效的token类型',
      data: null
    });
  }
  next();
};

module.exports = {
  jwtAuth,
  optionalJwtAuth,
  jwtErrorHandler,
  verifyTokenType
};
```

### 4. 使用express-jwt的应用配置

```javascript
var createError = require("http-errors");
var express = require("express");
var app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");

// 导入JWT中间件
const { jwtAuth, optionalJwtAuth, jwtErrorHandler, verifyTokenType } = require("./middleware/jwt");

//导入中间件
var cors = require("cors");
app.use(cors());

//导入规则中间件
var joi = require("joi");
//导入主体解析
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//导入配置文件
var config = require("./config/index");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 路由设置
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter); // 认证相关路由不需要JWT验证

// 需要认证的路由 - 使用express-jwt
app.use("/api/protected", jwtAuth, verifyTokenType); // 需要强制验证的路由
app.use("/api/optional", optionalJwtAuth); // 可选验证的路由

// JWT错误处理中间件
app.use(jwtErrorHandler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
```

## 前端无感刷新实现

```javascript
// 前端请求封装示例
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器 - 无感刷新
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data.data;
          
          // 更新存储的token
          localStorage.setItem('accessToken', accessToken);
          
          // 处理队列中的请求
          processQueue(null, accessToken);
          
          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清除token并跳转登录
          processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // 跳转到登录页
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 没有refresh token，直接跳转登录
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## 方案对比

### 详细对比表

| 对比维度 | 自定义JWT方案 | express-jwt方案 |
|----------|---------------|----------------|
| **开发复杂度** | 高 - 需要手写验证逻辑 | 低 - 开箱即用 |
| **代码量** | 多 - 需要完整的验证中间件 | 少 - 配置即可 |
| **定制化程度** | 高 - 完全自定义 | 中等 - 通过配置实现 |
| **错误处理** | 完全自定义 | 标准化错误处理 |
| **学习曲线** | 陡峭 - 需要深入理解JWT | 平缓 - 配置简单 |
| **维护成本** | 高 - 需要维护自定义代码 | 低 - 库维护 |
| **性能** | 优秀 | 优秀 |
| **社区支持** | 无 | 强 - 成熟库 |
| **调试难度** | 高 - 需要调试自定义逻辑 | 低 - 标准化输出 |
| **扩展性** | 高 - 可任意扩展 | 中等 - 受库限制 |

### 优缺点分析

#### 自定义JWT方案

**优点：**
- ✅ 完全控制验证逻辑
- ✅ 高度定制化，可满足特殊需求
- ✅ 深入理解JWT工作原理
- ✅ 错误信息完全可控
- ✅ 可以实现复杂的业务逻辑

**缺点：**
- ❌ 开发工作量大
- ❌ 容易出现安全漏洞
- ❌ 维护成本高
- ❌ 需要充分测试
- ❌ 学习成本高

#### express-jwt方案

**优点：**
- ✅ 开箱即用，配置简单
- ✅ 经过充分测试，稳定可靠
- ✅ 社区支持强，文档完善
- ✅ 标准化实现，易于维护
- ✅ 支持多种token获取方式
- ✅ 内置错误处理机制

**缺点：**
- ❌ 定制化程度有限
- ❌ 依赖第三方库
- ❌ 可能存在版本兼容问题
- ❌ 对特殊需求支持有限

## 最佳实践建议

### 选择建议

#### 推荐使用express-jwt方案的场景：
1. **快速开发**: 需要快速上线的项目
2. **标准需求**: JWT验证需求比较标准，没有特殊要求
3. **团队经验**: 团队对JWT不够熟悉
4. **维护优先**: 更看重后期维护成本

#### 推荐使用自定义方案的场景：
1. **特殊需求**: 有复杂的认证业务逻辑
2. **完全控制**: 需要对认证流程有完全控制权
3. **学习目的**: 团队希望深入理解JWT原理
4. **性能极致**: 需要极致的性能优化

### 安全最佳实践

1. **Token存储**
   ```javascript
   // 推荐：使用httpOnly cookie存储refresh token
   res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: true, // 生产环境启用
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
   });
   ```

2. **CSRF防护**
   ```javascript
   // 结合CSRF token使用
   const csrfToken = generateCSRFToken();
   res.cookie('csrfToken', csrfToken);
   ```

3. **Token轮换**
   ```javascript
   // 定期轮换refresh token
   static async rotateRefreshToken(oldRefreshToken) {
     const decoded = jwt.verify(oldRefreshToken, config.jwtRefreshSecretKey);
     await this.removeRefreshToken(decoded.id);
     return this.generateRefreshToken(decoded);
   }
   ```

4. **IP绑定**
   ```javascript
   // 将token与IP绑定
   const payload = {
     ...userInfo,
     ip: req.ip
   };
   ```

### 配置建议

```javascript
// 推荐的配置参数
module.exports = {
    jwtSecretKey: process.env.JWT_SECRET || 'your_strong_secret_key',
    jwtRefreshSecretKey: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
    secretKeyExpire: 15 * 60, // Access Token: 15分钟
    refreshSecretKeyExpire: 7 * 24 * 60 * 60, // Refresh Token: 7天
    
    // Redis配置
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: 0
    },
    
    // 安全配置
    security: {
        maxLoginAttempts: 5, // 最大登录尝试次数
        lockoutTime: 30 * 60, // 锁定时间（秒）
        passwordMinLength: 8, // 密码最小长度
        enableIPBinding: false, // 是否启用IP绑定
        enableCSRF: true // 是否启用CSRF防护
    }
}
```

### 监控和日志

```javascript
// 添加日志记录
const logger = require('winston');

// 在JWT工具类中添加日志
static generateAccessToken(payload) {
    logger.info('Generating access token', { 
        userId: payload.id, 
        username: payload.username 
    });
    
    return jwt.sign(/* ... */);
}

static async verifyRefreshToken(token, userId) {
    try {
        // 验证逻辑
        logger.info('Refresh token verified successfully', { userId });
        return decoded;
    } catch (error) {
        logger.warn('Refresh token verification failed', { 
            userId, 
            error: error.message 
        });
        throw error;
    }
}
```

## 总结

双Token验证方案是现代Web应用中重要的认证机制，能够在保证安全性的同时提供良好的用户体验。

- **对于大多数项目**，推荐使用**express-jwt方案**，因为它提供了更好的开发体验和维护性
- **对于有特殊需求的项目**，可以考虑**自定义方案**，但需要投入更多的开发和维护成本

无论选择哪种方案，都需要注意安全最佳实践，包括Token的安全存储、传输和管理。同时要做好监控和日志记录，以便及时发现和处理安全问题。
