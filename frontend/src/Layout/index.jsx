import React, { useState, useRef, useMemo, useCallback, lazy } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardFilled,
  DownOutlined,
  UserOutlined,
  UndoOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Button,
  theme,
  Switch,
  Dropdown,
  Space,
  Popconfirm,
  Breadcrumb,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/reducers/userSlice';
import { useNavigate, Link, useLocation } from 'react-router-dom';
// 导入css（未模块化）
import './Layout.scss';
// 导入自定义组件
import TabsView from './components/TabsView';
import CustomModal from '@/components/CustomModal';
import UserCenterForm from './components/UserCenterForm';
import ResetPwdForm from './components/ResetPwdForm';
import SvgIcon from '@/components/SvgIcon';
// 导入工具类方法
import { getBreadcrumbNameMap, getItem, getTreeMenu } from '@/utils/common';

const { Header, Sider, Content } = Layout;
// 提取底层路由方法
const getMenus = (routes) => {
  let menus = [];
  function getMenuItem(route) {
    route.forEach((item) => {
      if (item.children && item.children.length) getMenuItem(item.children);
      else {
        // 排除默认路由
        if (item.path) menus.push(item);
      }
    });
  }
  getMenuItem(routes);
  return menus;
};
const LayoutApp = () => {
  /** 通用hook */
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 侧边栏伸缩
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  // 侧边栏主题模式
  const [themeVari, setThemeVari] = useState('dark');
  // 切换侧边栏主题颜色
  const changeTheme = (value) => {
    setThemeVari(value ? 'light' : 'dark');
  };
  /** 侧边栏菜单 */
  const { pathname } = useLocation();
  const permissionRoutes = useSelector(
    (state) => state.permission.permissionRoutes
  );
  // 获取当前路径数组片段
  const pathSnippets = pathname.split('/').filter((i) => i);
  const [subMenuKeys, setSubMenuKeys] = useState(
    pathSnippets.slice(0, -1).map((item) => '/' + item)
  );

  // 处理菜单选中状态 - 确保根路径也能正确选中首页
  const currentSelectedKey = useMemo(() => {
    if (pathname === '/' || pathname === '/home') {
      return '/home';
    }
    // 处理嵌套路由：如果是商家子路由，选中商家主菜单
    if (pathname.startsWith('/shops')) {
      return '/shops';
    }
    // 处理嵌套路由：如果是商品子路由，选中商品主菜单
    if (pathname.startsWith('/goods')) {
      return '/goods';
    }
    // 处理嵌套路由：如果是订单子路由，选中订单主菜单
    if (pathname.startsWith('/orders')) {
      return '/orders';
    }
    // 处理嵌套路由：如果是用户子路由，选中用户主菜单
    if (pathname.startsWith('/users')) {
      return '/users';
    }
    return pathname;
  }, [pathname]);
  const menuItems = useMemo(() => {
    return [
      getItem(
        <Link to="/home">首页</Link>,
        '/home',
        <SvgIcon name="component" width="14" height="14" color="#ccc"></SvgIcon>
      ),
      // 添加商城菜单 - 使用统一的图标格式
      getItem(
        <Link to="/shops">商家</Link>,
        '/shops',
        <SvgIcon name="shop" width="14" height="14" color="#ccc"></SvgIcon>
      ),
      // 添加商品菜单
      getItem(
        <Link to="/goods">商品</Link>,
        '/goods',
        <SvgIcon name="goods" width="14" height="14" color="#ccc"></SvgIcon>
      ),
      // 添加订单菜单
      getItem(
        <Link to="/orders">订单</Link>,
        '/orders',
        <SvgIcon name="orders" width="14" height="14" color="#ccc"></SvgIcon>
      ),
      // 添加用户菜单
      getItem(
        <Link to="/users">用户</Link>,
        '/users',
        <SvgIcon name="users" width="14" height="14" color="#ccc"></SvgIcon>
      ),
    ].concat(getTreeMenu(permissionRoutes));
  }, [permissionRoutes]);
  // 设置菜单展开收缩
  const handleMenuOpen = (openKeys) => {
    setSubMenuKeys(openKeys);
  };
  // 点击菜单
  const handleMenuClick = ({ key }) => {
    // 菜单无子项，跳转
    if (formatRoutes.find((item) => item.menuPath === key)) navigate(key);
    console.log(key, '获取点击路径');
  };
  /** 面包屑 */
  const breadcrumbNameMap = useMemo(
    () => getBreadcrumbNameMap(permissionRoutes),
    [permissionRoutes]
  );
  const breadcrumbItems = useMemo(() => {
    const items = [];

    // 如果不在首页，总是添加首页作为第一项
    if (pathname !== '/' && pathname !== '/home') {
      items.push({
        key: '/home',
        title: <Link to="/home">首页</Link>,
      });
    }

    // 生成路径面包屑
    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const title = breadcrumbNameMap[url];

      if (title) {
        // 如果是最后一项，即当前页面路由，渲染文本不可点击跳转
        if (index + 1 === pathSnippets.length) {
          items.push({
            key: url,
            title: title,
          });
        } else {
          // 其余用link标签可点击跳转
          items.push({
            key: url,
            title: <Link to={url}>{title}</Link>,
          });
        }
      }
    });

    return items;
  }, [pathname, pathSnippets, breadcrumbNameMap]);
  /** tabs栏 */
  // 选择选项卡以后，跳转对应路由
  const selectTab = useCallback(
    (key) => {
      navigate(key);
    },
    [navigate]
  );
  // 格式化路由数组
  const Home = lazy(() => import('@/pages/Home_X'));
  const Shops = lazy(() => import('@/pages/Shops'));
  const Goods = lazy(() => import('@/pages/Goods'));
  const Orders = lazy(() => import('@/pages/Orders'));
  const Users = lazy(() => import('@/pages/Users'));
  const Merchants = lazy(() => import('@/pages/Merchant/Merchant'));
  const MerchantAccount = lazy(() =>
    import('@/pages/Merchant/MerchantAccount')
  );
  const WithdrawAccount = lazy(() =>
    import('@/pages/Merchant/WithdrawAccount')
  );
  const AccountDetail = lazy(() => import('@/pages/Merchant/AccountDetail'));
  const MerchantWithdraw = lazy(() =>
    import('@/pages/Merchant/MerchantWithdraw')
  );
  const SettlementOrder = lazy(() =>
    import('@/pages/Merchant/SettlementOrder')
  );
  const SettlementBill = lazy(() => import('@/pages/Merchant/SettlementBill'));
  const MerchantApplication = lazy(() =>
    import('@/pages/Merchant/MerchantApplication')
  );
  const DeviceManagement = lazy(() =>
    import('@/pages/Merchant/DeviceManagement')
  );
  const formatRoutes = useMemo(() => {
    return [
      { title: '首页', menuPath: '/home', element: <Home /> },
      { title: '商家', menuPath: '/shops', element: <Shops /> },
      { title: '商品', menuPath: '/goods', element: <Goods /> },
      { title: '订单', menuPath: '/orders', element: <Orders /> },
      { title: '用户', menuPath: '/users', element: <Users /> },
      // 添加商家子路由到TabsView
      {
        title: '商家管理',
        menuPath: '/shops/merchants',
        element: <Merchants />,
      },
      {
        title: '商家账号',
        menuPath: '/shops/merchant-account',
        element: <MerchantAccount />,
      },
      {
        title: '提现账号',
        menuPath: '/shops/withdraw-account',
        element: <WithdrawAccount />,
      },
      {
        title: '账户明细',
        menuPath: '/shops/account-detail',
        element: <AccountDetail />,
      },
      {
        title: '商家提现',
        menuPath: '/shops/merchant-withdraw',
        element: <MerchantWithdraw />,
      },
      {
        title: '结算订单',
        menuPath: '/shops/settlement-order',
        element: <SettlementOrder />,
      },
      {
        title: '结账单',
        menuPath: '/shops/settlement-bill',
        element: <SettlementBill />,
      },
      {
        title: '商家申请',
        menuPath: '/shops/merchant-application',
        element: <MerchantApplication />,
      },
      {
        title: '设备管理',
        menuPath: '/shops/device-management',
        element: <DeviceManagement />,
      },
    ].concat(getMenus(permissionRoutes));
  }, [permissionRoutes]);
  // 用户头像
  const avatar = useSelector((state) => state.user.userinfo.avatar);
  /** 下拉菜单 */
  // 下拉菜单项数组
  const dropdownMenuItems = [
    {
      key: '1',
      label: (
        <div onClick={() => toggleCenterStatus(true)}>
          <UserOutlined /> 个人中心
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <Popconfirm
          onConfirm={() => toggleResetStatus(true)}
          title="是否确认重置密码？"
          okText="重置"
          cancelText="取消"
        >
          <UndoOutlined /> 重置密码
        </Popconfirm>
      ),
    },
    {
      key: '3',
      label: (
        <Popconfirm
          onConfirm={() => handleLogout()}
          title="是否确认退出？"
          okText="退出"
          cancelText="取消"
        >
          <LogoutOutlined /> 退出登录
        </Popconfirm>
      ),
    },
  ];
  /** 个人中心 */
  const userCenterRef = useRef();
  const toggleCenterStatus = (status) => {
    userCenterRef.current.toggleShowStatus(status);
  };
  /** 重置密码 */
  const resetPwdRef = useRef();
  const toggleResetStatus = (status) => {
    resetPwdRef.current.toggleShowStatus(status);
  };

  // 退出登录
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  // debugger

  console.log(menuItems, '获取菜单');
  return (
    <Layout className="layout">
      <Sider trigger={null} collapsible collapsed={collapsed} theme={themeVari}>
        <div
          className="layout-logo-vertical"
          style={{ color: themeVari === 'dark' ? '#fff' : '#000' }}
        >
          <span className="layout-logo">
            <DashboardFilled />
          </span>
          {!collapsed && <span>后台管理系统</span>}
        </div>
        <Switch
          className="sider-switch"
          checkedChildren="☀"
          unCheckedChildren="🌙"
          onChange={changeTheme}
          style={{
            transform: collapsed ? 'translateX(15px)' : 'translateX(75px)',
          }}
        />
        <Menu
          theme={themeVari}
          mode="inline"
          selectedKeys={[currentSelectedKey]}
          openKeys={subMenuKeys}
          onOpenChange={handleMenuOpen}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div className="header-breadcrumb">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="header-right">
            <Dropdown
              menu={{ items: dropdownMenuItems }}
              placement="bottomRight"
            >
              <Space>
                <img
                  src={
                    avatar ||
                    require('@/assets/images/avatar/default_avatar.jpg')
                  }
                  className="user-icon"
                  alt="avatar"
                />
                <DownOutlined />
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            // padding: 24,
            minHeight: 280,
            // background: colorBgContainer
          }}
        >
          <TabsView
            pathname={pathname}
            formatRoutes={formatRoutes}
            selectTab={selectTab}
          />
        </Content>
      </Layout>
      <CustomModal title="个人中心" ref={userCenterRef}>
        <UserCenterForm toggleCenterStatus={toggleCenterStatus} />
      </CustomModal>
      <CustomModal title="重置密码" ref={resetPwdRef}>
        <ResetPwdForm toggleResetStatus={toggleResetStatus} />
      </CustomModal>
    </Layout>
  );
};
export default LayoutApp;
