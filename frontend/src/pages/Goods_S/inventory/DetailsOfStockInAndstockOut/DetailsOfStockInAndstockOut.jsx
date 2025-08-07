import React, { useState, useEffect } from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  DatePicker,
  Select,
  Modal,
  message,
  Input,
  Form,
} from 'antd';
import {
  FileTextOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  // DetailOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Item } = Form;

export default function DetailsOfStockInAndstockOut() {
  // 状态管理
  const [stockDetailsData, setStockDetailsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 模拟API获取数据
  useEffect(() => {
    fetchData();
  }, []);

  // 当筛选条件改变时重新筛选数据
  useEffect(() => {
    if (stockDetailsData.length > 0) {
      filterData();
    }
  }, [stockDetailsData]);

  // 模拟从API获取数据
  const fetchData = () => {
    setLoading(true);
    // 模拟网络延迟
    setTimeout(() => {
      const mockData = [
        {
          key: '1',
          recordId: 'R001',
          productName: 'iPhone 15 Pro',
          operationType: '入库',
          quantity: 50,
          beforeStock: 100,
          afterStock: 150,
          operator: '张三',
          operationTime: '2024-01-15 10:30:00',
          remark: '正常入库',
          batchNo: 'B20240115001',
          warehouse: '主仓库',
          shelf: 'A1-01',
        },
        {
          key: '2',
          recordId: 'R002',
          productName: 'MacBook Air',
          operationType: '出库',
          quantity: 5,
          beforeStock: 25,
          afterStock: 20,
          operator: '李四',
          operationTime: '2024-01-15 11:20:00',
          remark: '客户订单出库',
          orderNo: 'SO20240115001',
          customer: '苹果公司',
          contact: '王五',
        },
        {
          key: '3',
          recordId: 'R003',
          productName: 'Nike运动鞋',
          operationType: '入库',
          quantity: 100,
          beforeStock: 200,
          afterStock: 300,
          operator: '王五',
          operationTime: '2024-01-14 16:45:00',
          remark: '补货入库',
          batchNo: 'B20240114001',
          warehouse: '主仓库',
          shelf: 'B2-03',
        },
        {
          key: '4',
          recordId: 'R004',
          productName: 'iPhone 15 Pro',
          operationType: '出库',
          quantity: 10,
          beforeStock: 150,
          afterStock: 140,
          operator: '赵六',
          operationTime: '2024-01-15 14:15:00',
          remark: '销售出库',
          orderNo: 'SO20240115002',
          customer: '科技有限公司',
          contact: '赵六',
        },
        {
          key: '5',
          recordId: 'R005',
          productName: 'iPad Air',
          operationType: '入库',
          quantity: 30,
          beforeStock: 50,
          afterStock: 80,
          operator: '张三',
          operationTime: '2024-01-13 09:10:00',
          remark: '新品入库',
          batchNo: 'B20240113001',
          warehouse: '主仓库',
          shelf: 'C3-05',
        },
        {
          key: '6',
          recordId: 'R006',
          productName: 'AirPods Pro',
          operationType: '出库',
          quantity: 15,
          beforeStock: 40,
          afterStock: 25,
          operator: '李四',
          operationTime: '2024-01-13 13:30:00',
          remark: '线上订单',
          orderNo: 'SO20240113001',
          customer: '个人客户',
          contact: '钱七',
        },
        {
          key: '7',
          recordId: 'R007',
          productName: 'MacBook Pro',
          operationType: '入库',
          quantity: 20,
          beforeStock: 15,
          afterStock: 35,
          operator: '王五',
          operationTime: '2024-01-12 15:45:00',
          remark: '补货入库',
          batchNo: 'B20240112001',
          warehouse: '主仓库',
          shelf: 'A1-02',
        },
        {
          key: '8',
          recordId: 'R008',
          productName: 'Nike运动鞋',
          operationType: '出库',
          quantity: 25,
          beforeStock: 300,
          afterStock: 275,
          operator: '赵六',
          operationTime: '2024-01-12 16:20:00',
          remark: '批发订单',
          orderNo: 'SO20240112001',
          customer: '体育用品店',
          contact: '孙八',
        },
        {
          key: '9',
          recordId: 'R009',
          productName: 'iPhone 15',
          operationType: '入库',
          quantity: 100,
          beforeStock: 50,
          afterStock: 150,
          operator: '张三',
          operationTime: '2024-01-11 10:00:00',
          remark: '批量入库',
          batchNo: 'B20240111001',
          warehouse: '主仓库',
          shelf: 'A2-01',
        },
        {
          key: '10',
          recordId: 'R010',
          productName: 'iPad Pro',
          operationType: '出库',
          quantity: 8,
          beforeStock: 30,
          afterStock: 22,
          operator: '李四',
          operationTime: '2024-01-11 14:30:00',
          remark: '企业采购',
          orderNo: 'SO20240111001',
          customer: '教育机构',
          contact: '周九',
        },
        {
          key: '11',
          recordId: 'R011',
          productName: 'Apple Watch',
          operationType: '入库',
          quantity: 40,
          beforeStock: 20,
          afterStock: 60,
          operator: '王五',
          operationTime: '2024-01-10 09:30:00',
          remark: '新品入库',
          batchNo: 'B20240110001',
          warehouse: '主仓库',
          shelf: 'C1-03',
        },
        {
          key: '12',
          recordId: 'R012',
          productName: 'AirPods Max',
          operationType: '出库',
          quantity: 3,
          beforeStock: 15,
          afterStock: 12,
          operator: '赵六',
          operationTime: '2024-01-10 11:15:00',
          remark: 'VIP订单',
          orderNo: 'SO20240110001',
          customer: '高端客户',
          contact: '吴十',
        },
      ];
      setStockDetailsData(mockData);
      setLoading(false);
    }, 800);
  };

  // 根据搜索条件筛选数据
  const filterData = () => {
    const values = searchForm.getFieldsValue();
    let data = [...stockDetailsData];

    // 按日期范围筛选
    if (values.dateRange && values.dateRange.length === 2) {
      const startDate = moment(values.dateRange[0]).startOf('day');
      const endDate = moment(values.dateRange[1]).endOf('day');
      data = data.filter((item) => {
        const itemDate = moment(item.operationTime);
        return itemDate.isBetween(startDate, endDate, null, '[]');
      });
    }

    // 按操作类型筛选
    if (values.operationType && values.operationType !== 'all') {
      data = data.filter(
        (item) =>
          item.operationType ===
          (values.operationType === 'in' ? '入库' : '出库')
      );
    }

    // 按记录ID搜索
    if (values.recordId) {
      data = data.filter((item) =>
        item.recordId.toLowerCase().includes(values.recordId.toLowerCase())
      );
    }

    // 按商品名称搜索
    if (values.productName) {
      data = data.filter((item) =>
        item.productName
          .toLowerCase()
          .includes(values.productName.toLowerCase())
      );
    }

    setFilteredData(data);
    setPagination((prev) => ({ ...prev, total: data.length, current: 1 }));
  };

  // 处理分页变化
  const handlePaginationChange = (current, pageSize) => {
    setPagination({ current, pageSize, total: filteredData.length });
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setCurrentRecord(record);
    setVisible(true);
  };

  // 关闭详情模态框
  const handleClose = () => {
    setVisible(false);
    setCurrentRecord(null);
  };

  // 导出记录
  const handleExportRecord = (record) => {
    message.success(`记录 ${record.recordId} 导出成功`);
    // 实际项目中这里会调用导出API
  };

  // 导出全部明细
  const handleExportAll = () => {
    message.success('出入库明细导出成功');
    // 实际项目中这里会调用导出API
  };

  // 执行搜索
  const handleSearch = () => {
    filterData();
  };

  // 重置搜索条件
  const handleReset = () => {
    searchForm.resetFields();
    filterData();
  };

  // 表格列定义
  const columns = [
    {
      title: '记录ID',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 100,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 100,
      render: (type) => {
        const color = type === '入库' ? 'green' : 'red';
        const icon = type === '入库' ? <ImportOutlined /> : <ExportOutlined />;
        return (
          <Tag color={color} icon={icon}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity, record) => (
        <span
          style={{
            color: record.operationType === '入库' ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold',
          }}
        >
          {record.operationType === '入库' ? '+' : '-'} {quantity}
        </span>
      ),
    },
    {
      title: '库存变化',
      key: 'stockChange',
      width: 120,
      render: (_, record) => (
        <span>
          {record.beforeStock} → {record.afterStock}
        </span>
      ),
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            // icon={<DetailOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExportRecord(record)}
          >
            导出记录
          </Button>
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalRecords = filteredData.length;
  const inRecords = filteredData.filter(
    (item) => item.operationType === '入库'
  ).length;
  const outRecords = filteredData.filter(
    (item) => item.operationType === '出库'
  ).length;
  const totalInQuantity = filteredData
    .filter((item) => item.operationType === '入库')
    .reduce((sum, item) => sum + item.quantity, 0);
  const totalOutQuantity = filteredData
    .filter((item) => item.operationType === '出库')
    .reduce((sum, item) => sum + item.quantity, 0);

  // 分页数据
  const paginatedData = filteredData.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  return (
    <GoodsLayout>
      <div className="DetailsOfStockInAndstockOut" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          出入库明细
        </Title>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="记录总数"
                value={totalRecords}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="入库记录"
                value={inRecords}
                prefix={<ImportOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="出库记录"
                value={outRecords}
                prefix={<ExportOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="净入库量"
                value={totalInQuantity - totalOutQuantity}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="明细查询"
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportAll}
            >
              导出明细
            </Button>
          }
        >
          <Form
            form={searchForm}
            layout="inline"
            initialValues={{ operationType: 'all' }}
            style={{ marginBottom: '16px' }}
          >
            <Item name="recordId" label="记录ID">
              <Input placeholder="请输入记录ID" style={{ width: 150 }} />
            </Item>
            <Item name="productName" label="商品名称">
              <Input placeholder="请输入商品名称" style={{ width: 150 }} />
            </Item>
            <Item name="dateRange" label="操作日期">
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                style={{ width: 250 }}
              />
            </Item>
            <Item name="operationType" label="操作类型">
              <Select placeholder="操作类型" style={{ width: 120 }}>
                <Option value="all">全部</Option>
                <Option value="in">入库</Option>
                <Option value="out">出库</Option>
              </Select>
            </Item>
            <Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                >
                  查询
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Item>
          </Form>

          <Table
            columns={columns}
            dataSource={paginatedData}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `总共 ${total} 条记录`,
              onChange: handlePaginationChange,
            }}
            rowKey="key"
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="出入库记录详情"
          visible={visible}
          onCancel={handleClose}
          footer={[
            <Button key="close" onClick={handleClose}>
              关闭
            </Button>,
          ]}
          width={600}
        >
          {currentRecord && (
            <div style={{ padding: '16px' }}>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <strong>记录ID:</strong> {currentRecord.recordId}
                </Col>
                <Col span={12}>
                  <strong>操作类型:</strong>{' '}
                  <Tag
                    color={
                      currentRecord.operationType === '入库' ? 'green' : 'red'
                    }
                  >
                    {currentRecord.operationType}
                  </Tag>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <strong>商品名称:</strong> {currentRecord.productName}
                </Col>
                <Col span={12}>
                  <strong>数量:</strong>{' '}
                  <span
                    style={{
                      color:
                        currentRecord.operationType === '入库'
                          ? '#52c41a'
                          : '#ff4d4f',
                      fontWeight: 'bold',
                    }}
                  >
                    {currentRecord.operationType === '入库' ? '+' : '-'}
                    {currentRecord.quantity}
                  </span>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <strong>操作前库存:</strong> {currentRecord.beforeStock}
                </Col>
                <Col span={12}>
                  <strong>操作后库存:</strong> {currentRecord.afterStock}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <strong>操作员:</strong> {currentRecord.operator}
                </Col>
                <Col span={12}>
                  <strong>操作时间:</strong> {currentRecord.operationTime}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={24}>
                  <strong>备注:</strong> {currentRecord.remark}
                </Col>
              </Row>
              {currentRecord.operationType === '入库' ? (
                <React.Fragment>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={12}>
                      <strong>批次号:</strong> {currentRecord.batchNo}
                    </Col>
                    <Col span={12}>
                      <strong>仓库:</strong> {currentRecord.warehouse}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={12}>
                      <strong>货架:</strong> {currentRecord.shelf}
                    </Col>
                  </Row>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={12}>
                      <strong>订单号:</strong> {currentRecord.orderNo}
                    </Col>
                    <Col span={12}>
                      <strong>客户:</strong> {currentRecord.customer}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={12}>
                      <strong>联系人:</strong> {currentRecord.contact}
                    </Col>
                  </Row>
                </React.Fragment>
              )}
            </div>
          )}
        </Modal>
      </div>
    </GoodsLayout>
  );
}
