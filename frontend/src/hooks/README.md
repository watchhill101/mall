# 自定义 Hooks

## 目录结构
```
hooks/
├── useDict.js           # 字典数据获取
└── useFetchTableData.js # 表格数据获取
```

## Hooks 说明

### useDict
获取字典数据的 Hook
```javascript
import useDict from '@/hooks/useDict'

const Component = () => {
  const dictData = useDict('user_status')
  
  return (
    <Select>
      {dictData.map(item => (
        <Select.Option key={item.value} value={item.value}>
          {item.label}
        </Select.Option>
      ))}
    </Select>
  )
}
```

### useFetchTableData
表格数据获取的通用 Hook
```javascript
import useFetchTableData from '@/hooks/useFetchTableData'

const Component = () => {
  const {
    data,
    loading,
    pagination,
    handleTableChange,
    refresh
  } = useFetchTableData(fetchAPI, initialParams)
  
  return (
    <Table
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={handleTableChange}
    />
  )
}
```

## 开发规范
- Hook 名称以 use 开头
- 返回值使用对象形式，便于解构
- 包含完整的 JSDoc 注释
- 考虑错误处理和边界情况
- 保持 Hook 的通用性和可复用性

## 常见 Hook 模式
- 数据获取 Hook
- 状态管理 Hook  
- 事件处理 Hook
- 生命周期 Hook
- 表单处理 Hook
