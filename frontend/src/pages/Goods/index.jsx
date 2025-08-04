import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Cascader,
  Button,
  Menu,
} from 'antd';
import { data } from '@/db_S/data.mjs';
import { SmileOutlined } from '@ant-design/icons';
import SearchBar from '@/components/SearchBar';
import {
  categoryData,
  GoodsListColumns,
  formItemList,
  items,
} from '@/pages/Goods_S/data/data';
import CustomTable from '@/components/CustomTable';
import './index.scss';
import SvgIcon from '@/components/SvgIcon';

import {
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  TagOutlined,
} from '@ant-design/icons';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';

// console.log(data.list, '111');
const { Title } = Typography;

const Goods = () => {
  const navigate = useNavigate();
  const handleChange = ({ key, keyPath }) => {
    console.log(keyPath);
    if (keyPath.length == 1) {
      navigate(`/goods/${key}`);
    } else {
      navigate(`/goods/${keyPath[1]}/${key}`);
    }
  };
  return (
    <div
      className="GoodsNav"
      // style={{
      //   display: 'flex',
      //   justifyContent: 'space-between',
      //   alignItems: 'center',
      // }}
    >
      <div className="menu">
        <Menu
          defaultSelectedKeys={['ListofCommodities']}
          defaultOpenKeys={['ListofCommodities']}
          mode="inline"
          theme="dark"
          // inlineCollapsed={collapsed}
          items={items}
          style={{ height: '100vh', width: '150px' }}
          onSelect={handleChange}
        />
      </div>
      {/* <div className="menu">
        <ul>
          <li>
            <Link to="/goods/ListOfCommodities">商品列表管理</Link>
          </li>
          <li>
            <Link to="/goods/ClassificationOfCommodities">商品分类</Link>
          </li>
          <li>
            <Link to="/goods/inventory">库存管理</Link>
          </li>
          <li>
            <Link to="/goods/price">价格管理</Link>
          </li>
        </ul>
      </div> */}
      <div className="main-goods">
        <Outlet></Outlet>
      </div>

      {/* <Title level={2} style={{ marginBottom: '24px' }}>
        <ShoppingCartOutlined style={{ marginRight: '8px' }} />
        商品管理
      </Title>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={1128}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在售商品"
              value={856}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={112893}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="月增长率"
              value={9.3}
              prefix={<RiseOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card title="商品管理功能" style={{ marginBottom: '16px' }}>
        <p>📦 商品列表管理</p>
        <p>➕ 新增商品</p>
        <p>✏️ 编辑商品信息</p>
        <p>🏷️ 商品分类管理</p>
        <p>📊 库存管理</p>
        <p>💰 价格管理</p>
      </Card> */}
    </div>
  );
};

export default Goods;
