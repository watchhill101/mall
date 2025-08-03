const path = require('path')
const resolve = (dir) => path.resolve(__dirname, dir)

module.exports = {
  webpack: {
    alias: {
      '@': resolve('src')
    },
    configure: (webpackConfig, { env, paths }) => {
      // 排除默认的 SVG 处理规则
      const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf)
      if (oneOfRule) {
        const svgRule = oneOfRule.oneOf.find(rule => rule.test && rule.test.toString().includes('svg'))
        if (svgRule) {
          svgRule.exclude = resolve('./src/assets/Icon/svg')
        }
      }

      // 添加 SVG sprite 处理规则
      webpackConfig.module.rules[1].oneOf = [
        {
          test: /\.svg$/,
          include: resolve('./src/assets/Icon/svg'),
          use: [
            { 
              loader: 'svg-sprite-loader', 
              options: {
                symbolId: 'icon-[name]' // ✅ 添加这个重要配置
              }
            },
            { loader: 'svgo-loader', options: {} }
          ]
        },
        ...webpackConfig.module.rules[1].oneOf
      ]
      return webpackConfig
    }
  },
  style: {
    modules: {
      localIdentName: '[name]__[local]--[hash:base64:5]'
    }
  }
}
