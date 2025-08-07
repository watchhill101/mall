import React, { useState, useEffect } from 'react';
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
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  InputNumber,
  Pagination,
} from 'antd';
import {
  ExportOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FileTextOutlined,
  EditOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟商品数据
const products = [
  { id: 'P001', name: 'iPhone 15 Pro', category: '电子产品', unit: '台' },
  { id: 'P002', name: 'MacBook Air', category: '电子产品', unit: '台' },
  { id: 'P003', name: 'Nike运动鞋', category: '服装', unit: '双' },
  { id: 'P004', name: '华为平板', category: '电子产品', unit: '台' },
  { id: 'P005', name: 'Adidas短袖', category: '服装', unit: '件' },
];

// 模拟客户数据
const customers = [
  {
    id: 'C001',
    name: '张三',
    phone: '13800138000',
    address: '北京市朝阳区某某街道',
  },
  {
    id: 'C002',
    name: '王五',
    phone: '13900139000',
    address: '上海市浦东新区某某街道',
  },
  {
    id: 'C003',
    name: '孙七',
    phone: '13700137000',
    address: '广州市天河区某某街道',
  },
  {
    id: 'C004',
    name: '周九',
    phone: '13600136000',
    address: '深圳市南山区某某街道',
  },
];

// 模拟仓库数据
const warehouses = ['A仓库', 'B仓库', 'C仓库'];

// 模拟批次数据
const batchNumbers = [
  '20240115001',
  '20240115002',
  '20240114001',
  '20240113001',
];

export default function StockOut() {
  // 状态管理
  const [stockOutData, setStockOutData] = useState([
    {
      key: '1',
      orderId: 'OUT001',
      productId: 'P001',
      productName: 'iPhone 15 Pro',
      category: '电子产品',
      quantity: 10,
      unit: '台',
      customer: '张三',
      customerPhone: '13800138000',
      address: '北京市朝阳区某某街道',
      operator: '李四',
      status: '已完成',
      createTime: '2024-01-15 09:30:00',
      expectedDeliveryTime: '2024-01-16 12:00:00',
      actualDeliveryTime: '2024-01-15 17:30:00',
      remark: '普通快递',
      batchNumber: '20240115001',
      warehouse: 'A仓库',
    },
    {
      key: '2',
      orderId: 'OUT002',
      productId: 'P002',
      productName: 'MacBook Air',
      category: '电子产品',
      quantity: 5,
      unit: '台',
      customer: '王五',
      customerPhone: '13900139000',
      address: '上海市浦东新区某某街道',
      operator: '赵六',
      status: '进行中',
      createTime: '2024-01-15 11:20:00',
      expectedDeliveryTime: '2024-01-17 10:00:00',
      actualDeliveryTime: '',
      remark: '顺丰快递',
      batchNumber: '20240115002',
      warehouse: 'A仓库',
    },
    {
      key: '3',
      orderId: 'OUT003',
      productId: 'P003',
      productName: 'Nike运动鞋',
      category: '服装',
      quantity: 20,
      unit: '双',
      customer: '孙七',
      customerPhone: '13700137000',
      address: '广州市天河区某某街道',
      operator: '周八',
      status: '已完成',
      createTime: '2024-01-14 15:45:00',
      expectedDeliveryTime: '2024-01-15 12:00:00',
      actualDeliveryTime: '2024-01-15 10:30:00',
      remark: '韵达快递',
      batchNumber: '20240114001',
      warehouse: 'B仓库',
    },
    {
      key: '4',
      orderId: 'OUT004',
      productId: 'P004',
      productName: '华为平板',
      category: '电子产品',
      quantity: 8,
      unit: '台',
      customer: '周九',
      customerPhone: '13600136000',
      address: '深圳市南山区某某街道',
      operator: '吴十',
      status: '已取消',
      createTime: '2024-01-13 10:15:00',
      expectedDeliveryTime: '2024-01-15 15:00:00',
      actualDeliveryTime: '',
      remark: '客户取消订单',
      batchNumber: '20240113001',
      warehouse: 'C仓库',
    },
  ]);

  const [filteredData, setFilteredData] = useState(stockOutData);
  const [searchParams, setSearchParams] = useState({
    orderId: '',
    productName: '',
    status: '',
    dateRange: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // 计算统计数据
  useEffect(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(
      (item) => item.status === '已完成'
    ).length;
    const pending = filteredData.filter(
      (item) => item.status === '进行中'
    ).length;
    const cancelled = filteredData.filter(
      (item) => item.status === '已取消'
    ).length;
    const quantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);

    setTotalOrders(total);
    setCompletedOrders(completed);
    setPendingOrders(pending);
    setCancelledOrders(cancelled);
    setTotalQuantity(quantity);
  }, [filteredData]);

  // 搜索筛选
  useEffect(() => {
    let data = [...stockOutData];

    // 筛选出库单号
    if (searchParams.orderId) {
      data = data.filter((item) =>
        item.orderId.toLowerCase().includes(searchParams.orderId.toLowerCase())
      );
    }

    // 筛选商品名称
    if (searchParams.productName) {
      data = data.filter((item) =>
        item.productName
          .toLowerCase()
          .includes(searchParams.productName.toLowerCase())
      );
    }

    // 筛选状态
    if (searchParams.status) {
      data = data.filter((item) => item.status === searchParams.status);
    }

    // 筛选日期范围
    if (searchParams.dateRange && searchParams.dateRange.length === 2) {
      const startDate = dayjs(searchParams.dateRange[0]).startOf('day');
      const endDate = dayjs(searchParams.dateRange[1]).endOf('day');

      data = data.filter((item) => {
        const createTime = dayjs(item.createTime);
        return createTime.isBetween(startDate, endDate, null, '[]');
      });
    }

    setFilteredData(data);
    setCurrentPage(1); // 重置到第一页
  }, [searchParams, stockOutData]);

  // 分页数据
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 处理搜索参数变化
  const handleSearchParamChange = (paramName, value) => {
    setSearchParams((prev) => ({ ...prev, [paramName]: value }));
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchParams({
      orderId: '',
      productName: '',
      status: '',
      dateRange: [],
    });
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 确认出库
  const handleConfirmOutbound = (record) => {
    setSelectedRecord(record);
    setConfirmModalVisible(true);
  };

  // 提交确认出库
  const handleSubmitConfirm = () => {
    // 模拟API调用
    setTimeout(() => {
      const updatedData = stockOutData.map((item) => {
        if (item.key === selectedRecord.key) {
          return {
            ...item,
            status: '已完成',
            actualDeliveryTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
        }
        return item;
      });

      setStockOutData(updatedData);
      setConfirmModalVisible(false);
      message.success('出库确认成功');
    }, 500);
  };

  // 取消出库
  const handleCancelOutbound = (record) => {
    // 模拟API调用
    setTimeout(() => {
      const updatedData = stockOutData.map((item) => {
        if (item.key === record.key) {
          return {
            ...item,
            status: '已取消',
          };
        }
        return item;
      });

      setStockOutData(updatedData);
      message.success('出库单已取消');
    }, 500);
  };

  // 打开新增出库单模态框
  const handleOpenCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  // 提交新增出库单
  const handleSubmitCreate = () => {
    createForm.validateFields().then((values) => {
      // 模拟API调用
      setTimeout(() => {
        const newOrderId = `OUT${String(stockOutData.length + 1).padStart(
          3,
          '0'
        )}`;
        const product = products.find((p) => p.id === values.productId);
        const customer = customers.find((c) => c.id === values.customerId);

        const newRecord = {
          key: String(stockOutData.length + 1),
          orderId: newOrderId,
          productId: values.productId,
          productName: product.name,
          category: product.category,
          quantity: values.quantity,
          unit: product.unit,
          customer: customer.name,
          customerPhone: customer.phone,
          address: customer.address,
          operator: '当前用户', // 实际项目中应该获取当前登录用户
          status: '进行中',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          expectedDeliveryTime: dayjs(values.expectedDeliveryTime).format(
            'YYYY-MM-DD HH:mm:ss'
          ),
          actualDeliveryTime: '',
          remark: values.remark,
          batchNumber: values.batchNumber,
          warehouse: values.warehouse,
        };

        setStockOutData([...stockOutData, newRecord]);
        setCreateModalVisible(false);
        message.success('新增出库单成功');
      }, 500);
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '出库单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '商品分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '出库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity, record) => `${quantity} ${record.unit}`,
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = 'blue';
        let icon = <ClockCircleOutlined />;

        if (status === '已完成') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        } else if (status === '已取消') {
          color = 'red';
          icon = <EditOutlined />;
        }

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
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === '进行中' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleConfirmOutbound(record)}
              >
                确认出库
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleCancelOutbound(record)}
              >
                取消
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <GoodsLayout>
      <div className="StockOut" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <ExportOutlined style={{ marginRight: '8px' }} />
          出库管理
        </Title>

        {/* 统计卡片 */}
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

        {/* 搜索区域 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="请输入出库单号"
                value={searchParams.orderId}
                onChange={(e) =>
                  handleSearchParamChange('orderId', e.target.value)
                }
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="请输入商品名称"
                value={searchParams.productName}
                onChange={(e) =>
                  handleSearchParamChange('productName', e.target.value)
                }
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="请选择状态"
                value={searchParams.status}
                onChange={(value) => handleSearchParamChange('status', value)}
                allowClear
              >
                <Option value="已完成">已完成</Option>
                <Option value="进行中">进行中</Option>
                <Option value="已取消">已取消</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={searchParams.dateRange}
                onChange={(value) =>
                  handleSearchParamChange('dateRange', value)
                }
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleResetSearch}>重置</Button>
                <Button type="primary" onClick={() => {}}>
                  搜索
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 出库记录表格 */}
        <Card
          title="出库记录"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              新增出库单
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            rowKey="key"
            style={{ marginBottom: '16px' }}
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条记录`}
            style={{ textAlign: 'right' }}
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="出库单详情"
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={700}
        >
          {selectedRecord && (
            <div style={{ padding: '16px' }}>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>出库单号:</Text>
                </Col>
                <Col span={16}>{selectedRecord.orderId}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品名称:</Text>
                </Col>
                <Col span={16}>{selectedRecord.productName}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品分类:</Text>
                </Col>
                <Col span={16}>{selectedRecord.category}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>出库数量:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.quantity} {selectedRecord.unit}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>客户:</Text>
                </Col>
                <Col span={16}>{selectedRecord.customer}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>客户电话:</Text>
                </Col>
                <Col span={16}>{selectedRecord.customerPhone}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>客户地址:</Text>
                </Col>
                <Col span={16}>{selectedRecord.address}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>操作员:</Text>
                </Col>
                <Col span={16}>{selectedRecord.operator}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>状态:</Text>
                </Col>
                <Col span={16}>
                  <Tag
                    color={
                      selectedRecord.status === '已完成'
                        ? 'green'
                        : selectedRecord.status === '已取消'
                        ? 'red'
                        : 'blue'
                    }
                  >
                    {selectedRecord.status}
                  </Tag>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>创建时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.createTime}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>预计送达时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.expectedDeliveryTime}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>实际送达时间:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.actualDeliveryTime || '未送达'}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>备注:</Text>
                </Col>
                <Col span={16}>{selectedRecord.remark}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>批次号:</Text>
                </Col>
                <Col span={16}>{selectedRecord.batchNumber}</Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>仓库:</Text>
                </Col>
                <Col span={16}>{selectedRecord.warehouse}</Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 确认出库模态框 */}
        <Modal
          title="确认出库"
          visible={confirmModalVisible}
          onCancel={() => setConfirmModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setConfirmModalVisible(false)}>
              取消
            </Button>,
            <Button key="confirm" type="primary" onClick={handleSubmitConfirm}>
              确认
            </Button>,
          ]}
        >
          <div style={{ padding: '16px' }}>
            <p>您确定要确认以下出库单吗？</p>
            {selectedRecord && (
              <div style={{ marginTop: '16px' }}>
                <p>出库单号: {selectedRecord.orderId}</p>
                <p>商品名称: {selectedRecord.productName}</p>
                <p>
                  出库数量: {selectedRecord.quantity} {selectedRecord.unit}
                </p>
                <p>当前时间: {dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
              </div>
            )}
          </div>
        </Modal>

        {/* 新增出库单模态框 */}
        <Modal
          title="新增出库单"
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setCreateModalVisible(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmitCreate}>
              提交
            </Button>,
          ]}
          width={700}
        >
          <Form form={createForm} layout="vertical" style={{ padding: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="productId"
                  label="商品名称"
                  rules={[{ required: true, message: '请选择商品' }]}
                >
                  <Select placeholder="请选择商品">
                    {products.map((product) => (
                      <Option key={product.id} value={product.id}>
                        {product.name} ({product.category}) - {product.unit}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label="出库数量"
                  rules={[
                    { required: true, message: '请输入出库数量' },
                    { type: 'number', min: 1, message: '出库数量必须大于0' },
                  ]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="customerId"
                  label="客户"
                  rules={[{ required: true, message: '请选择客户' }]}
                >
                  <Select placeholder="请选择客户">
                    {customers.map((customer) => (
                      <Option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.phone})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expectedDeliveryTime"
                  label="预计送达时间"
                  rules={[{ required: true, message: '请选择预计送达时间' }]}
                >
                  <DatePicker
                    showTime
                    placeholder="请选择预计送达时间"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="batchNumber"
                  label="批次号"
                  rules={[{ required: true, message: '请选择批次号' }]}
                >
                  <Select placeholder="请选择批次号">
                    {batchNumbers.map((batch) => (
                      <Option key={batch} value={batch}>
                        {batch}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="warehouse"
                  label="仓库"
                  rules={[{ required: true, message: '请选择仓库' }]}
                >
                  <Select placeholder="请选择仓库">
                    {warehouses.map((warehouse) => (
                      <Option key={warehouse} value={warehouse}>
                        {warehouse}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={4} placeholder="请输入备注信息" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </GoodsLayout>
  );
}
