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
  InputNumber,
  Descriptions,
  Image,
  Divider
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { 
  getAfterSalesList, 
  getAfterSalesDetail, 
  processAfterSales 
} from '../../../api/orders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const AfterSales = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [processVisible, setProcessVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [form] = Form.useForm();

  // 售后类型选项
  const afterSalesTypeOptions = [
    { value: 'refund', label: '退款', color: 'orange' },
    { value: 'return', label: '退货', color: 'blue' },
    { value: 'exchange', label: '换货', color: 'green' },
    { value: 'repair', label: '维修', color: 'purple' },
  ];

  // 状态选项
  const statusOptions = [
    { value: 'pending', label: '待处理', color: 'orange' },
    { value: 'processing', label: '处理中', color: 'blue' },
    { value: 'completed', label: '已完成', color: 'green' },
    { value: 'rejected', label: '已拒绝', color: 'red' },
  ];

  // 获取状态配置
  const getStatusConfig = (status) => {
    const config = statusOptions.find(item => item.value === status);
    return config || { value: status, label: status, color: 'default' };
  };

  // 获取售后类型配置
  const getAfterSalesTypeConfig = (type) => {
    const config = afterSalesTypeOptions.find(item => item.value === type);
    return config || { value: type, label: type, color: 'default' };
  };

  // 表格列定义
  const columns = [
    {
      title: '售后单号',
      dataIndex: 'afterSalesId',
      key: 'afterSalesId',
      width: 150,
      render: (text) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {text}
        </span>
      ),
    },
    {
      title: '售后类型',
      dataIndex: 'afterSalesType',
      key: 'afterSalesType',
      width: 100,
      render: (type) => {
        const config = getAfterSalesTypeConfig(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '客户信息',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
      render: (customer) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{customer?.customerName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {customer?.customerPhone}
          </div>
        </div>
      ),
    },
    {
      title: '商品信息',
      dataIndex: 'products',
      key: 'products',
      width: 200,
      render: (products) => (
        <div>
          {products?.slice(0, 2).map((product, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>{product.productName}</div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                数量: {product.quantity} | 金额: ¥{product.totalAmount}
              </div>
            </div>
          ))}
          {products?.length > 2 && (
            <div style={{ color: '#1890ff', fontSize: '12px' }}>
              等{products.length}个商品
            </div>
          )}
        </div>
      ),
    },
    {
      title: '申请原因',
      dataIndex: 'applicationInfo',
      key: 'applicationReason',
      width: 150,
      render: (applicationInfo) => (
        <div>
          <div>{applicationInfo?.applicationReason}</div>
          {applicationInfo?.description && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              {applicationInfo.description.length > 30 
                ? `${applicationInfo.description.substring(0, 30)}...` 
                : applicationInfo.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '退款金额',
      dataIndex: 'refundInfo',
      key: 'refundAmount',
      width: 100,
      render: (refundInfo) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ¥{refundInfo?.refundAmount || 0}
        </span>
      ),
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
      title: '申请时间',
      dataIndex: 'applicationInfo',
      key: 'applicationTime',
      width: 150,
      render: (applicationInfo) => (
        applicationInfo?.applicationTime 
          ? new Date(applicationInfo.applicationTime).toLocaleString('zh-CN')
          : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
              icon={<EditOutlined />}
              onClick={() => handleProcess(record)}
            >
              处理
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
      const response = await getAfterSalesList({
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
      message.error('获取售后列表失败');
      console.error('获取售后列表失败:', error);
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
      const response = await getAfterSalesDetail(record._id);
      if (response.code === 200) {
        setCurrentRecord(response.data);
      }
    } catch (error) {
      message.error('获取售后详情失败');
      console.error('获取售后详情失败:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // 处理售后
  const handleProcess = (record) => {
    setCurrentRecord(record);
    setProcessVisible(true);
    form.setFieldsValue({
      status: 'processing',
      refundAmount: record.refundInfo?.refundAmount || 0,
      refundMethod: 'original',
    });
  };

  // 提交处理
  const handleProcessSubmit = async (values) => {
    setProcessLoading(true);
    try {
      const response = await processAfterSales(currentRecord._id, values);
      if (response.code === 200) {
        message.success('处理成功');
        setProcessVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      message.error('处理失败');
      console.error('处理失败:', error);
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
                placeholder="售后单号"
                value={searchParams.afterSalesId}
                onChange={(e) => setSearchParams(prev => ({ ...prev, afterSalesId: e.target.value }))}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="原订单号"
                value={searchParams.orderId}
                onChange={(e) => setSearchParams(prev => ({ ...prev, orderId: e.target.value }))}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="售后类型"
                value={searchParams.afterSalesType}
                onChange={(value) => setSearchParams(prev => ({ ...prev, afterSalesType: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {afterSalesTypeOptions.map(option => (
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
              <Input
                placeholder="客户姓名"
                value={searchParams.customerName}
                onChange={(e) => setSearchParams(prev => ({ ...prev, customerName: e.target.value }))}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="客户电话"
                value={searchParams.customerPhone}
                onChange={(e) => setSearchParams(prev => ({ ...prev, customerPhone: e.target.value }))}
                allowClear
              />
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
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
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
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 售后详情弹窗 */}
      <Modal
        title="售后详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setCurrentRecord(null);
        }}
        footer={null}
        width={800}
        loading={detailLoading}
      >
        {currentRecord && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="售后单号">{currentRecord.afterSalesId}</Descriptions.Item>
              <Descriptions.Item label="售后类型">
                <Tag color={getAfterSalesTypeConfig(currentRecord.afterSalesType).color}>
                  {getAfterSalesTypeConfig(currentRecord.afterSalesType).label}
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
            </Descriptions>

            <Divider />

            <Descriptions title="客户信息" bordered column={2}>
              <Descriptions.Item label="客户姓名">{currentRecord.customer?.customerName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentRecord.customer?.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="客户ID">{currentRecord.customer?.customerId}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="商品信息" bordered column={1}>
              <Descriptions.Item label="商品列表">
                <div>
                  {currentRecord.products?.map((product, index) => (
                    <div key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                      <div><strong>商品名称:</strong> {product.productName}</div>
                      <div><strong>数量:</strong> {product.quantity}</div>
                      <div><strong>单价:</strong> ¥{product.unitPrice}</div>
                      <div><strong>总金额:</strong> ¥{product.totalAmount}</div>
                      <div><strong>退货原因:</strong> {product.reason}</div>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="申请信息" bordered column={1}>
              <Descriptions.Item label="申请时间">
                {currentRecord.applicationInfo?.applicationTime 
                  ? new Date(currentRecord.applicationInfo.applicationTime).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="申请原因">{currentRecord.applicationInfo?.applicationReason}</Descriptions.Item>
              <Descriptions.Item label="详细描述">{currentRecord.applicationInfo?.description}</Descriptions.Item>
              <Descriptions.Item label="相关图片">
                {currentRecord.applicationInfo?.images?.length > 0 ? (
                  <div>
                    {currentRecord.applicationInfo.images.map((img, index) => (
                      <Image
                        key={index}
                        width={100}
                        src={img}
                        style={{ marginRight: '8px' }}
                      />
                    ))}
                  </div>
                ) : '无'}
              </Descriptions.Item>
            </Descriptions>

            {currentRecord.processingInfo && (
              <>
                <Divider />
                <Descriptions title="处理信息" bordered column={2}>
                  <Descriptions.Item label="处理时间">
                    {currentRecord.processingInfo.processingTime 
                      ? new Date(currentRecord.processingInfo.processingTime).toLocaleString('zh-CN')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="处理方案">{currentRecord.processingInfo.solution}</Descriptions.Item>
                  <Descriptions.Item label="处理备注" span={2}>{currentRecord.processingInfo.processingNote}</Descriptions.Item>
                </Descriptions>
              </>
            )}

            {currentRecord.refundInfo && (
              <>
                <Divider />
                <Descriptions title="退款信息" bordered column={2}>
                  <Descriptions.Item label="退款金额">¥{currentRecord.refundInfo.refundAmount}</Descriptions.Item>
                  <Descriptions.Item label="退款方式">{currentRecord.refundInfo.refundMethod === 'original' ? '原路退回' : '其他方式'}</Descriptions.Item>
                  <Descriptions.Item label="退款时间">
                    {currentRecord.refundInfo.refundTime 
                      ? new Date(currentRecord.refundInfo.refundTime).toLocaleString('zh-CN')
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="退款状态">{currentRecord.refundInfo.refundStatus}</Descriptions.Item>
                </Descriptions>
              </>
            )}

            {currentRecord.notes && (
              <>
                <Divider />
                <Descriptions title="其他信息" bordered column={1}>
                  <Descriptions.Item label="备注">{currentRecord.notes}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 处理售后弹窗 */}
      <Modal
        title="处理售后申请"
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
            label="处理状态"
            rules={[{ required: true, message: '请选择处理状态' }]}
          >
            <Select>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="solution"
            label="处理方案"
            rules={[{ required: true, message: '请输入处理方案' }]}
          >
            <Select>
              <Option value="全额退款">全额退款</Option>
              <Option value="部分退款">部分退款</Option>
              <Option value="换货">换货</Option>
              <Option value="维修">维修</Option>
              <Option value="拒绝申请">拒绝申请</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="refundAmount"
            label="退款金额"
            rules={[{ required: true, message: '请输入退款金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="refundMethod"
            label="退款方式"
            rules={[{ required: true, message: '请选择退款方式' }]}
          >
            <Select>
              <Option value="original">原路退回</Option>
              <Option value="bank">银行卡</Option>
              <Option value="alipay">支付宝</Option>
              <Option value="wechat">微信</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="processingNote"
            label="处理备注"
          >
            <TextArea rows={4} placeholder="请输入处理备注..." />
          </Form.Item>
        </Form>
      </Modal>
    </OrderLayout>
  );
};

export default AfterSales;
