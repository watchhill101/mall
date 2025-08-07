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
  Progress,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  InputNumber,
  Divider,
  Pagination,
} from 'antd';
import {
  CheckSquareOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟仓库数据
const warehouses = ['A仓库', 'B仓库', 'C仓库'];

// 模拟商品分类数据
const categories = ['电子产品', '服装', '食品', '日用品', '化妆品'];

// 模拟盘点商品数据
const stocktakingProducts = [
  {
    productId: 'P001',
    productName: 'iPhone 15 Pro',
    category: '电子产品',
    warehouse: 'A仓库',
    expectedQuantity: 50,
    actualQuantity: 48,
    difference: -2,
    status: '已盘点',
    remarks: '缺少2台',
  },
  {
    productId: 'P002',
    productName: 'MacBook Air',
    category: '电子产品',
    warehouse: 'A仓库',
    expectedQuantity: 20,
    actualQuantity: 20,
    difference: 0,
    status: '已盘点',
    remarks: '数量正确',
  },
  {
    productId: 'P003',
    productName: 'Nike运动鞋',
    category: '服装',
    warehouse: 'B仓库',
    expectedQuantity: 100,
    actualQuantity: 95,
    difference: -5,
    status: '已盘点',
    remarks: '缺少5双',
  },
  {
    productId: 'P004',
    productName: '华为平板',
    category: '电子产品',
    warehouse: 'A仓库',
    expectedQuantity: 30,
    actualQuantity: 30,
    difference: 0,
    status: '待盘点',
    remarks: '',
  },
  {
    productId: 'P005',
    productName: 'Adidas短袖',
    category: '服装',
    warehouse: 'B仓库',
    expectedQuantity: 80,
    actualQuantity: 82,
    difference: 2,
    status: '已盘点',
    remarks: '多出2件',
  },
];

export default function Stocktake() {
  // 状态管理
  const [stocktakeData, setStocktakeData] = useState([
    {
      key: '1',
      taskId: 'ST001',
      taskName: '电子产品盘点',
      productCount: 50,
      completedCount: 50,
      operator: '张三',
      status: '已完成',
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 11:30:00',
      warehouse: 'A仓库',
      category: '电子产品',
      description: '月度电子产品库存盘点',
    },
    {
      key: '2',
      taskId: 'ST002',
      taskName: '服装盘点',
      productCount: 100,
      completedCount: 75,
      operator: '李四',
      status: '进行中',
      startTime: '2024-01-15 14:00:00',
      endTime: null,
      warehouse: 'B仓库',
      category: '服装',
      description: '季度服装库存盘点',
    },
    {
      key: '3',
      taskId: 'ST003',
      taskName: '全库盘点',
      productCount: 200,
      completedCount: 0,
      operator: '王五',
      status: '待开始',
      startTime: null,
      endTime: null,
      warehouse: '所有仓库',
      category: '所有分类',
      description: '年度全库大盘点',
    },
  ]);

  const [filteredData, setFilteredData] = useState(stocktakeData);
  const [searchParams, setSearchParams] = useState({
    taskId: '',
    taskName: '',
    status: '',
    dateRange: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [inProgressTask, setInProgressTask] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // 计算统计数据
  useEffect(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(
      (item) => item.status === '已完成'
    ).length;
    const pending = filteredData.filter(
      (item) => item.status === '进行中'
    ).length;
    const products = filteredData.reduce(
      (sum, item) => sum + item.productCount,
      0
    );

    setTotalTasks(total);
    setCompletedTasks(completed);
    setPendingTasks(pending);
    setTotalProducts(products);
  }, [filteredData]);

  // 搜索筛选
  useEffect(() => {
    let data = [...stocktakeData];

    // 筛选任务ID
    if (searchParams.taskId) {
      data = data.filter((item) =>
        item.taskId.toLowerCase().includes(searchParams.taskId.toLowerCase())
      );
    }

    // 筛选任务名称
    if (searchParams.taskName) {
      data = data.filter((item) =>
        item.taskName
          .toLowerCase()
          .includes(searchParams.taskName.toLowerCase())
      );
    }

    // 筛选状态
    if (searchParams.status) {
      data = data.filter((item) => item.status === searchParams.status);
    }

    // 筛选日期范围
    if (searchParams.dateRange && searchParams.dateRange.length === 2) {
      const startDate = dayjs(searchParams.dateRange[0]).startOf('day');
      const endDate = dayjs(searchParams.dateRange[1]).endOf('day');

      data = data.filter((item) => {
        if (!item.startTime) return false;
        const startTime = dayjs(item.startTime);
        return startTime.isBetween(startDate, endDate, null, '[]');
      });
    }

    setFilteredData(data);
    setCurrentPage(1); // 重置到第一页
  }, [searchParams, stocktakeData]);

  // 分页数据
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 处理搜索参数变化
  const handleSearchParamChange = (paramName, value) => {
    setSearchParams((prev) => ({ ...prev, [paramName]: value }));
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchParams({
      taskId: '',
      taskName: '',
      status: '',
      dateRange: [],
    });
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 开始盘点
  const handleStartStocktake = (record) => {
    // 模拟API调用
    setTimeout(() => {
      const updatedData = stocktakeData.map((item) => {
        if (item.key === record.key) {
          return {
            ...item,
            status: '进行中',
            startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
        }
        return item;
      });

      setStocktakeData(updatedData);
      setInProgressTask(record);
      setCurrentProductIndex(0);
      setProductModalVisible(true);
      message.success('盘点已开始');
    }, 500);
  };

  // 继续盘点
  const handleContinueStocktake = (record) => {
    setInProgressTask(record);
    // 找到已盘点的商品数量，设置当前索引
    const completed = record.completedCount;
    setCurrentProductIndex(completed);
    setProductModalVisible(true);
  };

  // 提交商品盘点数据
  const handleSubmitProductStocktake = (data) => {
    // 模拟API调用
    setTimeout(() => {
      // 更新当前商品的盘点状态
      const updatedProducts = [...stocktakingProducts];
      updatedProducts[currentProductIndex] = {
        ...updatedProducts[currentProductIndex],
        actualQuantity: data.actualQuantity,
        difference:
          data.actualQuantity -
          updatedProducts[currentProductIndex].expectedQuantity,
        status: '已盘点',
        remarks: data.remarks,
      };

      // 更新盘点任务的完成数量
      const updatedTasks = [...stocktakeData];
      const taskIndex = updatedTasks.findIndex(
        (task) => task.key === inProgressTask.key
      );
      if (taskIndex !== -1) {
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          completedCount: currentProductIndex + 1,
        };

        // 如果所有商品都已盘点，标记任务为已完成
        if (currentProductIndex + 1 === updatedTasks[taskIndex].productCount) {
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            status: '已完成',
            endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
          setProductModalVisible(false);
          message.success('盘点任务已完成');
        } else if (
          currentProductIndex + 1 <
          updatedTasks[taskIndex].productCount
        ) {
          // 否则继续盘点下一个商品
          setCurrentProductIndex(currentProductIndex + 1);
          message.success('商品盘点成功，继续盘点下一个');
        }

        setStocktakeData(updatedTasks);
      }
    }, 500);
  };

  // 查看报告
  const handleViewReport = (record) => {
    setSelectedRecord(record);
    setReportModalVisible(true);
  };

  // 打开新增盘点任务模态框
  const handleOpenCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  // 提交新增盘点任务
  const handleSubmitCreate = () => {
    createForm.validateFields().then((values) => {
      // 模拟API调用
      setTimeout(() => {
        const newTaskId = `ST${String(stocktakeData.length + 1).padStart(
          3,
          '0'
        )}`;

        const newRecord = {
          key: String(stocktakeData.length + 1),
          taskId: newTaskId,
          taskName: values.taskName,
          productCount: values.productCount,
          completedCount: 0,
          operator: '当前用户', // 实际项目中应该获取当前登录用户
          status: '待开始',
          startTime: null,
          endTime: null,
          warehouse: values.warehouse,
          category: values.category,
          description: values.description,
        };

        setStocktakeData([...stocktakeData, newRecord]);
        setCreateModalVisible(false);
        message.success('新增盘点任务成功');
      }, 500);
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '盘点任务ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 100,
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 150,
    },
    {
      title: '进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const percent =
          record.productCount > 0
            ? Math.round((record.completedCount / record.productCount) * 100)
            : 0;
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              status={
                record.status === '已完成'
                  ? 'success'
                  : record.status === '进行中'
                  ? 'active'
                  : 'normal'
              }
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.completedCount}/{record.productCount}
            </span>
          </div>
        );
      },
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = 'orange';
        let icon = <ExclamationCircleOutlined />;

        if (status === '已完成') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        } else if (status === '进行中') {
          color = 'blue';
          icon = <ClockCircleOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time) => time || '-',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (time) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === '待开始' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStartStocktake(record)}
            >
              开始盘点
            </Button>
          )}
          {record.status === '进行中' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleContinueStocktake(record)}
            >
              继续盘点
            </Button>
          )}
          {record.status === '已完成' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleViewReport(record)}
            >
              查看报告
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 盘点商品表格列定义
  const productColumns = [
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: '预期数量',
      dataIndex: 'expectedQuantity',
      key: 'expectedQuantity',
    },
    {
      title: '实际数量',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
    },
    {
      title: '差异',
      dataIndex: 'difference',
      key: 'difference',
      render: (diff) => (
        <span style={{ color: diff > 0 ? 'red' : diff < 0 ? 'blue' : 'black' }}>
          {diff}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '已盘点' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
    },
  ];

  return (
    <GoodsLayout>
      <div className="Stocktake" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <CheckSquareOutlined style={{ marginRight: '8px' }} />
          库存盘点
        </Title>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="盘点任务总数"
                value={totalTasks}
                prefix={<CheckSquareOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成"
                value={completedTasks}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="进行中"
                value={pendingTasks}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待盘点商品"
                value={totalProducts}
                prefix={<CheckSquareOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 搜索区域 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="请输入盘点任务ID"
                value={searchParams.taskId}
                onChange={(e) =>
                  handleSearchParamChange('taskId', e.target.value)
                }
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="请输入任务名称"
                value={searchParams.taskName}
                onChange={(e) =>
                  handleSearchParamChange('taskName', e.target.value)
                }
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="请选择状态"
                value={searchParams.status}
                onChange={(value) => handleSearchParamChange('status', value)}
                allowClear
              >
                <Option value="已完成">已完成</Option>
                <Option value="进行中">进行中</Option>
                <Option value="待开始">待开始</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={searchParams.dateRange}
                onChange={(value) =>
                  handleSearchParamChange('dateRange', value)
                }
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleResetSearch}>重置</Button>
                <Button type="primary" onClick={() => {}}>
                  搜索
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 盘点任务表格 */}
        <Card
          title="盘点任务"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              新增盘点任务
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            rowKey="key"
            style={{ marginBottom: '16px' }}
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条记录`}
            style={{ textAlign: 'right' }}
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="盘点任务详情"
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={700}
        >
          {selectedRecord && (
            <div style={{ padding: '16px' }}>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>盘点任务ID:</Text>
                </Col>
                <Col span={16}>{selectedRecord.taskId}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>任务名称:</Text>
                </Col>
                <Col span={16}>{selectedRecord.taskName}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>仓库:</Text>
                </Col>
                <Col span={16}>{selectedRecord.warehouse}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品分类:</Text>
                </Col>
                <Col span={16}>{selectedRecord.category}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>操作员:</Text>
                </Col>
                <Col span={16}>{selectedRecord.operator}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>状态:</Text>
                </Col>
                <Col span={16}>
                  <Tag
                    color={
                      selectedRecord.status === '已完成'
                        ? 'green'
                        : selectedRecord.status === '进行中'
                        ? 'blue'
                        : 'orange'
                    }
                  >
                    {selectedRecord.status}
                  </Tag>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>开始时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.startTime || '-'}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>结束时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.endTime || '-'}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>总商品数:</Text>
                </Col>
                <Col span={16}>{selectedRecord.productCount}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>已完成数:</Text>
                </Col>
                <Col span={16}>{selectedRecord.completedCount}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>完成进度:</Text>
                </Col>
                <Col span={16}>
                  <Progress
                    percent={
                      selectedRecord.productCount > 0
                        ? Math.round(
                            (selectedRecord.completedCount /
                              selectedRecord.productCount) *
                              100
                          )
                        : 0
                    }
                    status={
                      selectedRecord.status === '已完成'
                        ? 'success'
                        : selectedRecord.status === '进行中'
                        ? 'active'
                        : 'normal'
                    }
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>任务描述:</Text>
                </Col>
                <Col span={16}>{selectedRecord.description}</Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 商品盘点模态框 */}
        <Modal
          title={`盘点商品 - ${inProgressTask?.taskName || ''}`}
          visible={productModalVisible}
          onCancel={() => setProductModalVisible(false)}
          footer={null}
          width={800}
        >
          {inProgressTask &&
            currentProductIndex < stocktakingProducts.length && (
              <div style={{ padding: '16px' }}>
                <Text strong>
                  当前进度: {currentProductIndex + 1}/
                  {inProgressTask.productCount}
                </Text>
                <Divider />
                <Card title="商品信息">
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                      <Text strong>商品ID:</Text>
                    </Col>
                    <Col span={16}>
                      {stocktakingProducts[currentProductIndex].productId}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                      <Text strong>商品名称:</Text>
                    </Col>
                    <Col span={16}>
                      {stocktakingProducts[currentProductIndex].productName}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                      <Text strong>分类:</Text>
                    </Col>
                    <Col span={16}>
                      {stocktakingProducts[currentProductIndex].category}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                      <Text strong>仓库:</Text>
                    </Col>
                    <Col span={16}>
                      {stocktakingProducts[currentProductIndex].warehouse}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                      <Text strong>预期数量:</Text>
                    </Col>
                    <Col span={16}>
                      {
                        stocktakingProducts[currentProductIndex]
                          .expectedQuantity
                      }
                    </Col>
                  </Row>
                </Card>
                <Divider />
                <Card title="盘点信息">
                  <Form
                    layout="vertical"
                    onFinish={handleSubmitProductStocktake}
                    initialValues={{
                      actualQuantity:
                        stocktakingProducts[currentProductIndex]
                          .expectedQuantity,
                    }}
                  >
                    <Form.Item
                      name="actualQuantity"
                      label="实际数量"
                      rules={[
                        { required: true, message: '请输入实际数量' },
                        {
                          type: 'number',
                          min: 0,
                          message: '实际数量不能小于0',
                        },
                      ]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="remarks" label="备注">
                      <Input.TextArea
                        rows={4}
                        placeholder="请输入备注信息（如数量差异原因）"
                      />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right' }}>
                      <Space>
                        <Button onClick={() => setProductModalVisible(false)}>
                          暂停盘点
                        </Button>
                        <Button type="primary" htmlType="submit">
                          提交盘点结果
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              </div>
            )}
        </Modal>

        {/* 报告模态框 */}
        <Modal
          title={`盘点报告 - ${selectedRecord?.taskName || ''}`}
          visible={reportModalVisible}
          onCancel={() => setReportModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setReportModalVisible(false)}>
              关闭
            </Button>,
            <Button key="download" type="primary">
              下载报告
            </Button>,
          ]}
          width={900}
        >
          {selectedRecord && (
            <div style={{ padding: '16px' }}>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>盘点任务ID:</Text>
                </Col>
                <Col span={16}>{selectedRecord.taskId}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>任务名称:</Text>
                </Col>
                <Col span={16}>{selectedRecord.taskName}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>操作员:</Text>
                </Col>
                <Col span={16}>{selectedRecord.operator}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>开始时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.startTime}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>结束时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.endTime}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>总商品数:</Text>
                </Col>
                <Col span={16}>{selectedRecord.productCount}</Col>
              </Row>
              <Divider />
              <Card title="盘点统计">
                <Row gutter={16} style={{ marginBottom: '16px' }}>
                  <Col span={8}>
                    <Statistic
                      title="数量正确"
                      value={
                        stocktakingProducts.filter((p) => p.difference === 0)
                          .length
                      }
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="数量缺少"
                      value={
                        stocktakingProducts.filter((p) => p.difference < 0)
                          .length
                      }
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="数量多出"
                      value={
                        stocktakingProducts.filter((p) => p.difference > 0)
                          .length
                      }
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="总差异数量"
                      value={stocktakingProducts.reduce(
                        (sum, p) => sum + p.difference,
                        0
                      )}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="盘点准确率"
                      value={`${Math.round(
                        (stocktakingProducts.filter((p) => p.difference === 0)
                          .length /
                          stocktakingProducts.length) *
                          100
                      )}%`}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>
              <Divider />
              <Card title="差异商品明细">
                <Table
                  columns={productColumns}
                  dataSource={stocktakingProducts.filter(
                    (p) => p.difference !== 0
                  )}
                  pagination={false}
                  rowKey="productId"
                />
              </Card>
            </div>
          )}
        </Modal>

        {/* 新增盘点任务模态框 */}
        <Modal
          title="新增盘点任务"
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setCreateModalVisible(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmitCreate}>
              提交
            </Button>,
          ]}
          width={700}
        >
          <Form form={createForm} layout="vertical" style={{ padding: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="taskName"
                  label="任务名称"
                  rules={[{ required: true, message: '请输入任务名称' }]}
                >
                  <Input placeholder="请输入任务名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="warehouse"
                  label="仓库"
                  rules={[{ required: true, message: '请选择仓库' }]}
                >
                  <Select placeholder="请选择仓库">
                    <Option value="所有仓库">所有仓库</Option>
                    {warehouses.map((warehouse) => (
                      <Option key={warehouse} value={warehouse}>
                        {warehouse}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="商品分类"
                  rules={[{ required: true, message: '请选择商品分类' }]}
                >
                  <Select placeholder="请选择商品分类">
                    <Option value="所有分类">所有分类</Option>
                    {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="productCount"
                  label="预计商品数量"
                  rules={[
                    { required: true, message: '请输入预计商品数量' },
                    {
                      type: 'number',
                      min: 1,
                      message: '预计商品数量必须大于0',
                    },
                  ]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="任务描述">
              <Input.TextArea rows={4} placeholder="请输入任务描述信息" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </GoodsLayout>
  );
}
