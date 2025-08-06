import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Space,
  Tag,
  Modal,
  Row,
  Col,
  message,
  Tooltip,
  Pagination
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { getPaymentRecordsList } from '../../../api/orders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentRecord = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 模拟数据
  const mockData = useMemo(() => [
    {
      id: 1,
      paymentId: 'PAY202312010001',
      orderId: 'ORD202312010001',
      merchantName: '清风便利店',
      paymentMethod: 'wechat',
      paymentAmount: 128.50,
      actualAmount: 128.50,
      paymentStatus: 'paid',
      paymentTime: '2023-12-01 10:30:15',
      customerPhone: '13800138000',
      transactionId: 'WX20231201103015123456',
      remarks: '正常支付'
    },
    {
      id: 2,
      paymentId: 'PAY202312010002',
      orderId: 'ORD202312010002',
      merchantName: '星期八超市',
      paymentMethod: 'alipay',
      paymentAmount: 89.90,
      actualAmount: 89.90,
      paymentStatus: 'paid',
      paymentTime: '2023-12-01 14:20:30',
      customerPhone: '13900139000',
      transactionId: 'ALI20231201142030789012',
      remarks: ''
    },
    {
      id: 3,
      paymentId: 'PAY202312010003',
      orderId: 'ORD202312010003',
      merchantName: '清风便利店',
      paymentMethod: 'cash',
      paymentAmount: 45.00,
      actualAmount: 45.00,
      paymentStatus: 'paid',
      paymentTime: '2023-12-01 16:45:12',
      customerPhone: '13700137000',
      transactionId: '',
      remarks: '现金支付'
    },
    {
      id: 4,
      paymentId: 'PAY202312010004',
      orderId: 'ORD202312010004',
      merchantName: '星期八超市',
      paymentMethod: 'wechat',
      paymentAmount: 256.80,
      actualAmount: 250.00,
      paymentStatus: 'refunding',
      paymentTime: '2023-12-01 18:15:45',
      customerPhone: '13600136000',
      transactionId: 'WX20231201181545654321',
      remarks: '部分退款中'
    }
  ], []);

  // 初始化数据
  useEffect(() => {
    setAllData(mockData);
    setFilteredData(mockData);
    setPagination(prev => ({ ...prev, total: mockData.length }));
  }, [mockData]);

  // 支付方式选项
  const paymentMethodOptions = [
    { value: 'wechat', label: '微信支付' },
    { value: 'alipay', label: '支付宝' },
    { value: 'cash', label: '现金' },
    { value: 'card', label: '刷卡' },
    { value: 'bank_transfer', label: '银行转账' }
  ];

  // 支付状态选项
  const paymentStatusOptions = [
    { value: 'paid', label: '已支付' },
    { value: 'refunding', label: '退款中' },
    { value: 'refunded', label: '已退款' },
    { value: 'failed', label: '支付失败' }
  ];

  // 获取支付方式显示文本
  const getPaymentMethodText = (method) => {
    const option = paymentMethodOptions.find(item => item.value === method);
    return option ? option.label : method;
  };

  // 获取支付状态显示
  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      paid: { color: 'success', text: '已支付' },
      refunding: { color: 'warning', text: '退款中' },
      refunded: { color: 'default', text: '已退款' },
      failed: { color: 'error', text: '支付失败' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列配置
  const columns = [
    {
      title: '收款单号',
      dataIndex: 'paymentId',
      key: 'paymentId',
      width: 150,
      fixed: 'left'
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 150
    },
    {
      title: '所属商家',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 120
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method) => getPaymentMethodText(method)
    },
    {
      title: '订单金额',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      width: 100,
      render: (amount) => `¥${amount.toFixed(2)}`
    },
    {
      title: '实收金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 100,
      render: (amount) => `¥${amount.toFixed(2)}`
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status) => getPaymentStatusTag(status)
    },
    {
      title: '支付时间',
      dataIndex: 'paymentTime',
      key: 'paymentTime',
      width: 160
    },
    {
      title: '客户电话',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
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
      )
    }
  ];

  // 数据筛选
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按收款单号筛选
      if (params.paymentId && !item.paymentId.toLowerCase().includes(params.paymentId.toLowerCase())) {
        return false;
      }

      // 按订单号筛选
      if (params.orderId && !item.orderId.toLowerCase().includes(params.orderId.toLowerCase())) {
        return false;
      }

      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false;
      }

      // 按支付方式筛选
      if (params.paymentMethod && item.paymentMethod !== params.paymentMethod) {
        return false;
      }

      // 按支付状态筛选
      if (params.paymentStatus && item.paymentStatus !== params.paymentStatus) {
        return false;
      }

      // 按支付时间范围筛选
      if (params.paymentTime && params.paymentTime.length === 2) {
        const [startDate, endDate] = params.paymentTime;
        const itemDate = new Date(item.paymentTime);

        if (startDate && itemDate < startDate.toDate()) {
          return false;
        }

        if (endDate && itemDate > endDate.toDate()) {
          return false;
        }
      }

      return true;
    });
  };

  // 搜索处理
  const handleSearch = (values) => {
    setLoading(true);

    setTimeout(() => {
      const filtered = filterData(allData, values);
      setFilteredData(filtered);
      setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
      setLoading(false);
    }, 500);
  };

  // 重置处理
  const handleReset = () => {
    form.resetFields();
    setFilteredData(allData);
    setPagination(prev => ({ ...prev, current: 1, total: allData.length }));
    message.info('已重置搜索条件');
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 导出处理
  const handleExport = () => {
    message.success('导出成功');
  };

  // 刷新处理
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('刷新成功');
    }, 1000);
  };

  // 分页处理
  const handleTableChange = (paginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
  };

  // 当前页数据
  const currentPageData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination]);

  return (
    <OrderLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索表单 */}
        <Card className="search-card" style={{ marginBottom: '16px' }}>
          <Form form={form} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="收款单号" name="paymentId">
                  <Input placeholder="请输入收款单号" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="订单号" name="orderId">
                  <Input placeholder="请输入订单号" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="所属商家" name="merchantName">
                  <Select placeholder="搜索商家" showSearch style={{ width: '100%' }}>
                    <Option value="清风便利店">清风便利店</Option>
                    <Option value="星期八超市">星期八超市</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="支付方式" name="paymentMethod">
                  <Select placeholder="请选择支付方式" allowClear>
                    {paymentMethodOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="支付状态" name="paymentStatus">
                  <Select placeholder="请选择支付状态" allowClear>
                    {paymentStatusOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="支付时间" name="paymentTime">
                  <RangePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label=" " colon={false}>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      icon={<SearchOutlined />}
                      loading={loading}
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
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 数据表格 */}
        <Card className="table-card">
          <div className="table-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div className="table-title" style={{ fontSize: '16px', fontWeight: 'bold' }}>
              收款记录列表
            </div>
            <div className="table-actions">
              <Space>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExport}
                >
                  导出
                </Button>
                <Tooltip title="刷新">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                  />
                </Tooltip>
              </Space>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={currentPageData}
            rowKey="id"
            pagination={false}
            loading={loading}
            scroll={{ x: 1200 }}
            size="middle"
            className="data-table"
          />

          {/* 分页 */}
          <div className="pagination-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <div className="pagination-info">
              <span>共 {pagination.total} 条</span>
            </div>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
              }
              onChange={handleTableChange}
              pageSizeOptions={['10', '20', '50', '100']}
              defaultPageSize={10}
            />
          </div>
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="收款记录详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={600}
        >
          {selectedRecord && (
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <strong>收款单号：</strong>{selectedRecord.paymentId}
                </Col>
                <Col span={12}>
                  <strong>关联订单：</strong>{selectedRecord.orderId}
                </Col>
                <Col span={12}>
                  <strong>所属商家：</strong>{selectedRecord.merchantName}
                </Col>
                <Col span={12}>
                  <strong>支付方式：</strong>{getPaymentMethodText(selectedRecord.paymentMethod)}
                </Col>
                <Col span={12}>
                  <strong>订单金额：</strong>¥{selectedRecord.paymentAmount.toFixed(2)}
                </Col>
                <Col span={12}>
                  <strong>实收金额：</strong>¥{selectedRecord.actualAmount.toFixed(2)}
                </Col>
                <Col span={12}>
                  <strong>支付状态：</strong>{getPaymentStatusTag(selectedRecord.paymentStatus)}
                </Col>
                <Col span={12}>
                  <strong>支付时间：</strong>{selectedRecord.paymentTime}
                </Col>
                <Col span={12}>
                  <strong>客户电话：</strong>{selectedRecord.customerPhone}
                </Col>
                <Col span={12}>
                  <strong>交易流水号：</strong>{selectedRecord.transactionId || '无'}
                </Col>
                <Col span={24}>
                  <strong>备注：</strong>{selectedRecord.remarks || '无'}
                </Col>
              </Row>
            </div>
        )}
      </Modal>
    </div>
    </OrderLayout>
  );
};export default PaymentRecord;
