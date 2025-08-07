import { AUTH_CONFIG } from '../config/auth'

// 设置token键值
const TokenKey = AUTH_CONFIG.ACCESS_TOKEN_KEY
const RefreshTokenKey = AUTH_CONFIG.REFRESH_TOKEN_KEY

/**
 * 获取token
 */
const getToken = () => {
  return window.localStorage.getItem(TokenKey)
}
/**
 * 设置token
 * @param token
 */
const setToken = (token) => {
  return window.localStorage.setItem(TokenKey, token)
}
/**
 * 移除token
 */
const removeToken = () => {
  return window.localStorage.removeItem(TokenKey)
}

const getRefreshToken = () => {
  return window.localStorage.getItem(RefreshTokenKey)
}

const setRefreshToken = (token) => {
  return window.localStorage.setItem(RefreshTokenKey, token)
}

const removeRefreshToken = () => {
  return window.localStorage.removeItem(RefreshTokenKey)
}
export { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken }
