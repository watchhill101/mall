import React, { useState } from 'react';
import './index.scss';
import { OrderData } from '@/db_S/data.mjs';
import SearchBar from '@/components/SearchBar';
import Icon, { SearchOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import {
  RefreshSvg,
  SearchSvg,
  clipSvg,
  toggleSvg,
} from '@/pages/Goods_S/icons_svg/IconCom';
import { Button } from 'antd';
import CustomTable from '@/components/CustomTable';
import OrderLayout from '../Order_layout/Order_layout';
export default function Index() {
  const [btnList, setBtnlist] = useState([
    '全部',
    '零售',
    '家政',
    '烘焙',
    '文旅',
    '洗衣',
    '养老',
    '食堂',
  ]);
  const [curIdx, setCurIdx] = useState(0);
  const formItemList = [
    {
      formItemProps: { name: 'OrderNumber', label: '订单编号' },
      valueCompProps: {
        placeholder: '请输入',
      },
    },
    {
      formItemProps: { name: 'BelongingStore', label: '所属店铺' },
      valueCompProps: {
        placeholder: '请选择',
        type: 'select',
        options: [
          {
            label: '店铺1',
            value: 0,
          },
          {
            label: '店铺2',
            value: 1,
          },
        ],
      },
    },
    {
      formItemProps: { name: 'PaymentTime', label: '支付时间' },
      valueCompProps: {
        type: 'rangePicker',
      },
    },
    {
      formItemProps: { name: 'ContactNumber', label: '联系电话' },
      valueCompProps: {
        placeholder: '请输入',
      },
    },
    {
      formItemProps: { name: 'TransactionType', label: '交易类型' },
      valueCompProps: {
        type: 'select',
        placeholder: '请选择',
        options: [
          {
            label: '消费',
            value: 'consumption',
          },
          {
            label: '退款',
            value: 'refund',
          },
        ],
      },
    },
    {
      formItemProps: { name: 'PaymentMethod', label: '支付方式' },
      valueCompProps: {
        type: 'select',
        placeholder: '请选择',
        options: [
          {
            label: '钱包',
            value: 'wallet',
          },
          {
            label: '微信',
            value: 'WeChat',
          },
          {
            label: '支付宝',
            value: 'Alipay',
          },
          {
            label: '余额',
            value: 'balance',
          },
        ],
      },
    },
  ];
  const handleSearch = (values) => {
    console.log(values);
  };

  const onParamChange = () => {};
  const [params, setparams] = useState({
    pageSize: 5,
    current: 1,
  });
  const fetchMethod = async (requesParams) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟分页（你需要根据实际接口分页）
    const { current = 1, pageSize = 5 } = requesParams;
    const startIdx = (current - 1) * pageSize;
    const endIdx = startIdx + pageSize;

    const currentOrders = OrderData.list.slice(startIdx, endIdx);

    const expandedData = currentOrders.flatMap((order) => {
      return order.ProductInformation.map((product, index) => ({
        ...order,
        product,
        rowSpan: index === 0 ? order.ProductInformation.length : 0,
        isFirstRow: index === 0,
      }));
    });

    return {
      data: {
        count: OrderData.list.length, // 这里是总订单数
        rows: expandedData, // 展示用的扁平化行
      },
    };
  };
  const expandedData = OrderData.list.flatMap((order) => {
    return order.ProductInformation.map((product, index) => ({
      ...order,
      product,
      rowSpan: index === 0 ? order.ProductInformation.length : 0, // 用于跨行显示
      isFirstRow: index === 0,
    }));
  });
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'OrderNumber',
      render: (value, row) => ({
        children: row.isFirstRow ? value : null,
        props: {
          rowSpan: row.rowSpan,
        },
      }),
    },
    {
      title: '商品信息',
      dataIndex: 'ProductInformation',
      key: 'ProductInformation',
      render: (productList) => (
        <div>
          {productList.map((product) => (
            <div key={product.id}>
              {product.ProductName} - {product.Specification}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '价格(元)/数量',
      dataIndex: 'ProductInformation',
      key: 'Price (yuan) / Quantity',
      render: (productList) => (
        <div>
          {productList.map((product) => (
            <div key={product.id}>
              ￥{product.price} / {product.quantity}
            </div>
          ))}
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
            ).join('\n')
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
      key: 'DistributionCommission',
      render: (value) => `￥${value}`,
    },
    {
      title: '所属店铺',
      dataIndex: 'StoreName',
      key: 'AffiliatedStore',
    },
    {
      title: '所属网点',
      dataIndex: 'OutletName',
      key: 'AffiliatedNetwork',
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
                <Button type="link" style={{ color: 'red' }}>
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

  return (
    // <OrderLayout>
    <div className="OrderS">
      <div className="header">
        <ul>
          {btnList.map((item, index) => {
            return (
              <li key={index}>
                <a
                  href="javascript:;"
                  className={curIdx === index ? 'active' : ''}
                  onClick={() => setCurIdx(index)}
                >
                  {item}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="searchbar">
          <SearchBar
            formItemList={formItemList}
            getSearchParams={handleSearch}
          />
        </div>
      </div>
      <div className="OperationButton">
        <div className="OperationButton-left">
          <Button
            color="primary"
            style={{
              backgroundColor: '#FEF8E7',
              border: '1px solid #FAE096',
              color: '#F7CC59',
            }}
          >
            导出
          </Button>
        </div>
        <div className="OperationButton-right">
          <ul>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={
                  <Icon component={RefreshSvg} />
                  // <SvgIcon
                  //   name="refresh"
                  //   width="16"
                  //   height="16"
                  //   color="#1890ff"
                  // ></SvgIcon>
                }
              />
            </li>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={<Icon component={SearchSvg} />}
                // icon={
                //   <SvgIcon
                //     name="setting"
                //     width="16"
                //     height="16"
                //     color="#1890ff"
                //
              />
            </li>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={<Icon component={clipSvg}></Icon>}
              />
            </li>
            <li>
              <Button
                // type="primary"
                shape="circle"
                icon={<Icon component={toggleSvg} />}
              />
            </li>
          </ul>
        </div>
      </div>
      <div>
        <CustomTable
          columns={columns}
          fetchMethod={fetchMethod}
          requestParam={params}
        />
      </div>
    </div>
    // </OrderLayout>
  );
}
