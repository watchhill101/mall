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
  ExportOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';

const { Title } = Typography;

export default function StockOut() {
  // 模拟出库数据
  const stockOutData = [
    {
      key: '1',
      orderId: 'OUT001',
      productName: 'iPhone 15 Pro',
      quantity: 10,
      customer: '张三',
      operator: '李四',
      status: '已完成',
      createTime: '2024-01-15 09:30:00',
    },
    {
      key: '2',
      orderId: 'OUT002',
      productName: 'MacBook Air',
      quantity: 5,
      customer: '王五',
      operator: '赵六',
      status: '进行中',
      createTime: '2024-01-15 11:20:00',
    },
    {
      key: '3',
      orderId: 'OUT003',
      productName: 'Nike运动鞋',
      quantity: 20,
      customer: '孙七',
      operator: '周八',
      status: '已完成',
      createTime: '2024-01-14 15:45:00',
    },
  ];

  const columns = [
    {
      title: '出库单号',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '出库数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === '已完成' ? 'green' : 'blue';
        const icon =
          status === '已完成' ? (
            <CheckCircleOutlined />
          ) : (
            <ClockCircleOutlined />
          );
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            查看详情
          </Button>
          {record.status === '进行中' && (
            <Button type="link" size="small">
              确认出库
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalOrders = stockOutData.length;
  const completedOrders = stockOutData.filter(
    (item) => item.status === '已完成'
  ).length;
  const pendingOrders = stockOutData.filter(
    (item) => item.status === '进行中'
  ).length;
  const totalQuantity = stockOutData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <GoodsLayout>
      <div className="StockOut" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <ExportOutlined style={{ marginRight: '8px' }} />
          出库管理
        </Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="出库单总数"
              value={totalOrders}
              prefix={<ExportOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总出库量"
              value={totalQuantity}
              prefix={<ExportOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="出库记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新增出库单
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={stockOutData}
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
