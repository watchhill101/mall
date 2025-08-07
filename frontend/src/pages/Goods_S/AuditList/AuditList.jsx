import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Space,
  Tag,
  Modal,
  message,
} from 'antd';
import GoodsLayout from '../Goods_Layout/Goods_Layout';
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/zh_CN';
import ProductApi from '@/api/Product';
import './index.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

export default function AuditList() {
  const [form] = Form.useForm();
  const [auditForm] = Form.useForm();
  const [allData, setAllData] = useState([]); // 原始数据
  const [data, setData] = useState([]); // 筛选后数据
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [visible, setVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const getProductAuditList = async () => {
    try {
      const { success, data } = await ProductApi.Product.getAudit();
      if (success) {
        setAllData(data);
        setData(data);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
        }));
      }
    } catch (error) {
      message.error('获取审核列表失败');
      console.error('获取审核列表失败:', error);
    }
  };

  useEffect(() => {
    getProductAuditList();
  }, []);

  const handleAudit = async (record) => {
    console.log('审核');
    console.log(record, '11');

    setCurrentRecord(record);
    console.log(record, '2222222222222222222222222222');

    // 使用record数据创建商品
    const response = await ProductApi.Product.createProduct({
      productId: record.productId || `PROD${Date.now()}`,
      productName: record.productInfo?.productName || '',
      productCategory: record.productInfo?.productCategory || '',
      businessType: 'retail',
      merchant: record.merchant?._id || '',
      productInfo: record.productInfo || {},
      pricing: record.pricing || {
        salePrice: {
          min: 0,
          max: 0,
        },
      },
      inventory: record.inventory || { currentStock: 0 },
      status: record.status || 'pending',
      auditInfo: {
        auditReason: record.auditReason || '',
        auditor: '648a7d9f8b7c6b5a4d3c2b1c',
        auditTime: new Date().toISOString(),
      },
      isExternal: false,
      salesData: {
        totalSales: 0,
        monthlyStock: record.inventory?.currentStock || 0,
      },
      warehouseInfo: record.warehouseInfo || {},
      createBy: record.submitter?._id || '648a7d9f8b7c6b5a4d3c2b1e',
    });
    console.log(response, 'response');
    auditForm.resetFields();
    setVisible(true);
  };

  const handleSubmitAudit = async () => {
    try {
      const values = await auditForm.validateFields();
      const result = await ProductApi.Product.updateAuditStatus({
        auditId: currentRecord.auditId,
        auditStatus: values.auditStatus,
        auditComments: values.auditComments,
        auditTime: new Date(),
        auditor: '6891c594711bbd8f373159c3',
      });

      if (result.success) {
        message.success('审核成功');

        // 如果审核通过
        if (values.auditStatus === 'approved') {
          // 处理创建类型的审核
          if (currentRecord.auditType === 'create') {
            const createResult = await ProductApi.Product.createProduct({
              productInfo: currentRecord.productInfo,
              merchant: currentRecord.merchant._id,
              businessType: 'retail',
              pricing: currentRecord.pricing || {
                salePrice: {
                  min: 0,
                  max: 0,
                },
              },
              inventory: currentRecord.inventory || { currentStock: 0 },
              createBy:
                currentRecord.submitter?._id || '6891c594711bbd8f373159c3',
              status: 'approved', // 设置初始状态为已通过
            });

            if (createResult.success) {
              message.success('商品已成功添加到商品列表');
            } else {
              message.error('添加商品到列表失败: ' + createResult.message);
            }
          }
          // 处理更新类型的审核
          else if (
            currentRecord.auditType === 'update' &&
            currentRecord.productId
          ) {
            // 调用更新商品状态的API
            const updateResult = await ProductApi.Product.updateProductStatus(
              currentRecord.productId,
              'approved'
            );

            if (updateResult.success) {
              message.success('商品状态已更新为已通过');
            } else {
              message.error('更新商品状态失败: ' + updateResult.message);
            }
          }
        }
        // 如果审核拒绝
        else if (values.auditStatus === 'rejected') {
          // 处理创建类型的审核（拒绝创建）
          if (currentRecord.auditType === 'create') {
            message.info('已拒绝创建新商品');
          }
          // 处理更新类型的审核（拒绝更新）
          else if (
            currentRecord.auditType === 'update' &&
            currentRecord.productId
          ) {
            // 调用更新商品状态的API
            const updateResult = await ProductApi.Product.updateProductStatus(
              currentRecord.productId,
              'rejected'
            );

            if (updateResult.success) {
              message.success('商品状态已更新为已拒绝');
            } else {
              message.error('更新商品状态失败: ' + updateResult.message);
            }
          }
        }

        setVisible(false);
        getProductAuditList();
        // 确保事件正确派发
        setTimeout(() => {
          window.dispatchEvent(new Event('refreshProductList'));
        }, 300);
      } else {
        message.error('审核失败: ' + result.message);
      }
    } catch (error) {
      message.error('提交审核失败');
      console.error('提交审核失败:', error);
    }
  };

  const handleSearch = async () => {
    const values = await form.validateFields();
    const { dateRange, productName, status, reason } = values;

    const filtered = allData.filter((item) => {
      if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange;
        const submitTime = dayjs(item.submitTime);
        if (!submitTime.isBetween(start, end, null, '[]')) return false;
      }

      if (
        productName &&
        !item.productInfo?.productName?.includes(productName)
      ) {
        return false;
      }

      if (status && item.auditStatus !== status) {
        return false;
      }

      if (reason && !item.auditReason?.includes(reason)) {
        return false;
      }

      return true;
    });

    setData(filtered);
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: filtered.length,
    }));
  };

  const handleReset = () => {
    form.resetFields();
    setData(allData);
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: allData.length,
    }));
  };

  const handlePageChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  const currentPageData = data.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'auditId',
      key: 'auditId',
    },
    {
      title: '所属商家',
      dataIndex: 'merchant',
      key: 'merchant',
      render: (merchant) => merchant?.name || '--',
    },
    {
      title: '商品信息',
      dataIndex: 'productInfo',
      key: 'productInfo',
      width: 200,
      render: (info) => (
        <Space direction="vertical">
          <span>{info?.productName || '--'}</span>
          <span>{info?.productCategory || '--'}</span>
        </Space>
      ),
    },
    {
      title: '审核原因',
      dataIndex: 'auditReason',
      key: 'auditReason',
    },
    {
      title: '状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      render: (status) => (
        <Tag
          color={
            status === 'pending'
              ? 'orange'
              : status === 'approved'
              ? 'green'
              : 'red'
          }
        >
          {status === 'pending'
            ? '待审核'
            : status === 'approved'
            ? '已通过'
            : '已拒绝'}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      render: (val) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'),
    },
    {
      title: '操作人',
      dataIndex: 'auditor',
      key: 'auditor',
      render: (val) => val?.loginAccount || '--',
    },
    {
      title: '审核时间',
      dataIndex: 'auditTime',
      key: 'auditTime',
      render: (val) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) =>
        record.auditStatus === 'pending' ? (
          <Button type="link" onClick={() => handleAudit(record)}>
            审核
          </Button>
        ) : (
          '--'
        ),
    },
  ];

  return (
    <GoodsLayout>
      {/* 搜索栏 */}
      <Form
        form={form}
        layout="inline"
        style={{ marginBottom: 16, flexWrap: 'wrap' }}
        className="audit-filter-form"
      >
        <Form.Item label="审核时间" name="dateRange">
          <RangePicker locale={locale} />
        </Form.Item>
        <Form.Item label="商品名称" name="productName">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select placeholder="请选择" style={{ width: 120 }} allowClear>
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
        </Form.Item>
        <Form.Item label="审核原因" name="reason">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 表格 */}
      <Table
        rowKey="auditId"
        columns={columns}
        dataSource={currentPageData}
        pagination={{
          ...pagination,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handlePageChange}
      />

      {/* 审核弹窗 */}
      <Modal
        title="商品审核"
        open={visible}
        onOk={handleSubmitAudit}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        {currentRecord && (
          <div className="audit-modal-content">
            <h3>商品信息</h3>
            <p>
              <strong>商品名称:</strong>{' '}
              {currentRecord.productInfo?.productName || '--'}
            </p>
            <p>
              <strong>所属商家:</strong> {currentRecord.merchant?.name || '--'}
            </p>
            <p>
              <strong>商品分类:</strong>{' '}
              {currentRecord.productInfo?.productCategory || '--'}
            </p>
            <p>
              <strong>审核原因:</strong> {currentRecord.auditReason || '--'}
            </p>
            <p>
              <strong>提交时间:</strong>{' '}
              {currentRecord.submitTime
                ? dayjs(currentRecord.submitTime).format('YYYY-MM-DD HH:mm:ss')
                : '--'}
            </p>
            <p>
              <strong>提交人:</strong>{' '}
              {currentRecord.submitter?.loginAccount || '--'}
            </p>

            <h3 style={{ marginTop: 20 }}>审核操作</h3>
            <Form form={auditForm} layout="vertical">
              <Form.Item
                name="auditStatus"
                label="审核结果"
                rules={[{ required: true, message: '请选择审核结果' }]}
              >
                <Select placeholder="请选择审核结果">
                  <Option value="approved">通过</Option>
                  <Option value="rejected">拒绝</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="auditComments"
                label="审核意见"
                rules={[{ required: true, message: '请输入审核意见' }]}
              >
                <TextArea rows={4} placeholder="请输入审核意见" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </GoodsLayout>
  );
}
