import React from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
} from 'antd';
import {
  InboxOutlined,
  CheckSquareOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';

const { Title } = Typography;

export default function CurrentInventory() {
  // 模拟库存数据
  const inventoryData = [
    {
      key: '1',
      productId: 'P001',
      productName: 'iPhone 15 Pro',
      category: '电子产品',
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
      unit: '台',
      status: '正常',
    },
    {
      key: '2',
      productId: 'P002',
      productName: 'MacBook Air',
      category: '电子产品',
      currentStock: 25,
      minStock: 30,
      maxStock: 100,
      unit: '台',
      status: '库存不足',
    },
    {
      key: '3',
      productId: 'P003',
      productName: 'Nike运动鞋',
      category: '服装',
      currentStock: 300,
      minStock: 100,
      maxStock: 500,
      unit: '双',
      status: '正常',
    },
  ];

  const columns = [
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '商品分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock, record) => (
        <span
          style={{
            color:
              stock < record.minStock
                ? '#ff4d4f'
                : stock > record.maxStock
                ? '#faad14'
                : '#52c41a',
          }}
        >
          {stock} {record.unit}
        </span>
      ),
    },
    {
      title: '库存范围',
      key: 'stockRange',
      render: (_, record) => (
        <span>
          {record.minStock} - {record.maxStock} {record.unit}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color =
          status === '正常'
            ? 'green'
            : status === '库存不足'
            ? 'red'
            : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            查看详情
          </Button>
          <Button type="link" size="small">
            调整库存
          </Button>
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalProducts = inventoryData.length;
  const normalStock = inventoryData.filter(
    (item) => item.status === '正常'
  ).length;
  const lowStock = inventoryData.filter(
    (item) => item.status === '库存不足'
  ).length;
  const totalStock = inventoryData.reduce(
    (sum, item) => sum + item.currentStock,
    0
  );

  return (
    <GoodsLayout>
      <div className="CurrentInventory" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <CheckSquareOutlined style={{ marginRight: '8px' }} />
          当前库存
        </Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={totalProducts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存正常"
              value={normalStock}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存不足"
              value={lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总库存量"
              value={totalStock}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="库存管理"
        extra={
          <Space>
            <Button type="primary">库存盘点</Button>
            <Button>导出数据</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={inventoryData}
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
