module.exports = {
    jwtSecretKey:'your_jwt_secret_key',
    jwtRefreshSecretKey:'your_jwt_refresh_secret_key',
    secretKeyExpire: 60*60,// 1 小时
    refreshSecretKeyExpire: 60*60*24*2, // 2 天
    port:6379,
    url:'127.0.0.1',
    password:''
}