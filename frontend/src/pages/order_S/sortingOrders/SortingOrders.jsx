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
  Row,
  Col,
  message,
  Modal,
  Form,
  Typography,
  Descriptions,
  Divider,
  Progress
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { 
  getSortingOrdersList, 
  getSortingOrderDetail, 
  updateSortingOrderStatus, 
  startPicking,
  completeSortingOrder,
  updatePickingProgress,
  batchOperateSortingOrders,
  createSortingOrder
} from '../../../api/sortingOrders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const SortingOrders = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  // 分拣类型选项
  const sortingTypeOptions = [
    { value: 'order_picking', label: '订单拣货', color: 'blue' },
    { value: 'batch_sorting', label: '批量分拣', color: 'green' },
    { value: 'return_sorting', label: '退货分拣', color: 'orange' },
    { value: 'damage_sorting', label: '报损分拣', color: 'red' },
  ];

  // 状态选项
  const statusOptions = [
    { value: 'pending', label: '待处理', color: 'orange' },
    { value: 'in_progress', label: '进行中', color: 'blue' },
    { value: 'completed', label: '已完成', color: 'green' },
    { value: 'cancelled', label: '已取消', color: 'red' },
  ];

  // 优先级选项
  const priorityOptions = [
    { value: 1, label: '最低', color: 'default' },
    { value: 2, label: '低', color: 'blue' },
    { value: 3, label: '中', color: 'orange' },
    { value: 4, label: '高', color: 'red' },
    { value: 5, label: '最高', color: 'volcano' },
  ];

  // 获取状态配置
  const getStatusConfig = (status) => {
    const config = statusOptions.find(item => item.value === status);
    return config || { value: status, label: status, color: 'default' };
  };

  // 获取分拣类型配置
  const getSortingTypeConfig = (type) => {
    const config = sortingTypeOptions.find(item => item.value === type);
    return config || { value: type, label: type, color: 'default' };
  };

  // 获取优先级配置
  const getPriorityConfig = (priority) => {
    const config = priorityOptions.find(item => item.value === priority);
    return config || { value: priority, label: priority, color: 'default' };
  };

  // 计算完成率
  const calculateCompletionRate = (products) => {
    if (!products || products.length === 0) return 0;
    const totalRequired = products.reduce((sum, item) => sum + item.requiredQuantity, 0);
    const totalPicked = products.reduce((sum, item) => sum + item.pickedQuantity, 0);
    return totalRequired > 0 ? Math.round((totalPicked / totalRequired) * 100) : 0;
  };

  // 更新拣货进度
  const handleUpdateProgress = async (record, productUpdates) => {
    try {
      const response = await updatePickingProgress(record._id, productUpdates);
      if (response.code === 200) {
        message.success('拣货进度更新成功');
        setCurrentRecord(response.data);
        fetchData();
      }
    } catch (error) {
      message.error('拣货进度更新失败');
      console.error('拣货进度更新失败:', error);
    }
  };

  // 批量操作
  const handleBatchOperation = async (selectedRowKeys, action, data) => {
    try {
      const response = await batchOperateSortingOrders(selectedRowKeys, action, data);
      if (response.code === 200) {
        message.success(response.message);
        setSelectedRowKeys([]);
        fetchData();
      }
    } catch (error) {
      message.error('批量操作失败');
      console.error('批量操作失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '分拣单号',
      dataIndex: 'sortingOrderId',
      key: 'sortingOrderId',
      width: 150,
      render: (text) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {text}
        </span>
      ),
    },
    {
      title: '分拣类型',
      dataIndex: 'sortingType',
      key: 'sortingType',
      width: 120,
      render: (type) => {
        const config = getSortingTypeConfig(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => {
        const config = getPriorityConfig(priority);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '商品信息',
      dataIndex: 'products',
      key: 'products',
      width: 200,
      render: (products) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            共 {products?.length || 0} 种商品
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            需求: {products?.reduce((sum, item) => sum + item.requiredQuantity, 0) || 0} 件
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            已拣: {products?.reduce((sum, item) => sum + item.pickedQuantity, 0) || 0} 件
          </div>
        </div>
      ),
    },
    {
      title: '拣货进度',
      dataIndex: 'products',
      key: 'completionRate',
      width: 120,
      render: (products) => {
        const rate = calculateCompletionRate(products);
        return (
          <div>
            <Progress 
              percent={rate} 
              size="small" 
              status={rate === 100 ? 'success' : 'active'}
            />
            <div style={{ fontSize: '12px', textAlign: 'center' }}>
              {rate}%
            </div>
          </div>
        );
      },
    },
    {
      title: '拣货员',
      dataIndex: 'operationInfo',
      key: 'picker',
      width: 100,
      render: (operationInfo) => (
        operationInfo?.picker?.name || '-'
      ),
    },
    {
      title: '位置信息',
      dataIndex: ['sourceLocation', 'targetLocation'],
      key: 'location',
      width: 150,
      render: (text, record) => (
        <div>
          {record.sourceLocation && (
            <div style={{ fontSize: '12px' }}>
              源: {record.sourceLocation}
            </div>
          )}
          {record.targetLocation && (
            <div style={{ fontSize: '12px' }}>
              目标: {record.targetLocation}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '计划时间',
      dataIndex: 'operationInfo',
      key: 'planTime',
      width: 150,
      render: (operationInfo) => (
        <div>
          {operationInfo?.planStartTime && (
            <div style={{ fontSize: '12px' }}>
              开始: {new Date(operationInfo.planStartTime).toLocaleString('zh-CN')}
            </div>
          )}
          {operationInfo?.planEndTime && (
            <div style={{ fontSize: '12px' }}>
              结束: {new Date(operationInfo.planEndTime).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (time) => (
        time ? new Date(time).toLocaleString('zh-CN') : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (text, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartPicking(record)}
            >
              开始拣货
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
            >
              完成
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'in_progress') && (
            <Button
              type="link"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleUpdateStatus(record, 'cancelled')}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getSortingOrdersList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
        ...params,
      });

      if (response.code === 200) {
        setData(response.data.list);
        setTotal(response.data.total);
        setPagination(prev => ({
          ...prev,
          current: response.data.page,
          total: response.data.total,
        }));
      }
    } catch (error) {
      message.error('获取分拣单列表失败');
      console.error('获取分拣单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData();
  };

  // 重置
  const handleReset = () => {
    setSearchParams({});
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({});
  };

  // 查看详情
  const handleViewDetail = async (record) => {
    setDetailLoading(true);
    setDetailVisible(true);
    try {
      const response = await getSortingOrderDetail(record._id);
      if (response.code === 200) {
        setCurrentRecord(response.data);
      }
    } catch (error) {
      message.error('获取分拣单详情失败');
      console.error('获取分拣单详情失败:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // 开始拣货
  const handleStartPicking = async (record) => {
    try {
      const response = await startPicking(record._id);
      if (response.code === 200) {
        message.success('开始拣货');
        fetchData();
      }
    } catch (error) {
      message.error('操作失败');
      console.error('操作失败:', error);
    }
  };

  // 新建分拣单
  const handleCreate = () => {
    setCreateVisible(true);
    createForm.resetFields();
  };

  // 提交新建分拣单
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      
      const createData = {
        ...values,
        operationInfo: {
          planStartTime: values.planStartTime,
          planEndTime: values.planEndTime,
          assignee: values.assignee
        },
        pickingRoute: {
          routePlan: values.routePlan
        },
        products: values.products || []
      };
      
      const response = await createSortingOrder(createData);
      if (response.code === 200) {
        message.success('分拣单创建成功');
        setCreateVisible(false);
        createForm.resetFields();
        fetchData();
      }
    } catch (error) {
      message.error('创建分拣单失败');
      console.error('创建分拣单失败:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  // 更新状态
  const handleUpdateStatus = async (record, status) => {
    try {
      const response = await updateSortingOrderStatus(record._id, status);
      if (response.code === 200) {
        message.success('状态更新成功');
        fetchData();
      }
    } catch (error) {
      message.error('状态更新失败');
      console.error('状态更新失败:', error);
    }
  };

  // 完成分拣
  const handleComplete = (record) => {
    setCurrentRecord(record);
    setProcessVisible(true);
    form.setFieldsValue({
      status: 'completed',
    });
  };

  // 提交完成
  const handleProcessSubmit = async (values) => {
    setProcessLoading(true);
    try {
      const response = await completeSortingOrder(currentRecord._id, values);
      if (response.code === 200) {
        message.success('分拣完成');
        setProcessVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      message.error('操作失败');
      console.error('操作失败:', error);
    } finally {
      setProcessLoading(false);
    }
  };

  // 表格分页变化
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    fetchData();
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  return (
    <OrderLayout>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Input
                placeholder="分拣单号"
                value={searchParams.sortingOrderId}
                onChange={(e) => setSearchParams(prev => ({ ...prev, sortingOrderId: e.target.value }))}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="分拣类型"
                value={searchParams.sortingType}
                onChange={(value) => setSearchParams(prev => ({ ...prev, sortingType: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {sortingTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="状态"
                value={searchParams.status}
                onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="优先级"
                value={searchParams.priority}
                onChange={(value) => setSearchParams(prev => ({ ...prev, priority: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {priorityOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={12}>
              <RangePicker
                placeholder={['开始时间', '结束时间']}
                onChange={(dates) => {
                  if (dates) {
                    setSearchParams(prev => ({
                      ...prev,
                      startDate: dates[0].format('YYYY-MM-DD'),
                      endDate: dates[1].format('YYYY-MM-DD'),
                    }));
                  } else {
                    setSearchParams(prev => {
                      const { startDate, endDate, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                style={{ width: '100%' }}
              />
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
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  新建分拣单
                </Button>
                {selectedRowKeys.length > 0 && (
                  <>
                    <Button
                      onClick={() => handleBatchOperation(selectedRowKeys, 'updateStatus', { status: 'in_progress' })}
                    >
                      批量开始({selectedRowKeys.length})
                    </Button>
                    <Button
                      onClick={() => handleBatchOperation(selectedRowKeys, 'updatePriority', { priority: 3 })}
                    >
                      设为高优先级
                    </Button>
                    <Button
                      danger
                      onClick={() => handleBatchOperation(selectedRowKeys, 'delete', {})}
                    >
                      批量删除
                    </Button>
                  </>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.status === 'completed',
            }),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 分拣单详情弹窗 */}
      <Modal
        title="分拣单详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setCurrentRecord(null);
        }}
        footer={null}
        width={1200}
        loading={detailLoading}
      >
        {currentRecord && (
          <div>
            <Descriptions title="基本信息" bordered column={3}>
              <Descriptions.Item label="分拣单号">{currentRecord.sortingOrderId}</Descriptions.Item>
              <Descriptions.Item label="分拣类型">
                <Tag color={getSortingTypeConfig(currentRecord.sortingType).color}>
                  {getSortingTypeConfig(currentRecord.sortingType).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getPriorityConfig(currentRecord.priority).color}>
                  {getPriorityConfig(currentRecord.priority).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusConfig(currentRecord.status).color}>
                  {getStatusConfig(currentRecord.status).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="源位置">
                {currentRecord.sourceLocation || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="目标位置">
                {currentRecord.targetLocation || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(currentRecord.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="仓库">
                {currentRecord.warehouse?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={1}>
                {currentRecord.notes || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>操作信息</Title>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="计划开始时间">
                {currentRecord.operationInfo?.planStartTime 
                  ? new Date(currentRecord.operationInfo.planStartTime).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="计划结束时间">
                {currentRecord.operationInfo?.planEndTime 
                  ? new Date(currentRecord.operationInfo.planEndTime).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="实际开始时间">
                {currentRecord.operationInfo?.actualStartTime 
                  ? new Date(currentRecord.operationInfo.actualStartTime).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="实际结束时间">
                {currentRecord.operationInfo?.actualEndTime 
                  ? new Date(currentRecord.operationInfo.actualEndTime).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="拣货员">
                {currentRecord.operationInfo?.picker?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="复核员">
                {currentRecord.operationInfo?.checker?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="使用设备" span={2}>
                {currentRecord.operationInfo?.equipment || '-'}
              </Descriptions.Item>
            </Descriptions>

            {currentRecord.pickingRoute && (
              <>
                <Divider />
                <Title level={4}>拣货路线</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="路线ID">
                    {currentRecord.pickingRoute.routeId || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="路线距离">
                    {currentRecord.pickingRoute.routeDistance ? `${currentRecord.pickingRoute.routeDistance}米` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="预计用时">
                    {currentRecord.pickingRoute.estimatedTime ? `${currentRecord.pickingRoute.estimatedTime}分钟` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="实际用时">
                    {currentRecord.pickingRoute.actualTime ? `${currentRecord.pickingRoute.actualTime}分钟` : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Divider />

            <Title level={4}>商品清单</Title>
            <Table
              size="small"
              columns={[
                {
                  title: '拣货顺序',
                  dataIndex: 'pickingOrder',
                  key: 'pickingOrder',
                  width: 80,
                  render: (order) => (
                    <Tag color="blue">{order || '-'}</Tag>
                  ),
                },
                {
                  title: '商品名称',
                  dataIndex: 'productName',
                  key: 'productName',
                },
                {
                  title: 'SKU',
                  dataIndex: 'sku',
                  key: 'sku',
                },
                {
                  title: '需求数量',
                  dataIndex: 'requiredQuantity',
                  key: 'requiredQuantity',
                },
                {
                  title: '已拣数量',
                  dataIndex: 'pickedQuantity',
                  key: 'pickedQuantity',
                  render: (picked, record) => (
                    <span style={{ 
                      color: picked === record.requiredQuantity ? '#52c41a' : 
                             picked > 0 ? '#1890ff' : '#666' 
                    }}>
                      {picked}
                    </span>
                  ),
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  key: 'unit',
                },
                {
                  title: '源位置',
                  dataIndex: 'sourceLocation',
                  key: 'sourceLocation',
                },
                {
                  title: '目标位置',
                  dataIndex: 'targetLocation',
                  key: 'targetLocation',
                },
                {
                  title: '批次号',
                  dataIndex: 'batchNumber',
                  key: 'batchNumber',
                },
                {
                  title: '有效期',
                  dataIndex: 'expiryDate',
                  key: 'expiryDate',
                  render: (date) => (
                    date ? new Date(date).toLocaleDateString('zh-CN') : '-'
                  ),
                },
                {
                  title: '备注',
                  dataIndex: 'notes',
                  key: 'notes',
                },
              ]}
              dataSource={currentRecord.products}
              rowKey="product"
              pagination={false}
            />

            {currentRecord.summary && (
              <>
                <Divider />
                <Title level={4}>汇总信息</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="总商品种数">
                    {currentRecord.summary.totalItems}
                  </Descriptions.Item>
                  <Descriptions.Item label="需求总数量">
                    {currentRecord.summary.totalRequiredQuantity}
                  </Descriptions.Item>
                  <Descriptions.Item label="已拣总数量">
                    {currentRecord.summary.totalPickedQuantity}
                  </Descriptions.Item>
                  <Descriptions.Item label="完成率">
                    <Progress 
                      percent={currentRecord.summary.completionRate} 
                      size="small" 
                      style={{ width: '100px' }}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="准确率" span={2}>
                    <Progress 
                      percent={currentRecord.summary.accuracy} 
                      size="small" 
                      style={{ width: '100px' }}
                      strokeColor="#52c41a"
                    />
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {currentRecord.qualityCheck && currentRecord.qualityCheck.isChecked && (
              <>
                <Divider />
                <Title level={4}>复核信息</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="复核员">
                    {currentRecord.qualityCheck.checkBy?.name || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="复核时间">
                    {currentRecord.qualityCheck.checkTime 
                      ? new Date(currentRecord.qualityCheck.checkTime).toLocaleString('zh-CN')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="复核结果">
                    <Tag color={
                      currentRecord.qualityCheck.checkResult === 'pass' ? 'green' :
                      currentRecord.qualityCheck.checkResult === 'fail' ? 'red' : 'orange'
                    }>
                      {currentRecord.qualityCheck.checkResult === 'pass' ? '通过' :
                       currentRecord.qualityCheck.checkResult === 'fail' ? '未通过' : '部分通过'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                {currentRecord.qualityCheck.errorItems && currentRecord.qualityCheck.errorItems.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>错误项目</Title>
                    <Table
                      size="small"
                      columns={[
                        {
                          title: '错误类型',
                          dataIndex: 'errorType',
                          key: 'errorType',
                          render: (type) => {
                            const typeMap = {
                              quantity_error: '数量错误',
                              product_error: '商品错误',
                              location_error: '位置错误',
                              quality_error: '质量错误'
                            };
                            return <Tag color="red">{typeMap[type] || type}</Tag>;
                          },
                        },
                        {
                          title: '商品',
                          dataIndex: 'product',
                          key: 'product',
                          render: (product) => product?.name || '-',
                        },
                        {
                          title: '描述',
                          dataIndex: 'description',
                          key: 'description',
                        },
                      ]}
                      dataSource={currentRecord.qualityCheck.errorItems}
                      rowKey="product"
                      pagination={false}
                    />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 完成分拣弹窗 */}
      <Modal
        title="完成分拣"
        open={processVisible}
        onCancel={() => {
          setProcessVisible(false);
          setCurrentRecord(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={processLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProcessSubmit}
        >
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select disabled>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="completionNotes"
            label="完成备注"
          >
            <TextArea rows={4} placeholder="请输入完成备注..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建分拣单弹窗 */}
      <Modal
        title="新建分拣单"
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        onOk={handleCreateSubmit}
        confirmLoading={createLoading}
        width={800}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sortingOrderId"
                label="分拣单号"
                rules={[{ required: true, message: '请输入分拣单号' }]}
              >
                <Input placeholder="请输入分拣单号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sortingType"
                label="分拣类型"
                rules={[{ required: true, message: '请选择分拣类型' }]}
              >
                <Select placeholder="请选择分拣类型">
                  {sortingTypeOptions.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value={1}>紧急</Option>
                  <Option value={2}>普通</Option>
                  <Option value={3}>低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warehouse"
                label="仓库"
              >
                <Input placeholder="请输入仓库" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceLocation"
                label="源货位"
              >
                <Input placeholder="请输入源货位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetLocation"
                label="目标货位"
              >
                <Input placeholder="请输入目标货位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="负责人"
              >
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="routePlan"
                label="拣货路线"
              >
                <Input placeholder="请输入拣货路线" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="planStartTime"
                label="计划开始时间"
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder="请选择计划开始时间"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="planEndTime"
                label="计划结束时间"
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder="请选择计划结束时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注信息..." />
          </Form.Item>

          <Form.Item
            label="商品清单"
            tooltip="分拣单需要关联具体的商品信息"
          >
            <div style={{ 
              padding: '20px',
              background: '#f5f5f5',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>商品清单功能开发中...</p>
              <p>目前可以创建基础分拣单，商品信息可在创建后添加</p>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </OrderLayout>
  );
};

export default SortingOrders;
