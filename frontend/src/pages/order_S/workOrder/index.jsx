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
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { getWorkOrdersList, getWorkOrderDetail } from '../../../api/orders';
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
    pageSize: 10,
    total: 0
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 模拟数据
  const mockData = useMemo(() => [
    {
      id: 1,
      workOrderId: 'WO202312010001',
      orderIds: ['ORD202312010001'],
      merchantName: '清风便利店',
      workType: 'picking',
      status: 'pending',
      priority: 3,
      assignedWorker: '张三',
      plannedStartTime: '2023-12-01 09:00:00',
      plannedEndTime: '2023-12-01 10:00:00',
      actualStartTime: '',
      actualEndTime: '',
      estimatedDuration: 60,
      actualDuration: 0,
      location: '仓库A区',
      equipment: 'PDA001',
      createTime: '2023-12-01 08:30:00',
      remarks: '拣货作业'
    },
    {
      id: 2,
      workOrderId: 'WO202312010002',
      orderIds: ['ORD202312010002', 'ORD202312010003'],
      merchantName: '星期八超市',
      workType: 'packing',
      status: 'in_progress',
      priority: 4,
      assignedWorker: '李四',
      plannedStartTime: '2023-12-01 10:00:00',
      plannedEndTime: '2023-12-01 11:30:00',
      actualStartTime: '2023-12-01 10:05:00',
      actualEndTime: '',
      estimatedDuration: 90,
      actualDuration: 45,
      location: '包装区B',
      equipment: '包装台002',
      createTime: '2023-12-01 09:45:00',
      remarks: '批量包装作业'
    },
    {
      id: 3,
      workOrderId: 'WO202312010003',
      orderIds: ['ORD202312010004'],
      merchantName: '清风便利店',
      workType: 'loading',
      status: 'completed',
      priority: 2,
      assignedWorker: '王五',
      plannedStartTime: '2023-12-01 14:00:00',
      plannedEndTime: '2023-12-01 15:00:00',
      actualStartTime: '2023-12-01 13:55:00',
      actualEndTime: '2023-12-01 14:50:00',
      estimatedDuration: 60,
      actualDuration: 55,
      location: '装车区C',
      equipment: '叉车003',
      createTime: '2023-12-01 13:20:00',
      remarks: '装车作业完成'
    },
    {
      id: 4,
      workOrderId: 'WO202312010004',
      orderIds: ['ORD202312010005'],
      merchantName: '星期八超市',
      workType: 'inspection',
      status: 'cancelled',
      priority: 1,
      assignedWorker: '赵六',
      plannedStartTime: '2023-12-01 16:00:00',
      plannedEndTime: '2023-12-01 16:30:00',
      actualStartTime: '',
      actualEndTime: '',
      estimatedDuration: 30,
      actualDuration: 0,
      location: '质检区D',
      equipment: '检测仪004',
      createTime: '2023-12-01 15:30:00',
      remarks: '订单取消，作业单取消'
    }
  ], []);

  // 初始化数据
  useEffect(() => {
    setAllData(mockData);
    setFilteredData(mockData);
    setPagination(prev => ({ ...prev, total: mockData.length }));
  }, [mockData]);

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

  // 数据筛选
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按作业单号筛选
      if (params.workOrderId && !item.workOrderId.toLowerCase().includes(params.workOrderId.toLowerCase())) {
        return false;
      }

      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false;
      }

      // 按作业类型筛选
      if (params.workType && item.workType !== params.workType) {
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

      // 按分配工人筛选
      if (params.assignedWorker && !item.assignedWorker.toLowerCase().includes(params.assignedWorker.toLowerCase())) {
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
                <Form.Item label="作业单号" name="workOrderId">
                  <Input placeholder="请输入作业单号" />
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
              作业单列表
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
            scroll={{ x: 1600 }}
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
};export default WorkOrder;
