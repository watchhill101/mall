import React, { useState, useEffect } from 'react';
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
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  getWorkOrdersList,
  getWorkOrderDetail,
  generateWorkOrderTestData,
  clearWorkOrderTestData
} from '../../../api/orders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;

const WorkOrder = () => {
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
      const response = await getWorkOrdersList({
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
          pageSize: response.data.pageSize || 2
        }));
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取作业单列表失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 作业类型选项
  const workTypeOptions = [
    { value: 'picking', label: '拣货' },
    { value: 'packing', label: '包装' },
    { value: 'loading', label: '装车' },
    { value: 'unloading', label: '卸车' },
    { value: 'inspection', label: '检验' },
    { value: 'maintenance', label: '维护' },
    { value: 'cleaning', label: '清洁' }
  ];

  // 作业状态选项
  const statusOptions = [
    { value: 'pending', label: '待执行' },
    { value: 'assigned', label: '已分配' },
    { value: 'in_progress', label: '执行中' },
    { value: 'completed', label: '已完成' },
    { value: 'paused', label: '暂停' },
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

  // 获取作业类型显示文本
  const getWorkTypeText = (type) => {
    const option = workTypeOptions.find(item => item.value === type);
    return option ? option.label : type;
  };

  // 获取作业状态显示
  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'default', text: '待执行' },
      assigned: { color: 'blue', text: '已分配' },
      in_progress: { color: 'processing', text: '执行中' },
      completed: { color: 'success', text: '已完成' },
      paused: { color: 'warning', text: '暂停' },
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
      title: '作业单号',
      dataIndex: 'workOrderId',
      key: 'workOrderId',
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
          {orderIds.map(orderId => (
            <div key={orderId} style={{ fontSize: '12px' }}>{orderId}</div>
          ))}
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
      title: '作业类型',
      dataIndex: 'workType',
      key: 'workType',
      width: 100,
      render: (type) => getWorkTypeText(type)
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
      title: '分配工人',
      dataIndex: 'assignedWorker',
      key: 'assignedWorker',
      width: 100
    },
    {
      title: '作业位置',
      dataIndex: 'location',
      key: 'location',
      width: 100
    },
    {
      title: '使用设备',
      dataIndex: 'equipment',
      key: 'equipment',
      width: 100
    },
    {
      title: '预计时长',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 90,
      render: (duration) => `${duration}分钟`
    },
    {
      title: '实际时长',
      dataIndex: 'actualDuration',
      key: 'actualDuration',
      width: 90,
      render: (duration) => duration > 0 ? `${duration}分钟` : '-'
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
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record)}
            >
              开始
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
            >
              完成
            </Button>
          )}
        </Space>
      )
    }
  ];



  // 搜索处理 - 使用服务端搜索
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      // 处理搜索参数
      const searchParams = {};

      if (values.workOrderId) {
        searchParams.workOrderId = values.workOrderId.trim();
      }

      if (values.merchantName) {
        searchParams.merchantName = values.merchantName.trim();
      }

      if (values.workType) {
        searchParams.workType = values.workType;
      }

      if (values.status) {
        searchParams.status = values.status;
      }

      if (values.priority) {
        searchParams.priority = values.priority;
      }

      if (values.assignedWorker) {
        searchParams.assignedWorker = values.assignedWorker.trim();
      }

      // 处理时间范围
      if (values.createTime && values.createTime.length === 2) {
        searchParams.createTimeStart = values.createTime[0].format('YYYY-MM-DD HH:mm:ss');
        searchParams.createTimeEnd = values.createTime[1].format('YYYY-MM-DD HH:mm:ss');
      }

      // 调用API进行搜索
      const response = await getWorkOrdersList({
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
      const response = await getWorkOrdersList({
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

  // 开始作业
  const handleStart = (record) => {
    Modal.confirm({
      title: '开始作业',
      content: `确定要开始作业单 "${record.workOrderId}" 吗？`,
      onOk: () => {
        message.success('作业已开始');
      }
    });
  };

  // 完成作业
  const handleComplete = (record) => {
    Modal.confirm({
      title: '完成作业',
      content: `确定要完成作业单 "${record.workOrderId}" 吗？`,
      onOk: () => {
        message.success('作业已完成');
      }
    });
  };

  // 生成测试数据
  const handleGenerateTestData = async () => {
    setLoading(true);
    try {
      const response = await generateWorkOrderTestData({ count: 10 });
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
      content: '确定要清空所有作业单数据吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await clearWorkOrderTestData();
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

      if (formValues.workOrderId) searchParams.workOrderId = formValues.workOrderId.trim();
      if (formValues.merchantName) searchParams.merchantName = formValues.merchantName.trim();
      if (formValues.workType) searchParams.workType = formValues.workType;
      if (formValues.status) searchParams.status = formValues.status;
      if (formValues.priority) searchParams.priority = formValues.priority;
      if (formValues.assignedWorker) searchParams.assignedWorker = formValues.assignedWorker.trim();

      if (formValues.createTime && formValues.createTime.length === 2) {
        searchParams.createTimeStart = formValues.createTime[0].format('YYYY-MM-DD HH:mm:ss');
        searchParams.createTimeEnd = formValues.createTime[1].format('YYYY-MM-DD HH:mm:ss');
      }

      // 获取所有数据用于导出
      const response = await getWorkOrdersList({
        page: 1,
        pageSize: 10000, // 获取大量数据用于导出
        ...searchParams
      });

      if (response.code === 200) {
        const exportData = response.data.list || [];

        // 创建CSV内容
        const headers = [
          '作业单号', '所属商家', '作业类型', '状态', '优先级', '分配工人',
          '作业位置', '使用设备', '预计时长', '实际时长', '创建时间', '备注'
        ];

        const csvContent = [
          headers.join(','),
          ...exportData.map(record => [
            record.workOrderId || '',
            record.merchantName || '',
            getWorkTypeText(record.workType) || '',
            record.status || '',
            record.priority || '',
            record.assignedWorker || '',
            record.location || '',
            record.equipment || '',
            record.estimatedDuration ? `${record.estimatedDuration}分钟` : '',
            record.actualDuration > 0 ? `${record.actualDuration}分钟` : '',
            record.createTime ? new Date(record.createTime).toLocaleString('zh-CN') : '',
            record.remarks || ''
          ].join(','))
        ].join('\n');

        // 下载文件
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `作业单_${new Date().toISOString().slice(0, 10)}.csv`;
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
      const response = await getWorkOrdersList({
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
      console.error('获取作业单列表失败:', error);
      message.error('获取数据失败');
      setAllData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索表单 */}
        <Card className="search-card" style={{ marginBottom: '16px' }}>
          <Form form={form} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="作业单号" name="workOrderId">
                  <Input placeholder="请输入作业单号" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="所属商家" name="merchantName">
                  <Input placeholder="请输入商家名称" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="作业类型" name="workType">
                  <Select placeholder="请选择作业类型" allowClear>
                    {workTypeOptions.map(option => (
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
                <Form.Item label="分配工人" name="assignedWorker">
                  <Input placeholder="请输入工人姓名" />
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
              作业单列表
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
            scroll={{ x: 1600 }}
            size="middle"
            className="data-table"
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="作业单详情"
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
                  <strong>作业单号：</strong>{selectedRecord.workOrderId}
                </Col>
                <Col span={12}>
                  <strong>作业类型：</strong>{getWorkTypeText(selectedRecord.workType)}
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
                  <strong>分配工人：</strong>{selectedRecord.assignedWorker}
                </Col>
                <Col span={12}>
                  <strong>作业位置：</strong>{selectedRecord.location}
                </Col>
                <Col span={12}>
                  <strong>使用设备：</strong>{selectedRecord.equipment}
                </Col>
                <Col span={12}>
                  <strong>计划开始时间：</strong>{selectedRecord.plannedStartTime}
                </Col>
                <Col span={12}>
                  <strong>计划结束时间：</strong>{selectedRecord.plannedEndTime}
                </Col>
                <Col span={12}>
                  <strong>实际开始时间：</strong>{selectedRecord.actualStartTime || '未开始'}
                </Col>
                <Col span={12}>
                  <strong>实际结束时间：</strong>{selectedRecord.actualEndTime || '未完成'}
                </Col>
                <Col span={12}>
                  <strong>预计时长：</strong>{selectedRecord.estimatedDuration}分钟
                </Col>
                <Col span={12}>
                  <strong>实际时长：</strong>{selectedRecord.actualDuration > 0 ? `${selectedRecord.actualDuration}分钟` : '未完成'}
                </Col>
                <Col span={12}>
                  <strong>创建时间：</strong>{selectedRecord.createTime}
                </Col>
                <Col span={24}>
                  <strong>关联订单：</strong>
                  <div style={{ marginTop: '8px' }}>
                    {selectedRecord.orderIds.map(orderId => (
                      <Tag key={orderId} style={{ margin: '2px' }}>{orderId}</Tag>
                    ))}
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
}; export default WorkOrder;
