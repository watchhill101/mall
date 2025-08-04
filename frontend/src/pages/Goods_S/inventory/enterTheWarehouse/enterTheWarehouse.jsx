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
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  ImportOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export default function StockIn() {
  // 模拟入库数据
  const stockInData = [
    {
      key: '1',
      orderId: 'IN001',
      productName: 'iPhone 15 Pro',
      quantity: 50,
      supplier: '苹果官方',
      operator: '张三',
      status: '已完成',
      createTime: '2024-01-15 10:30:00',
    },
    {
      key: '2',
      orderId: 'IN002',
      productName: 'MacBook Air',
      quantity: 20,
      supplier: '苹果官方',
      operator: '李四',
      status: '进行中',
      createTime: '2024-01-15 14:20:00',
    },
    {
      key: '3',
      orderId: 'IN003',
      productName: 'Nike运动鞋',
      quantity: 100,
      supplier: 'Nike官方',
      operator: '王五',
      status: '已完成',
      createTime: '2024-01-14 16:45:00',
    },
  ];

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '入库数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
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
              确认入库
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalOrders = stockInData.length;
  const completedOrders = stockInData.filter(
    (item) => item.status === '已完成'
  ).length;
  const pendingOrders = stockInData.filter(
    (item) => item.status === '进行中'
  ).length;
  const totalQuantity = stockInData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="StockIn">
      <Title level={2} style={{ marginBottom: '24px' }}>
        <ImportOutlined style={{ marginRight: '8px' }} />
        入库管理
      </Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="入库单总数"
              value={totalOrders}
              prefix={<ImportOutlined />}
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
              title="总入库量"
              value={totalQuantity}
              prefix={<ImportOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="入库记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新增入库单
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={stockInData}
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
  );
}
