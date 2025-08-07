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
  Progress
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  EditOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import {
  getAllocationOrdersList,
  getAllocationOrderDetail,
  generateAllocationTestData,
  clearAllocationTestData
} from '../../../api/orders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AllocationOrder = () => {
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
  const [searchParams, setSearchParams] = useState({});

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getAllocationOrdersList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
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
      console.error('获取配货单列表失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 配货类型选项
  const allocationTypeOptions = [
    { value: 'order_allocation', label: '订单配货' },
    { value: 'stock_transfer', label: '库存调拨' },
    { value: 'emergency_allocation', label: '紧急配货' },
    { value: 'bulk_allocation', label: '批量配货' }
  ];

  // 配货状态选项
  const statusOptions = [
    { value: 'pending', label: '待配货' },
    { value: 'allocated', label: '已配货' },
    { value: 'confirmed', label: '已确认' },
    { value: 'cancelled', label: '已取消' }
  ];

  // 优先级选项
  const priorityOptions = [
    { value: 1, label: '最低' },
    { value: 2, label: '低' },
    { value: 3, label: '中' },
    { value: 4, label: '高' },
    { value: 5, label: '最高' }
  ];

  // 获取配货类型显示文本
  const getAllocationTypeText = (type) => {
    const option = allocationTypeOptions.find(item => item.value === type);
    return option ? option.label : type;
  };

  // 获取配货状态显示
  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'default', text: '待配货' },
      allocated: { color: 'processing', text: '已配货' },
      confirmed: { color: 'success', text: '已确认' },
      cancelled: { color: 'error', text: '已取消' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取优先级显示
  const getPriorityTag = (priority) => {
    const priorityConfig = {
      1: { color: 'default', text: '最低' },
      2: { color: 'blue', text: '低' },
      3: { color: 'cyan', text: '中' },
      4: { color: 'orange', text: '高' },
      5: { color: 'red', text: '最高' }
    };
    const config = priorityConfig[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列配置
  const columns = [
    {
      title: '配货单号',
      dataIndex: 'allocationId',
      key: 'allocationId',
      width: 150,
      fixed: 'left'
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
      title: '配货类型',
      dataIndex: 'allocationType',
      key: 'allocationType',
      width: 100,
      render: (type) => getAllocationTypeText(type)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => getPriorityTag(priority)
    },
    {
      title: '配货进度',
      dataIndex: 'allocationRate',
      key: 'allocationRate',
      width: 120,
      render: (rate, record) => (
        <div>
          <Progress
            percent={rate}
            size="small"
            status={rate === 100 ? 'success' : rate < 60 ? 'exception' : 'active'}
          />
          <div style={{ fontSize: '12px', marginTop: '2px' }}>
            {record.allocatedQuantity}/{record.plannedQuantity}
          </div>
        </div>
      )
    },
    {
      title: '配货员',
      dataIndex: 'allocator',
      key: 'allocator',
      width: 80
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount) => amount != null ? `¥${Number(amount).toFixed(2)}` : '¥0.00'
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
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'allocated') && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleConfirm(record)}
            >
              确认
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 数据筛选
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按配货单号筛选
      if (params.allocationId && !item.allocationId.toLowerCase().includes(params.allocationId.toLowerCase())) {
        return false;
      }

      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false;
      }

      // 按配货类型筛选
      if (params.allocationType && item.allocationType !== params.allocationType) {
        return false;
      }

      // 按状态筛选
      if (params.status && item.status !== params.status) {
        return false;
      }

      // 按优先级筛选
      if (params.priority && item.priority !== params.priority) {
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

  // 搜索处理 - 使用服务端搜索
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      // 处理搜索参数
      const searchParams = {};

      if (values.allocationId) {
        searchParams.allocationId = values.allocationId.trim();
      }

      if (values.merchantName) {
        searchParams.merchantName = values.merchantName.trim();
      }

      if (values.allocationType) {
        searchParams.allocationType = values.allocationType;
      }

      if (values.status) {
        searchParams.status = values.status;
      }

      if (values.priority) {
        searchParams.priority = values.priority;
      }

      // 处理时间范围
      if (values.createTime && values.createTime.length === 2) {
        searchParams.createTimeStart = values.createTime[0].format('YYYY-MM-DD HH:mm:ss');
        searchParams.createTimeEnd = values.createTime[1].format('YYYY-MM-DD HH:mm:ss');
      }

      // 调用API进行搜索
      const response = await getAllocationOrdersList({
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
      const response = await getAllocationOrdersList({
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

  // 编辑处理
  const handleEdit = (record) => {
    message.info(`编辑配货单：${record.allocationId}`);
  };

  // 确认处理
  const handleConfirm = (record) => {
    Modal.confirm({
      title: '确认配货',
      content: `确定要确认配货单 "${record.allocationId}" 吗？`,
      onOk: () => {
        message.success('配货确认成功');
      }
    });
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

      if (formValues.allocationId) searchParams.allocationId = formValues.allocationId.trim();
      if (formValues.merchantName) searchParams.merchantName = formValues.merchantName.trim();
      if (formValues.allocationType) searchParams.allocationType = formValues.allocationType;
      if (formValues.status) searchParams.status = formValues.status;
      if (formValues.priority) searchParams.priority = formValues.priority;

      if (formValues.createTime && formValues.createTime.length === 2) {
        searchParams.createTimeStart = formValues.createTime[0].format('YYYY-MM-DD HH:mm:ss');
        searchParams.createTimeEnd = formValues.createTime[1].format('YYYY-MM-DD HH:mm:ss');
      }

      // 获取所有数据用于导出
      const response = await getAllocationOrdersList({
        page: 1,
        pageSize: 10000, // 获取大量数据用于导出
        ...searchParams
      });

      if (response.code === 200) {
        const exportData = response.data.list || [];

        // 创建CSV内容
        const headers = [
          '配货单号', '所属商家', '配货类型', '状态', '优先级',
          '配货进度', '配货员', '总金额', '创建时间', '备注'
        ];

        const csvContent = [
          headers.join(','),
          ...exportData.map(record => [
            record.allocationId || '',
            record.merchantName || '',
            getAllocationTypeText(record.allocationType) || '',
            record.status || '',
            record.priority || '',
            `${record.allocationRate || 0}%`,
            record.allocator || '',
            record.totalAmount ? `¥${Number(record.totalAmount).toFixed(2)}` : '',
            record.createTime ? new Date(record.createTime).toLocaleString('zh-CN') : '',
            record.remarks || ''
          ].join(','))
        ].join('\n');

        // 下载文件
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `配货单_${new Date().toISOString().slice(0, 10)}.csv`;
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

  // 生成测试数据
  const handleGenerateTestData = async () => {
    setLoading(true);
    try {
      const response = await generateAllocationTestData({ count: 10 });
      if (response.code === 200) {
        message.success(response.message);
        // 重新获取数据
        await fetchData();
      } else {
        message.error(response.message || '生成测试数据失败');
      }
    } catch (error) {
      console.error('生成测试数据失败:', error);
      message.error('生成测试数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 清空测试数据
  const handleClearTestData = async () => {
    Modal.confirm({
      title: '确认清空数据',
      content: '确定要清空所有配货单数据吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await clearAllocationTestData();
          if (response.code === 200) {
            message.success(response.message);
            // 重新获取数据
            await fetchData();
          } else {
            message.error(response.message || '清空数据失败');
          }
        } catch (error) {
          console.error('清空数据失败:', error);
          message.error('清空数据失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 刷新处理
  const handleRefresh = async () => {
    await fetchData();
    message.success('刷新成功');
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
      const response = await getAllocationOrdersList({
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
      console.error('获取配货单列表失败:', error);
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
                <Form.Item label="配货单号" name="allocationId">
                  <Input placeholder="请输入配货单号" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="所属商家" name="merchantName">
                  <Input placeholder="请输入商家名称" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="配货类型" name="allocationType">
                  <Select placeholder="请选择配货类型" allowClear>
                    {allocationTypeOptions.map(option => (
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
                <Form.Item label="优先级" name="priority">
                  <Select placeholder="请选择优先级" allowClear>
                    {priorityOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="创建时间" name="createTime">
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
              配货单列表
            </div>
            <div className="table-actions">
              <Space>
                <Button
                  type="primary"
                  onClick={handleGenerateTestData}
                  loading={loading}
                >
                  生成测试数据
                </Button>
                <Button
                  type="default"
                  danger
                  onClick={handleClearTestData}
                  loading={loading}
                >
                  清空数据
                </Button>
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
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              pageSizeOptions: ['2', '5', '10', '20'],
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange
            }}
            loading={loading}
            scroll={{ x: 1500 }}
            size="middle"
            className="data-table"
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="配货单详情"
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
                  <strong>配货单号：</strong>{selectedRecord.allocationId}
                </Col>
                <Col span={12}>
                  <strong>配货类型：</strong>{getAllocationTypeText(selectedRecord.allocationType)}
                </Col>
                <Col span={12}>
                  <strong>所属商家：</strong>{selectedRecord.merchantName}
                </Col>
                <Col span={12}>
                  <strong>状态：</strong>{getStatusTag(selectedRecord.status)}
                </Col>
                <Col span={12}>
                  <strong>优先级：</strong>{getPriorityTag(selectedRecord.priority)}
                </Col>
                <Col span={12}>
                  <strong>配货员：</strong>{selectedRecord.allocator}
                </Col>
                <Col span={12}>
                  <strong>计划数量：</strong>{selectedRecord.plannedQuantity}
                </Col>
                <Col span={12}>
                  <strong>已配数量：</strong>{selectedRecord.allocatedQuantity}
                </Col>
                <Col span={12}>
                  <strong>配货率：</strong>{selectedRecord.allocationRate}%
                </Col>
                <Col span={12}>
                  <strong>总金额：</strong>¥{selectedRecord.totalAmount != null ? Number(selectedRecord.totalAmount).toFixed(2) : '0.00'}
                </Col>
                <Col span={12}>
                  <strong>计划开始时间：</strong>{selectedRecord.planStartTime}
                </Col>
                <Col span={12}>
                  <strong>计划结束时间：</strong>{selectedRecord.planEndTime}
                </Col>
                <Col span={12}>
                  <strong>实际开始时间：</strong>{selectedRecord.actualStartTime || '未开始'}
                </Col>
                <Col span={12}>
                  <strong>实际结束时间：</strong>{selectedRecord.actualEndTime || '未完成'}
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
      </div>
    </OrderLayout>
  );
};

export default AllocationOrder;
