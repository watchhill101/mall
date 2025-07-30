# API 接口管理

## 目录结构
```
api/
├── auth/           # 认证相关接口
└── home/           # 首页相关接口
```

## 使用说明

### 接口定义规范
每个模块应包含以下文件：
- `index.js` - 主要接口定义

### 示例
```javascript
// auth/index.js
import request from '@/utils/request'

const apiMap = {
  login: loginAPI,
  logout: logoutAPI
}

function loginAPI(data) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

export default apiMap
```

### 在组件中使用
```javascript
import authApi from '@/api/auth'

// 调用登录接口
const response = await authApi.login(formData)
```

## 注意事项
- 所有接口都通过统一的 request 工具进行封装
- 接口返回格式应保持一致
- 错误处理由 request 拦截器统一处理
- 新增业务模块时，在此目录下创建对应的文件夹和接口文件
