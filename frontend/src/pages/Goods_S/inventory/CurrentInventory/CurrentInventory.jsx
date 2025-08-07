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
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  message,
  DatePicker,
  Divider,
} from 'antd';
import {
  InboxOutlined,
  CheckSquareOutlined,
  WarningOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../../Goods_Layout/Goods_Layout';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CurrentInventory() {
  // 状态管理
  const [inventoryData, setInventoryData] = useState([
    {
      key: '1',
      productId: 'P001',
      productName: 'iPhone 15 Pro',
      category: '电子产品',
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
      unit: '台',
      status: '正常',
      description: 'Apple最新款手机，配备A17芯片，256GB存储',
      supplier: '苹果公司',
      purchasePrice: 7999,
      salePrice: 9999,
      lastUpdated: '2023-11-10',
    },
    {
      key: '2',
      productId: 'P002',
      productName: 'MacBook Air',
      category: '电子产品',
      currentStock: 25,
      minStock: 30,
      maxStock: 100,
      unit: '台',
      status: '库存不足',
      description: '轻薄便携笔记本电脑，M2芯片，8GB内存',
      supplier: '苹果公司',
      purchasePrice: 6999,
      salePrice: 8999,
      lastUpdated: '2023-11-05',
    },
    {
      key: '3',
      productId: 'P003',
      productName: 'Nike运动鞋',
      category: '服装',
      currentStock: 300,
      minStock: 100,
      maxStock: 500,
      unit: '双',
      status: '正常',
      description: 'Nike经典运动鞋，舒适透气，多种尺码可选',
      supplier: 'Nike中国',
      purchasePrice: 699,
      salePrice: 1299,
      lastUpdated: '2023-11-08',
    },
    {
      key: '4',
      productId: 'P004',
      productName: '华为平板',
      category: '电子产品',
      currentStock: 80,
      minStock: 40,
      maxStock: 150,
      unit: '台',
      status: '正常',
      description: '华为最新款平板，10.4英寸屏幕，64GB存储',
      supplier: '华为技术有限公司',
      purchasePrice: 2499,
      salePrice: 3299,
      lastUpdated: '2023-11-01',
    },
    {
      key: '5',
      productId: 'P005',
      productName: '小米手环',
      category: '电子产品',
      currentStock: 120,
      minStock: 50,
      maxStock: 200,
      unit: '个',
      status: '正常',
      description: '小米智能手环，支持心率监测、睡眠监测',
      supplier: '小米科技有限公司',
      purchasePrice: 199,
      salePrice: 299,
      lastUpdated: '2023-11-12',
    },
    {
      key: '6',
      productId: 'P006',
      productName: 'Adidas运动服',
      category: '服装',
      currentStock: 45,
      minStock: 30,
      maxStock: 100,
      unit: '套',
      status: '正常',
      description: 'Adidas运动套装，透气面料，适合健身',
      supplier: 'Adidas中国',
      purchasePrice: 399,
      salePrice: 799,
      lastUpdated: '2023-11-03',
    },
    {
      key: '7',
      productId: 'P007',
      productName: '联想笔记本',
      category: '电子产品',
      currentStock: 15,
      minStock: 20,
      maxStock: 80,
      unit: '台',
      status: '库存不足',
      description: '联想ThinkPad系列笔记本，商务办公首选',
      supplier: '联想集团',
      purchasePrice: 5999,
      salePrice: 7999,
      lastUpdated: '2023-11-07',
    },
    {
      key: '8',
      productId: 'P008',
      productName: '三星手机',
      category: '电子产品',
      currentStock: 60,
      minStock: 30,
      maxStock: 120,
      unit: '台',
      status: '正常',
      description: '三星Galaxy系列手机，2K分辨率屏幕，128GB存储',
      supplier: '三星电子',
      purchasePrice: 5999,
      salePrice: 7499,
      lastUpdated: '2023-11-09',
    },
  ]);
  const [searchParams, setSearchParams] = useState({
    productId: '',
    productName: '',
    category: '',
  });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [inventoryCheckModalVisible, setInventoryCheckModalVisible] =
    useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [checkResult, setCheckResult] = useState('normal');
  const [checkDate, setCheckDate] = useState(dayjs());
  const [checkRemark, setCheckRemark] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // 分类选项
  const categoryOptions = [
    { value: '', label: '全部' },
    { value: '电子产品', label: '电子产品' },
    { value: '服装', label: '服装' },
    { value: '食品', label: '食品' },
    { value: '家居', label: '家居' },
  ];

  // 组件加载时初始化数据
  useEffect(() => {
    filterData();
  }, [inventoryData, searchParams, currentPage, pageSize]);

  // 过滤数据
  const filterData = () => {
    let data = [...inventoryData];

    // 应用搜索过滤
    if (searchParams.productId) {
      data = data.filter((item) =>
        item.productId.includes(searchParams.productId)
      );
    }
    if (searchParams.productName) {
      data = data.filter((item) =>
        item.productName.includes(searchParams.productName)
      );
    }
    if (searchParams.category) {
      data = data.filter((item) => item.category === searchParams.category);
    }

    // 设置总数
    setTotal(data.length);

    // 应用分页
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredData(data.slice(startIndex, endIndex));
  };

  // 处理搜索参数变化
  const handleSearchChange = (field, value) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); // 重置到第一页
  };

  // 处理分页变化
  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 调整库存
  const handleAdjustInventory = (record) => {
    setSelectedRecord(record);
    setAdjustAmount(0);
    setAdjustReason('');
    setAdjustModalVisible(true);
  };

  // 确认调整库存
  const handleConfirmAdjust = () => {
    if (adjustAmount === 0) {
      messageApi.error('调整数量不能为0');
      return;
    }

    if (!adjustReason) {
      messageApi.error('请输入调整原因');
      return;
    }

    // 更新库存数据
    const newInventory = [...inventoryData];
    const index = newInventory.findIndex(
      (item) => item.key === selectedRecord.key
    );
    if (index !== -1) {
      const newStock = newInventory[index].currentStock + adjustAmount;
      newInventory[index].currentStock = newStock;
      // 更新状态
      if (newStock < newInventory[index].minStock) {
        newInventory[index].status = '库存不足';
      } else if (newStock > newInventory[index].maxStock) {
        newInventory[index].status = '库存过剩';
      } else {
        newInventory[index].status = '正常';
      }
      setInventoryData(newInventory);
      messageApi.success('库存调整成功');
      setAdjustModalVisible(false);
    }
  };

  // 库存盘点
  const handleInventoryCheck = () => {
    setCheckResult('normal');
    setCheckDate(dayjs());
    setCheckRemark('');
    setInventoryCheckModalVisible(true);
  };

  // 确认盘点
  const handleConfirmCheck = () => {
    // 这里可以添加盘点逻辑，例如与实际库存对比等
    messageApi.success('库存盘点完成');
    setInventoryCheckModalVisible(false);

    // 模拟盘点结果，如果有差异可以调整库存
    if (checkResult === 'different') {
      // 这里可以触发批量调整库存的逻辑
      messageApi.info('发现库存差异，已生成调整建议');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 180,
    },
    {
      title: '商品分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      filters: categoryOptions,
      onFilter: (value, record) => value === '' || record.category === value,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      render: (stock, record) => (
        <span
          style={{
            color:
              stock < record.minStock
                ? '#ff4d4f'
                : stock > record.maxStock
                ? '#faad14'
                : '#52c41a',
          }}
        >
          {stock} {record.unit}
        </span>
      ),
    },
    {
      title: '库存范围',
      key: 'stockRange',
      width: 120,
      render: (_, record) => (
        <span>
          {record.minStock} - {record.maxStock} {record.unit}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const color =
          status === '正常'
            ? 'green'
            : status === '库存不足'
            ? 'red'
            : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            <EyeOutlined size={16} /> 查看详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleAdjustInventory(record)}
          >
            <EditOutlined size={16} /> 调整库存
          </Button>
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalProducts = inventoryData.length;
  const normalStock = inventoryData.filter(
    (item) => item.status === '正常'
  ).length;
  const lowStock = inventoryData.filter(
    (item) => item.status === '库存不足'
  ).length;
  const overStock = inventoryData.filter(
    (item) => item.status === '库存过剩'
  ).length;
  const totalStock = inventoryData.reduce(
    (sum, item) => sum + item.currentStock,
    0
  );

  return (
    <GoodsLayout>
      {contextHolder}
      <div className="CurrentInventory" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <CheckSquareOutlined style={{ marginRight: '8px' }} />
          当前库存
        </Title>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="商品总数"
                value={totalProducts}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="库存正常"
                value={normalStock}
                prefix={<CheckSquareOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="库存不足"
                value={lowStock}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总库存量"
                value={totalStock}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 搜索区域 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="输入商品ID"
                value={searchParams.productId}
                onChange={(e) =>
                  handleSearchChange('productId', e.target.value)
                }
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={6}>
              <Input
                placeholder="输入商品名称"
                value={searchParams.productName}
                onChange={(e) =>
                  handleSearchChange('productName', e.target.value)
                }
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="选择商品分类"
                value={searchParams.category}
                onChange={(value) => handleSearchChange('category', value)}
                style={{ width: '100%' }}
              >
                {categoryOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                onClick={filterData}
                style={{ width: '100%' }}
              >
                搜索
              </Button>
            </Col>
          </Row>
        </Card>

        <Card
          title="库存管理"
          extra={
            <Space>
              <Button type="primary" onClick={handleInventoryCheck}>
                <FileTextOutlined /> 库存盘点
              </Button>
              <Button>导出数据</Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
              onChange: handlePaginationChange,
            }}
            rowKey="key"
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="商品详情"
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={600}
        >
          {selectedRecord && (
            <div style={{ padding: '16px' }}>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品ID:</Text>
                </Col>
                <Col span={16}>{selectedRecord.productId}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品名称:</Text>
                </Col>
                <Col span={16}>{selectedRecord.productName}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品分类:</Text>
                </Col>
                <Col span={16}>{selectedRecord.category}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>供应商:</Text>
                </Col>
                <Col span={16}>{selectedRecord.supplier}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>当前库存:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.currentStock} {selectedRecord.unit}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>库存范围:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.minStock} - {selectedRecord.maxStock}{' '}
                  {selectedRecord.unit}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>状态:</Text>
                </Col>
                <Col span={16}>
                  <Tag
                    color={
                      selectedRecord.status === '正常'
                        ? 'green'
                        : selectedRecord.status === '库存不足'
                        ? 'red'
                        : 'orange'
                    }
                  >
                    {selectedRecord.status}
                  </Tag>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>采购价:</Text>
                </Col>
                <Col span={16}>¥{selectedRecord.purchasePrice}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>售价:</Text>
                </Col>
                <Col span={16}>¥{selectedRecord.salePrice}</Col>
              </Row>
              <Divider />
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品描述:</Text>
                </Col>
                <Col span={16}>{selectedRecord.description}</Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>最后更新时间:</Text>
                </Col>
                <Col span={16}>{selectedRecord.lastUpdated}</Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 调整库存模态框 */}
        <Modal
          title="调整库存"
          visible={adjustModalVisible}
          onCancel={() => setAdjustModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setAdjustModalVisible(false)}>
              取消
            </Button>,
            <Button key="confirm" type="primary" onClick={handleConfirmAdjust}>
              确认调整
            </Button>,
          ]}
          width={500}
        >
          {selectedRecord && (
            <div style={{ padding: '16px' }}>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>商品名称:</Text>
                </Col>
                <Col span={16}>{selectedRecord.productName}</Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>当前库存:</Text>
                </Col>
                <Col span={16}>
                  {selectedRecord.currentStock} {selectedRecord.unit}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}>
                  <Text strong>调整数量:</Text>
                </Col>
                <Col span={16}>
                  <Space align="center">
                    <Button
                      type="default"
                      onClick={() =>
                        setAdjustAmount((prev) =>
                          Math.max(prev - 1, -selectedRecord.currentStock)
                        )
                      }
                    >
                      <MinusOutlined size={16} />
                    </Button>
                    <InputNumber
                      min={-selectedRecord.currentStock}
                      max={1000}
                      value={adjustAmount}
                      onChange={setAdjustAmount}
                      style={{ width: '100px' }}
                    />
                    <Button
                      type="default"
                      onClick={() => setAdjustAmount((prev) => prev + 1)}
                    >
                      <PlusOutlined size={16} />
                    </Button>
                  </Space>
                  <Text
                    type="secondary"
                    style={{ display: 'block', marginTop: '8px' }}
                  >
                    注意: 减少库存不能超过当前库存
                  </Text>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>调整原因:</Text>
                </Col>
                <Col span={16}>
                  <Input.TextArea
                    rows={4}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="请输入调整原因"
                  />
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 库存盘点模态框 */}
        <Modal
          title="库存盘点"
          visible={inventoryCheckModalVisible}
          onCancel={() => setInventoryCheckModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setInventoryCheckModalVisible(false)}
            >
              取消
            </Button>,
            <Button key="confirm" type="primary" onClick={handleConfirmCheck}>
              确认盘点
            </Button>,
          ]}
          width={600}
        >
          <div style={{ padding: '16px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={8}>
                <Text strong>盘点日期:</Text>
              </Col>
              <Col span={16}>
                <DatePicker
                  value={checkDate}
                  onChange={setCheckDate}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={8}>
                <Text strong>盘点结果:</Text>
              </Col>
              <Col span={16}>
                <Select
                  value={checkResult}
                  onChange={setCheckResult}
                  style={{ width: '100%' }}
                >
                  <Option value="normal">库存正常</Option>
                  <Option value="different">库存差异</Option>
                </Select>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>盘点备注:</Text>
              </Col>
              <Col span={16}>
                <Input.TextArea
                  rows={4}
                  value={checkRemark}
                  onChange={(e) => setCheckRemark(e.target.value)}
                  placeholder="请输入盘点备注"
                />
              </Col>
            </Row>
          </div>
        </Modal>
      </div>
    </GoodsLayout>
  );
}
