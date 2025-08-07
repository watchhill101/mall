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
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message,
  Divider,
} from 'antd';
import {
  ImportOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingOutlined,
  CompanyOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function StockIn() {
  // 状态管理
  const [stockInData, setStockInData] = useState([
    {
      key: '1',
      orderId: 'IN001',
      productId: 'P001',
      productName: 'iPhone 15 Pro',
      category: '电子产品',
      quantity: 50,
      unit: '台',
      supplier: '苹果官方',
      contactPerson: '张经理',
      contactPhone: '13800138000',
      operator: '张三',
      status: '已完成',
      createTime: '2024-01-15 10:30:00',
      expectedArrivalTime: '2024-01-15 09:00:00',
      actualArrivalTime: '2024-01-15 10:15:00',
      remark: '常规补货',
      batchNumber: '20240115001',
      warehouse: 'A仓库',
    },
    {
      key: '2',
      orderId: 'IN002',
      productId: 'P002',
      productName: 'MacBook Air',
      category: '电子产品',
      quantity: 20,
      unit: '台',
      supplier: '苹果官方',
      contactPerson: '张经理',
      contactPhone: '13800138000',
      operator: '李四',
      status: '进行中',
      createTime: '2024-01-15 14:20:00',
      expectedArrivalTime: '2024-01-16 10:00:00',
      actualArrivalTime: '',
      remark: '新品入库',
      batchNumber: '20240115002',
      warehouse: 'A仓库',
    },
    {
      key: '3',
      orderId: 'IN003',
      productId: 'P003',
      productName: 'Nike运动鞋',
      category: '服装',
      quantity: 100,
      unit: '双',
      supplier: 'Nike官方',
      contactPerson: '王经理',
      contactPhone: '13900139000',
      operator: '王五',
      status: '已完成',
      createTime: '2024-01-14 16:45:00',
      expectedArrivalTime: '2024-01-14 15:00:00',
      actualArrivalTime: '2024-01-14 16:30:00',
      remark: '季度采购',
      batchNumber: '20240114001',
      warehouse: 'B仓库',
    },
    {
      key: '4',
      orderId: 'IN004',
      productId: 'P004',
      productName: '华为平板',
      category: '电子产品',
      quantity: 30,
      unit: '台',
      supplier: '华为官方',
      contactPerson: '李经理',
      contactPhone: '13700137000',
      operator: '赵六',
      status: '已取消',
      createTime: '2024-01-13 09:10:00',
      expectedArrivalTime: '2024-01-15 14:00:00',
      actualArrivalTime: '',
      remark: '订单取消',
      batchNumber: '20240113001',
      warehouse: 'A仓库',
    },
    {
      key: '5',
      orderId: 'IN005',
      productId: 'P005',
      productName: '小米手环',
      category: '电子产品',
      quantity: 150,
      unit: '个',
      supplier: '小米官方',
      contactPerson: '陈经理',
      contactPhone: '13600136000',
      operator: '孙七',
      status: '进行中',
      createTime: '2024-01-15 11:30:00',
      expectedArrivalTime: '2024-01-16 09:00:00',
      actualArrivalTime: '',
      remark: '促销备货',
      batchNumber: '20240115003',
      warehouse: 'B仓库',
    },
  ]);
  const [searchParams, setSearchParams] = useState({
    orderId: '',
    productName: '',
    status: '',
    supplier: '',
  });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [products, setProducts] = useState([
    { id: 'P001', name: 'iPhone 15 Pro', category: '电子产品', unit: '台' },
    { id: 'P002', name: 'MacBook Air', category: '电子产品', unit: '台' },
    { id: 'P003', name: 'Nike运动鞋', category: '服装', unit: '双' },
    { id: 'P004', name: '华为平板', category: '电子产品', unit: '台' },
    { id: 'P005', name: '小米手环', category: '电子产品', unit: '个' },
  ]);
  const [suppliers, setSuppliers] = useState([
    {
      id: 'S001',
      name: '苹果官方',
      contactPerson: '张经理',
      contactPhone: '13800138000',
    },
    {
      id: 'S002',
      name: 'Nike官方',
      contactPerson: '王经理',
      contactPhone: '13900139000',
    },
    {
      id: 'S003',
      name: '华为官方',
      contactPerson: '李经理',
      contactPhone: '13700137000',
    },
    {
      id: 'S004',
      name: '小米官方',
      contactPerson: '陈经理',
      contactPhone: '13600136000',
    },
  ]);
  const [warehouses, setWarehouses] = useState(['A仓库', 'B仓库', 'C仓库']);

  // 组件加载时初始化数据
  useEffect(() => {
    filterData();
  }, [stockInData, searchParams, currentPage, pageSize]);

  // 过滤数据
  const filterData = () => {
    let data = [...stockInData];

    // 应用搜索过滤
    if (searchParams.orderId) {
      data = data.filter((item) => item.orderId.includes(searchParams.orderId));
    }
    if (searchParams.productName) {
      data = data.filter((item) =>
        item.productName.includes(searchParams.productName)
      );
    }
    if (searchParams.status) {
      data = data.filter((item) => item.status === searchParams.status);
    }
    if (searchParams.supplier) {
      data = data.filter((item) => item.supplier === searchParams.supplier);
    }

    // 设置总数
    setTotal(data.length);

    // 应用分页
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredData(data.slice(startIndex, endIndex));
  };

  // 处理搜索参数变化
  const handleSearchChange = (field, value) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); // 重置到第一页
  };

  // 处理分页变化
  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 确认入库
  const handleConfirmStockIn = (record) => {
    setSelectedRecord(record);
    setConfirmModalVisible(true);
  };

  // 提交确认入库
  const handleSubmitConfirm = () => {
    if (!selectedRecord) return;

    // 更新数据
    const newData = [...stockInData];
    const index = newData.findIndex((item) => item.key === selectedRecord.key);
    if (index !== -1) {
      newData[index].status = '已完成';
      newData[index].actualArrivalTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      setStockInData(newData);
      messageApi.success('入库确认成功');
      setConfirmModalVisible(false);
    }
  };

  // 新增入库单
  const handleAddStockIn = () => {
    form.resetFields();
    setAddModalVisible(true);
  };

  // 提交新增入库单
  const handleSubmitAdd = async () => {
    try {
      const values = await form.validateFields();
      // 生成入库单号
      const orderId = 'IN' + dayjs().format('YYYYMMDDHHmmss').slice(2);
      // 查找商品信息
      const product = products.find((p) => p.id === values.productId);
      if (!product) {
        messageApi.error('找不到商品信息');
        return;
      }
      // 查找供应商信息
      const supplier = suppliers.find((s) => s.id === values.supplierId);
      if (!supplier) {
        messageApi.error('找不到供应商信息');
        return;
      }

      // 创建新入库单
      const newRecord = {
        key: Date.now().toString(),
        orderId,
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity: values.quantity,
        unit: product.unit,
        supplier: supplier.name,
        contactPerson: supplier.contactPerson,
        contactPhone: supplier.contactPhone,
        operator: '当前用户', // 实际应用中应从登录信息获取
        status: '进行中',
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        expectedArrivalTime: values.expectedArrivalTime.format(
          'YYYY-MM-DD HH:mm:ss'
        ),
        actualArrivalTime: '',
        remark: values.remark || '',
        batchNumber: values.batchNumber,
        warehouse: values.warehouse,
      };

      // 添加到数据列表
      setStockInData([...stockInData, newRecord]);
      messageApi.success('入库单创建成功');
      setAddModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '入库单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 180,
    },
    {
      title: '商品分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '入库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity, record) => `${quantity} ${record.unit}`,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
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
        let color, icon;
        if (status === '已完成') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        } else if (status === '进行中') {
          color = 'blue';
          icon = <ClockCircleOutlined />;
        } else {
          color = 'gray';
          icon = <ClockCircleOutlined />;
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
      width: 180,
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
            <EyeOutlined size={16} /> 查看详情
          </Button>
          {record.status === '进行中' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleConfirmStockIn(record)}
            >
              <CheckOutlined size={16} /> 确认入库
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
  const canceledOrders = stockInData.filter(
    (item) => item.status === '已取消'
  ).length;
  const totalQuantity = stockInData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <GoodsLayout>
      {contextHolder}
      <div className="StockIn" style={{ padding: '24px' }}>
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

        {/* 搜索区域 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="输入入库单号"
                value={searchParams.orderId}
                onChange={(e) => handleSearchChange('orderId', e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="输入商品名称"
                value={searchParams.productName}
                onChange={(e) =>
                  handleSearchChange('productName', e.target.value)
                }
                prefix={<ShoppingOutlined />}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="选择状态"
                value={searchParams.status}
                onChange={(value) => handleSearchChange('status', value)}
                style={{ width: '100%' }}
              >
                <Option value="">全部</Option>
                <Option value="已完成">已完成</Option>
                <Option value="进行中">进行中</Option>
                <Option value="已取消">已取消</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="选择供应商"
                value={searchParams.supplier}
                onChange={(value) => handleSearchChange('supplier', value)}
                style={{ width: '100%' }}
              >
                <Option value="">全部</Option>
                {[...new Set(stockInData.map((item) => item.supplier))].map(
                  (supplier) => (
                    <Option key={supplier} value={supplier}>
                      {supplier}
                    </Option>
                  )
                )}
              </Select>
            </Col>
          </Row>
          <Row gutter={16} align="middle" style={{ marginTop: '16px' }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={filterData}>
                搜索
              </Button>
            </Col>
          </Row>
        </Card>

        <Card
          title="入库记录"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddStockIn}
            >
              新增入库单
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
              onChange: handlePaginationChange,
            }}
            rowKey="key"
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="入库单详情"
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
                  <Text strong>入库单号:</Text>
                </Col>
                <Col span={16}>{selectedRecord.orderId}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品信息:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.productName} ({selectedRecord.productId})
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品分类:</Text>
                </Col>
                <Col span={16}>{selectedRecord.category}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>入库数量:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.quantity} {selectedRecord.unit}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>供应商:</Text>
                </Col>
                <Col span={16}>{selectedRecord.supplier}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>联系人:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.contactPerson} ({selectedRecord.contactPhone})
                </Col>
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
                        : selectedRecord.status === '进行中'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    {selectedRecord.status}
                  </Tag>
                </Col>
              </Row>
              <Divider />
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>创建时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.createTime}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>预计到达时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.expectedArrivalTime}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>实际到达时间:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.actualArrivalTime || '未确认'}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>批次号:</Text>
                </Col>
                <Col span={16}>{selectedRecord.batchNumber}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>仓库:</Text>
                </Col>
                <Col span={16}>{selectedRecord.warehouse}</Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>备注:</Text>
                </Col>
                <Col span={16}>{selectedRecord.remark || '无'}</Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 确认入库模态框 */}
        <Modal
          title="确认入库"
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
          width={500}
        >
          {selectedRecord && (
            <div style={{ padding: '16px' }}>
              <p>您确定要确认以下入库单吗？</p>
              <Row
                gutter={16}
                style={{ marginBottom: '16px', marginTop: '16px' }}
              >
                <Col span={8}>
                  <Text strong>入库单号:</Text>
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
                  <Text strong>入库数量:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.quantity} {selectedRecord.unit}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>当前时间:</Text>
                </Col>
                <Col span={16}>{dayjs().format('YYYY-MM-DD HH:mm:ss')}</Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 新增入库单模态框 */}
        <Modal
          title="新增入库单"
          visible={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setAddModalVisible(false)}>
              取消
            </Button>,
            <Button key="confirm" type="primary" onClick={handleSubmitAdd}>
              确认创建
            </Button>,
          ]}
          width={700}
        >
          <Form form={form} layout="vertical" style={{ padding: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="productId"
                  label="商品选择"
                  rules={[{ required: true, message: '请选择商品' }]}
                >
                  <Select placeholder="请选择商品">
                    {products.map((product) => (
                      <Option key={product.id} value={product.id}>
                        {product.name} ({product.id}) - {product.category}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label="入库数量"
                  rules={[
                    { required: true, message: '请输入入库数量' },
                    { type: 'number', min: 1, message: '入库数量必须大于0' },
                  ]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="supplierId"
                  label="供应商选择"
                  rules={[{ required: true, message: '请选择供应商' }]}
                >
                  <Select placeholder="请选择供应商">
                    {suppliers.map((supplier) => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.contactPerson}:{' '}
                        {supplier.contactPhone})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expectedArrivalTime"
                  label="预计到达时间"
                  rules={[{ required: true, message: '请选择预计到达时间' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="请选择预计到达时间"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="batchNumber"
                  label="批次号"
                  rules={[{ required: true, message: '请输入批次号' }]}
                >
                  <Input placeholder="请输入批次号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="warehouse"
                  label="仓库选择"
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
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="remark" label="备注">
                  <Input.TextArea rows={4} placeholder="请输入备注信息" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </GoodsLayout>
  );
}
