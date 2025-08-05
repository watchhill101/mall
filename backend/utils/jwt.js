const jwt = require("jsonwebtoken");
const config = require("../config/index");
const redis = require("redis");
const User = require("../moudle/user/user"); // 引入用户模型

// 创建 Redis 客户端
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});

redisClient.connect().catch((err) => {
  console.log("Redis connection error:", err);
});

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

    // 将 Refresh Token 存储到 Redis 中
    const key = `refreshToken:${payload.userId || payload._id}`;
    redisClient.setEx(key, config.refreshSecretKeyExpire, refreshToken);
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
      const storedToken = await redisClient.get(key);

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

      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken, // 可以选择是否生成新的refresh token
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
    await redisClient.del(key);
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
