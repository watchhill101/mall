import React from 'react';
import { Typography, Layout, Menu } from 'antd';
import {
  ShoppingCartOutlined,
  ShopOutlined,
  MoneyCollectOutlined,
  FileOutlined,
  AuditOutlined,
  TruckOutlined,
  SolutionOutlined,
  ContainerOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Sider, Content } = Layout;

const OrderLayout = ({ children }) => {
  console.log(children);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 二级导航菜单项
  const menuItems = [
    {
      key: '/orders/orders-list',
      icon: <ShoppingCartOutlined />,
      label: t('menu.orders-list'),
    },
    {
      key: '/orders/afterSales',
      icon: <AuditOutlined />,
      label: t('menu.afterSales'),
    },
    {
      key: '/orders/tallySheet',
      icon: <ContainerOutlined />,
      label: t('menu.tallySheet'),
    },
    {
      key: '/orders/SortingList',
      icon: <SolutionOutlined />,
      label: t('menu.sortingList'),
    },
    {
      key: '/orders/payment-record',
      icon: <MoneyCollectOutlined />,
      label: t('menu.payment-record'),
    },
    {
      key: '/orders/allocation-order',
      icon: <DeploymentUnitOutlined />,
      label: t('menu.allocation-order'),
    },
    {
      key: '/orders/work-order',
      icon: <FileOutlined />,
      label: t('menu.work-order'),
    },
    {
      key: '/orders/logistics-order',
      icon: <TruckOutlined />,
      label: t('menu.logistics-order'),
    },
  ];

  // 获取当前选中的菜单
  const selectedKey = location.pathname;

  // 菜单点击处理
  const handleMenuClick = ({ key }) => {
    console.log(key);
    navigate(key);
  };
  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Layout style={{ background: '#fff', borderRadius: '8px' }}>
        {/* 二级侧导航栏 */}
        <Sider
          width={200}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              <ShopOutlined style={{ marginRight: '8px' }} />
              {t('menu.orders')}
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              height: 'calc(100vh - 200px)',
            }}
          />
        </Sider>

        {/* 主内容区域 */}
        <Content style={{ padding: '0' }}>
          {children}

          {/* <Outlet></Outlet> */}
        </Content>
      </Layout>
    </div>
  );
};

export default OrderLayout;
