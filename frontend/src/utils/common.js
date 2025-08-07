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
  SettingOutlined: <SvgIcon name="setting" style={{ fontSize: '14px', color: '#ccc' }} />,
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
    { path: 'system', menuPath: '/system', title: '系统设置' }, // 更新为系统设置路由
    // 添加商家子路由映射
    { path: 'merchants', menuPath: '/shops/merchants', title: '商家管理' },
    { path: 'merchant-account', menuPath: '/shops/merchant-account', title: '商家账号' },
    { path: 'withdraw-account', menuPath: '/shops/withdraw-account', title: '提现账号' },
    { path: 'account-detail', menuPath: '/shops/account-detail', title: '账户明细' },
    { path: 'merchant-withdraw', menuPath: '/shops/merchant-withdraw', title: '商家提现' },
    { path: 'settlement-order', menuPath: '/shops/settlement-order', title: '结算订单' },
    { path: 'settlement-bill', menuPath: '/shops/settlement-bill', title: '结账单' },
    { path: 'merchant-application', menuPath: '/shops/merchant-application', title: '商家申请' },
    // 添加商品子路由映射
    { path: 'product-list', menuPath: '/goods/product-list', title: '商品列表' },
    { path: 'audit-list', menuPath: '/goods/audit-list', title: '审核列表' },
    { path: 'recycle-bin', menuPath: '/goods/recycle-bin', title: '回收站' },
    { path: 'product-category', menuPath: '/goods/product-category', title: '商品分类' },
    { path: 'external-product', menuPath: '/goods/external-product', title: '外部商品库' },
    { path: 'current-stock', menuPath: '/goods/inventory/current-stock', title: '当前库存' },
    { path: 'stock-in', menuPath: '/goods/inventory/stock-in', title: '入库' },
    { path: 'stock-out', menuPath: '/goods/inventory/stock-out', title: '出库' },
    { path: 'stocktake', menuPath: '/goods/inventory/stocktake', title: '盘点' },
    { path: 'stock-details', menuPath: '/goods/inventory/stock-details', title: '出入库明细' },
    // 添加订单子路由映射
    { path: 'orders-list', menuPath: '/orders/orders-list', title: '订单' },
    { path: 'afterSales', menuPath: '/orders/afterSales', title: '售后' },
    { path: 'tallySheet', menuPath: '/orders/tallySheet', title: '理货单' },
    { path: 'SortingList', menuPath: '/orders/SortingList', title: '分拣单' },
    // 添加系统设置子路由映射
    { path: 'users', menuPath: '/system/users', title: '用户' },
    { path: 'carousel', menuPath: '/system/carousel', title: '轮播图' },
    { path: 'user-permissions', menuPath: '/system/user-permissions', title: '用户权限' },
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
              null // 移除子菜单图标
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
  'GoodsOutlined',
  'OrdersOutlined',
  'SettingOutlined',
]