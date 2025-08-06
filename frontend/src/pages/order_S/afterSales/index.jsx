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
  message
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { getAfterSalesList } from '../../../api/orders';
import OrderLayout from '../Order_layout/Order_layout';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AfterSales = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState({});

  // 状态选项
  const statusOptions = [
    { value: '待处理', label: '待处理', color: 'orange' },
    { value: '已退款', label: '已退款', color: 'blue' },
    { value: '已退货', label: '已退货', color: 'cyan' },
    { value: '已拒绝', label: '已拒绝', color: 'red' },
  ];

  // 表格列定义
  const columns = [
    {
      title: '售后订单',
      dataIndex: 'salesOrderNumber',
      key: 'salesOrderNumber',
      width: 150,
      render: (text) => (
        <span style={{ color: '#1890ff' }}>
          {text || 'LXSH-121313123123'}
        </span>
      ),
    },
    {
      title: '原订单',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      render: (text) => (
        <span style={{ color: '#1890ff' }}>
          {text || 'LX-121313123123'}
        </span>
      ),
    },
    {
      title: '售后来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (text) => text || '金融中介',
    },
    {
      title: '会员信息',
      dataIndex: 'memberInfo',
      key: 'memberInfo',
      width: 150,
      render: (text, record) => (
        <div>
          <div>{record.memberName || '木易'}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.memberPhone || '18979881656'}
          </div>
        </div>
      ),
    },
    {
      title: '售后金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (text) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ¥ {text || '25'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let config = { color: 'blue', label: '待处理' };
        switch(status) {
          case '待处理':
            config = { color: 'orange', label: '待处理' };
            break;
          case '已退款':
            config = { color: 'green', label: '已退款' };
            break;
          case '已退货':
            config = { color: 'blue', label: '已退货' };
            break;
          case '已拒绝':
            config = { color: 'red', label: '已拒绝' };
            break;
          default:
            config = { color: 'blue', label: status || '待处理' };
        }
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '运费类型',
      dataIndex: 'shippingType',
      key: 'shippingType',
      width: 120,
      render: (text) => text || '免运费',
    },
    {
      title: '售后时间',
      dataIndex: 'afterSalesTime',
      key: 'afterSalesTime',
      width: 150,
      render: (text) => text || '2023-02-05 12:12:12',
    },
    {
      title: '审核人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 100,
      render: (text) => text || '小慧子',
    },
    {
      title: '处理时间',
      dataIndex: 'processTime',
      key: 'processTime',
      width: 150,
      render: (text) => text || '2023-02-05 12:12:12',
    },
    {
      title: '订单来源',
      dataIndex: 'orderSource',
      key: 'orderSource',
      width: 100,
      render: (text) => text || 'web',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (text) => text || '182.101.61.25',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (text, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleEdit(record)}
        >
          详情
        </Button>
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
        setData(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取售后列表失败:', error);
      message.error('获取数据失败');
      // 使用模拟数据
      const mockData = Array(10).fill().map((_, index) => ({
        id: `aftersales_${index + 1}`,
        salesOrderNumber: `LXSH-121313123123${index}`,
        orderNumber: `LX-121313123123${index}`,
        source: '金融中介',
        memberName: '木易',
        memberPhone: '18979881656',
        amount: '25',
        status: ['待处理', '已退款', '已退货', '已拒绝'][index % 4],
        shippingType: index % 2 === 0 ? '免运费' : '退运费',
        afterSalesTime: '2023-02-05 12:12:12',
        reviewer: '小慧子',
        processTime: '2023-02-05 12:12:12',
        orderSource: 'web',
        ip: '182.101.61.25',
      }));
      setData(mockData);
      setTotal(100);
    } finally {
      setLoading(false);
    }
  };

  // 编辑处理
  const handleEdit = (record) => {
    message.info('查看售后详情功能开发中...');
  };

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchData();
  };

  // 重置
  const handleReset = () => {
    setSearchParams({});
    setPagination({ ...pagination, current: 1 });
    fetchData();
  };

  // 表格分页变化
  const handleTableChange = (paginationConfig) => {
    setPagination(paginationConfig);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <OrderLayout>
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        <Card title="售后管理" style={{ marginBottom: '16px' }}>
          {/* 搜索表单 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                onChange={(dates) => setSearchParams({ 
                  ...searchParams, 
                startDate: dates?.[0]?.format('YYYY-MM-DD'),
                endDate: dates?.[1]?.format('YYYY-MM-DD')
              })}
              style={{ width: '100%' }}
            />
            </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['处理开始日期', '处理结束日期']}
              onChange={(dates) => setSearchParams({ 
                ...searchParams, 
                processStartDate: dates?.[0]?.format('YYYY-MM-DD'),
                processEndDate: dates?.[1]?.format('YYYY-MM-DD')
              })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="请输入售后订单号"
              value={searchParams.salesOrderNumber}
              onChange={(e) => setSearchParams({ ...searchParams, salesOrderNumber: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="请输入原订单号"
              value={searchParams.orderNumber}
              onChange={(e) => setSearchParams({ ...searchParams, orderNumber: e.target.value })}
              allowClear
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Input
              placeholder="请输入会员电话"
              value={searchParams.memberPhone}
              onChange={(e) => setSearchParams({ ...searchParams, memberPhone: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="请选择状态"
              value={searchParams.status}
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
              allowClear
              style={{ width: '100%' }}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
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
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
    </OrderLayout>
  );
};

export default AfterSales;
