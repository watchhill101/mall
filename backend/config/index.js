require('dotenv').config();

module.exports = {
    jwtSecretKey: process.env.JWT_SECRET_KEY || 'your_jwt_secret_key_2024',
    jwtRefreshSecretKey: process.env.JWT_REFRESH_SECRET_KEY || 'your_jwt_refresh_secret_key_2024',
    secretKeyExpire: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRE) || 15 * 60, // Access Token: 15分钟
    refreshSecretKeyExpire: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRE) || 7 * 24 * 60 * 60, // Refresh Token: 7天
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mall'
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || ''
    }
}