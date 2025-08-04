module.exports = {
    jwtSecretKey:'your_jwt_secret_key_2024',
    jwtRefreshSecretKey:'your_jwt_refresh_secret_key_2024',
    secretKeyExpire: 15 * 60, // Access Token: 15分钟
    refreshSecretKeyExpire: 7 * 24 * 60 * 60, // Refresh Token: 7天
    port: 6379,
    url: '127.0.0.1',
    password: ''
}