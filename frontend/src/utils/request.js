import Axios from 'axios'
import { getToken } from '../utils/auth'
import { message } from 'antd'

const BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : '/api' //请求接口url 如果不配置 则默认访问链接地址
const TIME_OUT = 20000 // 接口超时时间

const instance = Axios.create({
  baseURL: BASE_URL,
  timeout: TIME_OUT
})
console.log(process.env.NODE_ENV,'获取环境变量')
// 不需要token的接口白名单
const whiteList = ['/user/login', '/user/checkCode', '/user/refreshToken']

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    if (config.url && typeof config.url === 'string') {
      if (!whiteList.includes(config.url)) {
        let Token = getToken()
        if (Token && Token.length > 0) {
          config.headers && (config.headers['Authorization'] = Token)
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function setResponseInterceptor(store, login, logout) {
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
        // 简化响应处理，直接返回数据
        if (response.data && response.data.code !== undefined) {
          if (response.data.code === 0) {
            return response.data
          } else {
            const errMsg = response.data.message || '请求失败'
            message.error(errMsg)
            return Promise.reject(errMsg)
          }
        }
        return response.data || response
      }
    },
    (error) => {
      console.error('请求错误:', error)
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
