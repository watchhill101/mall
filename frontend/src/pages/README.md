# 页面组件

## 目录结构
```
pages/
├── Home/           # 首页
├── Login/          # 登录页
└── NotFound/       # 404 页面
```

## 当前页面

### Home - 首页
- 显示系统统计数据
- 欢迎信息
- 可扩展为仪表盘

### Login - 登录页
- 用户登录表单
- 验证码功能
- 记住密码功能

### NotFound - 404页面
- 页面未找到提示
- 返回首页链接

## 建议新增页面

根据管理系统的需求，建议添加以下页面：

### 用户管理
```
User/
├── index.jsx       # 用户列表页
├── index.scss      # 样式文件
└── components/     # 页面专用组件
    ├── UserForm/   # 用户表单
    └── UserDetail/ # 用户详情
```

### 系统设置
```
System/
├── Profile/        # 个人资料
├── Settings/       # 系统设置
└── Logs/          # 操作日志
```

## 页面开发模板

### 标准页面结构
```jsx
import React, { useState, useRef } from 'react'
import { Card, Button, Space } from 'antd'
import CustomTable from '@/components/CustomTable'
import CustomModal from '@/components/CustomModal'
import './index.scss'

const PageName = () => {
  const [params, setParams] = useState({})
  const modalRef = useRef()

  const columns = [
    // 定义表格列
  ]

  return (
    <div className="page-container">
      <Card>
        <Space>
          <Button type="primary">新增</Button>
        </Space>
      </Card>
      
      <CustomTable
        columns={columns}
        fetchMethod={api.query}
        requestParam={params}
      />
      
      <CustomModal ref={modalRef}>
        {/* 表单内容 */}
      </CustomModal>
    </div>
  )
}

export default PageName
```

## 路由配置
新增页面需要在 `router/index.js` 中配置路由：
```javascript
const routes = [
  {
    path: '/page-name',
    element: <PageName />,
    title: '页面标题'
  }
]
```

## 开发规范
1. 页面组件使用 PascalCase 命名
2. 文件夹名使用 PascalCase
3. 样式文件与组件文件同名
4. 复杂页面拆分子组件
5. 使用 TypeScript（推荐）
