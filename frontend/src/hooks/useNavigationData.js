import { useState, useEffect } from 'react';
import navigationAPI from '@/api/navigation';

// 本地默认导航数据 - 作为后备方案
const DEFAULT_NAVIGATION = [
  {
    _id: 'local-home',
    title: '首页',
    icon: 'HomeOutlined',
    url: '/home',
    subTitle: '系统首页',
    subText: '查看系统概览和数据统计',
    children: []
  },
  {
    _id: 'local-shops',
    title: '商家',
    icon: 'ShopOutlined',
    url: '/shops',
    subTitle: '商家管理',
    subText: '管理商家信息、账户和设备',
    children: [
      { _id: 'local-shops-1', name: '商家管理', url: '/shops/merchants' },
      { _id: 'local-shops-2', name: '商家账号', url: '/shops/merchant-account' },
      { _id: 'local-shops-3', name: '提现账号', url: '/shops/withdraw-account' },
      { _id: 'local-shops-4', name: '账户明细', url: '/shops/account-detail' },
      { _id: 'local-shops-5', name: '商家提现', url: '/shops/merchant-withdraw' },
      { _id: 'local-shops-6', name: '结算订单', url: '/shops/settlement-order' },
      { _id: 'local-shops-7', name: '结账单', url: '/shops/settlement-bill' },
      { _id: 'local-shops-8', name: '商家申请', url: '/shops/merchant-application' },
      { _id: 'local-shops-9', name: '设备管理', url: '/shops/device-management' }
    ]
  },
  {
    _id: 'local-goods',
    title: '商品',
    icon: 'GoodsOutlined',
    url: '/goods',
    subTitle: '商品管理',
    subText: '管理商品信息、分类和库存',
    children: [
      { _id: 'local-goods-1', name: '商品列表', url: '/goods/product-list' },
      { _id: 'local-goods-2', name: '审核列表', url: '/goods/audit-list' },
      { _id: 'local-goods-3', name: '回收站', url: '/goods/recycle-bin' },
      { _id: 'local-goods-4', name: '商品分类', url: '/goods/product-category' },
      { _id: 'local-goods-5', name: '外部商品库', url: '/goods/external-product' },
      { _id: 'local-goods-6', name: '当前库存', url: '/goods/inventory/current-stock' },
      { _id: 'local-goods-7', name: '入库', url: '/goods/inventory/stock-in' },
      { _id: 'local-goods-8', name: '出库', url: '/goods/inventory/stock-out' },
      { _id: 'local-goods-9', name: '盘点', url: '/goods/inventory/stocktake' },
      { _id: 'local-goods-10', name: '出入库明细', url: '/goods/inventory/stock-details' }
    ]
  },
  {
    _id: 'local-orders',
    title: '订单',
    icon: 'OrdersOutlined',
    url: '/orders',
    subTitle: '订单管理',
    subText: '处理订单、售后和物流相关业务',
    children: [
      { _id: 'local-orders-1', name: '订单', url: '/orders/orders-list' },
      { _id: 'local-orders-2', name: '售后', url: '/orders/afterSales' },
      { _id: 'local-orders-3', name: '理货单', url: '/orders/tallySheet' },
      { _id: 'local-orders-4', name: '分拣单', url: '/orders/SortingList' }
    ]
  },
  {
    _id: 'local-system',
    title: '系统设置',
    icon: 'SettingOutlined',
    url: '/system',
    subTitle: '系统设置',
    subText: '管理用户、轮播图和权限配置',
    children: [
      { _id: 'local-system-1', name: '用户', url: '/system/users' },
      { _id: 'local-system-2', name: '轮播图', url: '/system/carousel' },
      { _id: 'local-system-3', name: '用户权限', url: '/system/user-permissions' }
    ]
  }
];

/**
 * 导航数据管理Hook
 * 优先从后端获取导航数据，失败时使用本地默认数据
 */
export const useNavigationData = () => {
  const [navigationData, setNavigationData] = useState(DEFAULT_NAVIGATION);
  const [loading, setLoading] = useState(false);
  const [isFromBackend, setIsFromBackend] = useState(false);
  const [error, setError] = useState(null);

  // 获取导航数据
  const fetchNavigationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 正在从后端获取导航数据...');
      const response = await navigationAPI.navigation.getAll();
      
      if (response.code === 200 && response.data) {
        console.log('✅ 成功从后端获取导航数据:', response.data);
        setNavigationData(response.data);
        setIsFromBackend(true);
      } else {
        throw new Error(response.message || '获取导航数据失败');
      }
    } catch (err) {
      console.warn('⚠️ 后端导航数据获取失败，使用本地默认数据:', err.message);
      setError(err.message);
      setNavigationData(DEFAULT_NAVIGATION);
      setIsFromBackend(false);
    } finally {
      setLoading(false);
    }
  };

  // 刷新导航数据
  const refreshNavigationData = () => {
    fetchNavigationData();
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchNavigationData();
  }, []);

  return {
    navigationData,
    loading,
    isFromBackend,
    error,
    refreshNavigationData
  };
};

/**
 * 将导航数据转换为Antd Menu需要的格式
 */
export const convertToMenuItems = (navigationData, getItem, Link, SvgIcon) => {
  // 图标名称映射
  const iconMap = {
    'HomeOutlined': 'component',
    'ShopOutlined': 'shop', 
    'GoodsOutlined': 'goods',
    'OrdersOutlined': 'orders',
    'SettingOutlined': 'setting'
  };

  return navigationData.map(nav => {
    const iconName = iconMap[nav.icon] || 'component';
    
    // 如果有子菜单
    if (nav.children && nav.children.length > 0) {
      const children = nav.children.map(child => 
        getItem(
          <Link to={child.url}>{child.name}</Link>,
          child.url,
          <SvgIcon name="component" width="14" height="14" color="#ccc" />
        )
      );

      // 有子菜单的一级导航，不使用Link，只显示标题
      return getItem(
        nav.title,
        nav.url,
        <SvgIcon name={iconName} width="14" height="14" color="#ccc" />,
        children
      );
    } else {
      // 无子菜单的一级导航，使用Link
      return getItem(
        <Link to={nav.url}>{nav.title}</Link>,
        nav.url,
        <SvgIcon name={iconName} width="14" height="14" color="#ccc" />
      );
    }
  });
};

/**
 * 生成面包屑名称映射
 */
export const generateBreadcrumbNameMap = (navigationData) => {
  const nameMap = {};
  
  navigationData.forEach(nav => {
    // 添加一级导航
    nameMap[nav.url] = nav.title;
    
    // 添加二级导航
    if (nav.children && nav.children.length > 0) {
      nav.children.forEach(child => {
        nameMap[child.url] = child.name;
      });
    }
  });
  
  return nameMap;
};

export default useNavigationData;
