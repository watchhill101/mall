# 布局组件

## 目录结构
```
Layout/
├── index.jsx           # 主布局组件
├── Layout.scss         # 布局样式
└── components/         # 布局子组件
    ├── ResetPwdForm.jsx    # 重置密码表单
    ├── TabsView.jsx        # 标签页视图
    └── UserCenterForm.jsx  # 用户中心表单
```

## 功能特性

### 主布局功能
- 响应式侧边栏（可折叠）
- 主题切换（暗色/亮色）
- 面包屑导航
- 标签页导航
- 用户头像下拉菜单
- 权限控制菜单显示

### TabsView
多标签页管理：
- 标签页缓存
- 右键菜单操作
- 标签页关闭功能

### 用户相关组件
- **UserCenterForm** - 用户信息编辑
- **ResetPwdForm** - 密码重置表单

## 自定义配置

### 修改项目名称
在 `Layout/index.jsx` 中找到：
```jsx
{!collapsed && <span>管理系统模板</span>}
```

### 调整主题色彩
在 `Layout.scss` 中修改 CSS 变量：
```scss
:root {
  --primary-color: #1890ff;
  --sidebar-width: 200px;
  --header-height: 64px;
}
```

### 菜单配置
菜单项通过路由配置和权限系统自动生成，支持：
- 图标显示
- 多级嵌套
- 权限控制
- 动态加载

## 响应式设计
布局组件支持多种屏幕尺寸：
- 桌面端：完整侧边栏
- 平板端：可折叠侧边栏  
- 移动端：抽屉式侧边栏
