// 认证相关配置
export const AUTH_CONFIG = {
  // Token存储键名
  ACCESS_TOKEN_KEY: 'ACCESS-TOKEN',
  REFRESH_TOKEN_KEY: 'REFRESH-TOKEN',
  
  // 请求配置
  API_BASE_URL: process.env.NODE_ENV === 'production' ? '/api' : '/api',
  REQUEST_TIMEOUT: 20000,
  
  // 不需要token的接口白名单
  WHITE_LIST: [
    '/auth/login',
    '/auth/refresh',
    '/captcha/generate', 
    '/captcha/verify',
    '/captcha/refresh'
  ],
  
  // 刷新token相关配置
  REFRESH_CONFIG: {
    // 最大重试次数
    MAX_RETRY_ATTEMPTS: 3,
    // 重试间隔（毫秒）
    RETRY_DELAY: 1000,
    // 并发控制
    CONCURRENT_REFRESH_CONTROL: true
  },
  
  // token检查配置
  TOKEN_CHECK: {
    // App组件检查间隔（毫秒）- 监听localStorage变化，不需要定期检查
    APP_CHECK_INTERVAL: 0,
    // Layout组件检查间隔（毫秒）- 5分钟检查一次
    LAYOUT_CHECK_INTERVAL: 5 * 60 * 1000,
    // 是否启用跨标签页同步
    CROSS_TAB_SYNC: true
  }
};

// HTTP状态码配置
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  GATEWAY_TIMEOUT: 504
};

// 错误消息配置
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TOKEN_EXPIRED: '登录已过期，请重新登录',
  UNAUTHORIZED: '请先登录',
  REFRESH_FAILED: 'Token刷新失败，请重新登录',
  SERVER_ERROR: '服务器内部错误',
  TIMEOUT: '请求超时，请检查网络连接',
  NOT_FOUND: '请求的资源不存在',
  GATEWAY_TIMEOUT: '网关超时，请检查后端服务'
};
