import React, { useState } from 'react';
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Menu } from 'antd';
import './index.scss';
const items = [
  {
    key: 'orders',
    icon: <PieChartOutlined />,
    label: '订单',
    children: [
      { key: 'list', icon: <PieChartOutlined />, label: '订单' },
      { key: 'afterSales', icon: <PieChartOutlined />, label: '售后' },
      { key: 'tallySheet', icon: <PieChartOutlined />, label: '理货单' },
      { key: 'sortingList', icon: <PieChartOutlined />, label: '分拣单' },
    ],
  },
];
export default function Index() {
  // const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  // const toggleCollapsed = () => {
  //   setCollapsed(!collapsed);
  // };
  const handleOnchange = ({ key, keyPath }) => {
    if (keyPath.length == 1) {
      navigate(`/orders/${key}`);
    } else {
      navigate(`/${keyPath[1]}/${key}`);
    }
  };
  return (
    <div className="OrdersNav">
      {/* <Button
          type="primary"
          onClick={toggleCollapsed}
          style={{ marginBottom: 16 }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button> */}
      <div className="menu">
        <Menu
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          theme="dark"
          // inlineCollapsed={collapsed}
          items={items}
          onSelect={handleOnchange}
        />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
