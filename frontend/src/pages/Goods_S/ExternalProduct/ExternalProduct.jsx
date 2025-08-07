import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Form,
} from 'antd';
import { useTranslation } from 'react-i18next';
import GoodsLayout from '../Goods_Layout/Goods_Layout';

const { Option } = Select;

export default function ExternalProduct() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 🧪 模拟数据
  const mockData = [
    {
      externalId: 'EXT001',
      sourceSystem: 'ERP-A',
      businessType: 'retail',
      productInfo: {
        productName: '休闲运动鞋',
        productCode: 'SNK1001',
        description: '轻便舒适的休闲运动鞋',
        specifications: '42码',
        brand: 'Sporty',
        model: 'XJ2025',
        unit: '双',
        images: ['https://img95.699pic.com/photo/60016/7147.jpg_wh860.jpg'],
      },
      categoryInfo: {
        categoryName: '鞋类',
        categoryPath: '服饰 > 鞋类 > 运动鞋',
      },
      pricing: {
        marketPrice: { min: 199, max: 299 },
        suggestedPrice: 259,
        currency: 'CNY',
      },
      supplier: {
        supplierId: 'SUP001',
        supplierName: '广州优品供应链',
        contact: '020-12345678',
      },
      availability: {
        isAvailable: true,
        stockStatus: 'in_stock',
        leadTime: 3,
      },
      updatedAt: '2025-08-01 08:00:00',
    },
    // 可复制增加更多条数据
  ];

  const filterMockData = (query) => {
    return mockData.filter((item) => {
      const { businessType, productName, supplierName, stockStatus } = query;
      return (
        (!businessType || item.businessType === businessType) &&
        (!productName ||
          item.productInfo?.productName?.includes(productName)) &&
        (!supplierName ||
          item.supplier?.supplierName?.includes(supplierName)) &&
        (!stockStatus || item.availability?.stockStatus === stockStatus)
      );
    });
  };

  const fetchData = async (params = {}) => {
    setLoading(true);
    const values = form.getFieldsValue();
    const current = params.current || pagination.current;
    const pageSize = params.pageSize || pagination.pageSize;

    const filtered = filterMockData(values);
    const sliced = filtered.slice((current - 1) * pageSize, current * pageSize);

    setTimeout(() => {
      setDataSource(sliced);
      setPagination({
        current,
        pageSize,
        total: filtered.length,
      });
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchData({ current: 1 });
  }, []);

  const handleSearch = () => {
    fetchData({ current: 1 });
  };

  const handleReset = () => {
    form.resetFields();
    fetchData({ current: 1 });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'externalId',
      width: 80,
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      width: 100,
    },
    {
      title: '所属商家',
      dataIndex: ['supplier', 'supplierName'],
      width: 120,
      render: (_, record) => record.supplier?.supplierName || '-',
    },
    {
      title: '商品信息',
      dataIndex: 'productInfo',
      render: (_, record) => (
        <Space>
          <Image
            src={
              record.productInfo?.images?.[0] ||
              'https://via.placeholder.com/40'
            }
            width={40}
            height={40}
            preview={false}
          />
          <div>{record.productInfo?.productName}</div>
        </Space>
      ),
    },
    {
      title: '商品分类',
      dataIndex: ['categoryInfo', 'categoryName'],
      render: (_, record) => record.categoryInfo?.categoryName || '-',
    },
    {
      title: '销售价',
      dataIndex: 'pricing',
      render: (_, record) => {
        const min = record.pricing?.marketPrice?.min ?? 0;
        const max = record.pricing?.marketPrice?.max ?? 0;
        return min === max ? `¥${min}` : `¥${min}~¥${max}`;
      },
    },
    {
      title: '总库存',
      dataIndex: ['availability', 'stock'],
      render: (_, record) => record.availability?.stock || 1000,
    },
    {
      title: '状态',
      dataIndex: ['availability', 'stockStatus'],
      render: (status) => {
        const statusMap = {
          in_stock: { text: '在售中', color: 'blue' },
          out_of_stock: { text: '已下架', color: 'red' },
          limited: { text: '已售罄', color: 'green' },
          unknown: { text: '待审核', color: 'orange' },
        };
        const info = statusMap[status] || {};
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
    },
    {
      title: '操作',
      render: () => (
        <Space>
          <a>选品</a>
          <a>销售信息</a>
        </Space>
      ),
    },
  ];

  return (
    <GoodsLayout>
      <div style={{ padding: '16px', background: '#fff' }}>
        {/* 搜索区域 */}
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="businessType" label="业务类型">
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="retail">零售</Option>
                  <Option value="wholesale">批发</Option>
                  <Option value="manufacturer">制造商</Option>
                  <Option value="distributor">分销商</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="productName" label="商品名称">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="supplierName" label="所属商家">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="stockStatus" label="商品状态">
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="in_stock">在售中</Option>
                  <Option value="out_of_stock">已下架</Option>
                  <Option value="limited">已售罄</Option>
                  <Option value="unknown">待审核</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end" style={{ marginTop: 8, width: '100%' }}>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Row>
        </Form>

        {/* 表格区域 */}
        <Table
          rowKey="externalId"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            total: pagination.total,
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) =>
              fetchData({ current: page, pageSize }),
          }}
        />
      </div>
    </GoodsLayout>
  );
}
