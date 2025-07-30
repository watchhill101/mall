# 公共组件库

## 目录结构
```
components/
├── AuthComponent/      # 权限控制组件
├── CustomModal/        # 自定义模态框
├── CustomTable/        # 自定义表格
├── IconSelect/         # 图标选择器
├── Loading/            # 加载组件
├── Loadings/           # 加载动画组件
├── SearchBar/          # 搜索栏组件
└── SvgIcon/           # SVG 图标组件
```

## 组件说明

### AuthComponent
用于页面级权限控制
```jsx
<AuthComponent permission="user:add">
  <Button>添加用户</Button>
</AuthComponent>
```

### CustomModal
封装的模态框组件，支持 ref 控制
```jsx
const modalRef = useRef()
<CustomModal title="标题" ref={modalRef}>
  <div>内容</div>
</CustomModal>

// 控制显示/隐藏
modalRef.current.toggleShowStatus(true)
```

### CustomTable
增强的表格组件，集成分页、搜索等功能
```jsx
<CustomTable
  columns={columns}
  fetchMethod={api.query}
  requestParam={params}
/>
```

### SvgIcon
SVG 图标组件
```jsx
<SvgIcon name="home" width="16" height="16" color="#1890ff" />
```

### SearchBar
搜索栏组件
```jsx
const formItemList = [
  { formItemProps: { name: 'name', label: '名称' }, valueCompProps: {} }
]

<SearchBar 
  formItemList={formItemList} 
  getSearchParams={handleSearch} 
/>
```

## 开发规范
- 每个组件都应有独立的文件夹
- 包含 index.jsx 和对应的样式文件
- 添加 PropTypes 类型检查
- 编写使用示例和文档
- 组件应该是可复用和可配置的
