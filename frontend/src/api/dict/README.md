# 字典管理 API

## 接口说明

- `query(params)` - 查询字典数据列表
- `getByType(type)` - 根据类型获取字典数据

## 预置字典类型

- `hidden` - 显隐状态字典
- `authType` - 权限类型字典  
- `status` - 状态字典

## 使用示例

```javascript
import dictApi from '@/api/dict'

// 根据类型获取字典数据
const hiddenDict = await dictApi.getByType('hidden')
// 返回: [{ label: '显示', value: '0' }, { label: '隐藏', value: '1' }]
```

## 注意事项

- 当前使用模拟数据，便于项目初始化
- 实际使用时需要根据后端接口调整数据格式
- 可以根据业务需求扩展更多字典类型
