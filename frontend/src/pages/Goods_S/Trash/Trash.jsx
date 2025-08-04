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
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  // RestoreOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function Trash() {
  // 模拟回收站数据
  const trashData = [
    {
      key: '1',
      productId: 'P001',
      productName: 'iPhone 14 Pro',
      category: '电子产品',
      deleteTime: '2024-01-15 10:30:00',
      deleteReason: '商品下架',
      operator: '张三',
      status: '已删除',
    },
    {
      key: '2',
      productId: 'P002',
      productName: 'MacBook Pro',
      category: '电子产品',
      deleteTime: '2024-01-14 16:45:00',
      deleteReason: '库存不足',
      operator: '李四',
      status: '已删除',
    },
    {
      key: '3',
      productId: 'P003',
      productName: 'Nike运动鞋',
      category: '服装',
      deleteTime: '2024-01-13 09:20:00',
      deleteReason: '商品过期',
      operator: '王五',
      status: '已删除',
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
      title: '删除时间',
      dataIndex: 'deleteTime',
      key: 'deleteTime',
    },
    {
      title: '删除原因',
      dataIndex: 'deleteReason',
      key: 'deleteReason',
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
      render: (status) => (
        <Tag color="red" icon={<DeleteOutlined />}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            // icon={<RestoreOutlined />}
            onClick={() => handleRestore(record)}
          >
            恢复
          </Button>
          <Popconfirm
            title="确定要永久删除这个商品吗？"
            description="此操作不可恢复，请谨慎操作！"
            onConfirm={() => handlePermanentDelete(record)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button type="link" size="small" danger>
              永久删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理恢复商品
  const handleRestore = (record) => {
    console.log('恢复商品:', record);
    // 这里添加恢复商品的逻辑
  };

  // 处理永久删除
  const handlePermanentDelete = (record) => {
    console.log('永久删除商品:', record);
    // 这里添加永久删除的逻辑
  };

  // 计算统计数据
  const totalDeleted = trashData.length;
  const electronicsCount = trashData.filter(
    (item) => item.category === '电子产品'
  ).length;
  const clothingCount = trashData.filter(
    (item) => item.category === '服装'
  ).length;

  return (
    <div className="Trash">
      <Title level={2} style={{ marginBottom: '24px' }}>
        <DeleteOutlined style={{ marginRight: '8px' }} />
        回收站
      </Title>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="已删除商品"
              value={totalDeleted}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="电子产品"
              value={electronicsCount}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="服装类"
              value={clothingCount}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="可恢复商品"
              value={totalDeleted}
              // prefix={<RestoreOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="已删除商品列表"
        extra={
          <Space>
            {/* <Button type="primary" icon={<RestoreOutlined />}>
              批量恢复
            </Button> */}
            <Button danger icon={<DeleteOutlined />}>
              清空回收站
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={trashData}
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
