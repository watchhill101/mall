import request from '@/utils/request'

const captchaAPI = {
  // 生成验证码
  generate: generateCaptchaAPI,
  // 验证验证码
  verify: verifyCaptchaAPI,
  // 刷新验证码
  refresh: refreshCaptchaAPI
}

export default captchaAPI

// 生成验证码
function generateCaptchaAPI() {
  return request({
    url: '/captcha/generate',
    method: 'GET'
  })
}

// 验证验证码
function verifyCaptchaAPI(data) {
  return request({
    url: '/captcha/verify',
    method: 'POST',
    data
  })
}

// 刷新验证码
function refreshCaptchaAPI(data = {}) {
  return request({
    url: '/captcha/refresh',
    method: 'POST',
    data
  })
}