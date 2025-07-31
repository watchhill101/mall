/**
 * 内置一些工具类函数
 */ 
import { Link } from 'react-router-dom'
import SvgIcon from '@/components/SvgIcon'
import { 
  HomeOutlined
} from '@ant-design/icons'

// 图标映射，用于面包屑和菜单
export const IconMap = {
  HomeOutlined: <HomeOutlined style={{ fontSize: '14px', color: '#ccc' }} />,
  ShopOutlined: <SvgIcon name="shop" style={{ fontSize: '14px', color: '#ccc' }} />,
  GoodsOutlined: <SvgIcon name="goods" style={{ fontSize: '14px', color: '#ccc' }} />,
  OrdersOutlined: <SvgIcon name="orders" style={{ fontSize: '14px', color: '#ccc' }} />,
  UsersOutlined: <SvgIcon name="users" style={{ fontSize: '14px', color: '#ccc' }} />,
  // 可以继续添加其他图标
}

/**
 * 面包屑获取路由平铺对象 ,
 * @param {*} routes
 * @returns object, 例:{"/home":"首页"}
 */
export const getBreadcrumbNameMap = (routes) => {
  //首先拼接上首页
  const list = [
    { path: 'home', menuPath: '/home', title: '首页' },
    { path: 'shops', menuPath: '/shops', title: '商家' }, // 添加商家路由
    { path: 'goods', menuPath: '/goods', title: '商品' }, // 添加商品路由
    { path: 'orders', menuPath: '/orders', title: '订单' }, // 添加订单路由
    { path: 'users', menuPath: '/users', title: '用户' }, // 添加用户路由
    ...routes
  ]
  let breadcrumbNameObj = {}
  const getItems = (list) => {
    //先遍历数组
    list.forEach((item) => {
      //遍历数组项的对象
      if (item.children && item.children.length) {
        const menuPath = item.menuPath ? item.menuPath : '/' + item.path
        breadcrumbNameObj[menuPath] = item.title
        getItems(item.children)
      } else {
        breadcrumbNameObj[item.menuPath] = item.title
      }
    })
  }
  //调用一下递归函数
  getItems(list)
  //返回新数组
  return breadcrumbNameObj
}

/** 获取菜单项 */
export function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type
  }
}

/**
 * 获取侧边栏菜单项
 * @param {*} menuData 嵌套的路由数组
 * @returns
 */
export const getTreeMenu = (menuData) => {
  if (!menuData || !menuData.length) return []
  const menuItems = []
  
  menuData.forEach((item) => {
    if (!item.hidden) {
      // 如果有子菜单
      if (item.children && item.children.length > 0) {
        menuItems.push(
          getItem(
            item.title,
            item.menuPath || '/' + item.path,
            IconMap[item.icon] || <SvgIcon name={item.icon ?? 'component'} width="14" height="14" color="#ccc" />,
            getTreeMenu(item.children)
          )
        )
      } else {
        if (item.path && item.menuPath) {
          menuItems.push(
            getItem(
              <Link to={item.menuPath}>{item.title}</Link>,
              item.menuPath,
              IconMap[item.icon] || <SvgIcon name={item.icon ?? 'component'} width="14" height="14" color="#ccc" />
            )
          )
        }
      }
    }
  })
  return menuItems
}

// 导出可用的图标列表，方便其他地方使用
export const availableIcons = [
  'HomeOutlined',
  'ShopOutlined', 
]