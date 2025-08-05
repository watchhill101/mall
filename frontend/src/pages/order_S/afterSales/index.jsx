import React, { useState } from 'react';
import './index.scss';
import { OrderData } from '@/db_S/data.mjs';
import SearchBar from '@/components/SearchBar';
import Orderlayout from '../Order_layout/Order_layout';
import { afterSaleOrder } from '@/db_S/data.mjs';
import {
  Button,
  Popconfirm,
  Space,
  Upload,
  Table,
  Form,
  Input,
  Select,
  DatePicker,
} from 'antd';

import dayjs from 'dayjs';
const { RangePicker } = DatePicker;
export default function Index() {
  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState('inline');

  // ange = ({ layout }) => {
  //   setFormLayout(layout);
  // };

  const [curIdx, setCurIdx] = useState(0);

  const [params, setParams] = useState({
    pageSize: 5,
    current: 1,
  });

  const columns = [
    {
      title: '售后订单',
      dataIndex: 'After-salesOrder',
      key: 'After-salesOrder',
    },
    {
      title: '原订单',
      dataIndex: 'OriginalOrder',
      key: 'OriginalOrder',
    },
    {
      title: '售后来源',
      dataIndex: 'After-salesSource',
      key: 'After-salesSource',
    },
    {
      title: '会员信息',
      dataIndex: 'MemberInformation',
      key: 'MemberInformation',
    },
    {
      title: '售后金额',
      dataIndex: 'After-salesAmount',
      key: 'After-salesAmount',
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
    },
    {
      title: '退款金额',
      dataIndex: 'RefundAmount',
      key: 'RefundAmount',
    },
    {
      title: '售后时间',
      dataIndex: 'AfterSaleTime',
      key: 'AfterSaleTime',
    },
    {
      title: '审核人',
      dataIndex: 'Auditor',
      key: 'Auditor',
      width: 100,
    },
    {
      title: '处理时间',
      dataIndex: 'ProcessingTime',
      key: 'ProcessingTime',
    },
    {
      title: '订单来源',
      dataIndex: 'OrderSource',
      key: 'OrderSource',
    },
    {
      title: 'IP',
      dataIndex: 'IP',
      key: 'IP',
    },
    {
      title: '主机地址',
      dataIndex: 'HostAddress',
      key: 'HostAddress',
    },
    {
      title: 'mac地址',
      dataIndex: 'MacAddress',
      key: 'MacAddress',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text, record) => (
        <Space size="middle">
          <a>查看</a>
          <a href="javascript:;">审核</a>
        </Space>
      ),
    },
  ];

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().endOf('day');
  };
  return (
    <Orderlayout>
      <div className="OrderS">
        {/* 顶部按钮切换 */}
        <div className="header">
          <div className="searchBox">
            {/* <Space></Space> */}
            <Form
              layout={formLayout}
              form={form}
              initialValues={{ layout: formLayout }}
              // onValuesChange={onFormLayoutChange}
              style={{ maxWidth: 'inline' }}
            >
              <Form.Item label="售后时间">
                <RangePicker disabledDate={disabledDate} />
              </Form.Item>
              <Form.Item label="处理时间">
                <RangePicker disabledDate={disabledDate} />
              </Form.Item>
              <Form.Item label="售后订单">
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item label="原订单">
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item label="会员电话">
                <Input placeholder="请输入" />
              </Form.Item>
              <Form.Item>
                <Button type="primary">搜索</Button>
                <Button>重置</Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* 操作按钮*/}
        <div className="operation-section">
          <Button type="primary">导出</Button>
        </div>

        {/* 表格部分 */}
        <div className="table-section">
          <Table
            dataSource={afterSaleOrder.data}
            columns={columns}
            pagination={{ pageSize: 5 }}
            rowKey={(record) => record['After-salesOrder']}
            bordered
          />
        </div>
      </div>
    </Orderlayout>
  );
}
