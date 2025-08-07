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
  Divider,
  message
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ExportOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { 
  getOrdersList, 
  updateOrderStatus, 
  updatePaymentStatus, 
  batchOperateOrders, 
  getOrderStatistics 
} from '../../../api/orders';
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [statusUpdateVisible, setStatusUpdateVisible] = useState(false);
  const [batchOperationVisible, setBatchOperationVisible] = useState(false);

  // 状态选项
  const statusOptions = [
    { value: 'pending', label: '待处理', color: 'orange' },
    { value: 'confirmed', label: '已确认', color: 'blue' },
    { value: 'shipped', label: '已发货', color: 'cyan' },
    { value: 'completed', label: '已完成', color: 'green' },
    { value: 'cancelled', label: '已取消', color: 'red' },
  ];

  // 支付方式选项
  const paymentOptions = [
    { value: 'wechat', label: '微信支付' },
    { value: 'alipay', label: '支付宝' },
    { value: 'bank_card', label: '银行卡' },
    { value: 'cash', label: '现金' },
  ];

  // 支付状态选项
  const paymentStatusOptions = [
    { value: 'unpaid', label: '未支付', color: 'red' },
    { value: 'paid', label: '已支付', color: 'green' },
    { value: 'refunded', label: '已退款', color: 'orange' },
  ];

  // 表格列定义
  const columns = [
    {
      title: '订单信息',
      key: 'orderInfo',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.orderId}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {new Date(record.createdAt).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '商品信息',
      key: 'productInfo',
      width: 200,
      render: (text, record) => {
        const firstProduct = record.products?.[0];
        return (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {firstProduct?.productName || '暂无商品'}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              规格: {firstProduct?.specifications || '无'}
            </div>
            {record.products?.length > 1 && (
              <div style={{ color: '#1890ff', fontSize: '12px' }}>
                +{record.products.length - 1}个商品
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '价格/数量',
      key: 'priceQuantity',
      width: 120,
      render: (text, record) => {
        const totalQuantity = record.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        return (
          <div>
            <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              ¥ {record.pricing?.totalAmount || 0}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              共{totalQuantity}件
            </div>
          </div>
        );
      },
    },
    {
      title: '客户信息',
      key: 'customerInfo',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.customer?.customerName || '未知客户'}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.customer?.customerPhone || '无电话'}
          </div>
        </div>
      ),
    },
    {
      title: '支付信息',
      key: 'paymentInfo',
      width: 120,
      render: (text, record) => {
        const paymentMethodLabel = paymentOptions.find(p => p.value === record.payment?.paymentMethod)?.label || record.payment?.paymentMethod;
        const paymentStatusConfig = paymentStatusOptions.find(p => p.value === record.payment?.paymentStatus) || 
          { color: 'default', label: record.payment?.paymentStatus || '未知' };
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              {paymentMethodLabel || '未知'}
            </div>
            <Tag color={paymentStatusConfig.color} size="small">
              {paymentStatusConfig.label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: '配送方式',
      key: 'deliveryMethod',
      width: 100,
      render: (text, record) => (
        <div>
          {record.delivery?.deliveryMethod === 'home_delivery' ? '送货上门' : 
           record.delivery?.deliveryMethod || '未知'}
        </div>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 100,
      render: (status) => {
        const statusConfig = statusOptions.find(s => s.value === status) || 
          { color: 'default', label: status || '未知' };
        return <Tag color={statusConfig.color}>{statusConfig.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (text, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Select
            size="small"
            value={record.orderStatus}
            style={{ width: 80 }}
            onChange={(value) => handleUpdateOrderStatus(record._id, value)}
          >
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Select
            size="small"
            value={record.payment?.paymentStatus}
            style={{ width: 80 }}
            onChange={(value) => handleUpdatePaymentStatus(record._id, value)}
          >
            {paymentStatusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
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

  // 更新订单状态
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, { status: newStatus });
      if (response.code === 200) {
        message.success('状态更新成功');
        fetchData();
      } else {
        message.error(response.message || '状态更新失败');
      }
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error('状态更新失败');
    }
  };

  // 更新支付状态
  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      const response = await updatePaymentStatus(orderId, { status: newStatus });
      if (response.code === 200) {
        message.success('支付状态更新成功');
        fetchData();
      } else {
        message.error(response.message || '支付状态更新失败');
      }
    } catch (error) {
      console.error('更新支付状态失败:', error);
      message.error('支付状态更新失败');
    }
  };

  // 批量操作
  const handleBatchOperation = async (operation, orderIds) => {
    try {
      const response = await batchOperateOrders({
        operation,
        orderIds: orderIds || selectedRowKeys
      });
      if (response.code === 200) {
        message.success('批量操作成功');
        fetchData();
        setSelectedRowKeys([]);
      } else {
        message.error(response.message || '批量操作失败');
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      message.error('批量操作失败');
    }
  };

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await getOrderStatistics();
      if (response.code === 200) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
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
    fetchStatistics();
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
                value={searchParams.orderId}
                onChange={(e) => setSearchParams({ ...searchParams, orderId: e.target.value })}
                allowClear
            />
          </Col>
            <Col span={6}>
            <Select
              placeholder="请选择订单状态"
              value={searchParams.orderStatus}
              onChange={(value) => setSearchParams({ ...searchParams, orderStatus: value })}
              allowClear
              style={{ width: '100%' }}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
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
              placeholder="请输入客户姓名"
              value={searchParams.customerName}
              onChange={(e) => setSearchParams({ ...searchParams, customerName: e.target.value })}
              allowClear
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Input
              placeholder="请输入联系电话"
              value={searchParams.customerPhone}
              onChange={(e) => setSearchParams({ ...searchParams, customerPhone: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="请选择订单类型"
              value={searchParams.orderType}
              onChange={(value) => setSearchParams({ ...searchParams, orderType: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="retail">零售订单</Option>
              <Option value="wholesale">批发订单</Option>
              <Option value="return">退货订单</Option>
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
          <Col span={6}>
            <Select
              placeholder="请选择支付状态"
              value={searchParams.paymentStatus}
              onChange={(value) => setSearchParams({ ...searchParams, paymentStatus: value })}
              allowClear
              style={{ width: '100%' }}
            >
              {paymentStatusOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Input
              placeholder="请输入商品名称"
              value={searchParams.productName}
              onChange={(e) => setSearchParams({ ...searchParams, productName: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="最低金额"
              type="number"
              value={searchParams.minAmount}
              onChange={(e) => setSearchParams({ ...searchParams, minAmount: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="最高金额"
              type="number"
              value={searchParams.maxAmount}
              onChange={(e) => setSearchParams({ ...searchParams, maxAmount: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
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
              <Button 
                type="primary" 
                icon={<ExportOutlined />}
                style={{ background: '#52c41a' }}
              >
                导出
              </Button>
              <Button 
                icon={<BarChartOutlined />}
                onClick={fetchStatistics}
              >
                刷新统计
              </Button>
              {selectedRowKeys.length > 0 && (
                <>
                  <Button 
                    type="primary"
                    onClick={() => handleBatchOperation('confirm')}
                  >
                    批量确认 ({selectedRowKeys.length})
                  </Button>
                  <Button 
                    danger
                    onClick={() => handleBatchOperation('cancel')}
                  >
                    批量取消 ({selectedRowKeys.length})
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* 统计信息 */}
        {statistics && (
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#1890ff', fontWeight: 'bold' }}>
                    {statistics.totalOrders || 0}
                  </div>
                  <div>总订单数</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#52c41a', fontWeight: 'bold' }}>
                    ¥{statistics.totalRevenue || 0}
                  </div>
                  <div>总收入</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#faad14', fontWeight: 'bold' }}>
                    {statistics.pendingOrders || 0}
                  </div>
                  <div>待处理订单</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#f5222d', fontWeight: 'bold' }}>
                    {statistics.unpaidOrders || 0}
                  </div>
                  <div>未支付订单</div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.orderStatus === 'completed' || record.orderStatus === 'cancelled',
            }),
          }}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          rowKey={(record) => record._id || record.id || record.orderId}
          scroll={{ x: 1400 }}
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
            <Descriptions.Item label="订单编号">{currentOrder.orderId}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(currentOrder.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="客户姓名">{currentOrder.customer?.customerName}</Descriptions.Item>
            <Descriptions.Item label="客户电话">{currentOrder.customer?.customerPhone}</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{currentOrder.pricing?.totalAmount}</Descriptions.Item>
            <Descriptions.Item label="支付方式">
              {paymentOptions.find(p => p.value === currentOrder.payment?.paymentMethod)?.label || currentOrder.payment?.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="支付状态">
              <Tag color={paymentStatusOptions.find(p => p.value === currentOrder.payment?.paymentStatus)?.color || 'default'}>
                {paymentStatusOptions.find(p => p.value === currentOrder.payment?.paymentStatus)?.label || currentOrder.payment?.paymentStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={statusOptions.find(s => s.value === currentOrder.orderStatus)?.color || 'default'}>
                {statusOptions.find(s => s.value === currentOrder.orderStatus)?.label || currentOrder.orderStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="配送方式">
              {currentOrder.delivery?.deliveryMethod === 'home_delivery' ? '送货上门' : currentOrder.delivery?.deliveryMethod}
            </Descriptions.Item>
            <Descriptions.Item label="配送地址" span={2}>
              {currentOrder.customer?.customerAddress}
            </Descriptions.Item>
          </Descriptions>
        )}
        
        {/* 商品列表 */}
        {currentOrder && currentOrder.products && currentOrder.products.length > 0 && (
          <>
            <Divider>商品明细</Divider>
            <Table
              dataSource={currentOrder.products}
              pagination={false}
              size="small"
              rowKey={(record, index) => index}
              columns={[
                {
                  title: '商品名称',
                  dataIndex: 'productName',
                  key: 'productName',
                },
                {
                  title: '规格',
                  dataIndex: 'specifications',
                  key: 'specifications',
                },
                {
                  title: '单价',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (price) => `¥${price}`,
                },
                {
                  title: '数量',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: '小计',
                  key: 'subtotal',
                  render: (text, record) => `¥${(record.unitPrice * record.quantity).toFixed(2)}`,
                },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
    </OrderLayout>
  );
};

export default OrdersList;
