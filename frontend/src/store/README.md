# 状态管理

## 目录结构
```
store/
├── index.js            # Store 配置
└── reducers/           # Reducers
    ├── userSlice.js        # 用户状态
    ├── permissionSlice.js  # 权限状态
    └── tabSlice.js        # 标签页状态
```

## Redux Toolkit 使用

### Store 配置
```javascript
import { configureStore } from '@reduxjs/toolkit'
import userSlice from './reducers/userSlice'

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    // 其他 reducer
  }
})
```

### 创建 Slice
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 异步 thunk
export const fetchUserAsync = createAsyncThunk(
  'user/fetchUser',
  async (userId) => {
    const response = await api.getUser(userId)
    return response.data
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload
    },
    clearUser: (state) => {
      state.data = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserAsync.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUserAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice
```

### 在组件中使用
```javascript
import { useSelector, useDispatch } from 'react-redux'
import { setUser, fetchUserAsync } from '@/store/reducers/userSlice'

const Component = () => {
  const user = useSelector(state => state.user.data)
  const loading = useSelector(state => state.user.loading)
  const dispatch = useDispatch()
  
  const handleUpdate = () => {
    dispatch(setUser(newUserData))
  }
  
  const handleFetch = () => {
    dispatch(fetchUserAsync(userId))
  }
  
  return (
    <div>
      {loading ? 'Loading...' : user?.name}
    </div>
  )
}
```

## 当前状态模块

### userSlice - 用户状态
- 用户信息（用户名、头像等）
- 登录状态（token、refreshToken）
- 异步操作（登录、获取用户信息）

### permissionSlice - 权限状态
- 用户权限列表
- 动态路由生成
- 菜单权限控制

### tabSlice - 标签页状态
- 打开的标签页列表
- 当前激活标签
- 标签页操作（添加、关闭、切换）

## 状态设计原则
1. **保持状态扁平化** - 避免深度嵌套
2. **按功能模块划分** - 每个 slice 负责一个功能域
3. **使用 RTK Query** - 处理复杂的异步请求
4. **避免衍生数据** - 使用 selector 计算衍生状态
5. **不可变更新** - 使用 Immer 进行不可变更新

## 新增状态模块示例
```javascript
// 创建新的 slice
const exampleSlice = createSlice({
  name: 'example',
  initialState: {
    items: [],
    selectedId: null,
    filters: {}
  },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload
    },
    selectItem: (state, action) => {
      state.selectedId = action.payload
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    }
  }
})

// 在 store 中注册
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    example: exampleSlice.reducer
  }
})
```
