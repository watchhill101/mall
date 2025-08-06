import Axios from 'axios'
import { getToken, getRefreshToken, setToken, removeToken, removeRefreshToken } from '../utils/auth'
import { message } from 'antd'

const BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : '/api' //请求接口url 如果不配置 则默认访问链接地址
const TIME_OUT = 20000 // 接口超时时间

const instance = Axios.create({
  baseURL: BASE_URL,
  timeout: TIME_OUT
})
console.log(process.env.NODE_ENV, '获取环境变量')
// 不需要token的接口白名单
const whiteList = [
  '/auth/login',
  '/auth/refresh',
  '/captcha/generate',
  '/captcha/verify',
  '/captcha/refresh'
]

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    console.log('📤 发送请求:', config.method?.toUpperCase(), config.url, config.data);

    if (config.url && typeof config.url === 'string') {
      if (!whiteList.includes(config.url)) {
        let token = getToken()
        let refreshToken = getRefreshToken()
        
        if (token && token.length > 0) {
          config.headers && (config.headers['Authorization'] = `Bearer ${token}`)
          console.log('🔑 添加 Token:', token.substring(0, 20) + '...');
        }
        
        // 添加refresh token到请求头
        if (refreshToken && refreshToken.length > 0) {
          config.headers && (config.headers['X-Refresh-Token'] = refreshToken)
          console.log('🔄 添加 Refresh Token');
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

export function setResponseInterceptor(store) {
  // 添加响应拦截器
  instance.interceptors.response.use(
    (response) => {
      // 检查响应头中是否有新的token
      const newAccessToken = response.headers['x-new-access-token']
      const tokenRefreshed = response.headers['x-token-refreshed']
      
      if (newAccessToken && tokenRefreshed === 'true') {
        console.log('🔄 检测到token已刷新，更新本地token')
        setToken(newAccessToken)
        // 同时更新Redux状态
        store.dispatch({ type: 'user/login', payload: { token: newAccessToken, refreshToken: getRefreshToken() } })
      }

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
          if (response.data.code === 200) {
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
      if (error.response && error.response.status === 401) {
        const refreshToken = getRefreshToken()
        
        if (refreshToken) {
          try {
            console.log('🔄 尝试刷新token...')
            // 调用刷新token接口
            const refreshResponse = await Axios.post('/api/auth/refresh', {
              refreshToken: refreshToken
            })
            
            if (refreshResponse.data && refreshResponse.data.code === 200) {
              const { accessToken } = refreshResponse.data.data
              setToken(accessToken)
              console.log('✅ Token刷新成功')
              
              // 重新发送原始请求
              const originalRequest = error.config
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
              return instance(originalRequest)
            }
          } catch (refreshError) {
            console.error('❌ Token刷新失败:', refreshError)
            // 刷新失败，清除所有token并跳转到登录页
            removeToken()
            removeRefreshToken()
            // 清除Redux状态
            store.dispatch({ type: 'user/logout' })
            message.error('登录已过期，请重新登录')
            return Promise.reject(refreshError)
          }
        } else {
          // 没有refresh token，直接跳转登录
          message.error('请先登录')
          store.dispatch({ type: 'user/logout' })
          return Promise.reject(error)
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        message.error('请求超时，请检查网络连接')
      } else if (error.response) {
        const status = error.response.status
        if (status === 404) {
          message.error('请求的资源不存在')
        } else if (status === 500) {
          message.error('服务器内部错误')
        } else if (status === 504) {
          message.error('网关超时，请检查后端服务')
        } else {
          message.error(`请求失败: ${status}`)
        }
      } else {
        message.error('网络错误，请检查连接')
      }
      return Promise.reject(error)
    }
  )
}

export default instance
