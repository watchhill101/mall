# 静态资源管理

## 目录结构
```
assets/
├── images/         # 图片资源
│   ├── avatar/     # 头像图片
│   └── login/      # 登录页图片
└── Icon/           # 图标文件
    └── svg/        # SVG 图标
```

## 使用说明

### 图片引用
```javascript
// 静态引用
import logo from '@/assets/images/logo.png'

// 动态引用
const imagePath = require('@/assets/images/avatar/default.jpg')
```

### SVG 图标
使用 SvgIcon 组件引用：
```jsx
<SvgIcon name="home" width="16" height="16" />
```

## 文件命名规范
- 使用小写字母和下划线
- 图片格式优先使用 WebP，备选 PNG/JPG
- SVG 图标使用语义化命名

## 图片优化建议
- 压缩图片大小，保持合理的质量
- 使用合适的图片格式
- 考虑使用 CDN 存储大量图片资源
