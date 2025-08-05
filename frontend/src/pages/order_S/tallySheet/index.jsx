import React, { useState } from 'react';
import { Button, Form, Input, Select, DatePicker, Table, Space } from 'antd';
import dayjs from 'dayjs';
import './index.scss';
import { sortingOrderList } from '@/db_S/data.mjs'; // 假设你定义了一个 mock 数据源
import OrderLayout from '../Order_layout/Order_layout';
const { RangePicker } = DatePicker;

export default function SortingOrderPage() {
  const [form] = Form.useForm();
  const [formLayout] = useState('inline');

  const [params, setParams] = useState({
    pageSize: 10,
    current: 1,
  });

  const disabledDate = (current) => {
    return current && current < dayjs().endOf('day');
  };

  const columns = [
    {
      title: '理货单编号',
      dataIndex: 'sortingOrderNo',
      key: 'sortingOrderNo',
    },
    {
      title: '理货数量',
      dataIndex: 'sortingCount',
      key: 'sortingCount',
    },
    {
      title: '理货单状态',
      dataIndex: 'sortingStatus',
      key: 'sortingStatus',
      render: (text) => {
        let color = text === '待理货' ? 'red' : 'blue';
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: '理货单生成时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '理货单完成时间',
      dataIndex: 'completeTime',
      key: 'completeTime',
    },
    {
      title: '操作',
      key: 'operation',
      render: (_, record) => (
        <Space size="middle">
          <a>详情</a>
          <a>导出订单明细</a>
        </Space>
      ),
    },
  ];

  return (
    <OrderLayout>
      <div className="SortingOrderPage">
        {/* 搜索栏 */}
        <div className="header">
          <div className="searchBox">
            <Form
              layout={formLayout}
              form={form}
              initialValues={{ layout: formLayout }}
            >
              <Form.Item label="理货单编号" name="sortingOrderNo">
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item label="创建时间" name="createTime">
                <RangePicker disabledDate={disabledDate} />
              </Form.Item>
              <Form.Item label="完成时间" name="completeTime">
                <RangePicker disabledDate={disabledDate} />
              </Form.Item>
              <Form.Item label="理货单状态" name="sortingStatus">
                <Select placeholder="请选择" style={{ width: 120 }}>
                  <Select.Option value="待理货">待理货</Select.Option>
                  <Select.Option value="已理货">已理货</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary">搜索</Button>
                <Button>重置</Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="operation-section" style={{ margin: '16px 0' }}>
          <Button type="primary">导出</Button>
        </div>

        {/* 表格 */}
        <Table
          dataSource={sortingOrderList.data}
          columns={columns}
          pagination={{
            pageSize: params.pageSize,
            current: params.current,
            total: 1000,
          }}
          rowKey={(record) => record.sortingOrderNo}
          bordered
        />
      </div>
    </OrderLayout>
  );
}
