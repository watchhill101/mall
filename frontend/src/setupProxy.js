const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001', // 后台服务地址以及端口号
      changeOrigin: true, // 是否开启代理
      pathRewrite: {
        '^/api': '' // 将 /api 前缀移除，直接转发到后端
      },
      onError: (err, req, res) => {
        console.error('代理错误:', err)
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('代理请求:', req.method, req.url, '->', proxyReq.path)
      }
    })
  )
}
