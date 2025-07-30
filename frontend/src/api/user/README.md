# 用户管理 API

## 接口说明

### 登录模块 (login)
- `login(data)` - 用户登录
- `get(uuid)` - 获取验证码

### 用户中心 (center)
- `get(userId)` - 获取用户信息
- `update(data)` - 更新用户信息

### 用户管理 (manage)
- `reset(data)` - 重置密码
- `query(params)` - 查询用户列表
- `add(data)` - 添加用户
- `update(data)` - 更新用户
- `delete(id)` - 删除用户

## 使用示例

```javascript
import userApi from '@/api/user'

// 登录
const response = await userApi.login.login({
  username: 'admin',
  password: '123456'
})

// 获取用户信息
const userInfo = await userApi.center.get()
```

## 注意事项

- 所有接口都通过统一的 request 工具进行封装
- 管理功能的接口暂时返回模拟数据，便于项目初始化
- 实际使用时需要根据后端接口调整URL和数据格式
