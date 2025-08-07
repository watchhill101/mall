# Live2D 本地模型配置说明

## 当前模型配置位置
文件: `frontend/src/components/Live2DModel/index.jsx`
配置行: 第 25 行的 `jsonPath`

## 使用本地模型的步骤

### 1. 下载 Live2D 模型文件
你需要准备以下文件结构：
```
frontend/public/live2d/
├── model.json           # 模型配置文件
├── model.moc           # 模型文件
├── textures/           # 贴图文件夹
│   ├── texture_00.png
│   └── texture_01.png
└── motions/            # 动作文件夹（可选）
    ├── idle_01.mtn
    └── tap_body_01.mtn
```

### 2. 常用的 Live2D 模型下载源
- **官方示例模型**: https://github.com/live2d/live2d-widget.js
- **Shizuku模型**: https://github.com/xiazeyu/live2d-widget-models
- **更多模型**: https://github.com/xiazeyu/live2d-widget-model-packages

### 3. 修改配置文件
在 `frontend/src/components/Live2DModel/index.jsx` 中修改：

```jsx
// 原配置（在线模型）
jsonPath: 'https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json',

// 修改为本地模型
jsonPath: '/live2d/model.json',
```

### 4. 本地模型配置示例

#### 4.1 基础配置
```jsx
L2Dwidget.default.init({
  model: {
    jsonPath: '/live2d/shizuku/shizuku.model.json',  // 本地模型路径
    scale: 1.0,                                      // 模型缩放
  },
  display: {
    position: 'fixed',
    width: 200,
    height: 300,
    hOffset: 0,
    vOffset: 0,
  },
  mobile: {
    show: true,
    scale: 0.8,
  },
  react: {
    opacity: 0.8,
  },
});
```

#### 4.2 多模型配置（随机切换）
```jsx
const models = [
  '/live2d/shizuku/shizuku.model.json',
  '/live2d/koharu/koharu.model.json',
  '/live2d/hijiki/hijiki.model.json',
];

const randomModel = models[Math.floor(Math.random() * models.length)];

L2Dwidget.default.init({
  model: {
    jsonPath: randomModel,
  },
  // ... 其他配置
});
```

### 5. 推荐的本地模型
以下是一些流行的 Live2D 模型，你可以下载后放到本地：

1. **Shizuku (雪花)**
   - 下载地址: https://github.com/xiazeyu/live2d-widget-model-shizuku
   - 特点: 动作丰富，表情可爱

2. **Koharu (小春)**
   - 下载地址: https://github.com/xiazeyu/live2d-widget-model-koharu
   - 特点: 清新可爱，动作自然

3. **Hijiki (海藻)**
   - 下载地址: https://github.com/xiazeyu/live2d-widget-model-hijiki
   - 特点: 成熟稳重，适合商务场景

### 6. 快速部署本地模型

#### 方法1: 直接下载到 public 目录
```bash
cd frontend/public
mkdir live2d
cd live2d

# 下载 Shizuku 模型
git clone https://github.com/xiazeyu/live2d-widget-model-shizuku.git shizuku
```

#### 方法2: 使用 npm 包（推荐）
```bash
cd frontend
npm install live2d-widget-model-shizuku
```

然后在代码中引用：
```jsx
import shizukuModel from 'live2d-widget-model-shizuku/assets/shizuku.model.json';

L2Dwidget.default.init({
  model: {
    jsonPath: shizukuModel,
  },
  // ... 其他配置
});
```

### 7. 模型交互配置
```jsx
L2Dwidget.default.init({
  model: {
    jsonPath: '/live2d/model.json',
  },
  react: {
    opacity: 0.8,
  },
  hit: [
    {
      id: 'tap_body',
      file: 'motions/tap_body_01.mtn'
    },
    {
      id: 'pinch_in',
      file: 'motions/pinch_in_01.mtn'
    }
  ],
  message: {
    mouseover: [
      { selector: '.username', text: '欢迎回来！' },
      { selector: '.ai-assistant-trigger', text: '点击我开始对话吧！' }
    ],
    click: [
      { selector: '.send-btn', text: '正在为您发送消息...' }
    ]
  }
});
```

### 8. 性能优化建议
- 使用压缩后的模型文件
- 适当调整模型尺寸和质量
- 启用预加载机制
- 考虑使用 CDN 加速

### 9. 故障排除
如果模型无法加载，请检查：
1. 文件路径是否正确
2. 模型文件是否完整
3. 浏览器控制台是否有错误信息
4. 网络请求是否成功

## 当前可用的在线模型列表
如果你想先测试不同的在线模型，可以使用以下地址：

```jsx
// Shizuku
'https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json'

// Koharu  
'https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json'

// Hijiki
'https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json'

// Tororo
'https://unpkg.com/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json'

// Izumi
'https://unpkg.com/live2d-widget-model-izumi@1.0.5/assets/izumi.model.json'
```
