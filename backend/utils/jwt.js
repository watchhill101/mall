const jwt = require("jsonwebtoken");
const config = require("../config/index");
const redis = require("redis");
const User = require("../moudle/user/user"); // 引入用户模型

// 创建 Redis 客户端
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // Redis服务器拒绝连接
      console.error('Redis server connection was refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // 1小时后停止重试
      console.error('Redis retry time exhausted');
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      // 10次重试后停止
      return undefined;
    }
    // 重连延迟算法：min(指数增长, 3秒)
    return Math.min(options.attempt * 100, 3000);
  }
});

// Redis连接处理
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis连接成功');
  } catch (err) {
    console.error('❌ Redis连接失败:', err);
    // 5秒后重试连接
    setTimeout(connectRedis, 5000);
  }
};

// Redis错误事件监听
redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

redisClient.on('connect', () => {
  console.log('Redis连接已建立');
});

redisClient.on('ready', () => {
  console.log('Redis客户端就绪');
});

redisClient.on('end', () => {
  console.log('Redis连接已断开');
});

// 初始化连接
connectRedis();

// Redis操作包装函数，增加错误处理
const safeRedisOperation = async (operation, ...args) => {
  try {
    return await operation(...args);
  } catch (error) {
    console.error('Redis操作失败:', error);
    // 如果Redis不可用，允许系统继续运行，但记录错误
    throw new Error('Redis service temporarily unavailable');
  }
};

class JwtUtil {
  /**
   * 生成 Access Token
   * @param payload - 包含用户信息的载荷
   * @returns {string} Access Token
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      {
        userId: payload.userId || payload._id,
        loginAccount: payload.loginAccount,
        email: payload.email,
        FirstLevelNavigationID: payload.FirstLevelNavigationID,
        type: "access",
      },
      config.jwtSecretKey,
      { expiresIn: config.secretKeyExpire }
    );
  }

  /**
   * 生成 Refresh Token
   * @param payload - 包含用户信息的载荷
   * @returns {string} Refresh Token
   */
  static generateRefreshToken(payload) {
    const refreshToken = jwt.sign(
      {
        userId: payload.userId || payload._id,
        loginAccount: payload.loginAccount,
        type: "refresh",
      },
      config.jwtRefreshSecretKey,
      { expiresIn: config.refreshSecretKeyExpire }
    );

    // 将 Refresh Token 存储到 Redis 中（使用安全包装）
    const key = `refreshToken:${payload.userId || payload._id}`;
    safeRedisOperation(
      () => redisClient.setEx(key, config.refreshSecretKeyExpire, refreshToken)
    ).catch(err => {
      console.error('存储RefreshToken到Redis失败:', err);
    });
    
    return refreshToken;
  }

  /**
   * 生成完整的token对
   * @param user - 用户对象
   * @returns {Object} 包含accessToken和refreshToken的对象
   */
  static generateTokenPair(user) {
    const payload = {
      userId: user._id,
      loginAccount: user.loginAccount,
      email: user.email,
      FirstLevelNavigationID: user.FirstLevelNavigationID,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: config.secretKeyExpire,
    };
  }

  /**
   * 验证刷新令牌
   * @param token - Refresh Token
   * @param userId - 用户ID
   * @returns {Object} 解码后的token信息
   */
  static async verifyRefreshToken(token, userId) {
    try {
      // 验证 Refresh Token
      const decoded = jwt.verify(token, config.jwtRefreshSecretKey);
      const key = `refreshToken:${userId}`;
      
      // 使用安全包装获取Redis中的token
      const storedToken = await safeRedisOperation(
        () => redisClient.get(key)
      );

      // 检查 Redis 中存储的 Refresh Token 是否与提供的 token 匹配
      if (storedToken && storedToken === token) {
        return decoded;
      } else {
        throw new Error("Refresh token not found or mismatch");
      }
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      throw new Error("Invalid or expired refresh token");
    }
  }

  /**
   * 刷新 Access Token
   * @param refreshToken - Refresh Token
   * @returns {Object} 新的token对
   */
  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecretKey);

      // 验证 Refresh Token
      await this.verifyRefreshToken(refreshToken, decoded.userId);

      // 从数据库获取最新的用户信息
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new Error("User not found");
      }

      // 生成新的 Access Token
      const newAccessToken = this.generateAccessToken({
        userId: user._id,
        loginAccount: user.loginAccount,
        email: user.email,
        FirstLevelNavigationID: user.FirstLevelNavigationID,
      });

      // 生成新的 Refresh Token（轮换机制）
      const newRefreshToken = this.generateRefreshToken({
        userId: user._id,
        loginAccount: user.loginAccount,
      });

      // 删除旧的 Refresh Token
      await this.deleteRefreshToken(decoded.userId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: config.secretKeyExpire,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除 Refresh Token（用于登出）
   * @param userId - 用户ID
   */
  static async deleteRefreshToken(userId) {
    const key = `refreshToken:${userId}`;
    try {
      await safeRedisOperation(() => redisClient.del(key));
    } catch (error) {
      console.error('删除RefreshToken失败:', error);
      // 不抛出错误，允许登出继续进行
    }
  }

  /**
   * 验证Access Token
   * @param token - Access Token
   * @returns {Object} 解码后的token信息
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecretKey);
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }
}

module.exports = JwtUtil;
