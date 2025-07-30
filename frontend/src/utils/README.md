# 工具函数库

## 文件说明

### auth.js - 认证相关工具
```javascript
import { getToken, setToken, removeToken } from '@/utils/auth'

// 获取token
const token = getToken()

// 设置token  
setToken('your-token')

// 移除token
removeToken()
```

**注意：当前项目已暂时禁用 token 验证功能**
- Token 验证已在 `App.jsx` 中被注释
- 可以直接访问所有页面，无需登录
- 要重新启用验证，请取消 `App.jsx` 中相关代码的注释

### request.js - HTTP请求封装
统一的 HTTP 请求工具，包含：
- 请求/响应拦截器
- Token 自动刷新机制
- 错误统一处理
- 白名单配置

```javascript
import request from '@/utils/request'

const fetchData = async () => {
  const response = await request({
    url: '/api/data',
    method: 'GET',
    params: { id: 1 }
  })
  return response.data
}
```

### common.js - 通用工具函数
- `getBreadcrumbNameMap()` - 面包屑导航生成
- `getTreeMenu()` - 菜单树形结构处理
- `getMenus()` - 路由格式化工具
- `getItem()` - 菜单项生成

```javascript
import { getBreadcrumbNameMap, getTreeMenu } from '@/utils/common'

// 生成面包屑映射
const breadcrumbMap = getBreadcrumbNameMap(routes)

// 生成树形菜单
const menuTree = getTreeMenu(menuData)
```

### eventBus.jsx - 事件总线
组件间通信工具：
```javascript
import eventBus from '@/utils/eventBus'

// 发送事件
eventBus.emit('refresh-table', data)

// 监听事件
eventBus.on('refresh-table', handler)

// 移除监听
eventBus.off('refresh-table', handler)

// 一次性监听
eventBus.once('refresh-table', handler)
```

### jsencrypt.js - 加密工具
RSA 加密工具：
```javascript
import { encrypt, decrypt } from '@/utils/jsencrypt'

// 加密密码
const encryptedPassword = encrypt(password)

// 解密数据
const decryptedData = decrypt(encryptedData)
```

## 工具函数开发规范

### 命名规范
- 函数名使用驼峰命名法
- 工具文件名使用小写字母
- 导出函数使用具体的功能名称

### 文档规范
每个函数都应包含 JSDoc 注释：
```javascript
/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式化模式
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  // 实现代码
}
```

### 错误处理
```javascript
function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.error('JSON parse error:', error)
    return defaultValue
  }
}
```

### 类型检查
```javascript
function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

## 常用工具函数建议

### 数据处理
- `deepClone()` - 深拷贝
- `debounce()` - 防抖
- `throttle()` - 节流
- `formatNumber()` - 数字格式化

### 日期时间
- `formatDate()` - 日期格式化
- `getRelativeTime()` - 相对时间
- `isToday()` - 判断是否为今天

### 验证工具
- `isValidPhone()` - 手机号验证
- `isValidIdCard()` - 身份证验证
- `isValidUrl()` - URL 验证

### 本地存储
- `getStorage()` - 获取本地存储
- `setStorage()` - 设置本地存储
- `removeStorage()` - 移除本地存储

## 使用最佳实践
1. **保持函数纯净** - 无副作用，相同输入产生相同输出
2. **单一职责** - 每个函数只做一件事
3. **参数验证** - 验证输入参数的有效性
4. **错误处理** - 优雅地处理边界情况
5. **性能考虑** - 避免重复计算，使用缓存
