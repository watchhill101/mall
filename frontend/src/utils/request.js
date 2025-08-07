import Axios from 'axios'
import { getToken, getRefreshToken, setToken, removeToken, removeRefreshToken, setRefreshToken } from '../utils/auth'
import { message } from 'antd'
import { AUTH_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/auth'

const instance = Axios.create({
  baseURL: AUTH_CONFIG.API_BASE_URL,
  timeout: AUTH_CONFIG.REQUEST_TIMEOUT
})
console.log(process.env.NODE_ENV,'获取环境变量')
// 不需要token的接口白名单
// const whiteList = ['/auth/login', '/auth/refresh', '/captcha/generate', '/captcha/verify', '/captcha/refresh', '/qiao/products']

console.log(process.env.NODE_ENV, '获取环境变量')
// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    console.log('📤 发送请求:', config.method?.toUpperCase(), config.url, config.data);

    if (config.url && typeof config.url === 'string') {
      if (!AUTH_CONFIG.WHITE_LIST.includes(config.url)) {
        let token = getToken()
        
        if (token && token.length > 0) {
          config.headers && (config.headers['Authorization'] = `Bearer ${token}`)
          console.log('🔑 添加 Token:', token.substring(0, 20) + '...');
        }
      } else {
        console.log('⚪ 白名单接口，跳过 Token 验证');
      }
    }
    return config
  },
  (error) => {
    console.error('📤 请求拦截器错误:', error);
    return Promise.reject(error)
  }
)

// 刷新token相关状态控制
let isRefreshing = false;
let failedQueue = [];

// 处理队列中的请求
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

export function setResponseInterceptor(store) {
  // 添加响应拦截器
  instance.interceptors.response.use(
    (response) => {
      // 如果返回的类型为二进制文件类型
      if (response.config.responseType === 'blob') {
        if (response.status !== 200) {
          message.error('请求失败' + response.status)
          return Promise.reject()
        } else if (!response.headers['content-disposition']) {
          message.error('暂无接口访问权限')
          return Promise.reject()
        }
        return response
      } else {
        console.log('📥 收到响应:', response.status, response.data);

        // 处理后端返回的数据格式
        if (response.data && response.data.code !== undefined) {
          if (response.data.code === 200 || response.data.code === 201) {
            console.log('✅ 请求成功:', response.data);
            return response.data
          } else {
            const errMsg = response.data.message || '请求失败'
            console.error('❌ 业务错误:', errMsg);
            message.error(errMsg)
            return Promise.reject(new Error(errMsg))
          }
        }
        return response.data || response
      }
    },
    async (error) => {
      console.error('请求错误:', error)
      
      // 处理401错误（token过期）
      if (error.response && error.response.status === HTTP_STATUS.UNAUTHORIZED) {
        const originalRequest = error.config;
        
        // 防止无限循环重试
        if (originalRequest._retry) {
          console.log('❌ 请求已重试过，停止重试')
          store.dispatch({ type: 'user/logout' })
          return Promise.reject(error)
        }
        
        // 如果正在刷新token，将请求加入队列
        if (isRefreshing) {
          console.log('⏳ 正在刷新token，请求加入队列')
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return instance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        const refreshToken = getRefreshToken()
        
        if (refreshToken) {
          try {
            console.log('🔄 尝试刷新token...')
            // 调用刷新token接口
            const refreshResponse = await Axios.post('/api/auth/refresh', {
              refreshToken: refreshToken
            })
            
            if (refreshResponse.data && refreshResponse.data.code === 200) {
              const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data
              setToken(accessToken)
              
              // 如果返回了新的refreshToken，也要更新
              if (newRefreshToken) {
                setRefreshToken(newRefreshToken)
              }
              
              console.log('✅ Token刷新成功')
              
              // 更新Redux状态
              store.dispatch({ 
                type: 'user/login', 
                payload: { 
                  token: accessToken, 
                  refreshToken: newRefreshToken || refreshToken 
                } 
              })
              
              // 处理队列中的请求
              processQueue(null, accessToken);
              
              // 重新发送原始请求
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
              return instance(originalRequest)
            }
          } catch (refreshError) {
            // 刷新失败，清除所有token并跳转到登录页
            removeToken()
            removeRefreshToken()
            // 清除Redux状态
            store.dispatch({ type: 'user/logout' })
            message.error(ERROR_MESSAGES.TOKEN_EXPIRED)
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false;
          }
        } else {
          // 没有refresh token，直接跳转登录
          message.error(ERROR_MESSAGES.UNAUTHORIZED)
          store.dispatch({ type: 'user/logout' })
          isRefreshing = false;
          return Promise.reject(error)
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        message.error(ERROR_MESSAGES.TIMEOUT)
      } else if (error.response) {
        const status = error.response.status
        if (status === HTTP_STATUS.NOT_FOUND) {
          message.error(ERROR_MESSAGES.NOT_FOUND)
        } else if (status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
          message.error(ERROR_MESSAGES.SERVER_ERROR)
        } else if (status === HTTP_STATUS.GATEWAY_TIMEOUT) {
          message.error(ERROR_MESSAGES.GATEWAY_TIMEOUT)
        } else {
          message.error(`请求失败: ${status}`)
        }
      } else {
        message.error(ERROR_MESSAGES.NETWORK_ERROR)
      }
      return Promise.reject(error)
    }
  )
}

export default instance
