import React, { useState } from 'react';
import './index.scss';
import { ProductClassificationData } from '@/db_S/data.mjs';
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
    return {
      data: {
        count: ProductClassificationData.list.length,
        rows: ProductClassificationData.list,
      },
    };
  };
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'ProductInformation',
      key: 'ProductInformation',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={record.productImage}
            alt="商品图"
            style={{ width: 60, height: 60, marginRight: 10 }}
          />
          <div>
            <div>{record.productName}</div>
            <div style={{ color: '#999' }}>{record.productSpec}</div>
            {record.isRefunded && (
              <span
                style={{
                  color: 'red',
                  border: '1px solid red',
                  padding: '2px 4px',
                  fontSize: 12,
                }}
              >
                已退款
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '价格(元)/数量',
      dataIndex: 'Price (yuan) / Quantity',
      key: 'Price (yuan) / Quantity',
    },
    {
      title: '总价',
      dataIndex: 'TotalPrice',
      key: 'TotalPrice',
    },
    {
      title: '客户信息',
      dataIndex: 'CustomerInformation',
      key: 'CustomerInformation',
    },
    {
      title: '分销佣金',
      dataIndex: 'DistributionCommission',
      key: 'DistributionCommission',
    },
    {
      title: '所属店铺',
      dataIndex: 'AffiliatedStore',
      key: 'AffiliatedStore',
    },
    {
      title: '所属网点',
      dataIndex: 'AffiliatedNetwork',
      key: 'AffiliatedNetwork',
    },
    {
      title: '订单状态',
      dataIndex: 'OrderStatus',
      key: 'OrderStatus',
    },
    {
      title: 'Action',
      key: 'operation',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <>
          <Button type="link">详情</Button>
          {record.status !== '已退款' && (
            <>
              <Button type="link">完成</Button>
              <Button type="link" style={{ color: 'red' }}>
                退款
              </Button>
            </>
          )}
        </>
      ),
    },
  ];
  const expandable = {
    expandedRowRender: (record) => {
      const columns = [
        { title: '商品名', dataIndex: 'productName', key: 'productName' },
        { title: '规格', dataIndex: 'productSpec', key: 'productSpec' },
        { title: '单价', dataIndex: 'price', key: 'price' },
        { title: '数量', dataIndex: 'quantity', key: 'quantity' },
        {
          title: '图片',
          dataIndex: 'productImage',
          key: 'productImage',
          render: (src) => <img src={src} alt="商品图" style={{ width: 50 }} />,
        },
      ];
      return (
        <Table
          columns={columns}
          dataSource={record.productList}
          pagination={false}
          rowKey={(item, index) => index}
        />
      );
    },
    rowExpandable: (record) => record.productList?.length > 0,
  };
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
          expandable={expandable}
        />
      </div>
    </div>
    // </OrderLayout>
  );
}
