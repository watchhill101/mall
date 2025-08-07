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
  Pagination,
  Steps
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { getLogisticsOrdersList } from '../../../api/orders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;

const LogisticsOrder = () => {
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
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);

  // 模拟数据
  const mockData = useMemo(() => [
    {
      id: 1,
      logisticsOrderId: 'LO202312010001',
      orderIds: ['ORD202312010001'],
      merchantName: '清风便利店',
      logisticsType: 'delivery',
      status: 'delivered',
      logisticsCompany: '顺丰速运',
      trackingNumber: 'SF1234567890',
      senderName: '清风便利店',
      senderPhone: '13800138000',
      senderAddress: '北京市朝阳区xxx街道',
      receiverName: '张三',
      receiverPhone: '13900139000',
      receiverAddress: '北京市海淀区xxx小区',
      scheduledDeliveryTime: '2023-12-01 14:00:00',
      actualDeliveryTime: '2023-12-01 13:45:00',
      totalFee: 12.00,
      paymentStatus: 'paid',
      signatory: '张三',
      createTime: '2023-12-01 10:30:00',
      remarks: '正常配送'
    },
    {
      id: 2,
      logisticsOrderId: 'LO202312010002',
      orderIds: ['ORD202312010002', 'ORD202312010003'],
      merchantName: '星期八超市',
      logisticsType: 'pickup',
      status: 'in_transit',
      logisticsCompany: '中通快递',
      trackingNumber: 'ZT9876543210',
      senderName: '李四',
      senderPhone: '13700137000',
      senderAddress: '北京市丰台区xxx路',
      receiverName: '星期八超市',
      receiverPhone: '13600136000',
      receiverAddress: '北京市西城区xxx大厦',
      scheduledDeliveryTime: '2023-12-01 16:00:00',
      actualDeliveryTime: '',
      totalFee: 15.50,
      paymentStatus: 'paid',
      signatory: '',
      createTime: '2023-12-01 11:20:00',
      remarks: '退货取件'
    },
    {
      id: 3,
      logisticsOrderId: 'LO202312010003',
      orderIds: ['ORD202312010004'],
      merchantName: '清风便利店',
      logisticsType: 'transfer',
      status: 'picked_up',
      logisticsCompany: '圆通速递',
      trackingNumber: 'YT5555666677',
      senderName: '清风便利店A店',
      senderPhone: '13500135000',
      senderAddress: '北京市昌平区xxx商场',
      receiverName: '清风便利店B店',
      receiverPhone: '13400134000',
      receiverAddress: '北京市顺义区xxx街道',
      scheduledDeliveryTime: '2023-12-01 18:00:00',
      actualDeliveryTime: '',
      totalFee: 8.00,
      paymentStatus: 'paid',
      signatory: '',
      createTime: '2023-12-01 15:10:00',
      remarks: '店间调拨'
    },
    {
      id: 4,
      logisticsOrderId: 'LO202312010004',
      orderIds: ['ORD202312010005'],
      merchantName: '星期八超市',
      logisticsType: 'return',
      status: 'cancelled',
      logisticsCompany: '申通快递',
      trackingNumber: 'ST1111222233',
      senderName: '王五',
      senderPhone: '13300133000',
      senderAddress: '北京市房山区xxx小区',
      receiverName: '星期八超市',
      receiverPhone: '13200132000',
      receiverAddress: '北京市石景山区xxx广场',
      scheduledDeliveryTime: '2023-12-01 20:00:00',
      actualDeliveryTime: '',
      totalFee: 10.00,
      paymentStatus: 'unpaid',
      signatory: '',
      createTime: '2023-12-01 16:45:00',
      remarks: '订单取消，物流取消'
    }
  ], []);

  // 初始化数据
  useEffect(() => {
    setAllData(mockData);
    setFilteredData(mockData);
    setPagination(prev => ({ ...prev, total: mockData.length }));
  }, [mockData]);

  // 物流类型选项
  const logisticsTypeOptions = [
    { value: 'delivery', label: '配送' },
    { value: 'pickup', label: '取货' },
    { value: 'transfer', label: '调拨' },
    { value: 'return', label: '退货' }
  ];

  // 物流状态选项
  const statusOptions = [
    { value: 'pending', label: '待处理' },
    { value: 'assigned', label: '已分配' },
    { value: 'picked_up', label: '已取件' },
    { value: 'in_transit', label: '运输中' },
    { value: 'delivered', label: '已送达' },
    { value: 'returned', label: '已退回' },
    { value: 'cancelled', label: '已取消' }
  ];

  // 获取物流类型显示文本
  const getLogisticsTypeText = (type) => {
    const option = logisticsTypeOptions.find(item => item.value === type);
    return option ? option.label : type;
  };

  // 获取物流状态显示
  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'default', text: '待处理' },
      assigned: { color: 'blue', text: '已分配' },
      picked_up: { color: 'cyan', text: '已取件' },
      in_transit: { color: 'processing', text: '运输中' },
      delivered: { color: 'success', text: '已送达' },
      returned: { color: 'warning', text: '已退回' },
      cancelled: { color: 'error', text: '已取消' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取支付状态显示
  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      unpaid: { color: 'error', text: '未支付' },
      paid: { color: 'success', text: '已支付' },
      partial_paid: { color: 'warning', text: '部分支付' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列配置
  const columns = [
    {
      title: '物流单号',
      dataIndex: 'logisticsOrderId',
      key: 'logisticsOrderId',
      width: 150,
      fixed: 'left'
    },
    {
      title: '运单号',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      width: 130
    },
    {
      title: '关联订单',
      dataIndex: 'orderIds',
      key: 'orderIds',
      width: 180,
      render: (orderIds) => (
        <div style={{ maxHeight: '60px', overflow: 'auto' }}>
          {orderIds && Array.isArray(orderIds) ? orderIds.map(orderId => (
            <div key={orderId} style={{ fontSize: '12px' }}>{orderId}</div>
          )) : <div style={{ fontSize: '12px', color: '#999' }}>无关联订单</div>}
        </div>
      )
    },
    {
      title: '所属商家',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 120
    },
    {
      title: '物流类型',
      dataIndex: 'logisticsType',
      key: 'logisticsType',
      width: 100,
      render: (type) => getLogisticsTypeText(type)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '物流公司',
      dataIndex: 'logisticsCompany',
      key: 'logisticsCompany',
      width: 100
    },
    {
      title: '发件人',
      dataIndex: 'senderName',
      key: 'senderName',
      width: 100,
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.senderPhone}
          </div>
        </div>
      )
    },
    {
      title: '收件人',
      dataIndex: 'receiverName',
      key: 'receiverName',
      width: 100,
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.receiverPhone}
          </div>
        </div>
      )
    },
    {
      title: '运费',
      dataIndex: 'totalFee',
      key: 'totalFee',
      width: 80,
      render: (fee) => fee != null ? `¥${Number(fee).toFixed(2)}` : '¥0.00'
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status) => getPaymentStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
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
          <Button 
            type="link" 
            size="small"
            icon={<EnvironmentOutlined />}
            onClick={() => handleTrackingDetail(record)}
          >
            跟踪
          </Button>
        </Space>
      )
    }
  ];

  // 数据筛选
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按物流单号筛选
      if (params.logisticsOrderId && !item.logisticsOrderId.toLowerCase().includes(params.logisticsOrderId.toLowerCase())) {
        return false;
      }

      // 按运单号筛选
      if (params.trackingNumber && !item.trackingNumber.toLowerCase().includes(params.trackingNumber.toLowerCase())) {
        return false;
      }

      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false;
      }

      // 按物流类型筛选
      if (params.logisticsType && item.logisticsType !== params.logisticsType) {
        return false;
      }

      // 按状态筛选
      if (params.status && item.status !== params.status) {
        return false;
      }

      // 按物流公司筛选
      if (params.logisticsCompany && !item.logisticsCompany.toLowerCase().includes(params.logisticsCompany.toLowerCase())) {
        return false;
      }

      // 按创建时间范围筛选
      if (params.createTime && params.createTime.length === 2) {
        const [startDate, endDate] = params.createTime;
        const itemDate = new Date(item.createTime);

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

  // 物流跟踪
  const handleTrackingDetail = (record) => {
    setSelectedRecord(record);
    setTrackingModalVisible(true);
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

  // 获取物流跟踪步骤
  const getTrackingSteps = (record) => {
    const statusMap = {
      pending: 0,
      assigned: 1,
      picked_up: 2,
      in_transit: 3,
      delivered: 4,
      returned: 4,
      cancelled: -1
    };
    
    const current = statusMap[record.status] || 0;
    
    return {
      current: current === -1 ? 0 : current,
      status: current === -1 ? 'error' : 'process',
      steps: [
        { title: '待处理', description: record.createTime },
        { title: '已分配', description: '分配物流公司' },
        { title: '已取件', description: '快递员已取件' },
        { title: '运输中', description: '包裹运输中' },
        { title: record.status === 'returned' ? '已退回' : '已送达', 
          description: record.actualDeliveryTime || '预计送达时间：' + record.scheduledDeliveryTime }
      ]
    };
  };

  return (
    <OrderLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索表单 */}
        <Card className="search-card" style={{ marginBottom: '16px' }}>
          <Form form={form} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="物流单号" name="logisticsOrderId">
                  <Input placeholder="请输入物流单号" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="运单号" name="trackingNumber">
                  <Input placeholder="请输入运单号" />
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
                <Form.Item label="物流类型" name="logisticsType">
                  <Select placeholder="请选择物流类型" allowClear>
                    {logisticsTypeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="状态" name="status">
                  <Select placeholder="请选择状态" allowClear>
                    {statusOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="物流公司" name="logisticsCompany">
                  <Input placeholder="请输入物流公司" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="创建时间" name="createTime">
                  <RangePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
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
              物流单列表
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
            scroll={{ x: 1800 }}
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
          title="物流单详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          {selectedRecord && (
            <div style={{ padding: '16px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <strong>物流单号：</strong>{selectedRecord.logisticsOrderId}
                </Col>
                <Col span={12}>
                  <strong>运单号：</strong>{selectedRecord.trackingNumber}
                </Col>
                <Col span={12}>
                  <strong>物流类型：</strong>{getLogisticsTypeText(selectedRecord.logisticsType)}
                </Col>
                <Col span={12}>
                  <strong>所属商家：</strong>{selectedRecord.merchantName}
                </Col>
                <Col span={12}>
                  <strong>状态：</strong>{getStatusTag(selectedRecord.status)}
                </Col>
                <Col span={12}>
                  <strong>物流公司：</strong>{selectedRecord.logisticsCompany}
                </Col>
                <Col span={24}>
                  <strong>发件人信息：</strong>
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5' }}>
                    <div>姓名：{selectedRecord.senderName}</div>
                    <div>电话：{selectedRecord.senderPhone}</div>
                    <div>地址：{selectedRecord.senderAddress}</div>
                  </div>
                </Col>
                <Col span={24}>
                  <strong>收件人信息：</strong>
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5' }}>
                    <div>姓名：{selectedRecord.receiverName}</div>
                    <div>电话：{selectedRecord.receiverPhone}</div>
                    <div>地址：{selectedRecord.receiverAddress}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <strong>预计送达时间：</strong>{selectedRecord.scheduledDeliveryTime}
                </Col>
                <Col span={12}>
                  <strong>实际送达时间：</strong>{selectedRecord.actualDeliveryTime || '未送达'}
                </Col>
                <Col span={12}>
                  <strong>运费：</strong>¥{selectedRecord.totalFee != null ? Number(selectedRecord.totalFee).toFixed(2) : '0.00'}
                </Col>
                <Col span={12}>
                  <strong>支付状态：</strong>{getPaymentStatusTag(selectedRecord.paymentStatus)}
                </Col>
                <Col span={12}>
                  <strong>签收人：</strong>{selectedRecord.signatory || '未签收'}
                </Col>
                <Col span={12}>
                  <strong>创建时间：</strong>{selectedRecord.createTime}
                </Col>
                <Col span={24}>
                  <strong>关联订单：</strong>
                  <div style={{ marginTop: '8px' }}>
                    {selectedRecord.orderIds && Array.isArray(selectedRecord.orderIds) ? 
                      selectedRecord.orderIds.map(orderId => (
                        <Tag key={orderId} style={{ margin: '2px' }}>{orderId}</Tag>
                      )) : 
                      <span>无关联订单</span>
                    }
                  </div>
                </Col>
                <Col span={24}>
                  <strong>备注：</strong>{selectedRecord.remarks || '无'}
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 物流跟踪模态框 */}
        <Modal
          title="物流跟踪"
          open={trackingModalVisible}
          onCancel={() => setTrackingModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setTrackingModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={600}
        >
          {selectedRecord && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  运单号：{selectedRecord.trackingNumber}
                </div>
                <div style={{ color: '#666' }}>
                  物流公司：{selectedRecord.logisticsCompany}
                </div>
              </div>
              
              <Steps
                {...getTrackingSteps(selectedRecord)}
                direction="vertical"
                size="small"
              />
            </div>
        )}
      </Modal>
    </div>
    </OrderLayout>
  );
};

export default LogisticsOrder;
