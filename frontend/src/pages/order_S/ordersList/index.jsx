import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Modal,
  Descriptions,
  Row,
  Col,
  Image,
  message
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getOrdersList } from '../../../api/orders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrdersList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // 状态选项
  const statusOptions = [
    { value: '待付款', label: '待付款', color: 'orange' },
    { value: '待发货', label: '待发货', color: 'blue' },
    { value: '已发货', label: '已发货', color: 'cyan' },
    { value: '已完成', label: '已完成', color: 'green' },
    { value: '已取消', label: '已取消', color: 'red' },
  ];

  // 支付方式选项
  const paymentOptions = [
    { value: '微信', label: '微信' },
    { value: '支付宝', label: '支付宝' },
    { value: '银联', label: '银联' },
    { value: '现金', label: '现金' },
  ];

  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'productInfo',
      key: 'productInfo',
      width: 200,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            width={50}
            height={50}
            src={record.productImage || '/placeholder.png'}
            style={{ marginRight: 8, borderRadius: 4 }}
            fallback="/placeholder.png"
          />
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {record.productName || '商品名称商品名称'}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              规格: {record.specification || '规格名称规格名称'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '价格(元)/数量',
      key: 'priceQuantity',
      width: 120,
      render: (text, record) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ¥ {record.price || '138.99'}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            x{record.quantity || '1'}
          </div>
        </div>
      ),
    },
    {
      title: '客户信息',
      key: 'customerInfo',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.customerName || '店铺名称店铺名称'}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.customerPhone || '18979881656'}
          </div>
        </div>
      ),
    },
    {
      title: '分拣明细',
      dataIndex: 'sortingDetail',
      key: 'sortingDetail',
      width: 120,
      render: (text, record) => (
        <div>
          <div style={{ color: '#1890ff' }}>
            佣金: ¥ {record.commission || '20.24'}
          </div>
        </div>
      ),
    },
    {
      title: '新建店铺',
      dataIndex: 'newShop',
      key: 'newShop',
      width: 120,
      render: (text, record) => (
        <div>
          <div>{record.shopName || '店铺名称店铺名称'}</div>
        </div>
      ),
    },
    {
      title: '所属网点',
      dataIndex: 'networkPoint',
      key: 'networkPoint',
      width: 120,
      render: (text, record) => (
        <div>
          <div>{record.networkPoint || '网点名称网点名称'}</div>
        </div>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = statusOptions.find(s => s.value === status) || 
          { color: 'orange', label: status || '待付款' };
        return <Tag color={statusConfig.color}>{statusConfig.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getOrdersList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
        ...params,
      });
      
      if (response.code === 200) {
        setData(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取数据失败');
      // 使用模拟数据
      const mockData = Array(10).fill().map((_, index) => ({
        id: `order_${index + 1}`,
        orderNumber: `JZ-${Date.now()}${index}`,
        productName: '商品名称商品名称',
        specification: '规格名称规格名称',
        price: '138.99',
        quantity: '1',
        customerName: '店铺名称店铺名称',
        customerPhone: '18979881656',
        commission: '20.24',
        shopName: '店铺名称店铺名称',
        networkPoint: '网点名称网点名称',
        status: ['待付款', '待发货', '已发货', '已完成', '已取消'][index % 5],
        createdAt: new Date().toISOString(),
      }));
      setData(mockData);
      setTotal(100);
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const handleViewDetail = async (record) => {
    try {
      setCurrentOrder(record);
      setDetailVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchData();
  };

  // 重置
  const handleReset = () => {
    setSearchParams({});
    setPagination({ ...pagination, current: 1 });
    fetchData();
  };

  // 表格分页变化
  const handleTableChange = (paginationConfig) => {
    setPagination(paginationConfig);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <OrderLayout>
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <Card title="订单管理" style={{ marginBottom: '16px' }}>
          {/* 搜索表单 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <Input
                placeholder="请输入订单编号"
                value={searchParams.orderNumber}
                onChange={(e) => setSearchParams({ ...searchParams, orderNumber: e.target.value })}
                allowClear
            />
          </Col>
            <Col span={6}>
            <Select
              placeholder="请选择所属店铺"
              value={searchParams.shopLocation}
              onChange={(value) => setSearchParams({ ...searchParams, shopLocation: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="店铺1">店铺1</Option>
              <Option value="店铺2">店铺2</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => setSearchParams({ 
                ...searchParams, 
                startDate: dates?.[0]?.format('YYYY-MM-DD'),
                endDate: dates?.[1]?.format('YYYY-MM-DD')
              })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="请输入联系电话"
              value={searchParams.customerPhone}
              onChange={(e) => setSearchParams({ ...searchParams, customerPhone: e.target.value })}
              allowClear
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Select
              placeholder="请选择交易类型"
              value={searchParams.transactionType}
              onChange={(value) => setSearchParams({ ...searchParams, transactionType: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="销售">销售</Option>
              <Option value="退货">退货</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="请选择支付方式"
              value={searchParams.paymentMethod}
              onChange={(value) => setSearchParams({ ...searchParams, paymentMethod: value })}
              allowClear
              style={{ width: '100%' }}
            >
              {paymentOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <Row style={{ marginBottom: '16px' }}>
          <Col>
            <Space>
              <Button type="primary" style={{ background: '#52c41a' }}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单编号">{currentOrder.orderNumber}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{currentOrder.createdAt}</Descriptions.Item>
            <Descriptions.Item label="商品名称">{currentOrder.productName}</Descriptions.Item>
            <Descriptions.Item label="规格">{currentOrder.specification}</Descriptions.Item>
            <Descriptions.Item label="价格">¥{currentOrder.price}</Descriptions.Item>
            <Descriptions.Item label="数量">{currentOrder.quantity}</Descriptions.Item>
            <Descriptions.Item label="客户名称">{currentOrder.customerName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentOrder.customerPhone}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusOptions.find(s => s.value === currentOrder.status)?.color || 'blue'}>
                {currentOrder.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
    </OrderLayout>
  );
};

export default OrdersList;