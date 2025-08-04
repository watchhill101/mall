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
  Progress,
} from 'antd';
import {
  CheckSquareOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';

const { Title } = Typography;

export default function Stocktake() {
  // 模拟盘点数据
  const stocktakeData = [
    {
      key: '1',
      taskId: 'ST001',
      taskName: '电子产品盘点',
      productCount: 50,
      completedCount: 50,
      operator: '张三',
      status: '已完成',
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 11:30:00',
    },
    {
      key: '2',
      taskId: 'ST002',
      taskName: '服装盘点',
      productCount: 100,
      completedCount: 75,
      operator: '李四',
      status: '进行中',
      startTime: '2024-01-15 14:00:00',
      endTime: null,
    },
    {
      key: '3',
      taskId: 'ST003',
      taskName: '全库盘点',
      productCount: 200,
      completedCount: 0,
      operator: '王五',
      status: '待开始',
      startTime: null,
      endTime: null,
    },
  ];

  const columns = [
    {
      title: '盘点任务ID',
      dataIndex: 'taskId',
      key: 'taskId',
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '进度',
      key: 'progress',
      render: (_, record) => {
        const percent =
          record.productCount > 0
            ? Math.round((record.completedCount / record.productCount) * 100)
            : 0;
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              status={
                record.status === '已完成'
                  ? 'success'
                  : record.status === '进行中'
                  ? 'active'
                  : 'normal'
              }
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.completedCount}/{record.productCount}
            </span>
          </div>
        );
      },
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
        const color =
          status === '已完成'
            ? 'green'
            : status === '进行中'
            ? 'blue'
            : 'orange';
        const icon =
          status === '已完成' ? (
            <CheckCircleOutlined />
          ) : status === '进行中' ? (
            <ClockCircleOutlined />
          ) : (
            <ExclamationCircleOutlined />
          );
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => time || '-',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">
            查看详情
          </Button>
          {record.status === '待开始' && (
            <Button type="link" size="small">
              开始盘点
            </Button>
          )}
          {record.status === '进行中' && (
            <Button type="link" size="small">
              继续盘点
            </Button>
          )}
          {record.status === '已完成' && (
            <Button type="link" size="small">
              查看报告
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalTasks = stocktakeData.length;
  const completedTasks = stocktakeData.filter(
    (item) => item.status === '已完成'
  ).length;
  const pendingTasks = stocktakeData.filter(
    (item) => item.status === '进行中'
  ).length;
  const totalProducts = stocktakeData.reduce(
    (sum, item) => sum + item.productCount,
    0
  );

  return (
    <GoodsLayout>
      <div className="Stocktake" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <CheckSquareOutlined style={{ marginRight: '8px' }} />
          库存盘点
        </Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="盘点任务总数"
              value={totalTasks}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待盘点商品"
              value={totalProducts}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="盘点任务"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新增盘点任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={stocktakeData}
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
