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
  Descriptions
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getTallyOrdersList } from '../../../api/orders';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TallySheet = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentTally, setCurrentTally] = useState(null);
  const [detailData, setDetailData] = useState([]);

  // 状态选项
  const statusOptions = [
    { value: '待理货', label: '待理货', color: 'orange' },
    { value: '已理货', label: '已理货', color: 'green' },
    { value: '已取消', label: '已取消', color: 'red' },
  ];

  // 表格列定义
  const columns = [
    {
      title: '理货单编号',
      dataIndex: 'tallyOrderNumber',
      key: 'tallyOrderNumber',
      width: 180,
      render: (text) => (
        <span style={{ color: '#1890ff' }}>
          {text || 'WLD123132213121212'}
        </span>
      ),
    },
    {
      title: '理货数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (text) => text || '5',
    },
    {
      title: '理货单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let config = { color: 'orange', label: '待理货' };
        switch(status) {
          case '待理货':
            config = { color: 'orange', label: '待理货' };
            break;
          case '已理货':
            config = { color: 'green', label: '已理货' };
            break;
          case '已取消':
            config = { color: 'red', label: '已取消' };
            break;
          default:
            config = { color: 'orange', label: status || '待理货' };
        }
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '理货单生成时间',
      dataIndex: 'generateTime',
      key: 'generateTime',
      width: 180,
      render: (text) => text || '2023-12-12 12:12:12',
    },
    {
      title: '理货单完成时间',
      dataIndex: 'completeTime',
      key: 'completeTime',
      width: 180,
      render: (text) => text || '2023-12-12 12:12:12',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => (
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
            onClick={() => handleExportDetail(record)}
          >
            导出详情单
          </Button>
        </Space>
      ),
    },
  ];

  // 详情表格列定义
  const detailColumns = [
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
      render: (text) => text || '001',
    },
    {
      title: '商品图片',
      dataIndex: 'productImage',
      key: 'productImage',
      width: 80,
      render: (text) => (
        <img 
          src={text || '/placeholder.png'} 
          alt="商品" 
          style={{ width: 40, height: 40, objectFit: 'cover' }}
        />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      render: (text) => text || '商品名称商品名称',
    },
    {
      title: '商品分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text) => text || '分类名称',
    },
    {
      title: '商品规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
      render: (text) => text || '规格名称规格名称',
    },
    {
      title: '理货数量',
      dataIndex: 'tallyQuantity',
      key: 'tallyQuantity',
      width: 100,
      render: (text) => text || '2',
    },
    {
      title: '理货金额',
      dataIndex: 'tallyAmount',
      key: 'tallyAmount',
      width: 100,
      render: (text) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ¥ {text || '100'}
        </span>
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (text) => text || '份',
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
        setData(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取理货单列表失败:', error);
      message.error('获取数据失败');
      // 使用模拟数据
      const mockData = Array(10).fill().map((_, index) => ({
        id: `tally_${index + 1}`,
        tallyOrderNumber: `WLD123132213121212${index}`,
        quantity: '5',
        status: ['待理货', '已理货', '已取消'][index % 3],
        generateTime: '2023-12-12 12:12:12',
        completeTime: '2023-12-12 12:12:12',
      }));
      setData(mockData);
      setTotal(100);
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const handleViewDetail = async (record) => {
    try {
      setCurrentTally(record);
      // 模拟详情数据
      const mockDetailData = Array(3).fill().map((_, index) => ({
        id: `detail_${index + 1}`,
        productId: '001',
        productName: '商品名称商品名称',
        category: '分类名称',
        specification: '规格名称规格名称',
        tallyQuantity: '2',
        tallyAmount: '100',
        unit: '份',
      }));
      setDetailData(mockDetailData);
      setDetailVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  // 导出详情单
  const handleExportDetail = (record) => {
    message.info('导出理货详情单功能开发中...');
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
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="理货单" style={{ marginBottom: '16px' }}>
        {/* 搜索表单 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Input
              placeholder="请输入理货单编号"
              value={searchParams.tallyOrderNumber}
              onChange={(e) => setSearchParams({ ...searchParams, tallyOrderNumber: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['生成时间开始', '生成时间结束']}
              onChange={(dates) => setSearchParams({ 
                ...searchParams, 
                generateStartDate: dates?.[0]?.format('YYYY-MM-DD'),
                generateEndDate: dates?.[1]?.format('YYYY-MM-DD')
              })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['完成时间开始', '完成时间结束']}
              onChange={(dates) => setSearchParams({ 
                ...searchParams, 
                completeStartDate: dates?.[0]?.format('YYYY-MM-DD'),
                completeEndDate: dates?.[1]?.format('YYYY-MM-DD')
              })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="理货单状态"
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
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="理货单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={1200}
      >
        {currentTally && (
          <div>
            <Descriptions bordered column={3} style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="理货单编号">{currentTally.tallyOrderNumber}</Descriptions.Item>
              <Descriptions.Item label="所属供应商">供应商名称供应商名称</Descriptions.Item>
              <Descriptions.Item label="理货数量">{currentTally.quantity}</Descriptions.Item>
              <Descriptions.Item label="理货开始日期">{currentTally.generateTime}</Descriptions.Item>
              <Descriptions.Item label="理货截止日期">{currentTally.completeTime}</Descriptions.Item>
              <Descriptions.Item label="理货状态">
                <Tag color={statusOptions.find(s => s.value === currentTally.status)?.color || 'blue'}>
                  {currentTally.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="商品种类">3</Descriptions.Item>
              <Descriptions.Item label="商品数量">10</Descriptions.Item>
              <Descriptions.Item label="总金额">
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥ 100</span>
              </Descriptions.Item>
            </Descriptions>

            <Card title="商品信息" size="small">
              <div style={{ marginBottom: '16px' }}>
                <Button type="primary" style={{ background: '#52c41a' }}>
                  导出
                </Button>
              </div>
              <Table
                columns={detailColumns}
                dataSource={detailData}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TallySheet;
