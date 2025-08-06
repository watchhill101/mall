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
  Popconfirm,
  message, // 导入message组件
} from 'antd';
import {
  DeleteOutlined,
  // RestoreOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../Goods_Layout/Goods_Layout';
import { TrashData, data } from '@/db_S/data.mjs';
import ProductApi from '@/api/Product';
const { Title } = Typography;

export default function Trash() {
  // 模拟回收站数据
  // const trashData = [
  //   {
  //     key: '1',
  //     productId: 'P001',
  //     productName: 'iPhone 14 Pro',
  //     category: '电子产品',
  //     deleteTime: '2024-01-15 10:30:00',
  //     deleteReason: '商品下架',
  //     operator: '张三',
  //     status: '已删除',
  //   },
  //   {
  //     key: '2',
  //     productId: 'P002',
  //     productName: 'MacBook Pro',
  //     category: '电子产品',
  //     deleteTime: '2024-01-14 16:45:00',
  //     deleteReason: '库存不足',
  //     operator: '李四',
  //     status: '已删除',
  //   },
  //   {
  //     key: '3',
  //     productId: 'P003',
  //     productName: 'Nike运动鞋',
  //     category: '服装',
  //     deleteTime: '2024-01-13 09:20:00',
  //     deleteReason: '商品过期',
  //     operator: '王五',
  //     status: '已删除',
  //   },
  // ];
  const [trashData, setTrashData] = useState([]);
  const getProductAuditList = async () => {
    const { success, data } = await ProductApi.Product.getProductRecycleBin();
    console.log(success, data, '111111');
    if (success) {
      setTrashData(data);
    }
  };
  useEffect(() => {
    getProductAuditList();
  }, []);
  const TrashColumns = [
    {
      title: '商品ID',
      dataIndex: 'originalProduct',
      key: 'originalProduct',
    },
    {
      title: '商品名称',
      dataIndex: ['productSnapshot', 'productName'],
      key: 'ProductName',
      render: (text, record) => (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              {/* <img
                src={record.src}
                alt=""
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              /> */}
            </div>
            <div>{text}</div>
          </div>
        </>
      ),
    },
    {
      title: '商品分类',
      dataIndex: ['productSnapshot', 'productCategory'],
      key: 'ProductCategory',
    },
    {
      title: '市场售价',
      dataIndex: ['productSnapshot', 'pricing', 'marketPrice'],
      key: 'MarketPrice',
    },
    {
      title: '最后更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => (text ? new Date(text).toLocaleString() : '-'),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => handleRestore(record)}>
            恢复
          </Button>
          <Popconfirm
            title="确定要永久删除该商品吗？"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handlePermanentDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link">删除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  // 处理恢复商品
  const handleRestore = async (record) => {
    try {
      console.log('恢复商品', record);
      // 显示加载状态
      const hideLoading = message.loading('商品恢复中...', 0);

      // 调用恢复商品API
      const response = await ProductApi.Product.restoreProductFromRecycleBin({
        productId: record.originalProduct,
        restoredBy: '6891c594711bbd8f373159c3',
      });

      // 无论成功失败，先隐藏加载状态
      hideLoading();

      console.log('恢复商品响应:', response);
      if (response && response.success) {
        message.success('商品恢复成功');
        // 刷新回收站列表
        getProductAuditList();
      } else {
        message.error('商品恢复失败: ' + (response?.message || '未知错误'));
      }
    } catch (error) {
      // 发生异常时也隐藏加载状态
      message.destroy();
      message.error('商品恢复失败: ' + error.message);
      console.error('恢复商品错误:', error);
    }
  };
  const [recycleData, setRecycleData] = useState(
    data.list.filter((item) => item.isDeleted)
  );
  const onParamChange = () => {};
  const [params, setparams] = useState({
    pageSize: 5,
    current: 1,
  });
  // 处理永久删除
  const handlePermanentDelete = (record) => {
    console.log('永久删除商品:', record);
    const updated = recycleData.filter(
      (item) => item.ProductID !== record.ProductID
    );
    setRecycleData(updated);
  };
  const handleClearRecycleBin = () => {
    console.log('清空回收站');
    setRecycleData([]);
  };

  // 计算统计数据
  const totalDeleted = recycleData.length;
  const electronicsCount = recycleData.filter(
    (item) => item.category === '电子产品'
  ).length;
  const clothingCount = recycleData.filter(
    (item) => item.category === '服装'
  ).length;

  return (
    <GoodsLayout>
      <div className="Trash" style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          <DeleteOutlined style={{ marginRight: '8px' }} />
          回收站
        </Title>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="已删除商品"
                value={totalDeleted}
                prefix={<DeleteOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="电子产品"
                value={electronicsCount}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="服装类"
                value={clothingCount}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="可恢复商品"
                value={totalDeleted}
                // prefix={<RestoreOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="已删除商品列表"
          extra={
            <Space>
              <Popconfirm
                title="确定要清空回收站吗？"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                onConfirm={handleClearRecycleBin}
                okText="确认"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  清空回收站
                </Button>
              </Popconfirm>
              {/* <Button type="primary" icon={<RestoreOutlined />}>
              批量恢复
            </Button> */}
            </Space>
          }
        >
          <Table
            columns={TrashColumns}
            dataSource={trashData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            }}
          />
        </Card>
      </div>
    </GoodsLayout>
  );
}
