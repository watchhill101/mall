import React, { useState } from 'react';
import './index.scss';
import { OrderData } from '@/db_S/data.mjs';
import SearchBar from '@/components/SearchBar';
import './index.scss';
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

  const [btnList] = useState([
    '全部',
    '零售',
    '家政',
    '烘焙',
    '文旅',
    '洗衣',
    '养老',
    '食堂',
  ]);
  const onFormLayoutChange = ({ layout }) => {
    setFormLayout(layout);
  };

  const [curIdx, setCurIdx] = useState(0);

  const [params, setParams] = useState({
    pageSize: 5,
    current: 1,
  });
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };
  // const fetchMethod = async (requesParams) => {
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  //   const { current = 1, pageSize = 5 } = requesParams;
  //   const startIdx = (current - 1) * pageSize;
  //   const endIdx = startIdx + pageSize;

  //   const currentOrders = OrderData.list.slice(startIdx, endIdx);

  //   const expandedData = currentOrders.flatMap((order) => {
  //     return order.ProductInformation.map((product, index) => ({
  //       ...order,
  //       product,
  //       rowSpan: index === 0 ? order.ProductInformation.length : 0,
  //       isFirstRow: index === 0,
  //     }));
  //   });

  //   return {
  //     data: {
  //       count: OrderData.list.length,
  //       rows: expandedData,
  //     },
  //   };
  // };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'OrderNumber',
      render: (val, row) => renderMergedCell(val, row),
    },
    {
      title: '商品信息',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <img src={row.product?.ImageUrl} alt="" width={40} height={40} />
          <div>
            <div>{row.product?.ProductName}</div>
            <div style={{ color: '#999' }}>{row.product?.Specification}</div>
          </div>
        </div>
      ),
    },
    {
      title: '价格(元)/数量',
      render: (text, row) => (
        <div>
          ￥{row.product.price} / {row.product.quantity}
        </div>
      ),
    },
    {
      title: '总价',
      render: (value, row) => ({
        children: row.isFirstRow
          ? `￥${row.ProductInformation.reduce(
              (sum, p) => sum + p.price * p.quantity,
              0
            )}`
          : null,
        props: { rowSpan: row.rowSpan },
      }),
    },
    {
      title: '客户信息',
      render: (value, row) => ({
        children: row.isFirstRow
          ? row.CustomerInformation.map(
              (c) => `${c.CustomerName} - ${c.ContactInformation}`
            ).join(' / ')
          : null,
        props: { rowSpan: row.rowSpan },
      }),
    },
    {
      title: '订单状态',
      dataIndex: 'OrderStatus',
      render: (val, row) => ({
        children: row.isFirstRow
          ? {
              0: '待支付',
              1: '已支付',
              2: '已完成',
              3: '已关闭',
              4: '已退款',
              5: '部分退款',
            }[val] || '未知'
          : null,
        props: { rowSpan: row.rowSpan },
      }),
    },
    {
      title: '分销佣金',
      dataIndex: 'Commission',
      render: (val, row) => renderMergedCell(`￥${val}`, row),
    },
    {
      title: '所属店铺',
      dataIndex: 'StoreName',
    },
    {
      title: '所属网点',
      dataIndex: 'OutletName',
    },
    {
      title: '操作',
      render: (_, row) => ({
        children: row.isFirstRow ? (
          <>
            <Button type="link">详情</Button>
            {row.OrderStatus !== 4 && (
              <>
                <Button type="link">完成</Button>
                <Button type="link" danger>
                  退款
                </Button>
              </>
            )}
          </>
        ) : null,
        props: { rowSpan: row.rowSpan },
      }),
    },
  ];

  const formatOrderData = (orderList) =>
    orderList.flatMap((order) =>
      order.ProductInformation.map((product, index) => ({
        ...order,
        product,
        rowSpan: index === 0 ? order.ProductInformation.length : 0,
        isFirstRow: index === 0,
      }))
    );
  const expandedData = formatOrderData(OrderData.list);
  const renderMergedCell = (content, row) => ({
    children: row.isFirstRow ? content : null,
    props: { rowSpan: row.rowSpan },
  });
  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().endOf('day');
  };
  return (
    <div className="OrderS">
      {/* 顶部按钮切换 */}
      <div className="header">
        <ul className="btn-list">
          {btnList.map((item, index) => (
            <li key={index}>
              <a
                href="#!"
                className={curIdx === index ? 'active' : ''}
                onClick={() => setCurIdx(index)}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <div className="searchBox">
          {/* <Space></Space> */}
          <Form
            layout={formLayout}
            form={form}
            initialValues={{ layout: formLayout }}
            onValuesChange={onFormLayoutChange}
            style={{ maxWidth: 'inline' }}
          >
            <Form.Item label="订单编号">
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item label="所属店铺">
              <Select
                defaultValue="店铺1"
                style={{ width: 120 }}
                onChange={handleChange}
                options={[
                  { value: '店铺1', label: '店铺1' },
                  { value: '店铺2', label: '店铺2' },
                ]}
              />
            </Form.Item>
            <Form.Item label="支付时间">
              <RangePicker disabledDate={disabledDate} />
            </Form.Item>
            <Form.Item label="联系电话">
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item label="交易类型">
              <Select
                defaultValue="消费"
                style={{ width: 120 }}
                onChange={handleChange}
                options={[
                  { value: '消费', label: '消费' },
                  { value: '退款', label: '退款' },
                ]}
              />
            </Form.Item>
            <Form.Item label="支付方式">
              <Select
                defaultValue="微信"
                style={{ width: 120 }}
                onChange={handleChange}
                options={[
                  { value: '微信', label: '微信' },
                  { value: '支付宝', label: '支付宝' },
                  { value: '银行卡', label: '银行卡' },
                ]}
              ></Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary">搜索</Button>
              <Button>重置</Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="search-bar">
        {/* <SearchBar formItemList={[]} onSearch={(v) => console.log(v)} /> */}
      </div>

      {/* 表格部分 */}
      <div className="table-section">
        <Table
          dataSource={expandedData}
          columns={columns}
          pagination={{ pageSize: 5 }}
          rowKey={(record, index) => `${record.OrderNumber}-${index}`}
          bordered
        />
      </div>
    </div>
  );
}
