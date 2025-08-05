import React from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
} from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import './index.scss';
import GoodsLayout from '../Goods_Layout/Goods_Layout';

const { Title } = Typography;

export default function ProductCategory() {
  // 模拟分类数据
  const categoryData = [
    {
      key: '1',
      businessType: '零售',
      categoryId: 'CAT001',
      categoryName: '电子产品',
      parentCategory: '-',
      categoryLevel: '一级分类',
      afterSalesDays: 7,
      sort: 1,
      status: '启用',
    },
    {
      key: '2',
      businessType: '零售',
      categoryId: 'CAT002',
      categoryName: '服装',
      parentCategory: '-',
      categoryLevel: '一级分类',
      afterSalesDays: 15,
      sort: 2,
      status: '启用',
    },
    {
      key: '3',
      businessType: '零售',
      categoryId: 'CAT003',
      categoryName: '手机',
      parentCategory: '电子产品',
      categoryLevel: '二级分类',
      afterSalesDays: 7,
      sort: 1,
      status: '启用',
    },
  ];

  const columns = [
    {
      title: '业务类型',
      dataIndex: 'businessType',
      key: 'businessType',
    },
    {
      title: '分类ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
    },
    {
      title: '分类名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: '上级分类',
      dataIndex: 'parentCategory',
      key: 'parentCategory',
    },
    {
      title: '分类等级',
      dataIndex: 'categoryLevel',
      key: 'categoryLevel',
    },
    {
      title: '售后天数',
      dataIndex: 'afterSalesDays',
      key: 'afterSalesDays',
    },
    {
      title: '分类排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '启用' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button type="link" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <GoodsLayout>
      <div className="ProductCategory" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <AppstoreOutlined style={{ marginRight: '8px' }} />
          商品分类
        </Title>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="分类总数"
                value={categoryData.length}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="一级分类"
                value={2}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="二级分类"
                value={1}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="启用分类"
                value={3}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="分类管理"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              新增分类
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={categoryData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            }}
          />
        </Card>
      </div>
    </GoodsLayout>
  );
}
