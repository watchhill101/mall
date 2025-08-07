import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  lazy,
  useEffect,
} from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardFilled,
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
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
  Alert,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/reducers/userSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getToken, getRefreshToken } from "@/utils/auth";
// 导入css（未模块化）
import "./Layout.scss";
// 导入自定义组件
import TabsView from "./components/TabsView";
import CustomModal from "@/components/CustomModal";
import UserCenterForm from "./components/UserCenterForm";
import ResetPwdForm from "./components/ResetPwdForm";
import SvgIcon from "@/components/SvgIcon";
import AiAssistantWithLive2D from "@/components/AiAssistant/FixedVersion";
// 导入工具类方法
import { getBreadcrumbNameMap, getItem, getTreeMenu } from "@/utils/common";
// 导入导航数据管理Hook
import {
  useNavigationData,
  convertToMenuItems,
  generateBreadcrumbNameMap,
} from "@/hooks/useNavigationData";

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

  // 获取用户token状态
  const token = useSelector((state) => state.user.token);
  const userinfo = useSelector((state) => state.user.userinfo);

  // 处理头像URL
  const avatarUrl = useMemo(() => {
    if (!userinfo.avatar) return null;

    // 如果已经是完整URL，直接返回
    if (userinfo.avatar.startsWith("http")) {
      return userinfo.avatar;
    }

    // 如果是相对路径，拼接服务器地址
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
    return `${baseUrl}/${userinfo.avatar}`;
  }, [userinfo.avatar]);

  // 添加组件挂载状态跟踪
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // 监听token状态变化（减少检查频率）
  useEffect(() => {
    // 组件未完全挂载时不执行检查
    if (!isMounted) return;

    const checkTokenStatus = () => {
      const localToken = getToken();
      const localRefreshToken = getRefreshToken();

      // 如果Redux中有token但localStorage中没有，说明token被外部删除
      if (token && !localToken) {
        console.log("🚨 Layout检测到token被删除，执行登出");
        message.warning("登录状态已失效，请重新登录");
        dispatch(logout());
        navigate("/login", { replace: true });
        return;
      }

      // 如果既没有token也没有refresh token，跳转到登录页
      if (!token && !localToken && !localRefreshToken) {
        console.log("🚪 Layout检测到无有效token，跳转登录页");
        navigate("/login", { replace: true });
        return;
      }
    };

    // 立即检查一次
    checkTokenStatus();

    // 设置定期检查（每5分钟检查一次，减少频率）
    const interval = setInterval(checkTokenStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, dispatch, navigate, isMounted]);

  // 监听localStorage变化（跨标签页同步）
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "ACCESS-TOKEN" || e.key === "REFRESH-TOKEN") {
        console.log("🔄 Layout检测到localStorage变化:", e.key, !!e.newValue);

        // 如果token被删除且当前用户已登录
        if (!e.newValue && token) {
          console.log("🚪 Layout检测到token被删除，执行登出");
          message.warning("登录状态已失效，请重新登录");
          dispatch(logout());
          navigate("/login", { replace: true });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token, dispatch, navigate]);

  // 导航数据管理
  const {
    navigationData,
    isFromBackend,
    error: navError,
  } = useNavigationData();

  // 侧边栏伸缩
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  // 侧边栏主题模式
  const [themeVari, setThemeVari] = useState("dark");
  // 切换侧边栏主题颜色
  const changeTheme = (value) => {
    setThemeVari(value ? "light" : "dark");
  };
  /** 侧边栏菜单 */
  const { pathname } = useLocation();
  const permissionRoutes = useSelector(
    (state) => state.permission.permissionRoutes
  );
  // 获取当前路径数组片段
  const pathSnippets = pathname.split("/").filter((i) => i);
  const [subMenuKeys, setSubMenuKeys] = useState(
    pathSnippets.slice(0, -1).map((item) => "/" + item)
  );

  // 处理菜单选中状态 - 确保根路径也能正确选中首页
  const currentSelectedKey = useMemo(() => {
    if (pathname === "/" || pathname === "/home") {
      return "/home";
    }
    // 处理嵌套路由：如果是商家子路由，选中商家主菜单
    if (pathname.startsWith("/shops")) {
      return "/shops";
    }
    // 处理嵌套路由：如果是商品子路由，选中商品主菜单
    if (pathname.startsWith("/goods")) {
      return "/goods";
    }
    // 处理嵌套路由：如果是订单子路由，选中订单主菜单
    if (pathname.startsWith("/orders")) {
      return "/orders";
    }
    // 处理嵌套路由：如果是系统设置子路由，选中系统设置主菜单
    if (pathname.startsWith("/system")) {
      return "/system";
    }
    return pathname;
  }, [pathname]);
  const menuItems = useMemo(() => {
    // 使用导航数据生成菜单项
    const navigationMenuItems = convertToMenuItems(
      navigationData,
      getItem,
      Link,
      SvgIcon
    );

    // 合并导航菜单和权限路由菜单
    return navigationMenuItems.concat(getTreeMenu(permissionRoutes));
  }, [navigationData, permissionRoutes]);
  // 设置菜单展开收缩
  const handleMenuOpen = (openKeys) => {
    setSubMenuKeys(openKeys);
  };
  // 点击菜单
  const handleMenuClick = ({ key }) => {
    console.log(key, "获取点击路径");

    // 检查是否是导航数据中的路径
    const isNavigationPath = navigationData.some(
      (nav) =>
        nav.url === key || nav.children?.some((child) => child.url === key)
    );

    // 检查是否是权限路由中的路径
    const isPermissionRoute = formatRoutes.find(
      (item) => item.menuPath === key
    );

    // 如果是有效路径，则进行跳转
    if (isNavigationPath || isPermissionRoute) {
      // 检查是否是一级导航（有子菜单的）
      const parentNav = navigationData.find(
        (nav) => nav.url === key && nav.children && nav.children.length > 0
      );

      if (parentNav) {
        // 如果是一级导航且有子菜单，确保菜单展开
        if (!subMenuKeys.includes(key)) {
          setSubMenuKeys([...subMenuKeys, key]);
        }
      }

      navigate(key);
    }
  };
  /** 面包屑 */
  const breadcrumbNameMap = useMemo(() => {
    // 使用导航数据生成面包屑名称映射
    const navigationBreadcrumbMap = generateBreadcrumbNameMap(navigationData);

    // 合并导航面包屑和权限路由面包屑
    const permissionBreadcrumbMap = getBreadcrumbNameMap(permissionRoutes);

    return { ...navigationBreadcrumbMap, ...permissionBreadcrumbMap };
  }, [navigationData, permissionRoutes]);
  const breadcrumbItems = useMemo(() => {
    const items = [];

    // 如果不在首页，总是添加首页作为第一项
    if (pathname !== "/" && pathname !== "/home") {
      items.push({
        key: "/home",
        title: <Link to="/home">首页</Link>,
      });
    }

    // 生成路径面包屑
    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
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
  const Home = lazy(() => import("@/pages/Home_X"));
  const Shops = lazy(() => import("@/pages/Shops"));
  const Goods = lazy(() => import("@/pages/Goods"));
  const Orders = lazy(() => import("@/pages/Orders"));
  const Users = lazy(() => import("@/pages/Users"));
  const Lbt = lazy(() => import("@/pages/Home_X/lbt"));
  const Merchants = lazy(() => import("@/pages/Merchant/Merchant"));
  const UserRoot = lazy(() => import("@/pages/UserRoot"));
  const MerchantAccount = lazy(() =>
    import("@/pages/Merchant/MerchantAccount")
  );
  const WithdrawAccount = lazy(() =>
    import("@/pages/Merchant/WithdrawAccount")
  );
  const AccountDetail = lazy(() => import("@/pages/Merchant/AccountDetail"));
  const MerchantWithdraw = lazy(() =>
    import("@/pages/Merchant/MerchantWithdraw")
  );
  const SettlementOrder = lazy(() =>
    import("@/pages/Merchant/SettlementOrder")
  );
  const SettlementBill = lazy(() => import("@/pages/Merchant/SettlementBill"));
  const MerchantApplication = lazy(() =>
    import("@/pages/Merchant/MerchantApplication")
  );

  // const DeviceManagement = lazy(() =>
  //   import("@/pages/Merchant/DeviceManagement")  // 临时注释，组件不存在
  // );

  // 导入商品相关组件
  const ListOfCommodities = lazy(() =>
    import("@/pages/Goods_S/ListOfCommodities")
  );
  const ProductCategory = lazy(() =>
    import("@/pages/Goods_S/Classification of Commodities/index")
  );
  const RecycleBin = lazy(() => import("@/pages/Goods_S/Trash/Trash"));
  const CurrentStock = lazy(() =>
    import("@/pages/Goods_S/inventory/CurrentInventory/CurrentInventory")
  );
  const StockIn = lazy(() =>
    import("@/pages/Goods_S/inventory/enterTheWarehouse/enterTheWarehouse")
  );
  const StockOut = lazy(() =>
    import("@/pages/Goods_S/inventory/exWarehouse/exWarehouse")
  );
  const Stocktake = lazy(() =>
    import("@/pages/Goods_S/inventory/stocktaking/stocktaking")
  );
  const StockDetails = lazy(() =>
    import(
      "@/pages/Goods_S/inventory/DetailsOfStockInAndstockOut/DetailsOfStockInAndstockOut"
    )
  );

  // 导入订单相关组件
  const OrdersList = lazy(() => import("@/pages/order_S/Orders"));
  const AfterSales = lazy(() => import("@/pages/order_S/afterSales"));
  const TallySheet = lazy(() => import("@/pages/order_S/tallySheet"));
  const SortingList = lazy(() => import("@/pages/order_S/sortingList"));

  const formatRoutes = useMemo(() => {
    // 基础路由
    const baseRoutes = [
      { title: "首页", menuPath: "/home", element: <Home /> },
      { title: "商家", menuPath: "/shops", element: <Shops /> },
      { title: "商品", menuPath: "/goods", element: <Goods /> },
      { title: "订单", menuPath: "/orders", element: <Orders /> },
      { title: "系统设置", menuPath: "/system", element: <Users /> },
    ];

    // 从导航数据动态生成子路由
    const navigationRoutes = [];
    navigationData.forEach((nav) => {
      if (nav.children && nav.children.length > 0) {
        nav.children.forEach((child) => {
          let element = null;

          // 根据URL路径匹配对应的组件
          switch (child.url) {
            // 商家相关路由
            case "/shops/merchants":
              element = <Merchants />;
              break;
            case "/shops/merchant-account":
              element = <MerchantAccount />;
              break;
            case "/shops/withdraw-account":
              element = <WithdrawAccount />;
              break;
            case "/shops/account-detail":
              element = <AccountDetail />;
              break;
            case "/shops/merchant-withdraw":
              element = <MerchantWithdraw />;
              break;
            case "/shops/settlement-order":
              element = <SettlementOrder />;
              break;
            case "/shops/settlement-bill":
              element = <SettlementBill />;
              break;
            case "/shops/merchant-application":
              element = <MerchantApplication />;
              break;

            case "/shops/device-management":
              // element = <DeviceManagement />;  // 临时注释，组件不存在
              element = (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  设备管理功能开发中...
                </div>
              );
              break;

            // 商品相关路由
            case "/goods/product-list":
            case "/goods/audit-list":
            case "/goods/external-product":
              element = <ListOfCommodities />;
              break;
            case "/goods/product-category":
              element = <ProductCategory />;
              break;
            case "/goods/recycle-bin":
              element = <RecycleBin />;
              break;
            case "/goods/inventory/current-stock":
              element = <CurrentStock />;
              break;
            case "/goods/inventory/stock-in":
              element = <StockIn />;
              break;
            case "/goods/inventory/stock-out":
              element = <StockOut />;
              break;
            case "/goods/inventory/stocktake":
              element = <Stocktake />;
              break;
            case "/goods/inventory/stock-details":
              element = <StockDetails />;
              break;

            // 订单相关路由
            case "/orders/orders-list":
              element = <OrdersList />;
              break;
            case "/orders/afterSales":
              element = <AfterSales />;
              break;
            case "/orders/tallySheet":
              element = <TallySheet />;
              break;
            case "/orders/SortingList":
              element = <SortingList />;
              break;

            // 系统设置相关路由
            case "/system/users":
              element = <Users />;
              break;
            case "/system/carousel":
              element = <Lbt />;
              break;
            case "/system/user-permissions":
              element = <UserRoot />; // 暂时使用Users组件，后续可以创建专门的权限管理组件
              break;

            default:
              console.warn(`未找到路由 ${child.url} 对应的组件`);
              break;
          }

          if (element) {
            navigationRoutes.push({
              title: child.name,
              menuPath: child.url,
              element: element,
            });
          }
        });
      }
    });

    return baseRoutes
      .concat(navigationRoutes)
      .concat(getMenus(permissionRoutes));
  }, [navigationData, permissionRoutes]);

  /** 下拉菜单 */
  // 下拉菜单项数组
  const dropdownMenuItems = [
    {
      key: "1",
      label: (
        <div onClick={() => toggleCenterStatus(true)}>
          <UserOutlined /> 个人中心
        </div>
      ),
    },
    {
      key: "3",
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
  const handleLogout = async () => {
    try {
      console.log("🚪 用户主动退出登录");

      // 显示退出提示
      message.loading("正在退出...", 1);

      // 执行Redux logout action（会清理localStorage）
      dispatch(logout());

      // 延迟跳转，确保状态清理完成
      setTimeout(() => {
        navigate("/login", { replace: true });
        message.success("已安全退出");
      }, 100);
    } catch (error) {
      console.error("❌ 退出登录失败:", error);
      // 即使出错也要强制清理状态
      dispatch(logout());
      navigate("/login", { replace: true });
      message.error("退出过程中发生错误，但已安全退出");
    }
  };

  // 检查用户是否已登录，如果没有token则不渲染Layout
  const hasValidToken = token && getToken();

  // 如果没有有效token，返回null或加载状态
  if (!hasValidToken) {
    console.log("🔒 Layout: 无有效token，不渲染Layout组件");
    return null;
  }
  // debugger

  console.log(menuItems, "获取菜单");
  return (
    <Layout className="layout">
      <Sider trigger={null} collapsible collapsed={collapsed} theme={themeVari}>
        <div
          className="layout-logo-vertical"
          style={{ color: themeVari === "dark" ? "#fff" : "#000" }}
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
            transform: collapsed ? "translateX(15px)" : "translateX(75px)",
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
            display: "flex",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
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
                    avatarUrl ||
                    require("@/assets/images/avatar/default_avatar.jpg")
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
          {/* 导航数据状态提示 */}
          {navError && !isFromBackend && (
            <Alert
              message="导航数据提示"
              description="无法连接到后端服务，正在使用本地导航配置"
              type="warning"
              showIcon
              closable
              style={{ margin: "8px 16px" }}
            />
          )}
          {isFromBackend && (
            <Alert
              message="✅ 已连接到后端导航服务"
              type="success"
              showIcon
              closable
              style={{ margin: "8px 16px", display: "none" }} // 默认隐藏成功提示
            />
          )}

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
      
      {/* AI助手 - 除登录页外所有页面都显示 */}
      {pathname !== '/login' && <AiAssistantWithLive2D />}
    </Layout>
  );
};
export default LayoutApp;
