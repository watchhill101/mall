const svgCaptcha = require('svg-captcha');
const redis = require('redis');
const config = require('../config');

// 创建 Redis 客户端
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});

redisClient.connect().catch((err) => {
  console.log("Redis connection error:", err);
});

class CaptchaUtil {
  /**
   * 生成图片验证码
   * @param {string} sessionId - 会话ID
   * @returns {Object} 验证码信息
   */
  static async generateCaptcha(sessionId) {
    try {
      // 生成验证码
      const captcha = svgCaptcha.create({
        size: 4, // 验证码长度
        ignoreChars: '0o1iIl', // 忽略容易混淆的字符
        noise: 2, // 干扰线条数
        color: true, // 彩色验证码
        background: '#f0f0f0', // 背景色
        width: 120, // 宽度
        height: 40, // 高度
        fontSize: 50, // 字体大小
        charPreset: '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' // 字符集
      });

      // 将验证码存储到 Redis，设置5分钟过期
      const key = `captcha:${sessionId}`;
      await redisClient.setEx(key, 300, captcha.text.toLowerCase()); // 转为小写存储

      console.log(`✅ 验证码生成成功: ${sessionId} -> ${captcha.text}`);

      return {
        sessionId,
        captchaSvg: captcha.data,
        expiresIn: 300 // 5分钟
      };
    } catch (error) {
      console.error('❌ 验证码生成失败:', error);
      throw new Error('验证码生成失败');
    }
  }

  /**
   * 验证图片验证码
   * @param {string} sessionId - 会话ID
   * @param {string} userInput - 用户输入的验证码
   * @returns {boolean} 验证结果
   */
  static async verifyCaptcha(sessionId, userInput) {
    try {
      if (!sessionId || !userInput) {
        console.log('❌ 验证码参数不完整');
        return false;
      }

      const key = `captcha:${sessionId}`;
      const storedCaptcha = await redisClient.get(key);

      if (!storedCaptcha) {
        console.log('❌ 验证码已过期或不存在:', sessionId);
        return false;
      }

      // 验证码比较（不区分大小写）
      const isValid = storedCaptcha === userInput.toLowerCase();
      
      if (isValid) {
        // 验证成功后删除验证码（一次性使用）
        await redisClient.del(key);
        console.log(`✅ 验证码验证成功: ${sessionId}`);
      } else {
        console.log(`❌ 验证码验证失败: ${sessionId} - 期望: ${storedCaptcha}, 实际: ${userInput.toLowerCase()}`);
      }

      return isValid;
    } catch (error) {
      console.error('❌ 验证码验证错误:', error);
      return false;
    }
  }

  /**
   * 清理过期的验证码
   * @param {string} sessionId - 会话ID
   */
  static async clearCaptcha(sessionId) {
    try {
      const key = `captcha:${sessionId}`;
      await redisClient.del(key);
      console.log(`🗑️ 验证码已清理: ${sessionId}`);
    } catch (error) {
      console.error('❌ 验证码清理失败:', error);
    }
  }

  /**
   * 生成会话ID
   * @returns {string} 会话ID
   */
  static generateSessionId() {
    return 'captcha_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = CaptchaUtil;