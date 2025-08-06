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
import { getAllocationOrdersList, getAllocationOrderDetail } from '../../../api/orders';
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
    pageSize: 10,
    total: 0
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 模拟数据
  const mockData = useMemo(() => [
    {
      id: 1,
      allocationId: 'ALO202312010001',
      orderIds: ['ORD202312010001', 'ORD202312010002'],
      merchantName: '清风便利店',
      allocationType: 'normal',
      status: 'pending',
      priority: 3,
      plannedQuantity: 25,
      allocatedQuantity: 18,
      allocationRate: 72,
      planStartTime: '2023-12-01 09:00:00',
      planEndTime: '2023-12-01 12:00:00',
      actualStartTime: '',
      actualEndTime: '',
      allocator: '张三',
      totalAmount: 1280.50,
      createTime: '2023-12-01 08:30:00',
      remarks: '正常配货'
    },
    {
      id: 2,
      allocationId: 'ALO202312010002',
      orderIds: ['ORD202312010003'],
      merchantName: '星期八超市',
      allocationType: 'urgent',
      status: 'allocated',
      priority: 5,
      plannedQuantity: 15,
      allocatedQuantity: 15,
      allocationRate: 100,
      planStartTime: '2023-12-01 10:00:00',
      planEndTime: '2023-12-01 11:00:00',
      actualStartTime: '2023-12-01 10:05:00',
      actualEndTime: '2023-12-01 11:30:00',
      allocator: '李四',
      totalAmount: 890.00,
      createTime: '2023-12-01 09:45:00',
      remarks: '紧急配货单'
    },
    {
      id: 3,
      allocationId: 'ALO202312010003',
      orderIds: ['ORD202312010004', 'ORD202312010005'],
      merchantName: '清风便利店',
      allocationType: 'batch',
      status: 'in_progress',
      priority: 2,
      plannedQuantity: 40,
      allocatedQuantity: 32,
      allocationRate: 80,
      planStartTime: '2023-12-01 14:00:00',
      planEndTime: '2023-12-01 17:00:00',
      actualStartTime: '2023-12-01 14:10:00',
      actualEndTime: '',
      allocator: '王五',
      totalAmount: 2156.80,
      createTime: '2023-12-01 13:20:00',
      remarks: '批量配货'
    },
    {
      id: 4,
      allocationId: 'ALO202312010004',
      orderIds: ['ORD202312010006'],
      merchantName: '星期八超市',
      allocationType: 'partial',
      status: 'shortage',
      priority: 4,
      plannedQuantity: 20,
      allocatedQuantity: 12,
      allocationRate: 60,
      planStartTime: '2023-12-01 15:00:00',
      planEndTime: '2023-12-01 16:00:00',
      actualStartTime: '2023-12-01 15:05:00',
      actualEndTime: '',
      allocator: '赵六',
      totalAmount: 745.20,
      createTime: '2023-12-01 14:30:00',
      remarks: '部分缺货'
    }
  ], []);

  // 初始化数据
  useEffect(() => {
    setAllData(mockData);
    setFilteredData(mockData);
    setPagination(prev => ({ ...prev, total: mockData.length }));
  }, [mockData]);

  // 配货类型选项
  const allocationTypeOptions = [
    { value: 'normal', label: '正常配货' },
    { value: 'urgent', label: '紧急配货' },
    { value: 'batch', label: '批量配货' },
    { value: 'partial', label: '部分配货' }
  ];

  // 配货状态选项
  const statusOptions = [
    { value: 'pending', label: '待配货' },
    { value: 'in_progress', label: '配货中' },
    { value: 'allocated', label: '已配货' },
    { value: 'shortage', label: '缺货' },
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
      in_progress: { color: 'processing', text: '配货中' },
      allocated: { color: 'success', text: '已配货' },
      shortage: { color: 'warning', text: '缺货' },
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
      render: (amount) => `¥${amount.toFixed(2)}`
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
          {(record.status === 'pending' || record.status === 'in_progress') && (
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
                <Form.Item label="配货单号" name="allocationId">
                  <Input placeholder="请输入配货单号" />
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
              配货单列表
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
            scroll={{ x: 1500 }}
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
                  <strong>总金额：</strong>¥{selectedRecord.totalAmount.toFixed(2)}
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
};export default AllocationOrder;
