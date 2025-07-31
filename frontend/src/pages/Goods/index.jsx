import React, { useState } from 'react';
import { Card, Statistic, Row, Col, Typography, Cascader, Button } from 'antd';
import { data } from '@/db_S/data.mjs';
import { SmileOutlined } from '@ant-design/icons';
import SearchBar from '@/components/SearchBar';
import { categoryData, GoodsListColumns, formItemList } from './data';
import CustomTable from '@/components/CustomTable';

import SvgIcon from '@/components/SvgIcon';
import Refreshsvg from '@/pages/Goods/iconsvg/refresh.svg';
import './index.scss';
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
  const [params, setparams] = useState({
    pageSize: 5,
    current: 1,
  });

  const handleSearch = () => {};
  const fetchMethod = async (requesParams) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        count: data.list.length,
        rows: data.list,
      },
    };
  };
  const onParamChange = () => {};
  return (
    <div className="Goods">
      <div className="searchbar">
        <SearchBar formItemList={formItemList} getSearchParams={handleSearch} />
      </div>
      <div className="OperationButton">
        <div className="OperationButton-left">
          <Button
            color="primary"
            style={{
              backgroundColor: '#EAF4FE',
              border: '1px solid #448EF7',
              color: '#4792F7',
            }}
          >
            新增
          </Button>
          <Button
            color="cyan"
            variant="outlined"
            style={{
              backgroundColor: '#FEF9E6',
              border: '1px solid #F6C955',
              color: '#F7CB59',
            }}
          >
            导出
          </Button>
        </div>
        <div className="OperationButton-right">
          <ul>
            <li>
              <SvgIcon name="search" />
            </li>
            <li>
              <SvgIcon name="search" />
            </li>
            <li>
              <SvgIcon name="search" />
            </li>
            <li>
              <SvgIcon name="search" />
            </li>
          </ul>
        </div>
      </div>
      <div className="GoodsList">
        <CustomTable
          columns={GoodsListColumns}
          fetchMethod={fetchMethod}
          requestParam={params}
          onParamsChange={setparams}
        />
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
