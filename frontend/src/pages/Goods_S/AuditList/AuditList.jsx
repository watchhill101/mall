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

  const handleAudit = (record) => {
    setCurrentRecord(record);
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
        auditor: '6891c594711bbd8f373159c3', // mock 审核人 ID
      });

      if (result.success) {
        message.success('审核成功');
        setVisible(false);
        getProductAuditList();
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
