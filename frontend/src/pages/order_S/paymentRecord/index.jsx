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
import { useTranslation } from 'react-i18next';
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
    pageSize: 2,
    total: 0
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getPaymentRecordsList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });

      if (response.code === 200) {
        setAllData(response.data.list || []);
        setFilteredData(response.data.list || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          current: response.data.page || 1,
          pageSize: response.data.pageSize || 10
        }));
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取支付记录失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



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

  // 获取支付状态显示文本
  const getPaymentStatusText = (status) => {
    const option = paymentStatusOptions.find(item => item.value === status);
    return option ? option.label : status;
  };

  // 获取支付状态显示标签
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
      render: (amount) => amount != null ? `¥${Number(amount).toFixed(2)}` : '¥0.00'
    },
    {
      title: '实收金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 100,
      render: (amount) => amount != null ? `¥${Number(amount).toFixed(2)}` : '¥0.00'
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

  // 搜索处理 - 使用服务端搜索
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      // 处理搜索参数
      const searchParams = {};

      if (values.paymentId) {
        searchParams.paymentId = values.paymentId.trim();
      }

      if (values.orderId) {
        searchParams.orderId = values.orderId.trim();
      }

      if (values.merchantName) {
        searchParams.merchantName = values.merchantName.trim();
      }

      if (values.customerPhone) {
        searchParams.customerPhone = values.customerPhone.trim();
      }

      if (values.paymentMethod) {
        searchParams.paymentMethod = values.paymentMethod;
      }

      if (values.paymentStatus) {
        searchParams.paymentStatus = values.paymentStatus;
      }

      // 处理时间范围
      if (values.paymentTime && values.paymentTime.length === 2) {
        searchParams.paymentTimeStart = values.paymentTime[0].format('YYYY-MM-DD HH:mm:ss');
        searchParams.paymentTimeEnd = values.paymentTime[1].format('YYYY-MM-DD HH:mm:ss');
      }

      // 调用API进行搜索
      const response = await getPaymentRecordsList({
        page: 1, // 搜索时重置到第一页
        pageSize: pagination.pageSize,
        ...searchParams
      });

      if (response.code === 200) {
        setAllData(response.data.list || []);
        setFilteredData(response.data.list || []);
        setPagination(prev => ({
          ...prev,
          current: 1,
          total: response.data.total || 0
        }));
        message.success(`找到 ${response.data.total || 0} 条匹配记录`);
      } else {
        message.error(response.message || '搜索失败');
      }
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置处理 - 重新获取所有数据
  const handleReset = async () => {
    form.resetFields();
    setLoading(true);

    try {
      const response = await getPaymentRecordsList({
        page: 1,
        pageSize: pagination.pageSize
      });

      if (response.code === 200) {
        setAllData(response.data.list || []);
        setFilteredData(response.data.list || []);
        setPagination(prev => ({
          ...prev,
          current: 1,
          total: response.data.total || 0
        }));
        message.success('已重置搜索条件');
      } else {
        message.error('重置失败');
      }
    } catch (error) {
      console.error('重置失败:', error);
      message.error('重置失败');
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 导出处理
  const handleExport = async () => {
    if (filteredData.length === 0) {
      message.warning('没有数据可导出');
      return;
    }

    try {
      setLoading(true);

      // 获取当前搜索条件的所有数据
      const formValues = form.getFieldsValue();
      const searchParams = {};

      if (formValues.paymentId) searchParams.paymentId = formValues.paymentId.trim();
      if (formValues.orderId) searchParams.orderId = formValues.orderId.trim();
      if (formValues.merchantName) searchParams.merchantName = formValues.merchantName.trim();
      if (formValues.customerPhone) searchParams.customerPhone = formValues.customerPhone.trim();
      if (formValues.paymentMethod) searchParams.paymentMethod = formValues.paymentMethod;
      if (formValues.paymentStatus) searchParams.paymentStatus = formValues.paymentStatus;

      if (formValues.paymentTime && formValues.paymentTime.length === 2) {
        searchParams.paymentTimeStart = formValues.paymentTime[0].format('YYYY-MM-DD HH:mm:ss');
        searchParams.paymentTimeEnd = formValues.paymentTime[1].format('YYYY-MM-DD HH:mm:ss');
      }

      // 获取所有数据用于导出
      const response = await getPaymentRecordsList({
        page: 1,
        pageSize: 10000, // 获取大量数据用于导出
        ...searchParams
      });

      if (response.code === 200) {
        const exportData = response.data.list || [];

        // 创建CSV内容
        const headers = [
          '收款单号', '关联订单', '所属商家', '支付方式', '订单金额',
          '实收金额', '支付状态', '支付时间', '客户电话', '交易流水号', '备注'
        ];

        const csvContent = [
          headers.join(','),
          ...exportData.map(record => [
            record.paymentId || '',
            record.orderId || '',
            record.merchantName || '',
            getPaymentMethodText(record.paymentMethod) || '',
            record.paymentAmount ? `¥${Number(record.paymentAmount).toFixed(2)}` : '',
            record.actualAmount ? `¥${Number(record.actualAmount).toFixed(2)}` : '',
            getPaymentStatusText(record.paymentStatus) || '',
            record.paymentTime ? new Date(record.paymentTime).toLocaleString('zh-CN') : '',
            record.customerPhone || '',
            record.transactionId || '',
            record.remarks || ''
          ].join(','))
        ].join('\n');

        // 下载文件
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `收款记录_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        message.success(`成功导出 ${exportData.length} 条记录`);
      } else {
        message.error('导出失败：' + response.message);
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
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
    if (!paginationConfig) return;

    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current || prev.current,
      pageSize: paginationConfig.pageSize || prev.pageSize
    }));
  };

  // 处理页码变化
  const handlePageChange = (page, pageSize) => {
    const newPagination = {
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize
    };
    setPagination(newPagination);

    // 重新获取数据
    fetchDataWithPagination(newPagination);
  };

  // 处理页大小变化
  const handlePageSizeChange = (current, size) => {
    const newPagination = {
      ...pagination,
      current: 1, // 改变页大小时重置到第一页
      pageSize: size
    };
    setPagination(newPagination);

    // 重新获取数据
    fetchDataWithPagination(newPagination);
  };

  // 带分页参数获取数据
  const fetchDataWithPagination = async (paginationParams = pagination) => {
    setLoading(true);
    try {
      const response = await getPaymentRecordsList({
        page: paginationParams.current,
        pageSize: paginationParams.pageSize,
      });

      if (response.code === 200) {
        setAllData(response.data.list || []);
        setFilteredData(response.data.list || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          current: response.data.page || paginationParams.current,
          pageSize: response.data.pageSize || paginationParams.pageSize
        }));
      } else {
        message.error(response.message || '获取数据失败');
        setAllData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('获取支付记录失败:', error);
      message.error('获取数据失败');
      setAllData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // 注意：现在使用服务端分页，filteredData已经是当前页的数据

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
                  <Input placeholder="请输入商家名称" />
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
                <Form.Item label="客户电话" name="customerPhone">
                  <Input placeholder="请输入客户电话" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="支付时间" name="paymentTime">
                  <RangePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                  <Space size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                      loading={loading}
                      size="large"
                    >
                      搜索
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleReset}
                      size="large"
                    >
                      重置
                    </Button>
                    <Button
                      type="dashed"
                      icon={<FileExcelOutlined />}
                      onClick={handleExport}
                      size="large"
                    >
                      导出Excel
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
            dataSource={filteredData}
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
              onChange={handlePageChange}
              onShowSizeChange={handlePageSizeChange}
              pageSizeOptions={['2', '5', '10', '20']}
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
                  <strong>订单金额：</strong>¥{selectedRecord.paymentAmount != null ? Number(selectedRecord.paymentAmount).toFixed(2) : '0.00'}
                </Col>
                <Col span={12}>
                  <strong>实收金额：</strong>¥{selectedRecord.actualAmount != null ? Number(selectedRecord.actualAmount).toFixed(2) : '0.00'}
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
};

export default PaymentRecord;
