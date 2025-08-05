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
import { useNavigate, useLocation } from 'react-router-dom';

const { Title } = Typography;
const { Sider, Content } = Layout;

const MerchantLayout = ({ children }) => {
  console.log(children);
  const navigate = useNavigate();
  const location = useLocation();

  // 二级导航菜单项
  const menuItems = [
    {
      key: '/shops/merchants',
      icon: <TeamOutlined />,
      label: '商家管理',
    },
    {
      key: '/shops/merchant-account',
      icon: <UserOutlined />,
      label: '商家账号',
    },
    {
      key: '/shops/withdraw-account',
      icon: <BankOutlined />,
      label: '提现账号',
    },
    {
      key: '/shops/account-detail',
      icon: <FileTextOutlined />,
      label: '账户明细',
    },
    {
      key: '/shops/merchant-withdraw',
      icon: <MoneyCollectOutlined />,
      label: '商家提现',
    },
    {
      key: '/shops/settlement-order',
      icon: <CalculatorOutlined />,
      label: '结算订单',
    },
    {
      key: '/shops/settlement-bill',
      icon: <FileOutlined />,
      label: '结账单',
    },
    {
      key: '/shops/merchant-application',
      icon: <AuditOutlined />,
      label: '商家申请',
    },
    {
      key: '/shops/device-management',
      icon: <DesktopOutlined />,
      label: '设备管理',
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
              商家管理
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
        <Content style={{ padding: '0' }}>{children}</Content>
      </Layout>
    </div>
  );
};

export default MerchantLayout;
