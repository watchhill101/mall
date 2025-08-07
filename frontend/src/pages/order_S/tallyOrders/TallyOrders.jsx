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
  getTallyOrdersList, 
  getTallyOrderDetail, 
  updateTallyOrderStatus, 
  completeTallyOrder,
  startTallyOrder,
  updateTallyProgress,
  batchOperateTallyOrders,
  createTallyOrder
} from '../../../api/tallyOrders';
import OrderLayout from '../Order_layout/Order_layout';
import ProductSelector from '../../../components/ProductSelector/ProductSelector';
import { generateTallyOrderId } from '../../../utils/orderUtils';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const TallyOrders = () => {
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

  // 理货类型选项
  const tallyTypeOptions = [
    { value: 'inbound', label: '入库理货', color: 'blue' },
    { value: 'outbound', label: '出库理货', color: 'green' },
    { value: 'transfer', label: '调拨理货', color: 'orange' },
    { value: 'adjustment', label: '盘点调整', color: 'purple' },
  ];

  // 状态选项
  const statusOptions = [
    { value: 'pending', label: '待处理', color: 'orange' },
    { value: 'in_progress', label: '进行中', color: 'blue' },
    { value: 'completed', label: '已完成', color: 'green' },
    { value: 'cancelled', label: '已取消', color: 'red' },
  ];

  // 商品状态选项
  const conditionOptions = [
    { value: 'good', label: '完好', color: 'green' },
    { value: 'damaged', label: '破损', color: 'red' },
    { value: 'expired', label: '过期', color: 'orange' },
    { value: 'defective', label: '次品', color: 'volcano' },
  ];

  // 获取状态配置
  const getStatusConfig = (status) => {
    const config = statusOptions.find(item => item.value === status);
    return config || { value: status, label: status, color: 'default' };
  };

  // 获取理货类型配置
  const getTallyTypeConfig = (type) => {
    const config = tallyTypeOptions.find(item => item.value === type);
    return config || { value: type, label: type, color: 'default' };
  };

  // 获取商品状态配置
  const getConditionConfig = (condition) => {
    const config = conditionOptions.find(item => item.value === condition);
    return config || { value: condition, label: condition, color: 'default' };
  };

  // 计算完成率
  const calculateCompletionRate = (products) => {
    if (!products || products.length === 0) return 0;
    const totalPlanned = products.reduce((sum, item) => sum + item.plannedQuantity, 0);
    const totalActual = products.reduce((sum, item) => sum + item.actualQuantity, 0);
    return totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  };

  // 开始理货
  const handleStartTally = async (record) => {
    try {
      const response = await startTallyOrder(record._id);
      if (response.code === 200) {
        message.success('开始理货');
        fetchData();
      }
    } catch (error) {
      message.error('开始理货失败');
      console.error('开始理货失败:', error);
    }
  };

  // 新建理货单
  const handleCreate = () => {
    setCreateVisible(true);
    createForm.resetFields();
    // 自动生成理货单号
    createForm.setFieldsValue({
      tallyOrderId: generateTallyOrderId()
    });
  };

  // 提交新建理货单
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      
      // 处理商品数据，移除临时的key字段
      const processedProducts = (values.products || []).map(product => {
        const { key, ...productData } = product;
        return {
          ...productData,
          product: null, // 暂时设为null，实际项目中应该是商品ObjectId
        };
      });
      
      const createData = {
        ...values,
        operationInfo: {
          planStartTime: values.planStartTime,
          planEndTime: values.planEndTime,
          assignee: values.assignee
        },
        products: processedProducts,
        // 计算汇总信息
        summary: {
          totalPlannedItems: processedProducts.length,
          totalActualItems: processedProducts.filter(p => p.actualQuantity > 0).length,
          totalPlannedQuantity: processedProducts.reduce((sum, p) => sum + (p.plannedQuantity || 0), 0),
          totalActualQuantity: processedProducts.reduce((sum, p) => sum + (p.actualQuantity || 0), 0),
          differenceQuantity: processedProducts.reduce((sum, p) => sum + (p.actualQuantity || 0), 0) - 
                              processedProducts.reduce((sum, p) => sum + (p.plannedQuantity || 0), 0)
        }
      };
      
      const response = await createTallyOrder(createData);
      if (response.code === 200) {
        message.success('理货单创建成功');
        setCreateVisible(false);
        createForm.resetFields();
        fetchData();
      }
    } catch (error) {
      message.error('创建理货单失败');
      console.error('创建理货单失败:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  // 更新商品理货进度
  const handleUpdateProgress = async (record, productUpdates) => {
    try {
      const response = await updateTallyProgress(record._id, productUpdates);
      if (response.code === 200) {
        message.success('进度更新成功');
        setCurrentRecord(response.data);
        fetchData();
      }
    } catch (error) {
      message.error('进度更新失败');
      console.error('进度更新失败:', error);
    }
  };

  // 批量操作
  const handleBatchOperation = async (selectedRowKeys, action, data) => {
    try {
      const response = await batchOperateTallyOrders(selectedRowKeys, action, data);
      if (response.code === 200) {
        message.success(response.message);
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
      title: '理货单号',
      dataIndex: 'tallyOrderId',
      key: 'tallyOrderId',
      width: 150,
      render: (text) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {text}
        </span>
      ),
    },
    {
      title: '理货类型',
      dataIndex: 'tallyType',
      key: 'tallyType',
      width: 120,
      render: (type) => {
        const config = getTallyTypeConfig(type);
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
            计划: {products?.reduce((sum, item) => sum + item.plannedQuantity, 0) || 0} 件
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            实际: {products?.reduce((sum, item) => sum + item.actualQuantity, 0) || 0} 件
          </div>
        </div>
      ),
    },
    {
      title: '完成进度',
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
      title: '操作员',
      dataIndex: 'operationInfo',
      key: 'operator',
      width: 100,
      render: (operationInfo) => (
        operationInfo?.operator?.name || '-'
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
      width: 250,
      fixed: 'right',
      render: (text, record) => (
        <Space wrap>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartTally(record)}
              size="small"
            >
              开始理货
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
              size="small"
            >
              完成
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'in_progress') && (
            <Button
              type="link"
              icon={<CloseCircleOutlined />}
              onClick={() => handleUpdateStatus(record, 'cancelled')}
              danger
              size="small"
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
      const response = await getTallyOrdersList({
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
      message.error('获取理货单列表失败');
      console.error('获取理货单列表失败:', error);
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
      const response = await getTallyOrderDetail(record._id);
      if (response.code === 200) {
        setCurrentRecord(response.data);
      }
    } catch (error) {
      message.error('获取理货单详情失败');
      console.error('获取理货单详情失败:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // 更新状态
  const handleUpdateStatus = async (record, status) => {
    try {
      const response = await updateTallyOrderStatus(record._id, status);
      if (response.code === 200) {
        message.success('状态更新成功');
        fetchData();
      }
    } catch (error) {
      message.error('状态更新失败');
      console.error('状态更新失败:', error);
    }
  };

  // 完成理货
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
      const response = await completeTallyOrder(currentRecord._id, values);
      if (response.code === 200) {
        message.success('理货完成');
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
                placeholder="理货单号"
                value={searchParams.tallyOrderId}
                onChange={(e) => setSearchParams(prev => ({ ...prev, tallyOrderId: e.target.value }))}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="理货类型"
                value={searchParams.tallyType}
                onChange={(value) => setSearchParams(prev => ({ ...prev, tallyType: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {tallyTypeOptions.map(option => (
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
            <Col span={24}>
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
                  新建理货单
                </Button>
                {selectedRowKeys.length > 0 && (
                  <>
                    <Button
                      onClick={() => handleBatchOperation(selectedRowKeys, 'updateStatus', { status: 'in_progress' })}
                    >
                      批量开始({selectedRowKeys.length})
                    </Button>
                    <Button
                      onClick={() => handleBatchOperation(selectedRowKeys, 'updateStatus', { status: 'completed' })}
                    >
                      批量完成
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 理货单详情弹窗 */}
      <Modal
        title="理货单详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setCurrentRecord(null);
        }}
        footer={null}
        width={1000}
        loading={detailLoading}
      >
        {currentRecord && (
          <div>
            <Descriptions title="基本信息" bordered column={3}>
              <Descriptions.Item label="理货单号">{currentRecord.tallyOrderId}</Descriptions.Item>
              <Descriptions.Item label="理货类型">
                <Tag color={getTallyTypeConfig(currentRecord.tallyType).color}>
                  {getTallyTypeConfig(currentRecord.tallyType).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusConfig(currentRecord.status).color}>
                  {getStatusConfig(currentRecord.status).label}
                </Tag>
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
              <Descriptions.Item label="操作员">
                {currentRecord.operationInfo?.operator?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="监督员">
                {currentRecord.operationInfo?.supervisor?.name || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>商品清单</Title>
            <Table
              size="small"
              columns={[
                {
                  title: '商品名称',
                  dataIndex: 'productName',
                  key: 'productName',
                },
                {
                  title: '商品编码',
                  dataIndex: 'productCode',
                  key: 'productCode',
                },
                {
                  title: '计划数量',
                  dataIndex: 'plannedQuantity',
                  key: 'plannedQuantity',
                },
                {
                  title: '实际数量',
                  dataIndex: 'actualQuantity',
                  key: 'actualQuantity',
                  render: (actual, record) => (
                    <span style={{ 
                      color: actual === record.plannedQuantity ? '#52c41a' : '#ff4d4f' 
                    }}>
                      {actual}
                    </span>
                  ),
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  key: 'unit',
                },
                {
                  title: '存放位置',
                  dataIndex: 'location',
                  key: 'location',
                },
                {
                  title: '商品状态',
                  dataIndex: 'condition',
                  key: 'condition',
                  render: (condition) => {
                    const config = getConditionConfig(condition);
                    return <Tag color={config.color}>{config.label}</Tag>;
                  },
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
                  <Descriptions.Item label="计划商品种数">
                    {currentRecord.summary.totalPlannedItems}
                  </Descriptions.Item>
                  <Descriptions.Item label="实际商品种数">
                    {currentRecord.summary.totalActualItems}
                  </Descriptions.Item>
                  <Descriptions.Item label="计划总数量">
                    {currentRecord.summary.totalPlannedQuantity}
                  </Descriptions.Item>
                  <Descriptions.Item label="实际总数量">
                    {currentRecord.summary.totalActualQuantity}
                  </Descriptions.Item>
                  <Descriptions.Item label="差异数量" span={2}>
                    <span style={{ 
                      color: currentRecord.summary.differenceQuantity === 0 ? '#52c41a' : '#ff4d4f' 
                    }}>
                      {currentRecord.summary.differenceQuantity > 0 ? '+' : ''}
                      {currentRecord.summary.differenceQuantity}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {currentRecord.qualityCheck && currentRecord.qualityCheck.isQualityChecked && (
              <>
                <Divider />
                <Title level={4}>质检信息</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="质检员">
                    {currentRecord.qualityCheck.qualityCheckBy?.name || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="质检时间">
                    {currentRecord.qualityCheck.qualityCheckTime 
                      ? new Date(currentRecord.qualityCheck.qualityCheckTime).toLocaleString('zh-CN')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="质检结果">
                    <Tag color={
                      currentRecord.qualityCheck.qualityResult === 'pass' ? 'green' :
                      currentRecord.qualityCheck.qualityResult === 'fail' ? 'red' : 'orange'
                    }>
                      {currentRecord.qualityCheck.qualityResult === 'pass' ? '合格' :
                       currentRecord.qualityCheck.qualityResult === 'fail' ? '不合格' : '有条件通过'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="质检备注" span={1}>
                    {currentRecord.qualityCheck.qualityNotes || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 完成理货弹窗 */}
      <Modal
        title="完成理货"
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

      {/* 新建理货单弹窗 */}
      <Modal
        title="新建理货单"
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
                name="tallyOrderId"
                label="理货单号"
                rules={[{ required: true, message: '请输入理货单号' }]}
              >
                <Input placeholder="请输入理货单号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tallyType"
                label="理货类型"
                rules={[{ required: true, message: '请选择理货类型' }]}
              >
                <Select placeholder="请选择理货类型">
                  {tallyTypeOptions.map(type => (
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
                label="货位"
              >
                <Input placeholder="请输入货位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="负责人"
              >
                <Input placeholder="请输入负责人" />
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
            name="products"
            label="商品清单"
            tooltip="理货单需要关联具体的商品信息"
            rules={[{ 
              validator: (_, value) => {
                if (!value || value.length === 0) {
                  return Promise.reject(new Error('请至少添加一个商品'));
                }
                return Promise.resolve();
              }
            }]}
          >
            <ProductSelector 
              type="tally" 
              value={createForm.getFieldValue('products')}
              onChange={(products) => createForm.setFieldsValue({ products })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </OrderLayout>
  );
};

export default TallyOrders;
