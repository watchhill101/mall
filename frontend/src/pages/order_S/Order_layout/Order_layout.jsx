import React from 'react';
import { Typography, Layout, Menu } from 'antd';
import {
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  CalculatorOutlined,
  FileOutlined,
  AuditOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Title } = Typography;
const { Sider, Content } = Layout;

const OrderLayout = ({ children }) => {
  console.log(children);
  const navigate = useNavigate();
  const location = useLocation();

  // 二级导航菜单项

  const menuItems = [
    {
      key: '/orders/orders-list',
      icon: <TeamOutlined />,
      label: '订单',
    },
    {
      key: '/orders/afterSales',
      icon: <UserOutlined />,
      label: '售后',
    },
    {
      key: '/orders/tallySheet',
      icon: <BankOutlined />,
      label: '理货单',
    },
    {
      key: '/orders/SortingList',
      icon: <FileTextOutlined />,
      label: '分拣单',
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
              订单管理
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
          {/* {children}
           */}
          <Outlet></Outlet>
        </Content>
      </Layout>
    </div>
  );
};

export default OrderLayout;
