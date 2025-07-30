# 管理系统模板

基于 React + Ant Design 的现代化管理系统模板

## ✨ 特性

- 🚀 **React 18** - 使用最新的 React 版本
- 🎨 **Ant Design 5** - 企业级 UI 设计语言
- 📦 **Redux Toolkit** - 现代化的状态管理
- 🛣️ **React Router 6** - 声明式路由
- 💻 **响应式设计** - 支持多种屏幕尺寸
- 🔐 **权限控制** - 完整的权限管理系统
- 🎯 **TypeScript 支持** - 可选的类型检查
- 📱 **PWA 就绪** - 支持渐进式 Web 应用

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0 或 yarn >= 1.0.0

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 启动开发服务器
```bash
npm start
# 或
yarn start
```

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 📁 项目结构

```
src/
├── api/                  # API 接口
├── assets/              # 静态资源
├── components/          # 公共组件
├── hooks/               # 自定义 Hooks
├── Layout/              # 布局组件
├── pages/               # 页面组件
├── router/              # 路由配置
├── store/               # 状态管理
├── utils/               # 工具函数
├── App.jsx              # 根组件
└── index.js             # 入口文件
```

## 🛠️ 主要技术栈

- **前端框架**: React 18
- **UI 组件库**: Ant Design 5
- **状态管理**: Redux Toolkit
- **路由管理**: React Router 6
- **HTTP 请求**: Axios
- **构建工具**: Create React App + Craco
- **样式预处理**: Sass
- **图标方案**: SVG Sprite

## 📝 开发指南

查看各模块的 README 文件了解详细使用方法：
- [API 接口](src/api/README.md)
- [组件开发](src/components/README.md)
- [页面开发](src/pages/README.md)
- [状态管理](src/store/README.md)
- [工具函数](src/utils/README.md)

## 🔧 配置说明

### 环境变量
- `REACT_APP_API_BASE_URL` - API 基础地址
- `REACT_APP_APP_NAME` - 应用名称
- `REACT_APP_IMG_API` - 图片服务地址

### 代理配置
开发环境代理配置位于 `src/setupProxy.js`

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证
