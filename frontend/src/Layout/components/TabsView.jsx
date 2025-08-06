import React, { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { Tabs, ConfigProvider, Menu, Dropdown, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTab,
  removeTab,
  setTabs,
} from '@/store/reducers/tabSlice';

import { useNavigate } from 'react-router-dom';
import Loading from '@/components/Loadings';

const TabsView = React.memo(({ pathname, formatRoutes, selectTab }) => {
  // 获取全局tabs
  const tabs = useSelector((state) => state.tabs.tabs);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 当前选中tab
  const [activeKey, setActiveKey] = useState();

  // 判断是否是二级导航
  const isSecondaryRoute = (path) => {
    const segments = path.split('/').filter(Boolean);
    return segments.length > 1;
  };

  // 获取父级路径（一级导航路径）
  const getParentPath = (path) => {
    const segments = path.split('/').filter(Boolean);
    return segments.length > 1 ? `/${segments[0]}` : path;
  };

  useEffect(() => {
    // 如果没有任何标签，初始化首页标签
    if (tabs.length === 0) {
      const homeRoute = formatRoutes.find((item) => item.menuPath === '/home');
      if (homeRoute) {
        dispatch(addTab({
          label: '首页',
          key: '/home',
          children: (
            <Suspense fallback={<Loading />}>
              {homeRoute.element}
            </Suspense>
          ),
          closable: false,
          outline: false,
        }));
        setActiveKey('/home');
      }
    }
    
    // 处理根路径重定向
    if (pathname === '/') {
      navigate('/home')
      return
    }
    
    if (pathname !== '/') {
      // 如果是二级导航，使用父级路径作为activeKey
      const tabKey = isSecondaryRoute(pathname)
        ? getParentPath(pathname)
        : pathname;
      setActiveKey(tabKey);

      // 检查是否需要添加新页签
      if (!tabs.some((item) => item.key === tabKey)) {
        onAddTab(pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, tabs.length, formatRoutes]);

  const handleTabChange = (activeKey) => {
    // 如果点击的是一级导航页签，且之前在二级导航，需要导航到父级页面
    // 但如果父级页面有默认的子路由重定向，会自动处理
    selectTab(activeKey);
  };

  const onAddTab = useCallback(
    (pathname) => {
      const isSecondary = isSecondaryRoute(pathname);
      const tabKey = isSecondary ? getParentPath(pathname) : pathname;

      // 查找当前路由的配置
      const currentMenu = formatRoutes.find(
        (item) => item.menuPath === pathname
      );

      // 如果是二级导航，查找父级菜单配置
      const parentMenu = isSecondary
        ? formatRoutes.find((item) => item.menuPath === tabKey)
        : currentMenu;

      if (currentMenu && parentMenu) {
        dispatch(
          addTab({
            label: parentMenu.title, // 使用父级菜单的标题
            key: tabKey, // 使用父级路径作为key
            children: (
              <Suspense fallback={<Loading />}>
                {currentMenu.element}
              </Suspense>
            ), // 使用当前路由的元素并包装Suspense
            outline: false,
          })
        );
      }
    },
    [formatRoutes, dispatch]
  );

  const closeTab = useCallback((targetKey) => {
    // 不允许关闭首页标签
    if (targetKey === '/home') return;

    const afterRemoveTabs = tabs.filter((item) => item.key !== targetKey);
    const selectIndex = tabs.findIndex((item) => item.key === targetKey) - 1;
    if (selectIndex >= 0) {
      selectTab(afterRemoveTabs[selectIndex].key);
    } else {
      selectTab(afterRemoveTabs[selectIndex + 1].key);
    }
    dispatch(removeTab(targetKey));
  }, [tabs, selectTab, dispatch]);

  const onRefreshTab = useCallback((key) => {
    // 找到当前标签
    const currentTab = tabs.find((tab) => tab.key === key);
    if (!currentTab) return;

    // 找到对应的路由配置
    const routeConfig = formatRoutes.find((item) => item.menuPath === key);
    if (!routeConfig) return;

    // 创建一个新的刷新后的标签，包装Suspense
    const refreshedTab = {
      ...currentTab,
      children: (
        <Suspense fallback={<Loading />}>
          {React.cloneElement(routeConfig.element, { key: Date.now() })}
        </Suspense>
      ),
    };

    // 更新标签数组
    const newTabs = tabs.map((tab) => (tab.key === key ? refreshedTab : tab));

    // 更新 Redux store
    dispatch(setTabs(newTabs));

    // 可选：添加一些视觉反馈
    message.success('页面已刷新');
  }, [tabs, formatRoutes, dispatch]);

  const closeOtherTabs = useCallback((key) => {
    // 保留当前标签，移除其他标签
    const currentTab = tabs.find((item) => item.key === key);
    // 直接用当前标签创建新的标签数组
    const newTabs = [currentTab];
    // 更新 redux store 中的所有标签
    dispatch({ type: 'tabs/setTabs', payload: newTabs });
    selectTab(key);
  }, [tabs, selectTab, dispatch]);
  
  const closeAllTabs = useCallback(() => {
    // 创建首页标签
    const homeTab = {
      key: '/home', // 使用 /home 作为key
      label: '首页',
      closable: false,
      children: (
        <Suspense fallback={<Loading />}>
          {formatRoutes.find((item) => item.menuPath === '/home')?.element}
        </Suspense>
      ), // 查找 /home 路径的元素并包装Suspense
    };

    // 设置新的标签数组
    dispatch(setTabs([homeTab]));

    // 更新选中的标签和导航
    setActiveKey('/home');
    selectTab('/home');
    navigate('/home');
  }, [formatRoutes, dispatch, selectTab, navigate]);

  const handleEdit = useCallback((targetKey, action) => {
    if (action === 'remove') {
      closeTab(targetKey);
    }
  }, [closeTab]);

  const getContextMenu = useCallback((key) => {
    // 如果是首页标签，只显示"关闭其他标签"和"刷新页面"选项
    if (key === '/home') {
      return (
        <Menu>
          <Menu.Item onClick={() => onRefreshTab(key)}>刷新页面</Menu.Item>
          <Menu.Item onClick={() => closeOtherTabs(key)}>
            关闭其他标签
          </Menu.Item>
        </Menu>
      );
    }

    // 其他标签显示所有选项
    return (
      <Menu>
        <Menu.Item onClick={() => onRefreshTab(key)}>刷新页面</Menu.Item>
        <Menu.Item onClick={() => closeTab(key)}>关闭当前标签</Menu.Item>
        <Menu.Item onClick={() => closeOtherTabs(key)}>关闭其他标签</Menu.Item>
        <Menu.Item onClick={() => closeAllTabs()}>关闭所有标签</Menu.Item>
      </Menu>
    );
  }, [onRefreshTab, closeOtherTabs, closeTab, closeAllTabs]);

  const tabItems = useMemo(() => {
    return tabs.map((item, index) => {
      let children = item.children;

      // 如果当前路径是二级导航且匹配此页签，更新内容
      if (isSecondaryRoute(pathname) && getParentPath(pathname) === item.key) {
        const currentMenu = formatRoutes.find(
          (route) => route.menuPath === pathname
        );
        if (currentMenu) {
          children = currentMenu.element;
        }
      }

      return {
        ...item,
        children: (
          <div style={{ backgroundColor: '#f5f5f5' }} key={item.key}>
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </div>
        ),
        label: (
          <Dropdown overlay={getContextMenu(item.key)} trigger={['contextMenu']}>
            <div>
              <span>{item.label}</span>
            </div>
          </Dropdown>
        ),
        closable: tabs.length > 1,
      };
    });
  }, [tabs, formatRoutes, pathname, getContextMenu]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            horizontalMargin: 0,
          },
        },
      }}
    >
      <div style={{ backgroundColor: '#fff' }}>
        <Tabs
          type="editable-card"
          onChange={handleTabChange}
          activeKey={activeKey}
          onEdit={handleEdit}
          items={tabItems}
          hideAdd
        />
      </div>
    </ConfigProvider>
  );
});

export default TabsView;
