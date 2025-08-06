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
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [visible, setVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [auditForm] = Form.useForm();

  const getProductAuditList = async () => {
    try {
      const { success, data } = await ProductApi.Product.getAudit();
      console.log(success, data, '审核列表数据');
      if (success) {
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

  // 打开审核弹窗
  const handleAudit = (record) => {
    setCurrentRecord(record);
    auditForm.resetFields();
    setVisible(true);
  };

  // 提交审核
  const handleSubmitAudit = async () => {
    try {
      const values = await auditForm.validateFields();
      const { auditStatus, auditComments } = values;

      // 调用审核API
      const result = await ProductApi.Product.updateAuditStatus({
        auditId: currentRecord.auditId,
        auditStatus,
        auditComments,
        auditTime: new Date(),
        // 假设当前用户ID可以从全局状态获取
        auditor: '6891c594711bbd8f373159c3',
      });

      if (result.success) {
        message.success('审核成功');
        setVisible(false);
        // 刷新列表
        getProductAuditList();
      } else {
        message.error('审核失败: ' + result.message);
      }
    } catch (error) {
      message.error('提交审核失败');
      console.error('提交审核失败:', error);
    }
  };

  const statusColor = {
    待审核: 'orange',
    已通过: 'blue',
    已拒绝: 'red',
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'auditId',
      key: 'id',
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
      render: (productInfo) => (
        <Space direction="vertical">
          <span>{productInfo?.productName || '--'}</span>
          <span>{productInfo?.productCategory || '--'}</span>
        </Space>
      ),
    },
    {
      title: '审核原因',
      dataIndex: 'auditReason',
      key: 'auditReason',
      render: (reason) => reason || '--',
    },
    {
      title: '状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      render: (status) => (
        <Tag
          color={
            status == 'pending'
              ? 'orange'
              : status == 'approved'
              ? 'green'
              : 'red'
          }
        >
          {status == 'pending'
            ? '待审核'
            : status == 'approved'
            ? '已通过'
            : '已拒绝'}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      render: (submitTime) =>
        submitTime ? dayjs(submitTime).format('YYYY-MM-DD HH:mm:ss') : '--',
    },
    {
      title: '操作人',
      dataIndex: 'auditor',
      key: 'auditor',
      render: (auditor) => auditor?.loginAccount || '--',
    },
    {
      title: '审核时间',
      dataIndex: 'auditTime',
      key: 'auditTime',
      render: (auditTime) =>
        auditTime ? dayjs(auditTime).format('YYYY-MM-DD HH:mm:ss') : '--',
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
          <span>--</span>
        ),
    },
  ];

  const handleSearch = () => {
    form.validateFields().then((values) => {
      console.log('搜索参数:', values);
      // 可以在此调用后端接口获取搜索结果
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <GoodsLayout>
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

      <Table
        rowKey="auditId"
        columns={columns}
        dataSource={data}
        pagination={{
          ...pagination,
          showQuickJumper: true,
        }}
        onChange={(newPagination) => setPagination(newPagination)}
      />

      {/* 审核弹窗 */}
      <Modal
        title="商品审核"
        visible={visible}
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

            <h3 style={{ marginTop: '20px' }}>审核操作</h3>
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
