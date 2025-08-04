import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, ConfigProvider, Menu, Dropdown, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTab,
  removeTab,
  editTab,
  timeTab,
  setTabs,
} from '@/store/reducers/tabSlice';
import { SyncOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import eventBus from '@/utils/eventBus';

const TabsView = React.memo(({ pathname, formatRoutes, selectTab }) => {
  // 获取全局tabs
  const tabs = useSelector((state) => state.tabs.tabs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // 当前选中tab
  const [activeKey, setActiveKey] = useState();

  useEffect(() => {
    if (pathname !== '/') {
      setActiveKey(pathname);
      if (!tabs.some((item) => item.key === pathname)) {
        onAddTab(pathname);
      }
    }
  }, [pathname]);

  const handelOutlined = (id) => {
    dispatch(editTab(id));
    eventBus.emit('dataChange', activeKey);
    setTimeout(() => {
      dispatch(timeTab(id));
    }, 1500);
  };

  const getContextMenu = (key) => {
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
  };

  const tabItems = useMemo(() => {
    return tabs.map((item, index) => ({
      ...item,
      children: (
        <div style={{ backgroundColor: '#f5f5f5' }} key={item.key}>
          {item.children}
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
    }));
  }, [tabs, formatRoutes]);

  const handleTabChange = (activeKey) => {
    selectTab(activeKey);
  };

  const onAddTab = (pathname) => {
    const menu = formatRoutes.find((item) => item.menuPath === pathname);
    if (menu)
      dispatch(
        addTab({
          label: menu.title,
          key: menu.menuPath,
          children: menu.element,
          outline: false,
        })
      );
  };

  const closeTab = (targetKey) => {
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
  };

  const handleEdit = (targetKey, action) => {
    if (action === 'remove') {
      closeTab(targetKey);
    }
  };

  const onRefreshTab = (key) => {
    // 找到当前标签
    const currentTab = tabs.find((tab) => tab.key === key);
    if (!currentTab) return;

    // 创建一个带有随机 key 的新组件
    const refreshedTab = {
      ...currentTab,
      children: React.cloneElement(
        typeof currentTab.children === 'object' ? (
          currentTab.children
        ) : (
          <div>{currentTab.children}</div>
        ),
        { key: Date.now() }
      ),
    };

    // 更新标签数组
    const newTabs = tabs.map((tab) => (tab.key === key ? refreshedTab : tab));

    // 更新 Redux store
    dispatch(setTabs(newTabs));

    // 可选：添加一些视觉反馈
    message.success('页面已刷新');
  };

  const closeOtherTabs = (key) => {
    // 保留当前标签，移除其他标签
    const currentTab = tabs.find((item) => item.key === key);
    // 直接用当前标签创建新的标签数组
    const newTabs = [currentTab];
    // 更新 redux store 中的所有标签
    dispatch({ type: 'tabs/setTabs', payload: newTabs });
    selectTab(key);
  };
  const closeAllTabs = () => {
    // 创建首页标签
    const homeTab = {
      key: '/home', // 使用 /home 作为key
      label: '首页',
      closable: false,
      children: formatRoutes.find((item) => item.menuPath === '/home')?.element, // 查找 /home 路径的元素
    };

    // 设置新的标签数组
    dispatch(setTabs([homeTab]));

    // 更新选中的标签和导航
    setActiveKey('/home');
    selectTab('/home');
    navigate('/home');
  };

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
