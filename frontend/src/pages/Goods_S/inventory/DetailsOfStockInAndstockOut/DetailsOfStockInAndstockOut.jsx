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
  DatePicker,
  Select,
} from 'antd';
import {
  FileTextOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function StockDetails() {
  // 模拟出入库明细数据
  const stockDetailsData = [
    {
      key: '1',
      recordId: 'R001',
      productName: 'iPhone 15 Pro',
      operationType: '入库',
      quantity: 50,
      beforeStock: 100,
      afterStock: 150,
      operator: '张三',
      operationTime: '2024-01-15 10:30:00',
      remark: '正常入库',
    },
    {
      key: '2',
      recordId: 'R002',
      productName: 'MacBook Air',
      operationType: '出库',
      quantity: 5,
      beforeStock: 25,
      afterStock: 20,
      operator: '李四',
      operationTime: '2024-01-15 11:20:00',
      remark: '客户订单出库',
    },
    {
      key: '3',
      recordId: 'R003',
      productName: 'Nike运动鞋',
      operationType: '入库',
      quantity: 100,
      beforeStock: 200,
      afterStock: 300,
      operator: '王五',
      operationTime: '2024-01-14 16:45:00',
      remark: '补货入库',
    },
    {
      key: '4',
      recordId: 'R004',
      productName: 'iPhone 15 Pro',
      operationType: '出库',
      quantity: 10,
      beforeStock: 150,
      afterStock: 140,
      operator: '赵六',
      operationTime: '2024-01-15 14:15:00',
      remark: '销售出库',
    },
  ];

  const columns = [
    {
      title: '记录ID',
      dataIndex: 'recordId',
      key: 'recordId',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      render: (type) => {
        const color = type === '入库' ? 'green' : 'red';
        const icon = type === '入库' ? <ImportOutlined /> : <ExportOutlined />;
        return (
          <Tag color={color} icon={icon}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <span
          style={{
            color: record.operationType === '入库' ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold',
          }}
        >
          {record.operationType === '入库' ? '+' : '-'}
          {quantity}
        </span>
      ),
    },
    {
      title: '库存变化',
      key: 'stockChange',
      render: (_, record) => (
        <span>
          {record.beforeStock} → {record.afterStock}
        </span>
      ),
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
            导出记录
          </Button>
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalRecords = stockDetailsData.length;
  const inRecords = stockDetailsData.filter(
    (item) => item.operationType === '入库'
  ).length;
  const outRecords = stockDetailsData.filter(
    (item) => item.operationType === '出库'
  ).length;
  const totalInQuantity = stockDetailsData
    .filter((item) => item.operationType === '入库')
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalOutQuantity = stockDetailsData
    .filter((item) => item.operationType === '出库')
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <GoodsLayout>
      <div className="StockDetails" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          出入库明细
        </Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="记录总数"
              value={totalRecords}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="入库记录"
              value={inRecords}
              prefix={<ImportOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="出库记录"
              value={outRecords}
              prefix={<ExportOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="净入库量"
              value={totalInQuantity - totalOutQuantity}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="明细查询"
        extra={
          <Space>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Select placeholder="操作类型" style={{ width: 120 }}>
              <Option value="all">全部</Option>
              <Option value="in">入库</Option>
              <Option value="out">出库</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button>导出明细</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={stockDetailsData}
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
